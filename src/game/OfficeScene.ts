import Phaser from 'phaser';
import { generateOfficeBackground } from './generateBackground';
import { initialAgents } from '../data';
import type { Agent, AgentStatus } from '../types';
import { CHARACTERS, COMPUTER } from '../sprites';

// ── Area coordinates — open floor slots only, cross-referenced against furniture ──
const AREA_COORDS: Record<string, { x: number; y: number }[]> = {
  conference: [
    { x: 82, y: 193 }, { x: 82, y: 213 },
    { x: 142, y: 162 }, { x: 202, y: 162 },
    { x: 280, y: 193 }, { x: 280, y: 213 },
    { x: 142, y: 244 }, { x: 202, y: 244 },
  ],
  kitchen: [
    { x: 618, y: 167 },
    { x: 735, y: 158 }, { x: 735, y: 207 },
    { x: 820, y: 165 }, { x: 820, y: 210 },
    { x: 568, y: 272 }, { x: 642, y: 272 }, { x: 712, y: 272 },
    { x: 600, y: 348 }, { x: 682, y: 348 },
  ],
  gym: [
    { x: 882, y: 157 }, { x: 882, y: 202 },
    { x: 1028, y: 157 }, { x: 1028, y: 197 },
    { x: 1220, y: 155 }, { x: 1220, y: 207 }, { x: 1220, y: 257 },
    { x: 920, y: 353 }, { x: 1000, y: 353 }, { x: 1100, y: 353 },
  ],
  computing: [
    { x: 48, y: 432 }, { x: 120, y: 432 }, { x: 200, y: 432 },
    { x: 292, y: 462 }, { x: 292, y: 512 }, { x: 292, y: 562 },
    { x: 352, y: 497 }, { x: 378, y: 497 },
  ],
  vibe: [
    { x: 468, y: 490 }, { x: 468, y: 545 },
    { x: 800, y: 467 }, { x: 800, y: 525 }, { x: 800, y: 578 },
    { x: 580, y: 607 }, { x: 640, y: 607 }, { x: 700, y: 607 },
    { x: 540, y: 558 },
  ],
  jarvis: [
    { x: 938, y: 488 }, { x: 1038, y: 488 }, { x: 1138, y: 488 },
    { x: 945, y: 553 }, { x: 1050, y: 553 }, { x: 1153, y: 553 },
    { x: 963, y: 575 }, { x: 1023, y: 575 },
    { x: 1220, y: 508 }, { x: 1220, y: 560 },
    { x: 878, y: 460 }, { x: 878, y: 508 }, { x: 878, y: 553 },
    { x: 1023, y: 460 }, { x: 1153, y: 595 },
  ],
};

