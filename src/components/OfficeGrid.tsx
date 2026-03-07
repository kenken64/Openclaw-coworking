import type { CSSProperties } from 'react';
import type { Agent, Room } from '../types';
import {
  spriteStyle, spriteStyleFitH, getAgentSprite,
  CHAIRS, DESK_BLUE, DESK_RED, DESK_ORANGE,
  SOFA_BLUE, SOFA_GREEN, PLANT, BULLETIN,
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
    <div className="room-scene">
      {/* Top chairs row */}
      <div className="scene-row">
        <Sprite sprite={CHAIRS[0]} scale={2.5} />
        <Sprite sprite={CHAIRS[3]} scale={2.5} />
        <Sprite sprite={CHAIRS[1]} scale={2.5} />
      </div>
      {/* Conference table with side chairs */}
      <div className="scene-row">
        <Sprite sprite={CHAIRS[4]} scale={2.5} />
        <Sprite sprite={DESK_ORANGE} scale={3} />
        <Sprite sprite={DESK_RED} scale={3} />
        <Sprite sprite={CHAIRS[2]} scale={2.5} />
      </div>
      {/* Bottom chairs row */}
      <div className="scene-row">
        <Sprite sprite={CHAIRS[5]} scale={2.5} />
        <Sprite sprite={CHAIRS[0]} scale={2.5} />
        <Sprite sprite={CHAIRS[3]} scale={2.5} />
      </div>
      {/* Sofa at bottom */}
      <div className="scene-row">
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
