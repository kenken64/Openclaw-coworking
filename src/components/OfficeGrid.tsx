import type { Agent, Room } from '../types';
import './OfficeGrid.css';

interface Props {
  rooms: Room[];
  agents: Agent[];
  selectedAgent: string | null;
}

const roomFurniture: Record<string, React.ReactNode> = {
  conference: (
    <div className="room-interior">
      <div className="furniture table-conference">
        <div className="table-top"></div>
        <div className="chair chair-1"></div>
        <div className="chair chair-2"></div>
        <div className="chair chair-3"></div>
        <div className="chair chair-4"></div>
      </div>
      <div className="room-decor whiteboard"></div>
    </div>
  ),
  jarvis: (
    <div className="room-interior">
      <div className="furniture desk-row">
        <div className="desk">
          <div className="monitor"></div>
          <div className="monitor monitor-2"></div>
        </div>
        <div className="desk desk-2">
          <div className="monitor"></div>
        </div>
      </div>
      <div className="room-decor server-rack"></div>
    </div>
  ),
  kitchen: (
    <div className="room-interior">
      <div className="furniture kitchen-counter">
        <div className="appliance fridge"></div>
        <div className="appliance microwave"></div>
        <div className="appliance coffee-maker"></div>
      </div>
      <div className="room-decor kitchen-table"></div>
    </div>
  ),
  gym: (
    <div className="room-interior">
      <div className="furniture gym-equipment">
        <div className="equipment treadmill"></div>
        <div className="equipment weights"></div>
        <div className="equipment bench"></div>
      </div>
    </div>
  ),
  vibe: (
    <div className="room-interior">
      <div className="furniture vibe-setup">
        <div className="couch"></div>
        <div className="speaker speaker-1"></div>
        <div className="speaker speaker-2"></div>
      </div>
      <div className="room-decor plant"></div>
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
              {roomFurniture[room.id]}
              <div className="room-agents">
                {roomAgents.map(a => (
                  <div
                    key={a.id}
                    className={`room-agent-sprite ${selectedAgent === a.id ? 'agent-highlight' : ''}`}
                    style={{ borderColor: a.color }}
                    title={a.name}
                  >
                    <span>{a.emoji}</span>
                    <span className="sprite-label">{a.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
