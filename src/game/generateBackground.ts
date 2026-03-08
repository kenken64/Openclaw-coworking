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

  // Layout: Balanced 2x3 grid - equal room sizes, better spacing
  const roomW = (W - 60) / 3; // 3 columns with 20px gaps = 406px each
  const roomH = (H - 140) / 2; // 2 rows with 20px gap = 290px each

  // ── Top Row: Conference | Kitchen | Gym ──
  
  // Top-left: Conference Room
  const confX = 20, confY = 100;
  drawRect(confX, confY, roomW, roomH, '#33334d', '#4a4a6a');
  drawRect(confX + 60, confY + 80, 120, 40, '#5a3e28'); // Conference table
  drawRect(confX + 65, confY + 85, 110, 30, '#6b4c32');
  // Chairs around table
  for (let i = 0; i < 6; i++) {
    const chairX = confX + 40 + (i % 3) * 40;
    const chairY = confY + 60 + Math.floor(i / 3) * 80;
    drawRect(chairX, chairY, 20, 15, '#8b4513');
  }
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('📋 CONFERENCE', confX + 10, confY + 30);

  // Top-center: Kitchen
  const kitchenX = 20 + roomW + 20, kitchenY = 100;
  drawRect(kitchenX, kitchenY, roomW, roomH, '#33334d', '#4a4a6a');
  drawRect(kitchenX + 40, kitchenY + 60, 100, 20, '#5a3e28'); // Counter
  drawRect(kitchenX + 200, kitchenY + 40, 40, 60, '#b0b0b0'); // Fridge
  drawRect(kitchenX + 280, kitchenY + 50, 30, 30, '#4a4a4a'); // Microwave
  // Coffee machine
  drawRect(kitchenX + 60, kitchenY + 40, 25, 25, '#654321');
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('🍳 KITCHEN', kitchenX + 10, kitchenY + 30);

  // Top-right: Gym
  const gymX = 20 + roomW * 2 + 40, gymY = 100;
  drawRect(gymX, gymY, roomW, roomH, '#2d2d47', '#4a4a6a');
  // Equipment
  drawRect(gymX + 50, gymY + 60, 80, 40, '#4a4a4a'); // Treadmill
  drawRect(gymX + 200, gymY + 60, 80, 40, '#4a4a4a'); // Weights
  drawRect(gymX + 100, gymY + 150, 120, 40, '#27ae60'); // Mat area
  ctx.fillStyle = '#fff1a8';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('💪 GYM', gymX + 10, gymY + 30);

  // ── Bottom Row: Server | Lounge | Workspace ──
  
  // Bottom-left: Server Room
  const serverX = 20, serverY = 100 + roomH + 20;
  drawRect(serverX, serverY, roomW, roomH, '#1a1a2e', '#4a4a6a');
  // Server racks
  for (let i = 0; i < 4; i++) {
    drawRect(serverX + 30 + i * 80, serverY + 40, 60, 120, '#2d2d47');
    for (let j = 0; j < 6; j++) {
      const color = ['#2ecc71', '#3498db', '#e74c3c', '#f1c40f'][j % 4];
      ctx.fillStyle = color;
      ctx.fillRect(serverX + 35 + i * 80, serverY + 50 + j * 18, 5, 3);
      ctx.fillRect(serverX + 75 + i * 80, serverY + 50 + j * 18, 5, 3);
    }
  }
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('🖧 SERVER', serverX + 10, serverY + 30);

  // Bottom-center: Lounge
  const loungeX = 20 + roomW + 20, loungeY = 100 + roomH + 20;
  drawRect(loungeX, loungeY, roomW, roomH, '#33334d', '#4a4a6a');
  // Sofas
  drawRect(loungeX + 60, loungeY + 80, 100, 30, '#8e44ad');
  drawRect(loungeX + 200, loungeY + 120, 100, 30, '#8e44ad');
  // Coffee table
  drawRect(loungeX + 120, loungeY + 140, 60, 40, '#5a3e28');
  // Bean bags
  ctx.beginPath();
  ctx.arc(loungeX + 250, loungeY + 80, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#e74c3c';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(loungeX + 300, loungeY + 100, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#3498db';
  ctx.fill();
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('🎵 LOUNGE', loungeX + 10, loungeY + 30);

  // Bottom-right: Main Workspace
  const workX = 20 + roomW * 2 + 40, workY = 100 + roomH + 20;
  drawRect(workX, workY, roomW, roomH, '#2d2d47', '#4a4a6a');
  // Work desks in grid pattern
  const deskPositions = [
    [workX + 40, workY + 50], [workX + 160, workY + 50], [workX + 280, workY + 50],
    [workX + 40, workY + 130], [workX + 160, workY + 130], [workX + 280, workY + 130],
    [workX + 40, workY + 210], [workX + 160, workY + 210], [workX + 280, workY + 210],
  ];
  
  for (const [x, y] of deskPositions) {
    drawRect(x, y, 80, 40, '#5a3e28');
    drawRect(x + 5, y + 5, 70, 30, '#6b4c32');
    // Monitor
    drawRect(x + 25, y - 5, 30, 15, '#1a1a2e');
    drawRect(x + 28, y - 2, 24, 9, '#3498db');
  }
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('🖥️ WORKSPACE', workX + 10, workY + 30);

  // ── Grid separators ──
  ctx.strokeStyle = '#4a4a6a';
  ctx.lineWidth = 3;
  
  // Vertical lines
  ctx.beginPath();
  ctx.moveTo(20 + roomW, 100);
  ctx.lineTo(20 + roomW, H - 20);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(40 + roomW * 2, 100);
  ctx.lineTo(40 + roomW * 2, H - 20);
  ctx.stroke();
  
  // Horizontal line
  ctx.beginPath();
  ctx.moveTo(20, 100 + roomH);
  ctx.lineTo(W - 20, 100 + roomH);
  ctx.stroke();

  // ── Wall decorations ──
  // Corner plants
  drawRect(10, 85, 8, 15, '#654321');
  ctx.beginPath();
  ctx.arc(14, 80, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#27ae60';
  ctx.fill();

  drawRect(W - 30, 85, 8, 15, '#654321');
  ctx.beginPath();
  ctx.arc(W - 26, 80, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#27ae60';
  ctx.fill();

  // Central window
  drawRect(W/2 - 100, 15, 200, 60, '#1a1a3e');
  drawRect(W/2 - 97, 18, 194, 54, '#2c3e50');
  // City skyline
  ctx.fillStyle = '#f1c40f';
  for (let i = 0; i < 12; i++) {
    ctx.fillRect(W/2 - 80 + i * 15, 30 + Math.random() * 20, 2, 2);
  }
  
  // Room labels on wall
  ctx.fillStyle = '#7f8c8d';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('OpenClaw Co-working Office', W/2 - 120, 50);

  return canvas.toDataURL('image/png');
}
