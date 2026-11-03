import { GitHubTelemetry } from './github';

export function renderSpectrogramSvg(data: GitHubTelemetry): string {
  const { username, totalContributions, days, weeks, peakDay } = data;

  const width = 1200;
  const height = 430;
  const centerY = 245; // Center audio baseline
  const startX = 65;
  const endX = 1135;
  const usableWidth = endX - startX;

  const totalPoints = Math.max(52, days.length);
  const stepX = usableWidth / (totalPoints - 1);
  const maxCommit = Math.max(10, ...days.map((d) => d.count));
  const maxWeekly = Math.max(8, ...weeks.map((w) => w.total));

  // 1. Oscilloscope Studio Grid
  const gridLines: string[] = [];
  for (let i = 0; i <= 20; i++) {
    const gy = 80 + i * 15;
    gridLines.push(`<line x1="${startX}" y1="${gy}" x2="${endX}" y2="${gy}" stroke="#0077ff" stroke-width="0.5" opacity="${i === 11 ? '0.4' : '0.05'}"/>`);
  }
  for (let i = 0; i <= 52; i++) {
    const gx = startX + i * (usableWidth / 52);
    gridLines.push(`<line x1="${gx}" y1="80" x2="${gx}" y2="380" stroke="#0077ff" stroke-width="0.5" opacity="0.05"/>`);
  }

  // 2. Waveform Core & Envelopes (Phase Shifted for acoustic depth)
  const topPoints: { x: number; y: number }[] = [];
  const bottomPoints: { x: number; y: number }[] = [];
  const corePoints: { x: number; y: number }[] = []; // High-frequency inner carrier

  days.forEach((d, i) => {
    const x = startX + i * stepX;
    
    let amp = 4;
    if (d.count > 0) {
      const normalized = Math.min(1, d.count / maxCommit);
      // Aggressive exponential curve for visual audio spikes
      amp = 12 + Math.pow(normalized, 0.8) * 140;
    }

    // Micro-resonance harmonics
    const harmonic1 = Math.sin((i / totalPoints) * Math.PI * 24) * (d.count > 0 ? 5 : 1.5);
    const harmonic2 = Math.cos((i / totalPoints) * Math.PI * 64) * (d.count > 0 ? amp * 0.15 : 1);
    
    const finalAmp = Math.max(2, amp + harmonic1);

    topPoints.push({ x, y: centerY - finalAmp });
    bottomPoints.push({ x, y: centerY + finalAmp * 0.6 }); // Asymmetrical bottom reflection
    corePoints.push({ x, y: centerY - (finalAmp * 0.4) + harmonic2 }); // Inner chaotic energy
  });

  const buildBezier = (pts: {x: number, y: number}[], isReverse = false) => {
    const array = isReverse ? [...pts].reverse() : pts;
    let d = `M ${array[0].x} ${array[0].y}`;
    for (let i = 1; i < array.length; i++) {
      const prev = array[i - 1];
      const curr = array[i];
      const cpX = (prev.x + curr.x) / 2;
      d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  const topWaveD = buildBezier(topPoints);
  const bottomWaveD = buildBezier(bottomPoints, true);
  const coreWaveD = buildBezier(corePoints);
  const fullEnvelopeD = `${topWaveD} L ${bottomPoints[bottomPoints.length - 1].x} ${bottomPoints[bottomPoints.length - 1].y} ${bottomWaveD.replace(/^M [^\s]+ [^\s]+/, '')} Z`;

  // 3. 52-Band Segmented LED Equalizer Overlay
  const eqBars: string[] = [];
  const eqPitch = usableWidth / 52;

  weeks.forEach((w, idx) => {
    const bx = startX + idx * eqPitch + (eqPitch / 2);
    const bRatio = Math.min(1, w.total / maxWeekly);
    const barH = Math.max(8, Math.round(10 + Math.pow(bRatio, 0.85) * 135));
    const by = centerY - barH;

    let barColor = '#0077ff'; // Dormant/Low
    let glow = '';
    if (w.total >= 10) { barColor = '#ff2bd6'; glow = 'filter="url(#neonGlow)"'; }
    else if (w.total >= 4) { barColor = '#a855f7'; glow = 'filter="url(#eqGlow)"'; }
    else if (w.total >= 1) { barColor = '#00f9ff'; glow = 'filter="url(#eqGlow)"'; }

    if (w.total > 0) {
      eqBars.push(`
        <!-- Segmented LED Bar -->
        <line x1="${bx}" y1="${centerY - 4}" x2="${bx}" y2="${by}" stroke="${barColor}" stroke-width="${Math.max(3, eqPitch - 6)}" stroke-dasharray="4,2" opacity="0.8" ${glow}/>
        <!-- LED Peak Cap -->
        <rect x="${bx - (eqPitch - 6)/2}" y="${by - 4}" width="${Math.max(3, eqPitch - 6)}" height="2" fill="#ffffff" opacity="0.9" ${glow}/>
      `);
    } else {
      // Dormant ghost bars
      eqBars.push(`
        <line x1="${bx}" y1="${centerY - 4}" x2="${bx}" y2="${centerY - 12}" stroke="#0f172a" stroke-width="${Math.max(3, eqPitch - 6)}" stroke-dasharray="4,2" opacity="0.5"/>
      `);
    }
  });

  // 4. Frequency Scale Labels
  const freqMarks = [
    { label: '20Hz', pct: 0.02 }, { label: '80Hz', pct: 0.12 }, { label: '250Hz', pct: 0.25 },
    { label: '500Hz', pct: 0.38 }, { label: '1kHz', pct: 0.50 }, { label: '2.5kHz', pct: 0.65 },
    { label: '5kHz', pct: 0.78 }, { label: '10kHz', pct: 0.89 }, { label: '20kHz', pct: 0.98 },
  ];

  const freqLabels = freqMarks.map((m) => {
    const fx = startX + m.pct * usableWidth;
    return `
      <circle cx="${fx}" cy="${centerY + 120}" r="2" fill="#334155"/>
      <text x="${fx}" y="${centerY + 138}" class="mono" font-size="9" fill="#64748b" text-anchor="middle" font-weight="600">${m.label}</text>
    `;
  }).join('');

  // 5. Timeline Month Labels
  const monthLabels: string[] = [];
  const seenMonths = new Set<string>();
  weeks.forEach((w, i) => {
    if (w.month && !seenMonths.has(w.month)) {
      seenMonths.add(w.month);
      const mx = startX + i * eqPitch;
      monthLabels.push(`<text x="${mx}" y="${centerY - 150}" class="mono" font-size="10" fill="#94a3b8" font-weight="bold">${w.month}</text>`);
    }
  });

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background:#02040a; font-family:'Segoe UI', system-ui, -apple-system, sans-serif;">
  <defs>
    <linearGradient id="specBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#02040a"/>
      <stop offset="50%" stop-color="#080c18"/>
      <stop offset="100%" stop-color="#04060d"/>
    </linearGradient>

    <!-- Vibrant Multi-stage Audio Gradient -->
    <linearGradient id="spectrumGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#0077ff" stop-opacity="0.1"/>
      <stop offset="35%" stop-color="#00f9ff" stop-opacity="0.5"/>
      <stop offset="65%" stop-color="#a855f7" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#ff2bd6" stop-opacity="0.9"/>
    </linearGradient>

    <linearGradient id="peakLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00f9ff"/>
      <stop offset="25%" stop-color="#a855f7"/>
      <stop offset="50%" stop-color="#ff2bd6"/>
      <stop offset="75%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#00f9ff"/>
    </linearGradient>

    <!-- Studio Quality Glows -->
    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="blur1"/>
      <feGaussianBlur stdDeviation="12" result="blur2"/>
      <feMerge>
        <feMergeNode in="blur2"/>
        <feMergeNode in="blur1"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <filter id="eqGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <style>
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
    .eq-bar { animation: pulse 2s infinite ease-in-out; }
    .mono { font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace; }
  </style>

  <!-- Deep Canvas -->
  <rect width="${width}" height="${height}" fill="url(#specBg)" rx="16"/>
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="#1e293b" stroke-width="1.5" rx="15"/>

  <!-- Background Oscilloscope Grid -->
  <g id="oscilloscope-grid">${gridLines.join('')}</g>

  <!-- Audio dB Coordinate Tracking Lines -->
  <g opacity="0.3" stroke-width="1" class="mono" font-size="9">
    <line x1="${startX}" y1="${centerY - 120}" x2="${endX}" y2="${centerY - 120}" stroke="#a855f7" stroke-dasharray="2,4"/>
    <text x="${startX - 10}" y="${centerY - 117}" fill="#a855f7" text-anchor="end">+12dB</text>

    <line x1="${startX}" y1="${centerY - 60}" x2="${endX}" y2="${centerY - 60}" stroke="#00f9ff" stroke-dasharray="2,4"/>
    <text x="${startX - 10}" y="${centerY - 57}" fill="#00f9ff" text-anchor="end">+6dB</text>

    <!-- Glass Baseline -->
    <line x1="${startX}" y1="${centerY}" x2="${endX}" y2="${centerY}" stroke="#0077ff" stroke-width="2" opacity="0.5"/>
    <text x="${startX - 10}" y="${centerY + 3}" fill="#0077ff" text-anchor="end">0dB</text>
  </g>

  <!-- ==================== HUD HEADER ==================== -->
  <g id="header" transform="translate(45, 30)">
    <!-- Audio Waveform Sigil -->
    <polygon points="0,4 0,20 6,20 6,24 10,24 10,18 14,18 14,24 18,24 18,20 24,20 24,4 18,4 18,0 14,0 14,6 10,6 10,0 6,0 6,4" fill="#00f9ff" opacity="0.15"/>
    <path d="M 4 12 Q 12 0, 12 12 T 20 12" fill="none" stroke="#ff2bd6" stroke-width="2" filter="url(#eqGlow)"/>

    <text x="40" y="14" fill="#f8fafc" font-size="16" font-weight="900" letter-spacing="2">ACOUSTIC SPECTROGRAM: <tspan fill="#ff2bd6">RESONANCE</tspan></text>
    <text x="40" y="28" class="mono" fill="#64748b" font-size="10" letter-spacing="1">USER: ${username.toUpperCase()} // STUDIO VOCAL &amp; SITAR FFT SYNTHESIS</text>

    <!-- Telemetry Dash -->
    <g transform="translate(680, -5)">
      <text x="0" y="20" class="mono" fill="#94a3b8" font-size="11">TOTAL ENERGY:</text>
      <text x="95" y="21" class="mono" fill="#a855f7" font-size="14" font-weight="900" filter="url(#eqGlow)">${totalContributions} C</text>
      
      <text x="180" y="20" class="mono" fill="#94a3b8" font-size="11">PEAK SPIKE:</text>
      <text x="260" y="21" class="mono" fill="#ff2bd6" font-size="14" font-weight="900" filter="url(#neonGlow)">${peakDay.count} (+12dB)</text>
    </g>
  </g>

  <!-- Timeline Month Labels -->
  <g id="months">${monthLabels.join('')}</g>

  <!-- Layer 1: Background Equalizer Frequency Bars -->
  <g id="eq-bars">${eqBars.join('')}</g>

  <!-- Layer 2: Main Spectral Waveform Envelope (Bipolar Resonant Wave) -->
  <g id="waveform">
    <!-- Outer Glowing Plasma Area -->
    <path d="${fullEnvelopeD}" fill="url(#spectrumGrad)" opacity="0.9" filter="url(#neonGlow)"/>
    
    <!-- Core Chaos Carrier Wave (Inner high-frequency audio string) -->
    <path d="${coreWaveD}" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.6" filter="url(#eqGlow)"/>
    
    <!-- Precision Crest Audio Line (Upper Harmonic String) -->
    <path d="${topWaveD}" fill="none" stroke="url(#peakLineGrad)" stroke-width="2.5" filter="url(#eqGlow)"/>
    
    <!-- Trough Audio Line (Lower Reflection) -->
    <path d="${bottomWaveD}" fill="none" stroke="#0077ff" stroke-width="1.5" opacity="0.6"/>
  </g>

  <!-- Peak Indicator Crosshair -->
  <g id="peak-callout" transform="translate(${startX + peakDay.weekIndex * (usableWidth / 52)}, ${centerY - 130})">
    <line x1="0" y1="0" x2="0" y2="130" stroke="#ff2bd6" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.8"/>
    <!-- Outer radar ring -->
    <circle cx="0" cy="130" r="14" fill="none" stroke="#ff2bd6" stroke-width="1" opacity="0.5"/>
    <circle cx="0" cy="130" r="4" fill="#ffffff" filter="url(#neonGlow)"/>
    
    <rect x="-65" y="-25" width="130" height="24" rx="4" fill="#0f172a" stroke="#ff2bd6" stroke-width="1.5"/>
    <text x="0" y="-8" class="mono" fill="#ff2bd6" font-size="10" font-weight="800" text-anchor="middle" filter="url(#eqGlow)">PEAK: ${peakDay.count} COMMITS</text>
  </g>

  <!-- Frequency Scale Axis -->
  <g id="frequency-axis">
    <line x1="${startX}" y1="${centerY + 120}" x2="${endX}" y2="${centerY + 120}" stroke="#1e293b" stroke-width="2"/>
    ${freqLabels}
  </g>

  <!-- Footer Info -->
  <g id="footer" transform="translate(45, ${height - 25})">
    <rect width="260" height="4" rx="2" fill="#1e293b"/>
    <rect width="120" height="4" rx="2" fill="url(#peakLineGrad)"/>
    <text x="275" y="6" class="mono" fill="#475569" font-size="10">TIMBRE: LOW (#00F9FF) &#8594; PEAK RESONANCE (#FF2BD6)</text>
    <text x="${width - 90}" y="6" class="mono" fill="#a855f7" font-size="10" text-anchor="end">ACOUSTIC FOURIER ENGINE ✦</text>
  </g>
</svg>
  `.trim();
}