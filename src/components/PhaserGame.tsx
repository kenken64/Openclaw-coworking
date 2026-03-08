import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { OfficeScene } from '../game/OfficeScene';
import type { Agent } from '../types';
import './PhaserGame.css';

interface Props {
  onAgentsUpdate: (agents: Agent[]) => void;
}

export default function PhaserGame({ onAgentsUpdate }: Props) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<OfficeScene | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const scene = new OfficeScene();
    sceneRef.current = scene;
    scene.setAgentsUpdateCallback(onAgentsUpdate);

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1280,
      height: 720,
      parent: containerRef.current,
      pixelArt: true,
      backgroundColor: '#1a1a2e',
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false },
      },
      scene: [scene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
      },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onAgentsUpdate]);

  return (
    <div className="phaser-game-wrapper">
      <div ref={containerRef} className="phaser-game-container" />
    </div>
  );
}
