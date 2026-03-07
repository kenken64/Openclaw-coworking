import { useMemo } from 'react';
import type { Agent } from '../types';
import { spriteStyle, COMPUTER } from '../sprites';
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
  // Random animation delays per agent (stable across re-renders)
  const delays = useMemo(
    () => agents.map(() => Math.random() * 3),
    [agents.length],
  );

  return (
    <div className="agent-cards">
      <h3 className="cards-title">⚡ WORKSTATIONS</h3>
      <div className="cards-grid">
        {agents.map((agent, i) => {
          const color = statusColor[agent.status];
          const animClass =
            agent.status === 'WORKING' ? 'ws-working' :
            agent.status === 'COMPUTING' ? 'ws-computing' : 'ws-idle';
          return (
            <div
              key={agent.id}
              className={`agent-card ${selectedAgent === agent.id ? 'card-selected' : ''}`}
              onClick={() => onAgentClick(agent.id)}
            >
              <div
                className={`card-room ${animClass}`}
                style={{ animationDelay: `${delays[i]}s`, '--ws-color': color } as React.CSSProperties}
              >
                <div className="ws-screen-glow" style={{ '--ws-color': color } as React.CSSProperties} />
                <div style={spriteStyle(COMPUTER, 3)} />
              </div>
              <div className="card-info">
                <span className="card-name">{agent.name}</span>
                <span
                  className="card-status-dot"
                  style={{
                    background: color,
                    boxShadow: `0 0 6px ${color}`,
                  }}
                ></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
