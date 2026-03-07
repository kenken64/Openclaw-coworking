export type AgentStatus = 'WORKING' | 'IDLE' | 'COMPUTING';

export interface Agent {
  id: string;
  name: string;
  personName: string;
  status: AgentStatus;
  progress: number;
  room: string;
  color: string;
  emoji: string;
}

export interface Room {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type FilterTab = 'ALL' | 'WORKING' | 'IDLE' | 'COMPUTING';
