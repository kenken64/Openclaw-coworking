// Programmatically generate a pixel-art office background (1280x720)
// Distinct areas: Conference Room, Work Desks, Kitchen, Gym, Vibe/Lounge

export function generateOfficeBackground(): string {
  const W = 1280;
  const H = 720;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Helper: draw a filled rect with optional border
  const drawRect = (x: number, y: number, w: number, h: number, fill: string, stroke?: string) => {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
    }
  };

  // Floor
  drawRect(0, 0, W, H, '#2a2a3e');

  // Floor tiles pattern
  ctx.fillStyle = '#2e2e44';
  for (let x = 0; x < W; x += 32) {
    for (let y = 0; y < H; y += 32) {
      if ((x / 32 + y / 32) % 2 === 0) {
        ctx.fillRect(x, y, 32, 32);
      }
    }
  }

  // Wall (top area)
  drawRect(0, 0, W, 100, '#3d3d5c');
  // Wall border
  drawRect(0, 98, W, 4, '#4a4a6a');

  // ── Area 1: Conference Room (top-left) ──
  drawRect(10, 110, 300, 250, '#33334d', '#4a4a6a');
  // Conference table
  drawRect(60, 180, 200, 80, '#5a3e28');
  drawRect(65, 185, 190, 70, '#6b4c32');
  // Label on wall
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('📋 CONFERENCE', 60, 135);

  // ── Area 2: Work Desks (top-center-right) ──
  drawRect(320, 110, 450, 250, '#2d2d47', '#4a4a6a');
  // Desks (3 rows)
  for (let i = 0; i < 3; i++) {
    const dx = 360 + i * 140;
    drawRect(dx, 170, 100, 40, '#5a3e28');
    drawRect(dx + 5, 175, 90, 30, '#6b4c32');
    // Monitor on desk
    drawRect(dx + 35, 160, 30, 15, '#1a1a2e');
    drawRect(dx + 38, 163, 24, 9, '#3498db');
  }
  // Second row desks
  for (let i = 0; i < 3; i++) {
    const dx = 360 + i * 140;
    drawRect(dx, 270, 100, 40, '#5a3e28');
    drawRect(dx + 5, 275, 90, 30, '#6b4c32');
    drawRect(dx + 35, 260, 30, 15, '#1a1a2e');
    drawRect(dx + 38, 263, 24, 9, '#2ecc71');
  }
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('🖥️ WORK DESKS', 440, 135);

  // ── Area 3: Server/Computing Room (top-right) ──
  drawRect(780, 110, 240, 250, '#1a1a2e', '#4a4a6a');
  // Server racks
  for (let i = 0; i < 3; i++) {
    drawRect(800 + i * 70, 140, 50, 180, '#2d2d47');
    // Blinking lights
    for (let j = 0; j < 8; j++) {
      const color = ['#2ecc71', '#3498db', '#e74c3c', '#f1c40f'][Math.floor(Math.random() * 4)];
      ctx.fillStyle = color;
      ctx.fillRect(810 + i * 70, 150 + j * 20, 6, 4);
      ctx.fillRect(825 + i * 70, 150 + j * 20, 6, 4);
    }
  }
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('🖧 SERVER ROOM', 800, 135);

  // ── Area 4: Kitchen (bottom-left) ──
  drawRect(10, 380, 280, 330, '#33334d', '#4a4a6a');
  // Counter
  drawRect(30, 420, 240, 30, '#5a3e28');
  drawRect(35, 425, 230, 20, '#7a5c42');
  // Coffee machine
  drawRect(50, 400, 30, 20, '#4a4a4a');
  drawRect(55, 405, 20, 10, '#8b4513');
  // Fridge
  drawRect(220, 390, 40, 60, '#b0b0b0');
  drawRect(225, 395, 30, 25, '#c0c0c0');
  drawRect(225, 425, 30, 20, '#d0d0d0');
  // Table
  drawRect(60, 520, 180, 60, '#5a3e28');
  drawRect(65, 525, 170, 50, '#6b4c32');
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('🍳 KITCHEN', 70, 405);

  // ── Area 5: Gym (bottom-center) ──
  drawRect(300, 380, 300, 330, '#2d2d47', '#4a4a6a');
  // Treadmill outlines
  for (let i = 0; i < 2; i++) {
    drawRect(330 + i * 130, 430, 80, 40, '#4a4a4a');
    drawRect(335 + i * 130, 435, 70, 30, '#5a5a5a');
    // Display
    drawRect(355 + i * 130, 420, 30, 12, '#1a1a2e');
    drawRect(358 + i * 130, 423, 24, 6, '#e74c3c');
  }
  // Weights
  drawRect(340, 530, 60, 20, '#6a6a6a');
  drawRect(345, 535, 50, 10, '#8a8a8a');
  drawRect(430, 530, 60, 20, '#6a6a6a');
  drawRect(435, 535, 50, 10, '#8a8a8a');
  // Yoga mat
  drawRect(350, 600, 120, 60, '#27ae60');
  drawRect(355, 605, 110, 50, '#2ecc71');
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('💪 GYM', 390, 405);

  // ── Area 6: Vibe / Lounge (bottom-right) ──
  drawRect(610, 380, 410, 330, '#33334d', '#4a4a6a');
  // Sofas
  drawRect(640, 440, 120, 40, '#8e44ad');
  drawRect(645, 445, 110, 30, '#9b59b6');
  drawRect(640, 490, 120, 40, '#8e44ad');
  drawRect(645, 495, 110, 30, '#9b59b6');
  // Coffee table
  drawRect(670, 545, 60, 30, '#5a3e28');
  drawRect(675, 550, 50, 20, '#6b4c32');
  // Bean bags
  ctx.beginPath();
  ctx.arc(850, 480, 25, 0, Math.PI * 2);
  ctx.fillStyle = '#e74c3c';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(910, 500, 25, 0, Math.PI * 2);
  ctx.fillStyle = '#3498db';
  ctx.fill();
  // Plants
  drawRect(950, 420, 20, 40, '#654321');
  ctx.beginPath();
  ctx.arc(960, 410, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#27ae60';
  ctx.fill();
  // Music notes
  ctx.fillStyle = '#8888aa';
  ctx.fillText('🎵 VIBE LOUNGE', 760, 400);
  // TV/Screen
  drawRect(790, 560, 80, 50, '#1a1a2e');
  drawRect(795, 565, 70, 40, '#e056a0');
  drawRect(820, 612, 20, 10, '#4a4a4a');

  // ── Decorations ──
  // Plants along the wall
  const plantPositions = [
    [15, 95], [310, 95], [770, 95], [1010, 95], [1240, 95],
  ];
  for (const [px, py] of plantPositions) {
    drawRect(px, py - 15, 12, 20, '#654321');
    ctx.beginPath();
    ctx.arc(px + 6, py - 20, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#27ae60';
    ctx.fill();
  }

  // Window frames on wall
  for (let i = 0; i < 4; i++) {
    const wx = 100 + i * 300;
    drawRect(wx, 15, 80, 60, '#1a1a3e');
    drawRect(wx + 3, 18, 74, 54, '#2c3e50');
    drawRect(wx + 3, 18, 74, 54, '#34495e');
    // Stars through window
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(wx + 20, 30, 3, 3);
    ctx.fillRect(wx + 50, 25, 3, 3);
    ctx.fillRect(wx + 35, 40, 3, 3);
    ctx.fillRect(wx + 60, 45, 3, 3);
  }

  // Right wall section (beyond vibe lounge)
  drawRect(1030, 110, 240, 250, '#2d2d47', '#4a4a6a');
  // Meeting pods
  drawRect(1060, 150, 80, 60, '#3d3d5c');
  drawRect(1065, 155, 70, 50, '#4a4a6a');
  drawRect(1160, 150, 80, 60, '#3d3d5c');
  drawRect(1165, 155, 70, 50, '#4a4a6a');
  // Whiteboard
  drawRect(1080, 240, 120, 80, '#e8e8e8');
  drawRect(1085, 245, 110, 70, '#f5f5f5');
  ctx.fillStyle = '#333';
  ctx.font = '9px monospace';
  ctx.fillText('TODO:', 1090, 260);
  ctx.fillText('- Ship v2.0', 1090, 275);
  ctx.fillText('- Fix bugs', 1090, 290);
  ctx.fillStyle = '#8888aa';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('🏢 MEETING PODS', 1090, 130);

  return canvas.toDataURL('image/png');
}