// ── Furniture bounding boxes per area — used to reject overlap slots ──
const FURNITURE_ZONES: Record<string, { x: number; y: number; w: number; h: number }[]> = {
  conference: [
    { x: 98,  y: 168, w: 164, h: 54  },
    { x: 181, y: 118, w: 82,  h: 32  },
  ],
  kitchen: [
    { x: 477, y: 148, w: 122, h: 110 },
    { x: 645, y: 188, w: 84,  h: 44  },
    { x: 765, y: 138, w: 44,  h: 74  },
    { x: 545, y: 283, w: 172, h: 57  },
  ],
  gym: [
    { x: 896, y: 138, w: 68,  h: 70  },
    { x: 971, y: 135, w: 46,  h: 35  },
    { x: 1049,y: 136, w: 48,  h: 96  },
    { x: 1108,y: 159, w: 57,  h: 26  },
    { x: 1171,y: 136, w: 40,  h: 40  },
    { x: 931, y: 248, w: 250, h: 84  },
  ],
  computing: [
    { x: 58,  y: 448, w: 214, h: 64  },
    { x: 58,  y: 528, w: 214, h: 64  },
    { x: 338, y: 588, w: 64,  h: 52  },
    { x: 48,  y: 608, w: 254, h: 17  },
  ],
  vibe: [
    { x: 505, y: 468, w: 124, h: 38  },
    { x: 505, y: 503, w: 40,  h: 90  },
    { x: 553, y: 518, w: 84,  h: 34  },
    { x: 695, y: 458, w: 84,  h: 38  },
    { x: 663, y: 508, w: 44,  h: 44  },
  ],
  jarvis: [
    { x: 901, y: 448, w: 274, h: 39  },
    { x: 901, y: 508, w: 294, h: 44  },
    { x: 1191,y: 458, w: 64,  h: 104 },
    { x: 921, y: 578, w: 154, h: 34  },
    { x: 1111,y: 578, w: 124, h: 64  },
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
  isMoving: boolean;
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

    // Room labels always on top of characters
    this.createRoomLabels();

    // Notify React of initial state
    if (this.onAgentsUpdate) {
      this.onAgentsUpdate([...this.agents]);
    }
  }

  private createRoomLabels() {
    const roomW = (1280 - 60) / 3;
    const roomH = (720 - 140) / 2;
    const labels = [
      { text: '📋 CONFERENCE', x: 30,                    y: 112, color: '#ccccee' },
      { text: '🍳 KITCHEN',   x: 20 + roomW + 30,        y: 112, color: '#ccccee' },
      { text: '💪 GYM',       x: 20 + roomW * 2 + 50,    y: 112, color: '#fff1a8' },
      { text: '🖧 SERVER',    x: 30,                     y: 100 + roomH + 32, color: '#ccccee' },
      { text: '🎵 LOUNGE',   x: 20 + roomW + 30,        y: 100 + roomH + 32, color: '#ccccee' },
      { text: '🖥️ WORKSPACE', x: 20 + roomW * 2 + 50,    y: 100 + roomH + 32, color: '#ccccee' },
    ];
    for (const label of labels) {
      this.add.text(label.x, label.y, label.text, {
        fontFamily: 'bold monospace',
        fontSize: '13px',
        color: label.color,
        stroke: '#000000',
        strokeThickness: 3,
        backgroundColor: '#00000055',
        padding: { x: 4, y: 2 },
      }).setDepth(5000).setOrigin(0, 0.5);
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
      { x: confX + 160, y: confY + 95 }, // Center of oval conference table
    ];
    for (const pos of confCompPositions) {
      const comp = this.add.image(pos.x, pos.y, 'computer_sprite');
      comp.setScale(1.5); // Consistent smaller scale
      comp.setDepth(60); // Higher depth to appear on top of tables
    }

    // Kitchen computers (minimal)
    const kitchenX = 20 + roomW + 20, kitchenY = 100;
    const kitchenCompPositions = [
      { x: kitchenX + 240, y: kitchenY + 110 }, // Tablet on kitchen island (table)
    ];
    for (const pos of kitchenCompPositions) {
      const comp = this.add.image(pos.x, pos.y, 'computer_sprite');
      comp.setScale(1.0); // Small tablet scale
      comp.setDepth(60); // Higher depth to appear on top
    }

    // Main workspace computers (updated for new desk layout)
    const workX = 20 + roomW * 2 + 40, workY = 100 + roomH + 20;
    const workCompPositions = [
      // Individual workstations
      { x: workX + 65, y: workY + 58 }, { x: workX + 165, y: workY + 58 }, { x: workX + 265, y: workY + 58 },
      { x: workX + 73, y: workY + 120 }, { x: workX + 178, y: workY + 123 }, { x: workX + 280, y: workY + 120 },
      // Hot desks (laptops on communal table)
      { x: workX + 80, y: workY + 185 }, { x: workX + 120, y: workY + 185 }, { x: workX + 170, y: workY + 185 },
      // Collaborative area monitor
      { x: workX + 350, y: workY + 100 },
      // Focus pod screen
      { x: workX + 275, y: workY + 190 },
    ];
    for (const pos of workCompPositions) {
      const comp = this.add.image(pos.x, pos.y, 'computer_sprite');
      comp.setScale(1.5); // Smaller scale to fit properly on desks
      comp.setDepth(60); // Higher depth to appear on top of desks
    }

    // Server room: no computers (racks have their own LED indicators)


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

  private getAvailablePosition(agentId: string, area: string): { x: number; y: number } {
    const coords = AREA_COORDS[area] || AREA_COORDS['vibe'];
    const MIN_SLOT_DIST = 65;
    const FURNITURE_PAD = 14;

    const takenPositions: { x: number; y: number }[] = [];
    for (const [id, spriteData] of this.agentSprites) {
      if (id !== agentId) {
        takenPositions.push({ x: spriteData.targetX, y: spriteData.targetY });
      }
    }

    const clearOfFurniture = (x: number, y: number): boolean =>
      (FURNITURE_ZONES[area] || []).every(z =>
        x < z.x - FURNITURE_PAD || x > z.x + z.w + FURNITURE_PAD ||
        y < z.y - FURNITURE_PAD || y > z.y + z.h + FURNITURE_PAD
      );

    for (const coord of coords) {
      if (!clearOfFurniture(coord.x, coord.y)) continue;
      const isFree = takenPositions.every(t => {
        const dx = t.x - coord.x;
        const dy = t.y - coord.y;
        return Math.sqrt(dx * dx + dy * dy) >= MIN_SLOT_DIST;
      });
      if (isFree) {
        return { x: coord.x + (Math.random() - 0.5) * 16, y: coord.y + (Math.random() - 0.5) * 16 };
      }
    }

    const clearCoords = coords.filter(c => clearOfFurniture(c.x, c.y));
    const pool = clearCoords.length > 0 ? clearCoords : coords;
    let bestCoord = pool[0];
    let bestMinDist = -1;
    for (const coord of pool) {
      if (takenPositions.length === 0) { bestCoord = coord; break; }
      const minDist = Math.min(...takenPositions.map(t => {
        const dx = t.x - coord.x;
        const dy = t.y - coord.y;
        return Math.sqrt(dx * dx + dy * dy);
      }));
      if (minDist > bestMinDist) { bestMinDist = minDist; bestCoord = coord; }
    }
    return { x: bestCoord.x + (Math.random() - 0.5) * 16, y: bestCoord.y + (Math.random() - 0.5) * 16 };
  }

  private createAgentSprite(agent: Agent) {
    const area = this.getAreaForAgent(agent);
    const pos = this.getAvailablePosition(agent.id, area);

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
      // Add bright tint for mobile visibility
      if (isMobile) {
        charSprite.setTint(0xffffff); // Bright tint for better visibility
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
      isMoving: false,
    });
  }

  private simulateStatusChanges() {
    const statuses: AgentStatus[] = ['WORKING', 'IDLE', 'COMPUTING'];
    const roomOptions: Record<AgentStatus, string[]> = {
      WORKING: ['jarvis', 'conference'],
      IDLE: ['vibe', 'kitchen', 'gym'],
      COMPUTING: ['jarvis', 'computing'],
    };

    const MAX_PER_AREA = 2;

    // Build live area occupancy counts before processing changes
    const areaCounts = new Map<string, number>();
    for (const [, spriteData] of this.agentSprites) {
      const area = this.getAreaForAgent(spriteData.agent);
      areaCounts.set(area, (areaCounts.get(area) || 0) + 1);
    }

    let changed = false;

    this.agents = this.agents.map((agent) => {
      const shouldChange = Math.random() < 0.12;
      if (!shouldChange) {
        const delta = Math.floor(Math.random() * 6) - 2;
        return { ...agent, progress: Math.max(0, Math.min(100, agent.progress + delta)) };
      }

      changed = true;
      const currentArea = this.getAreaForAgent(agent);

      // Build all status+room candidates and shuffle them
      const candidates: { status: AgentStatus; room: string }[] = [];
      for (const status of statuses) {
        for (const room of roomOptions[status]) {
          candidates.push({ status, room });
        }
      }
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }

      // Pick the first candidate whose target area has room (< MAX_PER_AREA)
      for (const { status, room } of candidates) {
        const targetArea = this.getAreaForAgent({ ...agent, status, room });
        const occupants = areaCounts.get(targetArea) || 0;
        const effective = targetArea === currentArea ? occupants - 1 : occupants;
        if (effective < MAX_PER_AREA) {
          areaCounts.set(currentArea, Math.max(0, (areaCounts.get(currentArea) || 1) - 1));
          areaCounts.set(targetArea, (areaCounts.get(targetArea) || 0) + 1);
          return { ...agent, status, room, progress: Math.floor(Math.random() * 60) + 20 };
        }
      }

      // Every area is at capacity — stay put
      const delta = Math.floor(Math.random() * 6) - 2;
      return { ...agent, progress: Math.max(0, Math.min(100, agent.progress + delta)) };
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
          const pos = this.getAvailablePosition(agent.id, area);

          spriteData.targetX = pos.x;
          spriteData.targetY = pos.y;

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

          // Animate movement
          const isMobile = window.innerWidth <= 768;
          const moveDuration = isMobile ? 3000 + Math.random() * 2000 : 2000 + Math.random() * 1000;

          spriteData.isMoving = true;
          this.tweens.add({
            targets: spriteData.container,
            x: spriteData.targetX,
            y: spriteData.targetY,
            duration: moveDuration,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
              spriteData.container.setDepth(100 + spriteData.container.y);
            },
            onComplete: () => {
              spriteData.isMoving = false;
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
      fontSize: '11px',
      color: '#111111',
      align: 'center',
      wordWrap: { width: 180 },
      stroke: '#ffffff',
      strokeThickness: 1,
    }).setOrigin(0.5);

    const padding = 14;
    const bubbleW = Math.max(bubbleText.width + padding * 2, 80);
    const bubbleH = bubbleText.height + padding * 2;

    const bg = this.add.rectangle(0, 0, bubbleW, bubbleH, 0xfffde7, 0.97);
    bg.setStrokeStyle(2, 0x444444);

    // Tail triangle
    const tail = this.add.triangle(0, bubbleH / 2 + 5, -6, 0, 6, 0, 0, 10, 0xfffde7);
    tail.setStrokeStyle(1, 0x444444);

    let bx = spriteData.container.x;
    let by = spriteData.container.y - 90;

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

  // Room boundary boxes — characters are clamped inside their room, never into separators
  private getRoomBounds(area: string): { minX: number; maxX: number; minY: number; maxY: number } {
    const bounds: Record<string, { minX: number; maxX: number; minY: number; maxY: number }> = {
      conference: { minX: 32,  maxX: 415, minY: 118, maxY: 382 },
      kitchen:    { minX: 458, maxX: 840, minY: 118, maxY: 382 },
      gym:        { minX: 884, maxX: 1265, minY: 118, maxY: 382 },
      computing:  { minX: 32,  maxX: 415, minY: 428, maxY: 692 },
      vibe:       { minX: 458, maxX: 840, minY: 428, maxY: 692 },
      jarvis:     { minX: 884, maxX: 1265, minY: 428, maxY: 692 },
    };
    return bounds[area] ?? { minX: 32, maxX: 1265, minY: 118, maxY: 692 };
  }

  update() {
    // Update bubble positions to follow agents
    for (const [, spriteData] of this.agentSprites) {
      if (spriteData.bubble) {
        spriteData.bubble.x = spriteData.container.x;
        spriteData.bubble.y = spriteData.container.y - 90;
      }
    }

    // Gentle separation for stationary characters only — skip any that are mid-tween
    const MIN_DIST = 60;
    const PUSH_FORCE = 0.4;
    const entries = Array.from(this.agentSprites.values());

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        // Skip if either character is currently moving — let them pass freely
        if (entries[i].isMoving || entries[j].isMoving) continue;

        const a = entries[i].container;
        const b = entries[j].container;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MIN_DIST && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = (MIN_DIST - dist) * 0.5 * PUSH_FORCE;

          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;

          // Clamp each to their own room
          const aBounds = this.getRoomBounds(this.getAreaForAgent(entries[i].agent));
          const bBounds = this.getRoomBounds(this.getAreaForAgent(entries[j].agent));
          a.x = Phaser.Math.Clamp(a.x, aBounds.minX, aBounds.maxX);
          a.y = Phaser.Math.Clamp(a.y, aBounds.minY, aBounds.maxY);
          b.x = Phaser.Math.Clamp(b.x, bBounds.minX, bBounds.maxX);
          b.y = Phaser.Math.Clamp(b.y, bBounds.minY, bBounds.maxY);

          a.setDepth(100 + a.y);
          b.setDepth(100 + b.y);
        }
      }
    }
  }
}
