import { GitHubTelemetry } from './github';

export function renderCursedEnergySvg(data: GitHubTelemetry, katanaGifUri?: string): string {
  const { username, totalContributions, streak } = data;
  const longestStreak = (data as any).longestStreak || streak;

  const cyanGlow = '#7dcfff';
  const purpleAura = '#bb9af7';
  const magentaCore = '#f7768e';
  const cursedGreen = '#9ece6a';

  const isOvercharged = totalContributions > 500;
  const dominantAura = isOvercharged ? cursedGreen : purpleAura;
  const auraStatus = isOvercharged ? 'OVERCHARGED DOMAIN' : 'ACTIVE DOMAIN';

  // Ring logic for current streak
  const ringRadius = 38;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (ringCircumference * Math.min(streak / 30, 1));

  return `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 900 480" width="100%" height="100%">
  <defs>
    <!-- ==================== STYLES & ANIMATIONS ==================== -->
    <style>
      <![CDATA[
      .hud-title {
        font-family: 'Fira Code', 'JetBrains Mono', 'Courier New', monospace;
        font-size: 11px;
        font-weight: 700;
        fill: #7dcfff;
        letter-spacing: 3.5px;
      }
      .hud-sub {
        font-family: 'Fira Code', 'JetBrains Mono', 'Courier New', monospace;
        font-size: 9px;
        fill: #565f89;
        letter-spacing: 2px;
      }
      .metric-title {
        font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 13px;
        font-weight: 800;
        fill: #c0caf5;
        letter-spacing: 2.5px;
      }
      .metric-sub {
        font-family: 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 9.5px;
        font-weight: 600;
        letter-spacing: 2.5px;
      }
      .metric-val {
        font-family: 'SF Pro Display', 'Inter', 'Segoe UI', Roboto, sans-serif;
        font-size: 44px;
        font-weight: 900;
        letter-spacing: -1px;
      }
      .streak-val {
        font-family: 'SF Pro Display', 'Inter', 'Segoe UI', Roboto, sans-serif;
        font-size: 32px;
        font-weight: 900;
        fill: #ffffff;
      }
      .hud-tag {
        font-family: 'Fira Code', monospace;
        font-size: 8.5px;
        fill: #565f89;
        letter-spacing: 1.5px;
      }

      @keyframes floatSword {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-4px); }
      }
      @keyframes auraBreath {
        0%, 100% { transform: scaleY(1) translateY(0px); opacity: 0.88; }
        50% { transform: scaleY(1.07) translateY(-3px); opacity: 1; }
      }
      @keyframes arcFlicker {
        0%, 100% { opacity: 0.95; }
        18% { opacity: 0.25; }
        34% { opacity: 1; }
        52% { opacity: 0.4; }
        68% { opacity: 0.9; }
        82% { opacity: 0.15; }
      }
      @keyframes radarSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .sword-assembly {
        animation: floatSword 5s ease-in-out infinite;
        transform-origin: 450px 155px;
      }
      .aura-layer {
        animation: auraBreath 4s ease-in-out infinite;
        transform-origin: 450px 155px;
      }
      .lightning-cyan {
        animation: arcFlicker 2.6s infinite;
      }
      .lightning-magenta {
        animation: arcFlicker 3.3s infinite 0.4s;
      }
      .radar-ring {
        animation: radarSpin 16s linear infinite;
        transform-origin: 450px 358px;
      }
      ]]>
    </style>

    <!-- ==================== SVG SHADER FILTERS ==================== -->
    <filter id="hud-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3.2" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="extreme-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur1" />
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur2" />
      <feMerge>
        <feMergeNode in="blur1" />
        <feMergeNode in="blur2" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="panel-shadow" x="-5%" y="-5%" width="110%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.8" />
    </filter>

    <!-- ==================== GRADIENTS & PATTERNS ==================== -->
    <linearGradient id="void-vignette" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#080911" />
      <stop offset="60%" stop-color="#0b0c16" />
      <stop offset="100%" stop-color="#040408" />
    </linearGradient>

    <radialGradient id="domain-field" cx="50%" cy="32%" r="48%">
      <stop offset="0%" stop-color="#bb9af7" stop-opacity="0.22" />
      <stop offset="45%" stop-color="#7dcfff" stop-opacity="0.1" />
      <stop offset="70%" stop-color="#f7768e" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#080911" stop-opacity="0" />
    </radialGradient>

    <linearGradient id="metal-dark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#292e42" />
      <stop offset="50%" stop-color="#16161e" />
      <stop offset="100%" stop-color="#0b0c12" />
    </linearGradient>

    <linearGradient id="blade-edge" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#414868" />
      <stop offset="45%" stop-color="#7dcfff" stop-opacity="0.75" />
      <stop offset="80%" stop-color="#bb9af7" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>

    <linearGradient id="plasma-core" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#7dcfff" />
      <stop offset="25%" stop-color="#ffffff" />
      <stop offset="65%" stop-color="#e0f7ff" />
      <stop offset="90%" stop-color="#f7768e" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>

    <linearGradient id="panel-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1a1c2b" stop-opacity="0.88" />
      <stop offset="100%" stop-color="#0d0e17" stop-opacity="0.94" />
    </linearGradient>

    <linearGradient id="panel-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7dcfff" stop-opacity="0.7" />
      <stop offset="35%" stop-color="#bb9af7" stop-opacity="0.4" />
      <stop offset="65%" stop-color="#f7768e" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#9ece6a" stop-opacity="0.6" />
    </linearGradient>

    <linearGradient id="divider-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#7dcfff" stop-opacity="0" />
      <stop offset="25%" stop-color="#565f89" stop-opacity="0.65" />
      <stop offset="50%" stop-color="#bb9af7" stop-opacity="0.9" />
      <stop offset="75%" stop-color="#565f89" stop-opacity="0.65" />
      <stop offset="100%" stop-color="#7dcfff" stop-opacity="0" />
    </linearGradient>

    <linearGradient id="cyan-metric" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="35%" stop-color="#b4f0ff" />
      <stop offset="100%" stop-color="#7dcfff" />
    </linearGradient>

    <linearGradient id="purple-metric" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="35%" stop-color="#decbfe" />
      <stop offset="100%" stop-color="#bb9af7" />
    </linearGradient>

    <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f7768e" />
      <stop offset="50%" stop-color="#bb9af7" />
      <stop offset="100%" stop-color="#7dcfff" />
    </linearGradient>

    <pattern id="cyber-grid" width="36" height="36" patternUnits="userSpaceOnUse">
      <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#414868" stroke-width="0.6" stroke-opacity="0.16" />
      <circle cx="36" cy="36" r="0.9" fill="#7dcfff" fill-opacity="0.22" />
    </pattern>
  </defs>

  <!-- ==================== 1. VOID BACKGROUND & ANIMATED KATANA ==================== -->
  <rect width="900" height="480" rx="16" fill="url(#void-vignette)" />

  <!-- Animated Katana GIF set in Background! -->
  ${katanaGifUri ? `
  <g opacity="0.92">
    <image href="${katanaGifUri}" x="0" y="0" width="900" height="480" preserveAspectRatio="xMidYMid slice" style="mix-blend-mode: screen;" />
  </g>
  ` : ''}

  <rect width="900" height="480" rx="16" fill="url(#cyber-grid)" />
  <rect width="900" height="480" rx="16" fill="url(#domain-field)" />

  <!-- Outer Cyberpunk Corner Brackets -->
  <rect x="1.5" y="1.5" width="897" height="477" rx="14.5" fill="none" stroke="#292e42" stroke-width="1.5" />
  <path d="M 16 2 L 60 2 M 2 16 L 2 50" stroke="#7dcfff" stroke-width="2" stroke-opacity="0.7" fill="none" />
  <path d="M 884 2 L 840 2 M 898 16 L 898 50" stroke="#bb9af7" stroke-width="2" stroke-opacity="0.7" fill="none" />
  <path d="M 16 478 L 60 478 M 2 464 L 2 430" stroke="#7dcfff" stroke-width="2" stroke-opacity="0.5" fill="none" />
  <path d="M 884 478 L 840 478 M 898 464 L 898 430" stroke="#9ece6a" stroke-width="2" stroke-opacity="0.5" fill="none" />

  <!-- Background Domain Target Reticle -->
  <g opacity="0.22" stroke="#565f89" stroke-width="0.8" fill="none">
    <circle cx="480" cy="155" r="240" stroke-dasharray="3 9" />
    <circle cx="480" cy="155" r="185" stroke="#bb9af7" stroke-opacity="0.4" stroke-dasharray="18 6 2 6" />
    <line x1="30" y1="155" x2="870" y2="155" stroke="#7dcfff" stroke-opacity="0.3" stroke-dasharray="8 12" />
    <line x1="480" y1="15" x2="480" y2="255" stroke="#f7768e" stroke-opacity="0.25" stroke-dasharray="4 8" />
  </g>

  <!-- ==================== 2. TOP HUD BRANDING HEADER ==================== -->
  <g transform="translate(32, 26)">
    <polygon points="0,6 5,0 10,6 5,12" fill="#9ece6a" filter="url(#hud-glow)" />
    <circle cx="5" cy="6" r="1.5" fill="#ffffff" />
    <text x="20" y="10" class="hud-title" filter="url(#hud-glow)">AURA FARMING // ${auraStatus}</text>
    <text x="20" y="25" class="hud-sub">SYS.RELIC: FLAMING_KATANA_8K // LIVE_TELEMETRY</text>
    <path d="M 0 18 L 12 18 L 16 23 L 340 23" fill="none" stroke="#414868" stroke-width="1" />
  </g>

  <g transform="translate(868, 26)" text-anchor="end">
    <text x="0" y="10" class="hud-sub" fill="#f7768e">CURSED_OUTPUT: CRITICAL</text>
    <text x="0" y="24" class="hud-tag">TOKYO_NIGHT // HEX_0x1A1B26</text>
    <g transform="translate(-145, 29)">
      <rect x="0" y="0" width="24" height="3" fill="#7dcfff" opacity="0.8" />
      <rect x="28" y="0" width="16" height="3" fill="#bb9af7" opacity="0.8" />
      <rect x="48" y="0" width="36" height="3" fill="#f7768e" opacity="0.9" />
      <rect x="88" y="0" width="57" height="3" fill="#9ece6a" filter="url(#hud-glow)" />
    </g>
  </g>

  <!-- ==================== 3. VECTOR KATANA FALLBACK (If no GIF) ==================== -->
  ${!katanaGifUri ? `
  <g class="sword-assembly">
    <g id="cyber-tsuka">
      <polygon points="68,155 88,142 98,147 98,163 88,168" fill="#16161e" stroke="#7dcfff" stroke-width="1.2" />
      <polygon points="55,155 72,150 72,160" fill="#f7768e" filter="url(#hud-glow)" />
      <polygon points="96,143 226,141 232,147 232,163 226,169 96,167" fill="url(#metal-dark)" stroke="#565f89" stroke-width="1.2" />
    </g>
    <path d="M 278 155 L 785 147 L 838 145" stroke="url(#plasma-core)" stroke-width="8" stroke-linecap="round" filter="url(#extreme-glow)" opacity="0.88" />
  </g>
  ` : ''}

  <!-- ==================== 4. TOKYO NIGHT METRICS DASHBOARD (ORIGINAL PRESERVED) ==================== -->
  <g transform="translate(36, 262)">
    <!-- Dashboard Outer Base & Glowing Border -->
    <rect x="0" y="0" width="828" height="190" rx="14" fill="none" stroke="none" />
    
    <!-- Subtle Inner Tech Frame -->
    

    <!-- Top Edge Neon Accent Highlights -->
    <line x1="90" y1="0" x2="186" y2="0" stroke="#7dcfff" stroke-width="2.5" filter="url(#hud-glow)" />
    <line x1="366" y1="0" x2="462" y2="0" stroke="#f7768e" stroke-width="2.5" filter="url(#hud-glow)" />
    <line x1="642" y1="0" x2="738" y2="0" stroke="#bb9af7" stroke-width="2.5" filter="url(#hud-glow)" />

    <!-- Vertical Divider Lines with Diamond Nodes -->
    <g transform="translate(276, 0)">
      <line x1="0" y1="18" x2="0" y2="172" stroke="url(#divider-grad)" stroke-width="1.5" />
      <polygon points="0,89 4,95 0,101 -4,95" fill="#7dcfff" filter="url(#hud-glow)" />
    </g>
    <g transform="translate(552, 0)">
      <line x1="0" y1="18" x2="0" y2="172" stroke="url(#divider-grad)" stroke-width="1.5" />
      <polygon points="0,89 4,95 0,101 -4,95" fill="#bb9af7" filter="url(#hud-glow)" />
    </g>

    <!-- ==================== COLUMN 1: LEFT (TOTAL SOULS) ==================== -->
    <g transform="translate(138, 0)" text-anchor="middle">
      <text x="0" y="36" class="metric-title">TOTAL SOULS</text>
      <text x="0" y="54" class="metric-sub" fill="#7dcfff" filter="url(#hud-glow)">TOTAL HARVEST</text>

      <!-- Heavy Glowing Metric Value -->
      <text x="0" y="116" class="metric-val" fill="url(#cyan-metric)" filter="url(#hud-glow)">${totalContributions}</text>

      <!-- Telemetry Sub-Text & Micro Meter -->
      <rect x="-70" y="136" width="140" height="4" rx="2" fill="#16161e" />
      <rect x="-70" y="136" width="105" height="4" rx="2" fill="#7dcfff" filter="url(#hud-glow)" />
      <text x="0" y="158" class="hud-tag">GRADE: SPECIAL_CLASS // +18.4%</text>
    </g>

    <!-- ==================== COLUMN 2: CENTER (ACTIVE DOMAIN & STREAK) ==================== -->
    <g transform="translate(414, 0)" text-anchor="middle">
      <text x="0" y="36" class="metric-title">${auraStatus}</text>

      <!-- Circular SVG Progress Ring (Halo / Radar) -->
      <g transform="translate(0, 96)">
        <!-- Outer Radar Ticks -->
        <circle cx="0" cy="0" r="54" fill="none" stroke="#414868" stroke-width="1" stroke-dasharray="2 6" />
        <!-- Dark Track Ring -->
        <circle cx="0" cy="0" r="46" fill="#13141c" stroke="#1f2335" stroke-width="6" />
        <!-- Glowing Progress Arc -->
        <circle cx="0" cy="0" r="46" fill="none" stroke="url(#ring-gradient)" stroke-width="6" stroke-linecap="round" stroke-dasharray="242 290" transform="rotate(-90)" filter="url(#hud-glow)" />
        
        <!-- Magenta Cursed Flame Icon Inside Halo -->
        <path d="M 0 -36 
                 C 5 -29, 11 -22, 7 -14 
                 C 12 -17, 14 -11, 10 -6 
                 C 6 -1, -6 -1, -10 -6 
                 C -14 -11, -11 -20, -6 -24 
                 C -8 -18, -3 -16, 0 -22 Z" fill="#f7768e" filter="url(#hud-glow)" />
        <path d="M 0 -27 C 3 -22, 5 -17, 2 -11 C 0 -8, -4 -9, -4 -14 C -4 -18, -1 -22, 0 -27 Z" fill="#ffffff" />

        <!-- Current Day Streak Value -->
        <text x="0" y="17" class="streak-val" filter="url(#hud-glow)">${streak}</text>
        <text x="0" y="31" class="hud-tag" fill="#f7768e">DAYS</text>
      </g>

      <text x="0" y="168" class="metric-sub" fill="#9ece6a" filter="url(#hud-glow)">CURRENT DAY STREAK</text>
    </g>

    <!-- ==================== COLUMN 3: RIGHT (PEAK RESONANCE) ==================== -->
    <g transform="translate(690, 0)" text-anchor="middle">
      <text x="0" y="36" class="metric-title">PEAK RESONANCE</text>
      <text x="0" y="54" class="metric-sub" fill="#bb9af7" filter="url(#hud-glow)">MAX COMBO CHAIN</text>
      
      <!-- Heavy Glowing Metric Value -->
      <text x="0" y="116" class="metric-val" fill="url(#purple-metric)" filter="url(#hud-glow)">${longestStreak}</text>
      
      <!-- Telemetry Bar & Status -->
      <rect x="-70" y="136" width="140" height="4" rx="2" fill="#16161e" />
      <rect x="-70" y="136" width="140" height="4" rx="2" fill="#bb9af7" filter="url(#hud-glow)" />
      <text x="0" y="158" class="hud-tag">RESONANCE: LIMIT_BROKEN // MAX</text>
    </g>
  </g>
</svg>
  `.trim();
}
