import type { Agent } from '../types';
import './AgentCards.css';

interface Props {
  agents: Agent[];
  selectedAgent: string | null;
  onAgentClick: (id: string) => void;
}

const statusColor: Record<string, string> = {
  WORKING: '#2ecc71',
  IDLE: '#f1c40f',
  COMPUTING: '#3498db',
};

export default function AgentCards({ agents, selectedAgent, onAgentClick }: Props) {
  return (
    <div className="agent-cards">
      <h3 className="cards-title">⚡ WORKSTATIONS</h3>
      <div className="cards-grid">
        {agents.map(agent => (
          <div
            key={agent.id}
            className={`agent-card ${selectedAgent === agent.id ? 'card-selected' : ''}`}
            onClick={() => onAgentClick(agent.id)}
          >
            <div className="card-room">
              <div className="card-desk">
                <div className="card-monitor" style={{ borderColor: statusColor[agent.status] }}>
                  <div className="card-screen-line" style={{ background: statusColor[agent.status] }}></div>
                  <div className="card-screen-line short" style={{ background: statusColor[agent.status] }}></div>
                </div>
              </div>
              <div className="card-agent-sprite">
                <span className="card-emoji">{agent.emoji}</span>
              </div>
              {agent.name === 'TRENDY' && (
                <>
                  <div className="sparkle sparkle-1">✦</div>
                  <div className="sparkle sparkle-2">✧</div>
                  <div className="sparkle sparkle-3">✦</div>
                </>
              )}
            </div>
            <div className="card-info">
              <span className="card-name">{agent.name}</span>
              <span
                className="card-status-dot"
                style={{
                  background: statusColor[agent.status],
                  boxShadow: `0 0 6px ${statusColor[agent.status]}`,
                }}
              ></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
