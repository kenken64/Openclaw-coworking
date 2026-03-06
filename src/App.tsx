import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import OfficeGrid from './components/OfficeGrid';
import AgentCards from './components/AgentCards';
import { initialAgents, rooms } from './data';
import type { Agent, AgentStatus, FilterTab } from './types';
import './App.css';

const statuses: AgentStatus[] = ['WORKING', 'IDLE', 'COMPUTING'];

function App() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [filter, setFilter] = useState<FilterTab>('ALL');
  const [search, setSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Randomly update agent statuses and progress
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev =>
        prev.map(agent => {
          const shouldChange = Math.random() < 0.15;
          if (!shouldChange) {
            // Just update progress slightly
            const progressDelta = Math.floor(Math.random() * 6) - 2;
            const newProgress = Math.max(0, Math.min(100, agent.progress + progressDelta));
            return { ...agent, progress: newProgress };
          }
          return {
            ...agent,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            progress: Math.floor(Math.random() * 60) + 20,
          };
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAgentClick = useCallback((id: string) => {
    setSelectedAgent(prev => (prev === id ? null : id));
  }, []);

  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <Sidebar
          agents={agents}
          filter={filter}
          search={search}
          selectedAgent={selectedAgent}
          onFilterChange={setFilter}
          onSearchChange={setSearch}
          onAgentClick={handleAgentClick}
        />
        <OfficeGrid
          rooms={rooms}
          agents={agents}
          selectedAgent={selectedAgent}
        />
        <AgentCards
          agents={agents}
          selectedAgent={selectedAgent}
          onAgentClick={handleAgentClick}
        />
      </div>
    </div>
  );
}

export default App;
