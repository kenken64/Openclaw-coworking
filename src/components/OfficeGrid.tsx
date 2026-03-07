import type { CSSProperties } from 'react';
import type { Agent, Room } from '../types';
import {
  spriteStyle, spriteStyleFitH, getAgentSprite,
  CHAIRS, DESK_BLUE, DESK_RED, DESK_ORANGE,
  SOFA_BLUE, SOFA_GREEN, PLANT, BULLETIN, CHARACTERS,
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

const roomBottomFurniture: Record<string, React.ReactNode> = {
  conference: (
    <div className="conf-bottom">
      {/* Two walking characters below table */}
      <div className="conf-walkers">
        <div className="walker walker-1"><Sprite sprite={CHARACTERS[2]} scale={3} /></div>
        <div className="walker walker-2"><Sprite sprite={CHARACTERS[4]} scale={3} /></div>
      </div>
      {/* Sofa at very bottom */}
      <div className="scene-row">
        <Sprite sprite={SOFA_BLUE} scale={3} />
      </div>
    </div>
  ),
};

const roomFurniture: Record<string, React.ReactNode> = {
  conference: (
    <div className="room-scene conf-room">
      {/* 1 character standing at the top */}
      <div className="scene-row">
        <Sprite sprite={CHARACTERS[1]} scale={3} />
      </div>
      {/* Left chairs | Rotated tables (vertical) | Right chairs */}
      <div className="conf-table-group">
        <div className="conf-side-chairs">
          <Sprite sprite={CHAIRS[0]} scale={2} />
          <Sprite sprite={CHAIRS[3]} scale={2} />
          <Sprite sprite={CHAIRS[1]} scale={2} />
        </div>
        <div className="conf-tables-vertical">
          <Sprite sprite={DESK_ORANGE} scale={3} style={{ transform: 'rotate(90deg)' }} />
          <Sprite sprite={DESK_RED} scale={3} style={{ transform: 'rotate(90deg)' }} />
        </div>
        <div className="conf-side-chairs">
          <Sprite sprite={CHAIRS[4]} scale={2} />
          <Sprite sprite={CHAIRS[2]} scale={2} />
          <Sprite sprite={CHAIRS[5]} scale={2} />
        </div>
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
                  {roomBottomFurniture[room.id]}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
