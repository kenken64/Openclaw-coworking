import { useState, useEffect, useRef } from 'react';
import type { Agent, Room } from '../types';
import spriteSheet from '../assets/PixelOfficeAssets.png';
import './OfficeGrid.css';

interface Props {
  rooms: Room[];
  agents: Agent[];
  selectedAgent: string | null;
}

// Sprite sheet: 256x160
const SHEET = { w: 256, h: 160 };

interface SR { x: number; y: number; w: number; h: number }

// Sprite coordinates from PixelOfficeAssets.png
const SP = {
  // Characters (bottom-left row)
  person1: { x: 1, y: 126, w: 14, h: 20 },
  person2: { x: 17, y: 126, w: 14, h: 20 },
  person3: { x: 33, y: 126, w: 14, h: 20 },
  cat:     { x: 49, y: 130, w: 16, h: 14 },
  person4: { x: 65, y: 126, w: 14, h: 20 },
  person5: { x: 81, y: 126, w: 14, h: 20 },

  // Large furniture
  orangeCouch:    { x: 84, y: 48, w: 28, h: 16 },
  redCouch:       { x: 97, y: 126, w: 28, h: 18 },
  blueCouch:      { x: 127, y: 126, w: 28, h: 18 },
  vendingMachine: { x: 160, y: 108, w: 22, h: 38 },
  snackShelf:     { x: 186, y: 108, w: 26, h: 38 },
  serverRack:     { x: 234, y: 96, w: 20, h: 52 },

  // Medium furniture
  blueSeats:  { x: 0, y: 48, w: 80, h: 16 },
  whitePanel: { x: 68, y: 64, w: 40, h: 16 },
  grayPanel:  { x: 112, y: 64, w: 28, h: 16 },

  // Small items
  window1: { x: 160, y: 48, w: 30, h: 28 },
  window2: { x: 194, y: 48, w: 30, h: 28 },
  plant:   { x: 114, y: 48, w: 14, h: 16 },
  monitor: { x: 140, y: 64, w: 14, h: 16 },
} as const;

const CHARS: SR[] = [SP.person1, SP.person2, SP.person3, SP.person4, SP.person5];

function Sprite({ s, scale = 3, className, style }: {
  s: SR; scale?: number; className?: string; style?: React.CSSProperties;
}) {
  return (
    <div
      className={`sprite ${className || ''}`}
      style={{
        width: s.w * scale,
        height: s.h * scale,
        backgroundImage: `url(${spriteSheet})`,
        backgroundPosition: `-${s.x * scale}px -${s.y * scale}px`,
        backgroundSize: `${SHEET.w * scale}px ${SHEET.h * scale}px`,
        ...style,
      }}
    />
  );
}

const SCALE = 2.5;

// Simple obstacle rectangles (percent-based, relative to room-agents-area)
type Rect = { x: number; y: number; w: number; h: number };

const OBSTACLES: Record<string, Rect[]> = {
  // Try to reflect rough furniture placement without over-blocking the area
  conference: [
    // Center table/couch band
    { x: 35, y: 18, w: 30, h: 12 },
  ],
  jarvis: [
    // Server corner on the right
    { x: 72, y: 10, w: 18, h: 18 },
  ],
  kitchen: [
    // Vending/shelf center
    { x: 40, y: 12, w: 20, h: 16 },
  ],
  gym: [
    // Long seat row
    { x: 25, y: 15, w: 50, h: 12 },
  ],
  vibe: [
    // Two sofas left and right
    { x: 20, y: 18, w: 18, h: 12 },
    { x: 62, y: 18, w: 18, h: 12 },
  ],
};

// Room furniture compositions
const roomFurniture: Record<string, React.ReactNode> = {
  conference: (
    <div className="room-interior">
      <div className="furniture-row furniture-center">
        <Sprite s={SP.orangeCouch} scale={SCALE} />
      </div>
      <div className="furniture-row furniture-spread">
        <Sprite s={SP.plant} scale={SCALE} />
        <Sprite s={SP.whitePanel} scale={SCALE} />
      </div>
    </div>
  ),
  jarvis: (
    <div className="room-interior">
      <div className="furniture-row furniture-center">
        <Sprite s={SP.grayPanel} scale={SCALE} />
        <Sprite s={SP.monitor} scale={SCALE} />
        <Sprite s={SP.monitor} scale={SCALE} />
      </div>
      <Sprite s={SP.serverRack} scale={1.8} className="furniture-corner" />
    </div>
  ),
  kitchen: (
    <div className="room-interior">
      <div className="furniture-row furniture-center">
        <Sprite s={SP.vendingMachine} scale={2} />
        <Sprite s={SP.snackShelf} scale={2} />
      </div>
      <div className="furniture-row furniture-center">
        <Sprite s={SP.whitePanel} scale={SCALE} />
      </div>
    </div>
  ),
  gym: (
    <div className="room-interior">
      <div className="furniture-row furniture-center">
        <Sprite s={SP.blueSeats} scale={2} />
      </div>
      <div className="furniture-row furniture-spread">
        <Sprite s={SP.grayPanel} scale={SCALE} />
        <Sprite s={SP.grayPanel} scale={SCALE} />
      </div>
    </div>
  ),
  vibe: (
    <div className="room-interior">
      <div className="furniture-row furniture-center">
        <Sprite s={SP.redCouch} scale={SCALE} />
        <Sprite s={SP.blueCouch} scale={SCALE} />
      </div>
      <div className="furniture-row furniture-spread">
        <Sprite s={SP.plant} scale={SCALE} />
        <Sprite s={SP.plant} scale={SCALE} />
      </div>
    </div>
  ),
};

// Agent walking animation: each agent gets a random position that updates periodically
interface WalkPos { x: number; y: number; flipX: boolean }

