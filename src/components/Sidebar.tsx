import type { Agent, FilterTab } from '../types';
import { spriteStyleFitH, getAgentSprite } from '../sprites';
import './Sidebar.css';

interface Props {
  agents: Agent[];
  filter: FilterTab;
  search: string;
  selectedAgent: string | null;
  onFilterChange: (f: FilterTab) => void;
  onSearchChange: (s: string) => void;
  onAgentClick: (id: string) => void;
}

const statusColor: Record<string, string> = {
  WORKING: '#2ecc71',
  IDLE: '#f1c40f',
  COMPUTING: '#3498db',
};

export default function Sidebar({ agents, filter, search, selectedAgent, onFilterChange, onSearchChange, onAgentClick }: Props) {
  const filtered = agents.filter(a => {
    if (filter !== 'ALL' && a.status !== filter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tabs: FilterTab[] = ['ALL', 'WORKING', 'IDLE', 'COMPUTING'];

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">📊 TEAM STATUS</h2>
      <input
        className="sidebar-search"
        type="text"
        placeholder="🔍 Search agent..."
        value={search}
        onChange={e => onSearchChange(e.target.value)}
      />
      <div className="sidebar-tabs">
        {tabs.map(t => (
          <button
            key={t}
            className={`tab ${filter === t ? 'tab-active' : ''}`}
            onClick={() => onFilterChange(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <ul className="agent-list">
        {filtered.map(agent => (
          <li
            key={agent.id}
            className={`agent-item ${selectedAgent === agent.id ? 'agent-selected' : ''}`}
            onClick={() => onAgentClick(agent.id)}
          >
            <div className="agent-row">
              <span className="agent-avatar">
                <div style={spriteStyleFitH(getAgentSprite(agent.id), 40)} />
              </span>
              <span className="agent-name">{agent.personName} - {agent.name}</span>
              <span className="agent-status" style={{ background: statusColor[agent.status], color: '#1a1a2e' }}>
                {agent.status}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${agent.progress}%`,
                  background: statusColor[agent.status],
                  boxShadow: `0 0 8px ${statusColor[agent.status]}`,
                }}
              />
              <span className="progress-text">{agent.progress}%</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
