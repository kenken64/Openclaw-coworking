import Phaser from 'phaser';
import { generateOfficeBackground } from './generateBackground';
import { initialAgents } from '../data';
import type { Agent, AgentStatus } from '../types';
import { CHARACTERS, COMPUTER } from '../sprites';

// ── Area coordinates (where agents go based on status/room) ──
// Balanced 2x3 grid layout: Equal room sizes, better spacing
const AREA_COORDS: Record<string, { x: number; y: number }[]> = {
  conference: [
    // Top-left: Conference room (large space)
    { x: 120, y: 180 }, { x: 180, y: 200 }, { x: 220, y: 170 },
    { x: 160, y: 220 }, { x: 200, y: 190 }, { x: 140, y: 240 },
    { x: 260, y: 180 }, { x: 280, y: 210 },
  ],
  kitchen: [
    // Top-center: Kitchen area
    { x: 480, y: 170 }, { x: 520, y: 190 }, { x: 560, y: 180 },
    { x: 500, y: 220 }, { x: 540, y: 200 }, { x: 460, y: 210 },
    { x: 580, y: 170 }, { x: 520, y: 240 },
  ],
  gym: [
    // Top-right: Gym space
    { x: 880, y: 180 }, { x: 920, y: 200 }, { x: 960, y: 170 },
    { x: 900, y: 230 }, { x: 940, y: 210 }, { x: 860, y: 190 },
    { x: 980, y: 180 }, { x: 920, y: 250 },
  ],
  computing: [
    // Bottom-left: Server room
    { x: 140, y: 480 }, { x: 200, y: 500 }, { x: 180, y: 460 },
    { x: 220, y: 480 }, { x: 160, y: 520 }, { x: 240, y: 470 },
    { x: 260, y: 500 }, { x: 180, y: 540 },
  ],
  vibe: [
    // Bottom-center: Lounge area
    { x: 480, y: 480 }, { x: 520, y: 500 }, { x: 560, y: 470 },
    { x: 500, y: 520 }, { x: 540, y: 490 }, { x: 460, y: 510 },
    { x: 580, y: 480 }, { x: 520, y: 540 },
  ],
  jarvis: [
    // Bottom-right: Main workspace (largest area)
    { x: 880, y: 460 }, { x: 920, y: 480 }, { x: 960, y: 470 },
    { x: 900, y: 510 }, { x: 940, y: 490 }, { x: 860, y: 500 },
    { x: 980, y: 460 }, { x: 1000, y: 490 }, { x: 1020, y: 470 },
    { x: 840, y: 480 }, { x: 1040, y: 500 }, { x: 920, y: 530 },
    { x: 1000, y: 520 }, { x: 860, y: 540 }, { x: 980, y: 540 },
  ],
};

// Status → area mapping (used by getAreaForAgent)

const SPEECH_TEXTS: Record<AgentStatus, string[]> = {
  WORKING: [
    'Pushing code...', 'Almost done!', 'In the zone 🔥',
    'Need more coffee ☕', 'Ship it!', 'Testing...', 'LGTM!',
    'Refactoring...', 'Debugging 🐛', 'PR review time',
    'Writing docs...', 'Clean code ✨', 'Deploy ready!',
  ],
  IDLE: [
    'Break time~', 'chilling...', '🎵 vibing', 'afk brb',
    'Snack time!', 'Stretching...', 'Scrolling feeds',
    'Need a nap 😴', 'Great weather!', 'Anyone for lunch?',
  ],
  COMPUTING: [
    'Processing...', 'Running models 🤖', 'GPU go brrrr',
    'Training epoch 42', 'Crunching data...', 'Compiling...',
    'Syncing nodes...', 'Batch job 73%', 'Pipeline running',
  ],
};

const AGENT_SPRITE_MAP: Record<string, number> = {
  atlas: 0, clawd: 1, clip: 2, closer: 3,
  nova: 4, oracle: 1, pixel: 0,
  sage: 2, scribe: 3, sentinel: 4, trendy: 1,
};

const STATUS_COLORS: Record<AgentStatus, number> = {
  WORKING: 0x2ecc71,
  IDLE: 0xf1c40f,
  COMPUTING: 0x3498db,
};

