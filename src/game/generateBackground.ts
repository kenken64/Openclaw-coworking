// Programmatically generate a pixel-art office background (1280x720)
// Column-based layout: 5 vertical rooms

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

  // Column dimensions (5 columns)
  const colWidth = W / 5; // 256px each
  const roomHeight = H - 100; // 620px (excluding top wall)

  // ── Column 1: Conference Room ──
  const col1X = 0;
  drawRect(col1X, 100, colWidth, roomHeight, '#33334d', '#4a4a6a');
  // Conference table
  drawRect(col1X + 50, 300, 150, 80, '#5a3e28');
  drawRect(col1X + 55, 305, 140, 70, '#6b4c32');
  // Chairs around table
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const chairX = col1X + 125 + Math.cos(angle) * 80;
    const chairY = 340 + Math.sin(angle) * 50;
    drawRect(chairX - 6, chairY - 6, 12, 12, '#636e72');
  }
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('📋', col1X + 30, 150);
  ctx.font = 'bold 16px monospace';
  ctx.fillText('CONFERENCE', col1X + 20, 180);

  // ── Column 2: Work Desks ──
  const col2X = colWidth;
  drawRect(col2X, 100, colWidth, roomHeight, '#2d2d47', '#4a4a6a');
  // 6 desks in 2 rows
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const deskX = col2X + 20 + col * 70;
      const deskY = 200 + row * 200;
      drawRect(deskX, deskY, 60, 30, '#5a3e28');
      drawRect(deskX + 3, deskY + 3, 54, 24, '#6b4c32');
      // Monitor
      drawRect(deskX + 20, deskY - 10, 20, 12, '#1a1a2e');
      drawRect(deskX + 22, deskY - 8, 16, 8, '#3498db');
    }
  }
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('🖥️', col2X + 30, 150);
  ctx.font = 'bold 16px monospace';
  ctx.fillText('WORK DESKS', col2X + 20, 180);

  // ── Column 3: Kitchen ──
  const col3X = colWidth * 2;
  drawRect(col3X, 100, colWidth, roomHeight, '#33334d', '#4a4a6a');
  // Counter
  drawRect(col3X + 20, 250, 200, 30, '#5a3e28');
  drawRect(col3X + 25, 255, 190, 20, '#7a5c42');
  // Coffee machine
  drawRect(col3X + 40, 230, 25, 20, '#4a4a4a');
  drawRect(col3X + 43, 235, 19, 10, '#8b4513');
  // Fridge
  drawRect(col3X + 180, 200, 35, 50, '#b0b0b0');
  drawRect(col3X + 183, 205, 29, 20, '#c0c0c0');
  drawRect(col3X + 183, 230, 29, 15, '#d0d0d0');
  // Dining table
  drawRect(col3X + 60, 400, 120, 80, '#5a3e28');
  drawRect(col3X + 65, 405, 110, 70, '#6b4c32');
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('🍳', col3X + 30, 150);
  ctx.font = 'bold 16px monospace';
  ctx.fillText('KITCHEN', col3X + 40, 180);

  // ── Column 4: Gym ──
  const col4X = colWidth * 3;
  drawRect(col4X, 100, colWidth, roomHeight, '#2d2d47', '#4a4a6a');
  // Treadmills
  drawRect(col4X + 30, 220, 70, 40, '#4a4a4a');
  drawRect(col4X + 35, 225, 60, 30, '#5a5a5a');
  drawRect(col4X + 130, 220, 70, 40, '#4a4a4a');
  drawRect(col4X + 135, 225, 60, 30, '#5a5a5a');
  // Weights
  drawRect(col4X + 50, 350, 50, 15, '#6a6a6a');
  drawRect(col4X + 130, 350, 50, 15, '#6a6a6a');
  // Yoga mats
  drawRect(col4X + 40, 500, 80, 40, '#27ae60');
  drawRect(col4X + 45, 505, 70, 30, '#2ecc71');
  drawRect(col4X + 130, 500, 80, 40, '#e74c3c');
  drawRect(col4X + 135, 505, 70, 30, '#f39c12');
  ctx.fillStyle = '#fff1a8';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('💪', col4X + 30, 150);
  ctx.font = 'bold 16px monospace';
  ctx.fillText('GYM', col4X + 50, 180);

  // ── Column 5: Server & Lounge ──
  const col5X = colWidth * 4;
  drawRect(col5X, 100, colWidth, roomHeight, '#1a1a2e', '#4a4a6a');
  // Server racks
  for (let i = 0; i < 2; i++) {
    drawRect(col5X + 30 + i * 80, 150, 40, 120, '#2d2d47');
    // Blinking lights
    for (let j = 0; j < 6; j++) {
      const color = ['#2ecc71', '#3498db', '#e74c3c', '#f1c40f'][j % 4];
      ctx.fillStyle = color;
      ctx.fillRect(col5X + 35 + i * 80, 160 + j * 18, 4, 3);
      ctx.fillRect(col5X + 55 + i * 80, 160 + j * 18, 4, 3);
    }
  }
  // Lounge area
  drawRect(col5X + 40, 350, 80, 30, '#8e44ad');
  drawRect(col5X + 45, 355, 70, 20, '#9b59b6');
  // Bean bags
  ctx.beginPath();
  ctx.arc(col5X + 80, 450, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#e74c3c';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(col5X + 150, 470, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#3498db';
  ctx.fill();
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('🖧', col5X + 30, 150);
  ctx.font = 'bold 16px monospace';
  ctx.fillText('SERVER', col5X + 20, 180);

  // ── Column separators ──
  ctx.strokeStyle = '#4a4a6a';
  ctx.lineWidth = 3;
  for (let i = 1; i < 5; i++) {
    const x = colWidth * i;
    ctx.beginPath();
    ctx.moveTo(x, 100);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  // ── Wall decorations ──
  // Plants on top wall
  for (let i = 0; i < 5; i++) {
    const px = colWidth * i + colWidth / 2 - 10;
    drawRect(px, 85, 8, 15, '#654321');
    ctx.beginPath();
    ctx.arc(px + 4, 80, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#27ae60';
    ctx.fill();
  }

  // Windows above each room
  for (let i = 0; i < 5; i++) {
    const wx = colWidth * i + 20;
    drawRect(wx, 15, 60, 50, '#1a1a3e');
    drawRect(wx + 3, 18, 54, 44, '#2c3e50');
    // Stars
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(wx + 15, 30, 2, 2);
    ctx.fillRect(wx + 35, 25, 2, 2);
    ctx.fillRect(wx + 45, 40, 2, 2);
  }

  return canvas.toDataURL('image/png');
}
