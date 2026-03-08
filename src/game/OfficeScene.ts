import Phaser from 'phaser';
import { generateOfficeBackground } from './generateBackground';
import { initialAgents } from '../data';
import type { Agent, AgentStatus } from '../types';
import { CHARACTERS } from '../sprites';

// ── Area coordinates (where agents go based on status/room) ──
const AREA_COORDS: Record<string, { x: number; y: number }[]> = {
  conference: [
    { x: 80, y: 200 }, { x: 170, y: 190 }, { x: 260, y: 210 },
    { x: 110, y: 280 }, { x: 220, y: 270 },
  ],
  jarvis: [  // Work desks — wider gaps
    { x: 380, y: 180 }, { x: 480, y: 180 }, { x: 580, y: 180 },
    { x: 380, y: 310 }, { x: 480, y: 310 }, { x: 580, y: 310 },
    { x: 680, y: 180 }, { x: 680, y: 310 },
  ],
  computing: [ // Server room — wider spacing
    { x: 830, y: 180 }, { x: 940, y: 190 }, { x: 850, y: 290 },
    { x: 960, y: 280 }, { x: 900, y: 350 },
  ],
  kitchen: [
    { x: 80, y: 470 }, { x: 180, y: 530 }, { x: 280, y: 490 },
    { x: 120, y: 590 }, { x: 240, y: 570 },
  ],
  gym: [
    { x: 370, y: 470 }, { x: 470, y: 510 }, { x: 570, y: 470 },
    { x: 400, y: 580 }, { x: 520, y: 570 },
  ],
  vibe: [
    { x: 700, y: 460 }, { x: 800, y: 500 }, { x: 900, y: 470 },
    { x: 720, y: 560 }, { x: 830, y: 580 }, { x: 950, y: 540 },
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

    // Notify React of initial state
    if (this.onAgentsUpdate) {
      this.onAgentsUpdate([...this.agents]);
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

    // Character sprite (scaled up 3x for visibility)
    const charIdx = AGENT_SPRITE_MAP[agent.id] ?? 0;
    const texKey = `char_${charIdx}`;
    let charSprite: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;

    if (this.textures.exists(texKey)) {
      charSprite = this.add.image(0, 0, texKey);
      charSprite.setScale(3);
      (charSprite as Phaser.GameObjects.Image).setTexture(texKey);
    } else {
      // Fallback: colored rectangle
      charSprite = this.add.rectangle(0, 0, 16, 24, Phaser.Display.Color.HexStringToColor(agent.color).color);
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

          // Animate movement
          this.tweens.add({
            targets: spriteData.container,
            x: spriteData.targetX,
            y: spriteData.targetY,
            duration: 1500 + Math.random() * 1000,
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

    const texts = SPEECH_TEXTS[spriteData.agent.status] || SPEECH_TEXTS.IDLE;
    const text = texts[Math.floor(Math.random() * texts.length)];

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

    const bubble = this.add.container(
      spriteData.container.x,
      spriteData.container.y - 70,
      [bg, bubbleText, tail]
    );
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
    const MIN_DIST = 55; // minimum distance between agents
    const PUSH_FORCE = 1.5;
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