interface AgentSprite {
  container: Phaser.GameObjects.Container;
  agent: Agent;
  targetX: number;
  targetY: number;
  bubble: Phaser.GameObjects.Container | null;
  bubbleTimer: number;
  lastStatusChange: number;
}

export class OfficeScene extends Phaser.Scene {
  private agentSprites: Map<string, AgentSprite> = new Map();
  private agents: Agent[] = [];
  private onAgentsUpdate?: (agents: Agent[]) => void;

  constructor() {
    super({ key: 'OfficeScene' });
  }

  setAgentsUpdateCallback(cb: (agents: Agent[]) => void) {
    this.onAgentsUpdate = cb;
  }

  init() {
    this.agents = [...initialAgents];
  }

  preload() {
    // Generate office background
    const bgDataUrl = generateOfficeBackground();
    this.textures.addBase64('office_bg', bgDataUrl);

    // Load character spritesheet
    // Characters are 89x23 total, individual chars vary in size
    // We'll load the whole sheet and create individual textures
    const basePath = import.meta.env.BASE_URL || '/';
    this.load.image('characters_sheet', `${basePath}characters.png`);
    this.load.image('sprites_sheet', `${basePath}sprites.png`);
  }

  create() {
    // Background
    if (this.textures.exists('office_bg')) {
      this.add.image(640, 360, 'office_bg');
    }

    // Extract individual character sprites from the sheet
    this.createCharacterTextures();

    // Create agent sprites
    for (const agent of this.agents) {
      this.createAgentSprite(agent);
    }

    // Status simulation timer
    this.time.addEvent({
      delay: 3000,
      callback: this.simulateStatusChanges,
      callbackScope: this,
      loop: true,
    });

    // Speech bubble timer
    this.time.addEvent({
      delay: 2000,
      callback: this.randomSpeechBubble,
      callbackScope: this,
      loop: true,
    });

    // Place computers on desks using sprite sheet
    this.placeComputersOnDesks();

    // Notify React of initial state
    if (this.onAgentsUpdate) {
      this.onAgentsUpdate([...this.agents]);
    }
  }

  private placeComputersOnDesks() {
    // Extract computer sprite from spritesheet
    const source = this.textures.get('sprites_sheet').getSourceImage() as HTMLImageElement;
    if (!source || !source.width) return;

    const canvas = document.createElement('canvas');
    canvas.width = COMPUTER.w;
    canvas.height = COMPUTER.h;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(source, COMPUTER.x, COMPUTER.y, COMPUTER.w, COMPUTER.h, 0, 0, COMPUTER.w, COMPUTER.h);
    this.textures.addCanvas('computer_sprite', canvas);

    // Place computers in each room according to new 2x3 layout
    const roomW = (1280 - 60) / 3; // 406px each room
    const roomH = (720 - 140) / 2; // 290px each room
    
    // Conference room computers
    const confX = 20, confY = 100;
    const confCompPositions = [
      { x: confX + 120, y: confY + 100 }, // On conference table
    ];
    for (const pos of confCompPositions) {
      const comp = this.add.image(pos.x, pos.y, 'computer_sprite');
      comp.setScale(1.8);
      comp.setDepth(50);
    }

    // Kitchen computers (minimal)
    const kitchenX = 20 + roomW + 20, kitchenY = 100;
    const kitchenCompPositions = [
      { x: kitchenX + 320, y: kitchenY + 80 }, // Wall mounted tablet
    ];
    for (const pos of kitchenCompPositions) {
      const comp = this.add.image(pos.x, pos.y, 'computer_sprite');
      comp.setScale(1.2);
      comp.setDepth(50);
    }

    // Main workspace computers (bottom-right room)
    const workX = 20 + roomW * 2 + 40, workY = 100 + roomH + 20;
    const workCompPositions = [
      { x: workX + 80, y: workY + 70 }, { x: workX + 200, y: workY + 70 }, { x: workX + 320, y: workY + 70 },
      { x: workX + 80, y: workY + 150 }, { x: workX + 200, y: workY + 150 }, { x: workX + 320, y: workY + 150 },
      { x: workX + 80, y: workY + 230 }, { x: workX + 200, y: workY + 230 }, { x: workX + 320, y: workY + 230 },
    ];
    for (const pos of workCompPositions) {
      const comp = this.add.image(pos.x, pos.y, 'computer_sprite');
      comp.setScale(2.2);
      comp.setDepth(50);
    }

    // Server room computers
    const serverX = 20, serverY = 100 + roomH + 20;
    const serverCompPositions = [
      { x: serverX + 100, y: serverY + 200 }, // Control station
      { x: serverX + 250, y: serverY + 200 }, // Monitoring desk
    ];
    for (const pos of serverCompPositions) {
      const comp = this.add.image(pos.x, pos.y, 'computer_sprite');
      comp.setScale(2.0);
      comp.setDepth(50);
    }


  }

