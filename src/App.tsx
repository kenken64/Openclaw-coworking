import { useState, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PhaserGame from './components/PhaserGame';
import BottomPanels from './components/BottomPanels';
import { initialAgents } from './data';
import type { Agent, FilterTab } from './types';
import './App.css';

function App() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [filter, setFilter] = useState<FilterTab>('ALL');
  const [search, setSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const handleAgentsUpdate = useCallback((updatedAgents: Agent[]) => {
    setAgents(updatedAgents);
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
        <div className="main-content">
          <PhaserGame onAgentsUpdate={handleAgentsUpdate} />
          <BottomPanels
            agents={agents}
            selectedAgent={selectedAgent}
            onAgentClick={handleAgentClick}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
