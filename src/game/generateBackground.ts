// Programmatically generate a pixel-art office background (1280x720)
// Balanced 2x3 grid layout: Equal room sizes

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
  // Oval conference table (larger, centered)
  drawRect(confX + 80, confY + 70, 160, 50, '#5a3e28');
  drawRect(confX + 85, confY + 75, 150, 40, '#6b4c32');
  // Chairs properly arranged around oval table
  const chairPositions = [
    [confX + 60, confY + 90], [confX + 120, confY + 60], [confX + 180, confY + 60], [confX + 260, confY + 90],
    [confX + 260, confY + 110], [confX + 180, confY + 130], [confX + 120, confY + 130], [confX + 60, confY + 110]
  ];
  for (const [x, y] of chairPositions) {
    drawRect(x, y, 18, 12, '#8b4513');
  }
  // Whiteboard on wall
  drawRect(confX + 30, confY + 20, 80, 30, '#ffffff');
  drawRect(confX + 32, confY + 22, 76, 26, '#f8f8f8');
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('📋 CONFERENCE', confX + 10, confY + 30);

  // Top-center: Kitchen
  const kitchenX = 20 + roomW + 20, kitchenY = 100;
  drawRect(kitchenX, kitchenY, roomW, roomH, '#33334d', '#4a4a6a');
  // L-shaped counter with better flow
  drawRect(kitchenX + 30, kitchenY + 50, 120, 25, '#5a3e28'); // Main counter
  drawRect(kitchenX + 30, kitchenY + 75, 25, 80, '#5a3e28'); // Side counter
  // Kitchen island for gathering
  drawRect(kitchenX + 200, kitchenY + 90, 80, 40, '#5a3e28');
  drawRect(kitchenX + 205, kitchenY + 95, 70, 30, '#6b4c32');
  // Appliances with better spacing
  drawRect(kitchenX + 320, kitchenY + 40, 40, 70, '#b0b0b0'); // Fridge (corner)
  drawRect(kitchenX + 60, kitchenY + 30, 35, 25, '#4a4a4a'); // Microwave on counter
  drawRect(kitchenX + 120, kitchenY + 30, 25, 25, '#654321'); // Coffee machine
  // Sink area
  drawRect(kitchenX + 160, kitchenY + 50, 40, 25, '#87ceeb'); // Sink
  // Bar stools around island
  drawRect(kitchenX + 180, kitchenY + 150, 15, 15, '#8b4513');
  drawRect(kitchenX + 220, kitchenY + 150, 15, 15, '#8b4513');
  drawRect(kitchenX + 260, kitchenY + 150, 15, 15, '#8b4513');
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('🍳 KITCHEN', kitchenX + 10, kitchenY + 30);

  // Top-right: Gym
  const gymX = 20 + roomW * 2 + 40, gymY = 100;
  drawRect(gymX, gymY, roomW, roomH, '#2d2d47', '#4a4a6a');
  // Cardio zone (left side)
  drawRect(gymX + 30, gymY + 40, 60, 30, '#4a4a4a'); // Treadmill 1
  drawRect(gymX + 30, gymY + 80, 60, 30, '#4a4a4a'); // Treadmill 2
  drawRect(gymX + 100, gymY + 40, 45, 30, '#555555'); // Exercise bike
  // Weight zone (center)
  drawRect(gymX + 180, gymY + 50, 40, 80, '#4a4a4a'); // Weight rack
  drawRect(gymX + 230, gymY + 60, 60, 25, '#333333'); // Bench press
  drawRect(gymX + 300, gymY + 40, 30, 30, '#4a4a4a'); // Dumbbells
  // Stretching/yoga area (bottom)
  drawRect(gymX + 60, gymY + 150, 200, 60, '#27ae60'); // Large mat area
  drawRect(gymX + 280, gymY + 170, 80, 40, '#27ae60'); // Small mats
  // Mirror wall indicator
  drawRect(gymX + 10, gymY + 20, 350, 8, '#c0c0c0');
  ctx.fillStyle = '#fff1a8';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('💪 GYM', gymX + 10, gymY + 30);

  // ── Bottom Row: Server | Lounge | Workspace ──
  
  // Bottom-left: Server Room
  const serverX = 20, serverY = 100 + roomH + 20;
  drawRect(serverX, serverY, roomW, roomH, '#1a1a2e', '#4a4a6a');
  // Server racks in organized rows with aisles
  const rackPositions = [
    [serverX + 40, serverY + 40], [serverX + 120, serverY + 40], [serverX + 200, serverY + 40],
    [serverX + 40, serverY + 120], [serverX + 120, serverY + 120], [serverX + 200, serverY + 120]
  ];
  for (const [x, y] of rackPositions) {
    drawRect(x, y, 50, 60, '#2d2d47');
    // Status lights
    for (let j = 0; j < 4; j++) {
      const color = ['#2ecc71', '#3498db', '#e74c3c', '#f1c40f'][j % 4];
      ctx.fillStyle = color;
      ctx.fillRect(x + 5, y + 10 + j * 12, 4, 3);
      ctx.fillRect(x + 40, y + 10 + j * 12, 4, 3);
    }
  }
  // Central control console
  drawRect(serverX + 300, serverY + 70, 80, 40, '#2d2d47');
  drawRect(serverX + 305, serverY + 75, 70, 30, '#1a1a1a');
  // Cable management
  drawRect(serverX + 30, serverY + 200, 250, 15, '#333333'); // Cable tray
  // Air conditioning unit
  drawRect(serverX + 320, serverY + 180, 60, 50, '#666666');
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('🖧 SERVER', serverX + 10, serverY + 30);

  // Bottom-center: Lounge
  const loungeX = 20 + roomW + 20, loungeY = 100 + roomH + 20;
  drawRect(loungeX, loungeY, roomW, roomH, '#33334d', '#4a4a6a');
  // Main conversation area (L-shaped seating)
  drawRect(loungeX + 60, loungeY + 60, 120, 35, '#8e44ad'); // Main sofa
  drawRect(loungeX + 60, loungeY + 95, 35, 80, '#8e44ad'); // Side sofa
  drawRect(loungeX + 110, loungeY + 110, 80, 30, '#5a3e28'); // Coffee table
  // Secondary seating area
  drawRect(loungeX + 250, loungeY + 50, 80, 35, '#9b59b6'); // Loveseat
  drawRect(loungeX + 220, loungeY + 100, 40, 40, '#5a3e28'); // Side table
  // Casual seating (bean bags in corner)
  ctx.beginPath();
  ctx.arc(loungeX + 300, loungeY + 150, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#e74c3c';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(loungeX + 330, loungeY + 180, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#3498db';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(loungeX + 340, loungeY + 140, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#f39c12';
  ctx.fill();
  // TV/entertainment area
  drawRect(loungeX + 30, loungeY + 30, 60, 8, '#1a1a1a'); // Wall-mounted TV
  drawRect(loungeX + 32, loungeY + 32, 56, 4, '#333333');
  // Plants for ambiance
  ctx.beginPath();
  ctx.arc(loungeX + 180, loungeY + 200, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#27ae60';
  ctx.fill();
  drawRect(loungeX + 175, loungeY + 212, 10, 15, '#654321');
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('🎵 LOUNGE', loungeX + 10, loungeY + 30);

  // Bottom-right: Main Workspace
  const workX = 20 + roomW * 2 + 40, workY = 100 + roomH + 20;
  drawRect(workX, workY, roomW, roomH, '#2d2d47', '#4a4a6a');
  
  // Individual workstations (varied sizes)
  const deskPositions = [
    [workX + 30, workY + 40, 70, 35], [workX + 120, workY + 40, 90, 35], [workX + 230, workY + 40, 70, 35],
    [workX + 30, workY + 100, 85, 40], [workX + 140, workY + 105, 75, 35], [workX + 240, workY + 100, 80, 40],
  ];
  
  for (const [x, y, w, h] of deskPositions) {
    drawRect(x, y, w, h, '#5a3e28');
    drawRect(x + 3, y + 3, w - 6, h - 6, '#6b4c32');
  }
  
  // Collaborative area (standing meeting table)
  drawRect(workX + 320, workY + 50, 60, 100, '#5a3e28');
  drawRect(workX + 325, workY + 55, 50, 90, '#6b4c32');
  
  // Hot desks area (laptop-friendly)
  drawRect(workX + 50, workY + 170, 150, 30, '#5a3e28'); // Long communal table
  drawRect(workX + 55, workY + 175, 140, 20, '#6b4c32');
  
  // Quiet focus pods
  drawRect(workX + 250, workY + 170, 50, 50, '#2d2d47'); // Focus booth
  drawRect(workX + 255, workY + 175, 40, 40, '#3d3d57');
  
  // Storage and printer area
  drawRect(workX + 320, workY + 170, 40, 40, '#4a4a4a'); // Printer/storage unit
  
  // Pathway indicators (lighter floor)
  drawRect(workX + 110, workY + 30, 15, 200, '#3d3d57'); // Main aisle
  drawRect(workX + 210, workY + 80, 100, 15, '#3d3d57'); // Cross aisle
  ctx.fillStyle = '#ccccee';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('🖥️ WORKSPACE', workX + 10, workY + 20); // Moved higher to avoid desk overlap

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