  private createCharacterTextures() {
    // Create individual textures from the character spritesheet
    const source = this.textures.get('characters_sheet').getSourceImage() as HTMLImageElement;
    if (!source || !source.width) return;

    for (let i = 0; i < CHARACTERS.length; i++) {
      const char = CHARACTERS[i];
      const canvas = document.createElement('canvas');
      canvas.width = char.w;
      canvas.height = char.h;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(source, char.x, char.y, char.w, char.h, 0, 0, char.w, char.h);
      this.textures.addCanvas(`char_${i}`, canvas);
    }
  }

  private getAreaForAgent(agent: Agent): string {
    // If status is WORKING, go to their assigned room
    if (agent.status === 'WORKING') {
      return agent.room === 'jarvis' ? 'jarvis' : agent.room;
    }
    if (agent.status === 'COMPUTING') {
      return 'computing';
    }
    // IDLE - go to their room or a random idle area
    return agent.room;
  }

  private getPositionInArea(area: string, index: number): { x: number; y: number } {
    const coords = AREA_COORDS[area] || AREA_COORDS['vibe'];
    return coords[index % coords.length];
  }

  private createAgentSprite(agent: Agent) {
    const area = this.getAreaForAgent(agent);
    const areaAgents = this.agents.filter(a => this.getAreaForAgent(a) === area);
    const idx = areaAgents.indexOf(agent);
    const pos = this.getPositionInArea(area, idx >= 0 ? idx : 0);

    const container = this.add.container(pos.x, pos.y);
    container.setDepth(100 + pos.y); // Y-sorting

    // Character sprite with mobile optimization
    const charIdx = AGENT_SPRITE_MAP[agent.id] ?? 0;
    const texKey = `char_${charIdx}`;
    let charSprite: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;

    // Mobile detection and scaling
    const isMobile = window.innerWidth <= 768;
    const charScale = isMobile ? 4.0 : 2.8; // Much bigger on mobile for visibility

    if (this.textures.exists(texKey)) {
      charSprite = this.add.image(0, 0, texKey);
      charSprite.setScale(charScale);
      (charSprite as Phaser.GameObjects.Image).setTexture(texKey);
      // Add bright outline for mobile visibility
      if (isMobile) {
        charSprite.setTintFill(0xffffff); // Bright tint
        charSprite.setStroke('#000000', 3); // Black outline
      }
    } else {
      // Fallback: larger colored rectangle for mobile
      const rectSize = isMobile ? 28 : 16;
      charSprite = this.add.rectangle(0, 0, rectSize, rectSize + 6, Phaser.Display.Color.HexStringToColor(agent.color).color);
      charSprite.setStrokeStyle(2, 0x000000); // Black border for visibility
    }
    // Pixelated rendering for scaled sprites
    if (charSprite instanceof Phaser.GameObjects.Image) {
      charSprite.setTexture(texKey);
    }

    // Shadow
    const shadow = this.add.ellipse(0, 30, 30, 10, 0x000000, 0.3);

    // Name tag background
    const nameText = this.add.text(0, -45, agent.emoji + ' ' + agent.name, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center',
    }).setOrigin(0.5);

    // Status dot
    const statusDot = this.add.circle(nameText.width / 2 + 8, -45, 4, STATUS_COLORS[agent.status]);
    statusDot.setStrokeStyle(1, 0x000000);
    statusDot.setName('statusDot');

    container.add([shadow, charSprite, nameText, statusDot]);
    container.setName(agent.id);

