import { useEffect, useState } from 'react';
import './Header.css';

export default function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (d: Date) => {
    let h = d.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  return (
    <header className="header">
      <div className="header-left">
        <span className="header-logo">🦀</span>
        <span className="header-title">OpenClaw</span>
        <span className="header-badge">AGENTS TEAM</span>
      </div>
      <div className="header-right">
        <span className="header-clock">TIME: {formatTime(time)}</span>
        <div className="header-dots">
          <span className="dot dot-green"></span>
          <span className="dot dot-yellow"></span>
          <span className="dot dot-blue"></span>
        </div>
      </div>
    </header>
  );
}
