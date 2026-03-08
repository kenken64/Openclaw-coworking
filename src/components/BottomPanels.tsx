import type { Agent } from '../types';
import './BottomPanels.css';

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

const statusEmoji: Record<string, string> = {
  WORKING: '⚡',
  IDLE: '💤',
  COMPUTING: '🔄',
};

export default function BottomPanels({ agents, selectedAgent, onAgentClick }: Props) {
  const working = agents.filter(a => a.status === 'WORKING').length;
  const idle = agents.filter(a => a.status === 'IDLE').length;
  const computing = agents.filter(a => a.status === 'COMPUTING').length;

  return (
    <div className="bottom-panels">
      {/* Status Overview Panel */}
      <div className="panel status-panel">
        <h3 className="panel-title">📊 STATUS OVERVIEW</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-dot" style={{ background: '#2ecc71' }} />
            <span className="status-label">WORKING</span>
            <span className="status-count">{working}</span>
          </div>
          <div className="status-item">
            <span className="status-dot" style={{ background: '#f1c40f' }} />
            <span className="status-label">IDLE</span>
            <span className="status-count">{idle}</span>
          </div>
          <div className="status-item">
            <span className="status-dot" style={{ background: '#3498db' }} />
            <span className="status-label">COMPUTING</span>
            <span className="status-count">{computing}</span>
          </div>
          <div className="status-item total">
            <span className="status-dot" style={{ background: '#9b59b6' }} />
            <span className="status-label">TOTAL</span>
            <span className="status-count">{agents.length}</span>
          </div>
        </div>
      </div>

      {/* Agent List Panel */}
      <div className="panel agent-panel">
        <h3 className="panel-title">🤖 AGENT ROSTER</h3>
        <div className="agent-roster">
          {agents.map(agent => (
            <div
              key={agent.id}
              className={`roster-item ${selectedAgent === agent.id ? 'roster-selected' : ''}`}
              onClick={() => onAgentClick(agent.id)}
            >
              <span className="roster-emoji">{agent.emoji}</span>
              <span className="roster-name">{agent.name}</span>
              <span className="roster-person">({agent.personName})</span>
              <span
                className="roster-status"
                style={{ color: statusColor[agent.status] }}
              >
                {statusEmoji[agent.status]} {agent.status}
              </span>
              <div className="roster-progress-bar">
                <div
                  className="roster-progress-fill"
                  style={{
                    width: `${agent.progress}%`,
                    background: statusColor[agent.status],
                  }}
                />
              </div>
              <span className="roster-progress-text">{agent.progress}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