    // Add idle animation (bobbing)
    this.tweens.add({
      targets: charSprite,
      y: -3,
      duration: 800 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.agentSprites.set(agent.id, {
      container,
      agent: { ...agent },
      targetX: pos.x,
      targetY: pos.y,
      bubble: null,
      bubbleTimer: 0,
      lastStatusChange: this.time.now,
    });
  }

  private simulateStatusChanges() {
    const statuses: AgentStatus[] = ['WORKING', 'IDLE', 'COMPUTING'];
    const roomOptions: Record<AgentStatus, string[]> = {
      WORKING: ['jarvis', 'conference'],
      IDLE: ['vibe', 'kitchen', 'gym'],
      COMPUTING: ['jarvis', 'computing'],
    };

    let changed = false;

    this.agents = this.agents.map((agent) => {
      const shouldChange = Math.random() < 0.12;
      if (!shouldChange) {
        // Just update progress
        const delta = Math.floor(Math.random() * 6) - 2;
        return { ...agent, progress: Math.max(0, Math.min(100, agent.progress + delta)) };
      }

      changed = true;
      const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const rooms = roomOptions[newStatus];
      const newRoom = rooms[Math.floor(Math.random() * rooms.length)];

      return {
        ...agent,
        status: newStatus,
        progress: Math.floor(Math.random() * 60) + 20,
        room: newRoom,
      };
    });

    if (changed) {
      // Update positions for changed agents
      for (const agent of this.agents) {
        const spriteData = this.agentSprites.get(agent.id);
        if (!spriteData) continue;

        if (spriteData.agent.status !== agent.status || spriteData.agent.room !== agent.room) {
          spriteData.agent = { ...agent };
          spriteData.lastStatusChange = this.time.now;

          // Calculate new target position
          const area = this.getAreaForAgent(agent);
          const areaAgents = this.agents.filter(a => this.getAreaForAgent(a) === area);
          const idx = areaAgents.indexOf(agent);
          const pos = this.getPositionInArea(area, idx >= 0 ? idx : 0);

          // Add more randomness to prevent stacking
          spriteData.targetX = pos.x + (Math.random() - 0.5) * 60;
          spriteData.targetY = pos.y + (Math.random() - 0.5) * 50;

          // Check movement direction and flip sprite accordingly
          const deltaX = spriteData.targetX - spriteData.container.x;
          // Find the character sprite (it's usually the second item after shadow)
          const charSprite = spriteData.container.list[1];
          
          if (charSprite && Math.abs(deltaX) > 10) {
            // Flip sprite based on movement direction (horizontal flip only)
            if (charSprite instanceof Phaser.GameObjects.Image) {
              if (deltaX > 0) {
                // Moving right - normal orientation
                charSprite.setFlipX(false);
              } else {
                // Moving left - flip horizontally
                charSprite.setFlipX(true);
              }
            }
          }

          // Animate movement with mobile speed adjustment
          const isMobile = window.innerWidth <= 768;
          const moveDuration = isMobile ? 3000 + Math.random() * 2000 : 1500 + Math.random() * 1000; // Slower on mobile
          
          this.tweens.add({
            targets: spriteData.container,
            x: spriteData.targetX,
            y: spriteData.targetY,
            duration: moveDuration,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
              // Update depth for Y-sorting
              spriteData.container.setDepth(100 + spriteData.container.y);
            },
          });

          // Update status dot color
          const statusDot = spriteData.container.getByName('statusDot') as Phaser.GameObjects.Arc;
          if (statusDot) {
            statusDot.fillColor = STATUS_COLORS[agent.status];
          }
        } else {
          spriteData.agent = { ...agent };
        }
      }

      // Notify React
      if (this.onAgentsUpdate) {
        this.onAgentsUpdate([...this.agents]);
      }
    }
  }

  private randomSpeechBubble() {
    // Pick 1-2 random agents to show a speech bubble
    const count = Math.random() < 0.3 ? 2 : 1;
    const agentIds = Array.from(this.agentSprites.keys());
    const shuffled = agentIds.sort(() => Math.random() - 0.5).slice(0, count);

    for (const id of shuffled) {
      if (Math.random() < 0.6) continue; // Don't always show
      this.showSpeechBubble(id);
    }
  }

