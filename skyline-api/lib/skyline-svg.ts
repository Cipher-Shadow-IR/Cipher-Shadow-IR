import { GitHubTelemetry } from './github';

export function renderSkylineSvg(data: GitHubTelemetry): string {
  const { username, totalContributions, weeks, streak } = data;

  const width = 1200;
  const height = 430;
  const groundY = 350;
  const startX = 65;
  const colPitch = 21; // Slightly wider spacing for better city density
  const bldgWidth = 16;

  // Scale calculations
  const maxWeekly = Math.max(12, ...weeks.map((w) => w.total));
  const streakWeeksCount = Math.max(2, Math.min(18, Math.ceil(streak / 2)));
  const streakStartCol = Math.max(0, 52 - streakWeeksCount);
  const streakEndCol = 51;

  // Layers
  const backdropBuildings: string[] = [];
  const midgroundBuildings: string[] = [];
  const foregroundTowers: string[] = [];
  const monorailWaypoints: { x: number; y: number }[] = [];

  // 1. Perspective Wireframe Grid (Background)
  const perspectiveGrid = [];
  for (let i = 0; i <= 30; i++) {
    const xOff = (i - 15) * 60;
    perspectiveGrid.push(
      `<line x1="${width / 2}" y1="160" x2="${width / 2 + xOff * 3}" y2="${groundY}" stroke="#0077ff" stroke-width="1" opacity="0.1" />`
    );
  }
  for (let i = 0; i < 6; i++) {
    const yOff = 160 + Math.pow(i, 1.8) * 10;
    perspectiveGrid.push(
      `<line x1="0" y1="${yOff}" x2="${width}" y2="${yOff}" stroke="#0077ff" stroke-width="1" opacity="${0.05 + i * 0.03}" />`
    );
  }

  // 2. Distant & Midground Silhouettes
  for (let i = 0; i < 60; i++) {
    const bx = 30 + i * 20;
    const bHash = (i * 37 + 13) % 100;
    const bHeight = 40 + (bHash / 100) * 180;
    const by = groundY - bHeight;
    
    // Parallax layering
    if (i % 2 === 0) {
      backdropBuildings.push(
        `<rect x="${bx}" y="${by}" width="${20 + (bHash % 15)}" height="${bHeight}" fill="#040914" opacity="0.8"/>`
      );
    } else {
      midgroundBuildings.push(
        `<rect x="${bx}" y="${by + 30}" width="${15 + (bHash % 10)}" height="${bHeight - 30}" fill="#091224" opacity="0.9"/>
         <line x1="${bx + 2}" y1="${by + 30}" x2="${bx + 2}" y2="${groundY}" stroke="#0077ff" stroke-width="0.5" opacity="0.3"/>`
      );
    }
  }

  // 3. Foreground 52 Weekly Skyscrapers
  weeks.forEach((w, i) => {
    const x = startX + i * colPitch;
    const activityRatio = Math.min(1, w.total / maxWeekly);
    const bldgHeight = Math.max(30, Math.round(40 + activityRatio * 220));
    const y = groundY - bldgHeight;
    const hasActivity = w.total > 0;
    const isInStreak = i >= streakStartCol && i <= streakEndCol;

    // Thematic Colors
    const isOvercharged = w.total >= 10;
    const primaryNeon = isOvercharged ? '#00ff7f' : w.total >= 4 ? '#00f9ff' : '#0077ff';
    const fillGrad = hasActivity ? 'url(#activeBldgGrad)' : 'url(#dormantBldgGrad)';

    // Architectural Variation based on week index
    const archStyle = i % 3;
    let roofPath = '';
    if (archStyle === 0) {
      // Stepped Tech Roof
      roofPath = `M ${x} ${y+6} L ${x+3} ${y+6} L ${x+3} ${y} L ${x+bldgWidth-3} ${y} L ${x+bldgWidth-3} ${y+6} L ${x+bldgWidth} ${y+6} L ${x+bldgWidth} ${y+bldgHeight} L ${x} ${y+bldgHeight} Z`;
    } else if (archStyle === 1) {
      // Slanted Cyber Roof
      roofPath = `M ${x} ${y+8} L ${x+bldgWidth} ${y} L ${x+bldgWidth} ${y+bldgHeight} L ${x} ${y+bldgHeight} Z`;
    } else {
      // Flat Core
      roofPath = `M ${x} ${y} L ${x+bldgWidth} ${y} L ${x+bldgWidth} ${y+bldgHeight} L ${x} ${y+bldgHeight} Z`;
    }

    foregroundTowers.push(`
      <g class="skyscraper" transform="translate(0, 0)">
        <!-- Core Structure -->
        <path d="${roofPath}" fill="${fillGrad}" stroke="${hasActivity ? primaryNeon : '#1e293b'}" stroke-width="${hasActivity ? '1.2' : '0.6'}" stroke-opacity="${hasActivity ? '0.9' : '0.3'}"/>
        
        <!-- Left Edge Highlight -->
        ${hasActivity ? `<line x1="${x}" y1="${y+8}" x2="${x}" y2="${groundY}" stroke="${primaryNeon}" stroke-width="1" opacity="0.7"/>` : ''}
    `);

    // Spires & Antennas
    if (w.total >= 5) {
      const spireH = 15 + (w.total % 5) * 4;
      foregroundTowers.push(`
        <line x1="${x + bldgWidth / 2}" y1="${y}" x2="${x + bldgWidth / 2}" y2="${y - spireH}" stroke="${primaryNeon}" stroke-width="1" filter="url(#neonGlow)"/>
        <circle cx="${x + bldgWidth / 2}" cy="${y - spireH}" r="1.5" fill="#ffffff" class="spire-beacon"/>
      `);
    }

    // 7-Day Window Matrix (Sleek horizontal LED bands)
    const activeDays = w.days.filter(d => d.count > 0).length;
    w.days.forEach((day, dIdx) => {
      // Space windows evenly across the middle 80% of the building height
      const usableHeight = bldgHeight * 0.8;
      const startY = y + (bldgHeight * 0.1);
      const winY = startY + dIdx * (usableHeight / 7);
      const winH = (usableHeight / 7) - 2;

      if (day.count > 0) {
        const winGlow = day.count >= 5 ? 'filter="url(#neonGlow)"' : '';
        const winColor = day.count >= 5 ? '#00ff7f' : day.count >= 2 ? '#00f9ff' : '#0077ff';
        
        // High activity days get double-pane windows
        if (day.count > 3) {
          foregroundTowers.push(`
            <rect x="${x + 3}" y="${winY}" width="${(bldgWidth / 2) - 4}" height="${winH}" fill="${winColor}" ${winGlow} opacity="0.95"/>
            <rect x="${x + (bldgWidth / 2) + 1}" y="${winY}" width="${(bldgWidth / 2) - 4}" height="${winH}" fill="${winColor}" ${winGlow} opacity="0.95"/>
          `);
        } else {
          foregroundTowers.push(`
            <rect x="${x + 3}" y="${winY}" width="${bldgWidth - 6}" height="${winH}" fill="${winColor}" opacity="0.85"/>
          `);
        }
      } else if (hasActivity) {
        // Subtle unlit windows on active buildings
        foregroundTowers.push(`<rect x="${x + 3}" y="${winY}" width="${bldgWidth - 6}" height="${winH}" fill="#101827" opacity="0.6"/>`);
      }
    });

    foregroundTowers.push(`</g>`);

    if (isInStreak) {
      monorailWaypoints.push({ x: x + bldgWidth / 2, y: groundY - 45 });
    }
  });

  // 4. Continuous Monorail Network
  let monorailSvg = '';
  if (monorailWaypoints.length >= 2) {
    const monoPathD = monorailWaypoints.reduce((acc, pt, idx) => {
      // Create a smooth cubic bezier curve through the city
      const prev = idx > 0 ? monorailWaypoints[idx - 1] : pt;
      const midX = (prev.x + pt.x) / 2;
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} S ${midX} ${pt.y}, ${pt.x} ${pt.y}`;
    }, '');

    const lastPt = monorailWaypoints[monorailWaypoints.length - 1];

    monorailSvg = `
      <g id="monorail-system">
        <!-- Energy Field / Outer Glow -->
        <path d="${monoPathD}" fill="none" stroke="#00f9ff" stroke-width="6" opacity="0.2" filter="url(#monorailGlow)"/>
        <path d="${monoPathD}" fill="none" stroke="#00ff7f" stroke-width="2" class="monorail-track"/>
        
        <!-- Maglev Train -->
        <g class="monorail-train" transform="translate(${lastPt.x - 20}, ${lastPt.y - 4})">
          <!-- Thruster Trail -->
          <line x1="-15" y1="4" x2="0" y2="4" stroke="#0077ff" stroke-width="3" opacity="0.8" filter="url(#neonGlow)"/>
          <rect width="28" height="8" rx="4" fill="#00ff7f" filter="url(#neonGlow)"/>
          <rect width="22" height="4" rx="2" fill="#ffffff" x="3" y="2"/>
        </g>
      </g>
    `;
  }

  // 5. Timeline Labels
  const monthLabels: string[] = [];
  const seenMonths = new Set<string>();
  weeks.forEach((w, i) => {
    if (w.month && !seenMonths.has(w.month)) {
      seenMonths.add(w.month);
      monthLabels.push(`<text x="${startX + i * colPitch}" y="${groundY + 22}" class="mono" font-size="10" fill="#64748b" font-weight="bold">${w.month}</text>`);
    }
  });

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background:#020617; font-family:'Segoe UI', system-ui, -apple-system, sans-serif;">
  <defs>
    <!-- Rich Background Gradients -->
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#02040a"/>
      <stop offset="60%" stop-color="#061024"/>
      <stop offset="100%" stop-color="#081836"/>
    </linearGradient>

    <linearGradient id="dormantBldgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0a101d"/>
      <stop offset="100%" stop-color="#03060d"/>
    </linearGradient>

    <linearGradient id="activeBldgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0c2045"/>
      <stop offset="100%" stop-color="#050a14"/>
    </linearGradient>

    <linearGradient id="cyberCyberLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0077ff" stop-opacity="0.3"/>
      <stop offset="50%" stop-color="#00f9ff" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#00ff7f" stop-opacity="0.3"/>
    </linearGradient>

    <!-- Professional Glow Filters -->
    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="blur1"/>
      <feGaussianBlur stdDeviation="8" result="blur2"/>
      <feMerge>
        <feMergeNode in="blur2"/>
        <feMergeNode in="blur1"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <filter id="monorailGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <style>
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    .spire-beacon { animation: pulse 2s infinite ease-in-out; }
    .monorail-track { animation: pulse 3s infinite ease-in-out; stroke-dasharray: 8, 4; stroke-dashoffset: 0; }
    .mono { font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace; }
  </style>

  <!-- Deep Sky Backdrop -->
  <rect width="${width}" height="${height}" fill="url(#skyGrad)" rx="16"/>
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="#1e293b" stroke-width="1.5" rx="15"/>

  <!-- Starfield Matrix -->
  <g opacity="0.4" fill="#ffffff">
    <circle cx="150" cy="80" r="1"/> <circle cx="320" cy="50" r="1.5"/> <circle cx="580" cy="90" r="0.8"/>
    <circle cx="850" cy="60" r="1.2"/> <circle cx="1080" cy="110" r="1"/> <circle cx="1150" cy="40" r="1.5"/>
  </g>

  <!-- Geometric Horizon Wireframe -->
  <g id="perspective-grid">
    ${perspectiveGrid.join('')}
  </g>

  <!-- HUD Header Layer -->
  <g id="header" transform="translate(45, 30)">
    <polygon points="0,12 12,0 30,0 30,24 12,24" fill="#00f9ff" opacity="0.15" stroke="#00f9ff" stroke-width="1"/>
    <rect x="10" y="8" width="8" height="8" fill="#00ff7f" filter="url(#neonGlow)"/>
    
    <text x="45" y="14" fill="#f8fafc" font-size="16" font-weight="800" letter-spacing="2">NEON CITYSCAPE: <tspan fill="#00f9ff">OVERCHARGED</tspan></text>
    <text x="45" y="28" class="mono" fill="#64748b" font-size="10" letter-spacing="1">USER: ${username.toUpperCase()} // ACTIVE POWER GRID</text>

    <g transform="translate(750, -5)">
      <text x="0" y="20" class="mono" fill="#94a3b8" font-size="11">TOTAL COMMITS:</text>
      <text x="100" y="21" class="mono" fill="#00f9ff" font-size="14" font-weight="900" filter="url(#neonGlow)">${totalContributions}</text>
      
      <text x="180" y="20" class="mono" fill="#94a3b8" font-size="11">ACTIVE STREAK:</text>
      <text x="285" y="21" class="mono" fill="#00ff7f" font-size="14" font-weight="900" filter="url(#neonGlow)">${streak} DAYS</text>
    </g>
  </g>

  <!-- Architectural Layers -->
  <g id="backdrop">${backdropBuildings.join('')}</g>
  <g id="midground">${midgroundBuildings.join('')}</g>
  <g id="skyscrapers">${foregroundTowers.join('')}</g>

  <!-- Transit System -->
  ${monorailSvg}

  <!-- Ground Plane & Reflection Pool -->
  <g id="ground">
    <line x1="0" y1="${groundY}" x2="${width}" y2="${groundY}" stroke="#00f9ff" stroke-width="2" opacity="0.6"/>
    <line x1="0" y1="${groundY+1}" x2="${width}" y2="${groundY+1}" stroke="url(#cyberCyberLine)" stroke-width="3" filter="url(#neonGlow)"/>
    <!-- Wet Asphalt Gradient -->
    <rect x="0" y="${groundY+3}" width="${width}" height="${height - groundY - 3}" fill="#020617" opacity="0.9"/>
    <!-- Reflection lines -->
    <path d="M 100 ${groundY+5} L 1100 ${groundY+5} M 150 ${groundY+12} L 1050 ${groundY+12}" stroke="#0077ff" stroke-width="1" opacity="0.2"/>
  </g>

  <!-- Timeline UI -->
  <g id="months">${monthLabels.join('')}</g>

  <!-- Footer UI Elements -->
  <g id="footer" transform="translate(45, ${height - 25})">
    <rect width="250" height="4" rx="2" fill="#1e293b"/>
    <rect width="100" height="4" rx="2" fill="url(#cyberCyberLine)"/>
    <text x="265" y="6" class="mono" fill="#475569" font-size="10">LEVEL COLOR: LOW (#0077FF) &#8594; PEAK (#00FF7F)</text>
    <text x="${width - 90}" y="6" class="mono" fill="#00ff7f" font-size="10" text-anchor="end">STATUS: REAL-TIME TELEMETRY STREAM ✦</text>
  </g>
</svg>
  `.trim();
}