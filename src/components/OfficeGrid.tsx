import type { CSSProperties } from 'react';
import type { Agent, Room } from '../types';
import {
  spriteStyle, spriteStyleFitH, getAgentSprite,
  CHAIRS, DESK_BLUE, DESK_RED, DESK_ORANGE,
  SOFA_BLUE, SOFA_GREEN, PLANT, BULLETIN,
  CHARACTERS,
} from '../sprites';
import type { SpriteRect } from '../sprites';
import './OfficeGrid.css';

interface Props {
  rooms: Room[];
  agents: Agent[];
  selectedAgent: string | null;
}

function Sprite({ sprite, scale = 2, style }: { sprite: SpriteRect; scale?: number; style?: CSSProperties }) {
  return <div style={{ ...spriteStyle(sprite, scale), ...style }} />;
}

const roomFurniture: Record<string, React.ReactNode> = {
  conference: (
    <div className="conf-layout">
      {/* Presenter at head of table */}
      <div className="conf-presenter">
        <div className="presenter-char"><Sprite sprite={CHARACTERS[1]} scale={3} /></div>
      </div>
      {/* Top row: 3 chairs */}
      <div className="scene-row">
        <Sprite sprite={CHAIRS[0]} scale={2.5} />
        <Sprite sprite={CHAIRS[3]} scale={2.5} />
        <Sprite sprite={CHAIRS[1]} scale={2.5} />
      </div>
      {/* Big conference table (2 desks side by side) */}
      <div className="scene-row conf-table-row">
        <Sprite sprite={CHAIRS[4]} scale={2.5} style={{ transform: 'scaleX(-1)' }} />
        <Sprite sprite={DESK_ORANGE} scale={3} />
        <Sprite sprite={DESK_RED} scale={3} />
        <Sprite sprite={CHAIRS[2]} scale={2.5} />
      </div>
      {/* Bottom row: 3 chairs */}
      <div className="scene-row">
        <Sprite sprite={CHAIRS[5]} scale={2.5} />
        <Sprite sprite={CHAIRS[0]} scale={2.5} />
        <Sprite sprite={CHAIRS[3]} scale={2.5} />
      </div>
      {/* Two walking characters */}
      <div className="conf-walkers">
        <div className="walker walker-1"><Sprite sprite={CHARACTERS[2]} scale={2.5} /></div>
        <div className="walker walker-2"><Sprite sprite={CHARACTERS[4]} scale={2.5} /></div>
      </div>
      {/* Sofa at bottom */}
      <div className="scene-row conf-sofa-row">
        <Sprite sprite={SOFA_BLUE} scale={3} />
      </div>
    </div>
  ),
  jarvis: (
    <div className="room-scene">
      <div className="scene-row">
        <Sprite sprite={BULLETIN} scale={3} />
        <Sprite sprite={DESK_BLUE} scale={2} />
      </div>
    </div>
  ),
  kitchen: (
    <div className="room-scene">
      <div className="scene-row">
        <Sprite sprite={PLANT} scale={3} />
        <Sprite sprite={DESK_ORANGE} scale={3} />
      </div>
    </div>
  ),
  gym: (
    <div className="room-scene">
      <div className="scene-row">
        <Sprite sprite={DESK_RED} scale={3} />
        <Sprite sprite={CHAIRS[3]} scale={3} />
      </div>
    </div>
  ),
  vibe: (
    <div className="room-scene">
      <div className="scene-row">
        <Sprite sprite={SOFA_BLUE} scale={3} />
        <Sprite sprite={SOFA_GREEN} scale={3} />
      </div>
    </div>
  ),
};

export default function OfficeGrid({ rooms, agents, selectedAgent }: Props) {
  return (
    <div className="office-grid">
      {rooms.map(room => {
        const roomAgents = agents.filter(a => a.room === room.id);
        const isHighlighted = selectedAgent && roomAgents.some(a => a.id === selectedAgent);

        return (
          <div
            key={room.id}
            className={`room-card ${isHighlighted ? 'room-highlighted' : ''}`}
          >
            <div className="room-header">
              <span className="room-icon">{room.icon}</span>
              <span className="room-name">{room.name}</span>
            </div>
            <div className="room-content">
              <div className="room-floor">
                <div className="room-floor-inner">
                  {roomFurniture[room.id]}
                  <div className="room-agents">
                    {roomAgents.map(a => (
                      <div
                        key={a.id}
                        className={`room-agent-sprite ${selectedAgent === a.id ? 'agent-highlight' : ''}`}
                        title={a.name}
                      >
                        <div style={spriteStyleFitH(getAgentSprite(a.id), 60)} />
                        <span className="sprite-label">{a.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