  private showSpeechBubble(agentId: string) {
    const spriteData = this.agentSprites.get(agentId);
    if (!spriteData) return;

    // Remove existing bubble
    if (spriteData.bubble) {
      spriteData.bubble.destroy();
      spriteData.bubble = null;
    }

    // Expanded randomness: mix in status texts + a small random corpus
    const baseTexts = SPEECH_TEXTS[spriteData.agent.status] || SPEECH_TEXTS.IDLE;
    const extra = [
      'LOL', 'brb', 'on it', 'nice!', 'cool 😎', 'ok', 'yep', 'hmm', 'yup', 'got it',
      'working on it', 'one sec', 'be right back', 'ping me', 'scheduling', 'solid', 'neat'
    ];
    const pool = [...baseTexts, ...extra];
    const text = pool[Math.floor(Math.random() * pool.length)];

    const bubbleText = this.add.text(0, 0, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#000000',
      align: 'center',
      wordWrap: { width: 120 },
    }).setOrigin(0.5);

    const padding = 8;
    const bubbleW = bubbleText.width + padding * 2;
    const bubbleH = bubbleText.height + padding * 2;

    const bg = this.add.rectangle(0, 0, bubbleW, bubbleH, 0xffffff, 0.95);
    bg.setStrokeStyle(2, 0x333333);

    // Tail triangle
    const tail = this.add.triangle(0, bubbleH / 2 + 4, -4, 0, 4, 0, 0, 8, 0xffffff);
    tail.setStrokeStyle(1, 0x333333);

    let bx = spriteData.container.x;
    let by = spriteData.container.y - 70;

    // Avoid overlapping with other bubbles: simple check and nudge
    const existingBubbles = Array.from(this.agentSprites.values()).map(s => s.bubble).filter(Boolean) as Phaser.GameObjects.Container[];
    for (const eb of existingBubbles) {
      const dx = eb.x - bx;
      const dy = eb.y - by;
      const bdist = Math.sqrt(dx * dx + dy * dy);
      if (bdist < Math.max(bubbleW, bubbleH)) {
        // nudge horizontally away
        bx -= Math.sign(dx || 1) * (Math.max(bubbleW, bubbleH) - bdist + 8);
      }
    }

    const bubble = this.add.container(bx, by, [bg, bubbleText, tail]);
    bubble.setDepth(2000);

    spriteData.bubble = bubble;

    // Fade in
    bubble.setAlpha(0);
    this.tweens.add({
      targets: bubble,
      alpha: 1,
      duration: 300,
      ease: 'Sine.easeIn',
    });

    // Remove after 3-4 seconds
    this.time.delayedCall(3000 + Math.random() * 1000, () => {
      if (spriteData.bubble === bubble) {
        this.tweens.add({
          targets: bubble,
          alpha: 0,
          duration: 500,
          ease: 'Sine.easeOut',
          onComplete: () => {
            bubble.destroy();
            if (spriteData.bubble === bubble) {
              spriteData.bubble = null;
            }
          },
        });
      }
    });
  }

  update() {
    // Update bubble positions to follow agents
    for (const [, spriteData] of this.agentSprites) {
      if (spriteData.bubble) {
        spriteData.bubble.x = spriteData.container.x;
        spriteData.bubble.y = spriteData.container.y - 70;
      }
    }

    // Collision detection — push agents apart if too close
    const isMobile = window.innerWidth <= 768;
    const MIN_DIST = isMobile ? 120 : 80; // Wider gap on mobile for larger characters
    const PUSH_FORCE = isMobile ? 1.5 : 2.5; // Gentler push on mobile for smoother movement
    const entries = Array.from(this.agentSprites.values());

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const a = entries[i].container;
        const b = entries[j].container;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MIN_DIST && dist > 0) {
          // Normalize and push apart
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = (MIN_DIST - dist) * 0.5 * PUSH_FORCE;

          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;

          // Clamp to game bounds
          a.x = Phaser.Math.Clamp(a.x, 40, 1240);
          a.y = Phaser.Math.Clamp(a.y, 100, 650);
          b.x = Phaser.Math.Clamp(b.x, 40, 1240);
          b.y = Phaser.Math.Clamp(b.y, 100, 650);

          // Update depth for Y-sorting
          a.setDepth(100 + a.y);
          b.setDepth(100 + b.y);
        }
      }
    }
  }
}