function useAgentWalking(roomId: string, agents: Agent[]) {
  const [positions, setPositions] = useState<Record<string, WalkPos>>({});
  const targetsRef = useRef<Record<string, WalkPos>>({});

  // Bounds (in percentage of the agents area)
  const X_MIN = 5;
  const X_MAX = 85; // keep inside area visually
  const Y_MIN = 5;
  const Y_MAX = 35;
  const MIN_DIST = 6; // minimum separation in percentage units (looser spacing)
  const MAX_TRIES = 12;

  const dist2 = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  };

  const randomPos = () => ({
    x: Math.random() * (X_MAX - X_MIN) + X_MIN,
    y: Math.random() * (Y_MAX - Y_MIN) + Y_MIN,
  });

  const insideRect = (p: { x: number; y: number }, r: Rect) =>
    p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

  const blocked = (p: { x: number; y: number }) => {
    const roomsRects = OBSTACLES[roomId] || [];
    return roomsRects.some(r => insideRect(p, r));
  };

  // Attempt to find a free spot not colliding with others
  const findFreePos = (
    id: string,
    current: WalkPos | undefined,
    snapshot: Record<string, WalkPos>,
  ) => {
    // Build list of other positions to avoid
    const others = Object.entries(snapshot)
      .filter(([otherId]) => otherId !== id)
      .map(([, p]) => ({ x: p.x, y: p.y }));

    let candidate = randomPos();
    let tries = 0;
    while (
      tries < MAX_TRIES &&
      (others.some(o => dist2(o, candidate) < MIN_DIST * MIN_DIST) || blocked(candidate))
    ) {
      candidate = randomPos();
      tries++;
    }

    // If we didn't find a free spot, keep current to avoid overlap
    const stillCollides = others.some(o => dist2(o, candidate) < MIN_DIST * MIN_DIST) || blocked(candidate);
    if (stillCollides && current) {
      return { x: current.x, y: current.y, flipX: current.flipX } as WalkPos;
    }

    const flipX = current ? candidate.x < current.x : false;
    return { x: candidate.x, y: candidate.y, flipX } as WalkPos;
  };

  // Initialize positions (non-overlapping where possible, avoiding obstacles)
  useEffect(() => {
    const initial: Record<string, WalkPos> = {};
    agents.forEach((a, i) => {
      // start evenly distributed on X but ensure separation
      const base: WalkPos = {
        x: ((i * 23 + 10) % 80) + 5,
        y: Math.random() * (Y_MAX - Y_MIN) + Y_MIN,
        flipX: false,
      };
      // try base first; if collides, search
      const tempSnapshot = { ...initial };
      let pos: WalkPos = {
        x: Math.min(X_MAX, Math.max(X_MIN, base.x)),
        y: Math.min(Y_MAX, Math.max(Y_MIN, base.y)),
        flipX: false,
      };
      const collides = Object.values(tempSnapshot).some(p => dist2(p, pos) < MIN_DIST * MIN_DIST) || blocked(pos);
      if (collides) {
        pos = findFreePos(a.id, undefined, tempSnapshot);
      }
      initial[a.id] = pos;
    });
    setPositions(initial);
    targetsRef.current = { ...initial };
  }, [agents.length]);

  // Periodically pick new random targets, avoiding collisions
  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prev => {
        const next: Record<string, WalkPos> = { ...prev };
        agents.forEach(a => {
          if (Math.random() < 0.4) {
            const current = prev[a.id];
            if (current) {
              // Use current snapshot while updating to avoid overlaps
              const updated = findFreePos(a.id, current, next);
              next[a.id] = updated;
            }
          }
        });
        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [agents]);

  return positions;
}

function RoomWithAgents({ room, roomAgents, selectedAgent }: {
  room: Room;
  roomAgents: Agent[];
  selectedAgent: string | null;
}) {
  const positions = useAgentWalking(room.id, roomAgents);
  const isHighlighted = selectedAgent && roomAgents.some(a => a.id === selectedAgent);

  return (
    <div className={`room-card ${isHighlighted ? 'room-highlighted' : ''}`}>
      <div className="room-header">
        <span className="room-icon">{room.icon}</span>
        <span className="room-name">{room.name}</span>
        <span className="room-agent-count">{roomAgents.length}</span>
      </div>
      <div className="room-content">
        {roomFurniture[room.id]}
        <div className="room-agents-area">
          {roomAgents.map((a, i) => {
            const pos = positions[a.id] || { x: 10 + i * 20, y: 15, flipX: false };
            return (
              <div
                key={a.id}
                className={`walking-agent ${selectedAgent === a.id ? 'agent-highlight' : ''}`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  borderColor: a.color,
                  transform: pos.flipX ? 'scaleX(-1)' : 'scaleX(1)',
                }}
                title={`${a.name} - ${a.status}`}
              >
                <Sprite s={CHARS[i % CHARS.length]} scale={SCALE} />
                <span className="sprite-label" style={pos.flipX ? { transform: 'scaleX(-1)' } : undefined}>
                  {a.name}
                </span>
                <div
                  className="agent-status-pip"
                  style={{
                    background:
                      a.status === 'WORKING' ? '#2ecc71' :
                      a.status === 'IDLE' ? '#f1c40f' : '#3498db',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function OfficeGrid({ rooms, agents, selectedAgent }: Props) {
  return (
    <div className="office-grid">
      {rooms.map(room => {
        const roomAgents = agents.filter(a => a.room === room.id);
        return (
          <RoomWithAgents
            key={room.id}
            room={room}
            roomAgents={roomAgents}
            selectedAgent={selectedAgent}
          />
        );
      })}
    </div>
  );
}
