import type { Agent, Room } from './types';

export const initialAgents: Agent[] = [
  { id: 'atlas', name: 'ATLAS', status: 'WORKING', progress: 78, room: 'jarvis', color: '#ff6b6b', emoji: '🗺️' },
  { id: 'clawd', name: 'CLAWD', status: 'WORKING', progress: 92, room: 'conference', color: '#ffa502', emoji: '🦀' },
  { id: 'clip', name: 'CLIP', status: 'IDLE', progress: 45, room: 'kitchen', color: '#7bed9f', emoji: '📎' },
  { id: 'closer', name: 'CLOSER', status: 'WORKING', progress: 67, room: 'jarvis', color: '#ff4757', emoji: '🎯' },
  { id: 'nova', name: 'NOVA', status: 'COMPUTING', progress: 88, room: 'vibe', color: '#5352ed', emoji: '⭐' },
  { id: 'oracle', name: 'ORACLE', status: 'WORKING', progress: 55, room: 'conference', color: '#2ed573', emoji: '🔮' },
  { id: 'pixel', name: 'PIXEL', status: 'IDLE', progress: 30, room: 'gym', color: '#ff6348', emoji: '🎨' },
  { id: 'sage', name: 'SAGE', status: 'COMPUTING', progress: 71, room: 'conference', color: '#1e90ff', emoji: '🧙' },
  { id: 'scribe', name: 'SCRIBE', status: 'WORKING', progress: 83, room: 'jarvis', color: '#ffa502', emoji: '✍️' },
  { id: 'sentinel', name: 'SENTINEL', status: 'WORKING', progress: 95, room: 'jarvis', color: '#ff4757', emoji: '🛡️' },
  { id: 'trendy', name: 'TRENDY', status: 'IDLE', progress: 20, room: 'vibe', color: '#ff6b81', emoji: '✨' },
];

export const rooms: Room[] = [
  { id: 'conference', name: 'Conference Room', icon: '🏛️', color: '#2d3436' },
  { id: 'jarvis', name: 'JARVIS Office', icon: '🖥️', color: '#2d3436' },
  { id: 'kitchen', name: 'Kitchen', icon: '🍳', color: '#2d3436' },
  { id: 'gym', name: 'GYM', icon: '💪', color: '#2d3436' },
  { id: 'vibe', name: 'Vibe', icon: '🎵', color: '#2d3436' },
];
