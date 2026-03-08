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

  // Layout: Narrow left column (200px) + large right area (1080px)
  const leftColWidth = 200;
  const rightAreaWidth = W - leftColWidth;
  const roomHeight = (H - 100) / 5; // 124px per room (5 rooms stacked)

  // ── Left Column: 5 rooms stacked vertically ──
  
  // Room 1: Conference
  const room1Y = 100;
  drawRect(0, room1Y, leftColWidth, roomHeight, '#33334d', '#4a4a6a');
  drawRect(30, room1Y + 40, 80, 30, '#5a3e28');
  drawRect(35, room1Y + 45, 70, 20, '#6b4c32');
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('📋 CONF', 10, room1Y + 20);

  // Room 2: Kitchen
  const room2Y = room1Y + roomHeight;
  drawRect(0, room2Y, leftColWidth, roomHeight, '#33334d', '#4a4a6a');
  drawRect(20, room2Y + 30, 60, 15, '#5a3e28');
  drawRect(140, room2Y + 20, 25, 40, '#b0b0b0');
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('🍳 KITCHEN', 10, room2Y + 20);

  // Room 3: Gym
  const room3Y = room2Y + roomHeight;
  drawRect(0, room3Y, leftColWidth, roomHeight, '#2d2d47', '#4a4a6a');
  drawRect(30, room3Y + 30, 50, 25, '#4a4a4a');
  drawRect(120, room3Y + 30, 50, 25, '#4a4a4a');
  drawRect(50, room3Y + 80, 80, 25, '#27ae60');
  ctx.fillStyle = '#fff1a8';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('💪 GYM', 10, room3Y + 20);

  // Room 4: Server
  const room4Y = room3Y + roomHeight;
  drawRect(0, room4Y, leftColWidth, roomHeight, '#1a1a2e', '#4a4a6a');
  for (let i = 0; i < 3; i++) {
    drawRect(20 + i * 50, room4Y + 20, 30, 80, '#2d2d47');
    for (let j = 0; j < 4; j++) {
      const color = ['#2ecc71', '#3498db', '#e74c3c', '#f1c40f'][j % 4];
      ctx.fillStyle = color;
      ctx.fillRect(25 + i * 50, room4Y + 25 + j * 18, 3, 2);
      ctx.fillRect(40 + i * 50, room4Y + 25 + j * 18, 3, 2);
    }
  }
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('🖧 SERVER', 10, room4Y + 20);

  // Room 5: Lounge
  const room5Y = room4Y + roomHeight;
  drawRect(0, room5Y, leftColWidth, roomHeight, '#33334d', '#4a4a6a');
  drawRect(30, room5Y + 30, 60, 20, '#8e44ad');
  ctx.beginPath();
  ctx.arc(120, room5Y + 50, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#e74c3c';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(150, room5Y + 70, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#3498db';
  ctx.fill();
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('🎵 LOUNGE', 10, room5Y + 20);

  // ── Right Area: Large collaboration space ──
  drawRect(leftColWidth, 100, rightAreaWidth, H - 100, '#2d2d47', '#4a4a6a');
  
  // Multiple work desks scattered around
  const deskPositions = [
    [250, 150], [400, 180], [550, 150], [700, 200], [850, 170], [1000, 190],
    [280, 350], [450, 380], [600, 360], [750, 400], [900, 350], [1050, 380],
    [320, 550], [500, 520], [680, 580], [850, 560], [1020, 540],
  ];
  
  for (const [x, y] of deskPositions) {
    drawRect(x, y, 80, 40, '#5a3e28');
    drawRect(x + 5, y + 5, 70, 30, '#6b4c32');
    // Monitor
    drawRect(x + 25, y - 5, 30, 15, '#1a1a2e');
    drawRect(x + 28, y - 2, 24, 9, '#3498db');
  }
  
  // Central meeting area
  drawRect(600, 300, 200, 120, '#5a3e28');
  drawRect(605, 305, 190, 110, '#6b4c32');
  
  // Label for work area
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('🖥️ MAIN WORKSPACE', 400, 140);

  // ── Column separator ──
  ctx.strokeStyle = '#4a4a6a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(leftColWidth, 100);
  ctx.lineTo(leftColWidth, H);
  ctx.stroke();

  // ── Room separators in left column ──
  ctx.lineWidth = 2;
  for (let i = 1; i < 5; i++) {
    const y = 100 + roomHeight * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(leftColWidth, y);
    ctx.stroke();
  }

  // ── Wall decorations ──
  // Plant in left column
  drawRect(10, 85, 8, 15, '#654321');
  ctx.beginPath();
  ctx.arc(14, 80, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#27ae60';
  ctx.fill();

  // Large window in work area
  drawRect(leftColWidth + 50, 15, 200, 60, '#1a1a3e');
  drawRect(leftColWidth + 53, 18, 194, 54, '#2c3e50');
  // Stars
  ctx.fillStyle = '#f1c40f';
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(leftColWidth + 70 + i * 20, 30 + Math.random() * 20, 2, 2);
  }

  return canvas.toDataURL('image/png');
}
