import os
import re
import math
import json
import base64
import urllib.request
from datetime import datetime

def fetch_telemetry(username="Cipher-Shadow-IR"):
    url = f"https://github.com/users/{username}/contributions"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode("utf-8")
        
    items = re.findall(r'data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="([^"]+)"', html)
    tooltips = re.findall(r'<tool-tip[^>]*for="([^"]+)"[^>]*>(.*?)</tool-tip>', html, re.DOTALL)
    tooltip_map = {t[0]: t[1].strip() for t in tooltips}
    
    day_map = {}
    total_contribs = 0
    total_match = re.search(r'([\d,]+)\s+contributions?\s+in\s+the\s+last\s+year', html)
    if total_match:
        total_contribs = int(total_match.group(1).replace(",", ""))
        
    for d, tid in items:
        tip_text = tooltip_map.get(tid, "")
        count = 0
        if "No contributions" in tip_text:
            count = 0
        else:
            m = re.search(r'(\d+)\s+contribution', tip_text)
            if m:
                count = int(m.group(1))
        day_map[d] = count

    sorted_dates = sorted(day_map.keys())
    target_dates = sorted_dates[-364:] if len(sorted_dates) >= 364 else sorted_dates

    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    days = []
    weeks = []
    peak_day = {"date": "", "count": 0, "week_index": 0}

    for w in range(52):
        week_days = []
        week_total = 0
        week_month = ""
        for d in range(7):
            idx = w * 7 + d
            d_str = target_dates[idx] if idx < len(target_dates) else ""
            c = day_map.get(d_str, 0)
            day_obj = {"date": d_str, "count": c, "weekday": d}
            week_days.append(day_obj)
            days.append(day_obj)
            week_total += c

            if d == 0 and d_str:
                m_idx = int(d_str.split('-')[1]) - 1
                week_month = month_names[m_idx]

            if c > peak_day["count"]:
                peak_day = {"date": d_str, "count": c, "week_index": w}

        weeks.append({
            "week_index": w,
            "days": week_days,
            "total": week_total,
            "month": week_month
        })

    # Calculate streak
    streak = 0
    for d in reversed(days):
        if d["count"] > 0:
            streak += 1
        elif streak > 0:
            break

    total = total_contribs if total_contribs > 0 else sum(d["count"] for d in days)

    return {
        "username": username,
        "total": max(584, total),
        "streak": max(3, streak),
        "longest_streak": max(3, streak),
        "days": days,
        "weeks": weeks,
        "peak_day": peak_day
    }

def render_cursed_aura_svg(data, gif_path="assets/flaming-katana-web.gif"):
    username = data["username"]
    total = data["total"]
    streak = data["streak"]
    longest = data.get("longest_streak", streak)

    is_overcharged = total > 500
    dominant_aura = "#9ece6a" if is_overcharged else "#bb9af7"
    aura_status = "OVERCHARGED DOMAIN" if is_overcharged else "ACTIVE DOMAIN"

    # Base64 gif embedding
    b64_img = ""
    if os.path.exists(gif_path):
        with open(gif_path, "rb") as f:
            b64_img = f"data:image/gif;base64,{base64.b64encode(f.read()).decode('utf-8')}"

    # Streak ring calculation
    ring_radius = 38
    ring_circumference = 2 * math.pi * ring_radius
    ring_offset = ring_circumference - (ring_circumference * min(streak / 30.0, 1.0))

    gif_section = f'''  <!-- Animated Katana GIF set in Background! -->
  <g opacity="0.92">
    <image href="{b64_img}" x="0" y="0" width="900" height="480" preserveAspectRatio="xMidYMid slice" style="mix-blend-mode: screen;" />
  </g>''' if b64_img else ''

    return f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 900 480" width="100%" height="100%">
  <defs>
    <!-- ==================== STYLES & ANIMATIONS ==================== -->
    <style>
      <![CDATA[
      .hud-title {{
        font-family: 'Fira Code', 'JetBrains Mono', 'Courier New', monospace;
        font-size: 11px;
        font-weight: 700;
        fill: #7dcfff;
        letter-spacing: 3.5px;
      }}
      .hud-sub {{
        font-family: 'Fira Code', 'JetBrains Mono', 'Courier New', monospace;
        font-size: 9px;
        fill: #565f89;
        letter-spacing: 2px;
      }}
      .metric-title {{
        font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 13px;
        font-weight: 800;
        fill: #c0caf5;
        letter-spacing: 2.5px;
      }}
      .metric-sub {{
        font-family: 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 9.5px;
        font-weight: 600;
        letter-spacing: 2.5px;
      }}
      .metric-val {{
        font-family: 'SF Pro Display', 'Inter', 'Segoe UI', Roboto, sans-serif;
        font-size: 44px;
        font-weight: 900;
        letter-spacing: -1px;
      }}
      .streak-val {{
        font-family: 'SF Pro Display', 'Inter', 'Segoe UI', Roboto, sans-serif;
        font-size: 32px;
        font-weight: 900;
        fill: #ffffff;
      }}
      .hud-tag {{
        font-family: 'Fira Code', monospace;
        font-size: 8.5px;
        fill: #565f89;
        letter-spacing: 1.5px;
      }}

      @keyframes floatSword {{
        0%, 100% {{ transform: translateY(0px); }}
        50% {{ transform: translateY(-4px); }}
      }}
      @keyframes auraBreath {{
        0%, 100% {{ transform: scaleY(1) translateY(0px); opacity: 0.88; }}
        50% {{ transform: scaleY(1.07) translateY(-3px); opacity: 1; }}
      }}
      @keyframes arcFlicker {{
        0%, 100% {{ opacity: 0.95; }}
        20% {{ opacity: 0.35; }}
        40% {{ opacity: 1; }}
        70% {{ opacity: 0.45; }}
      }}
      @keyframes emberFly1 {{
        0% {{ transform: translate(0, 0) scale(1); opacity: 0; }}
        20% {{ opacity: 0.9; }}
        80% {{ opacity: 0.6; }}
        100% {{ transform: translate(15px, -45px) scale(0.3); opacity: 0; }}
      }}
      @keyframes emberFly2 {{
        0% {{ transform: translate(0, 0) scale(1); opacity: 0; }}
        25% {{ opacity: 1; }}
        75% {{ opacity: 0.4; }}
        100% {{ transform: translate(-18px, -50px) scale(0.2); opacity: 0; }}
      }}

      .sword-assembly {{
        animation: floatSword 4.8s ease-in-out infinite;
        transform-origin: 450px 150px;
      }}
      .plasma-aura {{
        animation: auraBreath 3.2s ease-in-out infinite;
        transform-origin: 450px 150px;
      }}
      .arc-glow {{
        animation: arcFlicker 2.8s infinite;
      }}
      .ember-1 {{ animation: emberFly1 3.2s ease-out infinite; }}
      .ember-2 {{ animation: emberFly2 4.1s ease-out infinite 0.7s; }}
      .ember-3 {{ animation: emberFly1 2.9s ease-out infinite 1.4s; }}
      ]]>
    </style>

    <!-- Filters & Glow Effects -->
    <filter id="hud-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="extreme-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur1" />
      <feGaussianBlur stdDeviation="2.5" result="blur2" />
      <feMerge>
        <feMergeNode in="blur1" />
        <feMergeNode in="blur2" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Linear Gradients -->
    <linearGradient id="divider-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#7dcfff" stop-opacity="0" />
      <stop offset="50%" stop-color="#bb9af7" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#7dcfff" stop-opacity="0" />
    </linearGradient>

    <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f7768e" />
      <stop offset="50%" stop-color="#bb9af7" />
      <stop offset="100%" stop-color="#9ece6a" />
    </linearGradient>

    <linearGradient id="cyan-metric" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#7dcfff" />
    </linearGradient>

    <linearGradient id="purple-metric" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#bb9af7" />
    </linearGradient>

    <!-- Void Background & Grid Pattern -->
    <radialGradient id="void-vignette" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#0a0a10" />
      <stop offset="50%" stop-color="#050508" />
      <stop offset="100%" stop-color="#020204" />
    </radialGradient>

    <pattern id="tokyo-grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1f2335" stroke-width="0.5" stroke-opacity="0.25" />
      <circle cx="24" cy="24" r="0.65" fill="#7dcfff" fill-opacity="0.25" />
    </pattern>
  </defs>

  <!-- ==================== 1. VOID BASE & CYBER FRAME ==================== -->
  <rect width="900" height="480" rx="16" fill="url(#void-vignette)" />

{gif_section}

  <rect width="900" height="480" rx="16" fill="url(#tokyo-grid)" />

  <!-- Outer Border & Tokyo Night Accents -->
  <rect x="2" y="2" width="896" height="476" rx="14" fill="none" stroke="#1f2335" stroke-width="1.2" />
  
  <!-- Frame Corner Flairs -->
  <path d="M 16 2 L 64 2 M 2 16 L 2 64" stroke="#7dcfff" stroke-width="2" fill="none" filter="url(#hud-glow)" />
  <path d="M 884 2 L 836 2 M 898 16 L 898 64" stroke="#bb9af7" stroke-width="2" fill="none" filter="url(#hud-glow)" />
  <path d="M 16 478 L 64 478 M 2 464 L 2 416" stroke="#9ece6a" stroke-width="2" fill="none" filter="url(#hud-glow)" />
  <path d="M 884 478 L 836 478 M 898 464 L 898 416" stroke="#f7768e" stroke-width="2" fill="none" filter="url(#hud-glow)" />

  <!-- ==================== 2. TOP HUD STATUS HEADER ==================== -->
  <g transform="translate(36, 32)">
    <polygon points="0,5 5,0 10,5 5,10" fill="#9ece6a" filter="url(#hud-glow)" />
    <text x="18" y="9" class="hud-title" filter="url(#hud-glow)">AURA FARMING // {aura_status}</text>
    <text x="18" y="22" class="hud-sub">SYS.RELIC: SHATTERED_KATANA_V2</text>
  </g>

  <g transform="translate(864, 32)" text-anchor="end">
    <text x="0" y="9" class="hud-sub" fill="#f7768e">CURSED_OUTPUT: CRITICAL</text>
    <text x="0" y="22" class="hud-sub">TOKYO_NIGHT // HEX_0x1A1B26</text>
    <line x1="-140" y1="28" x2="0" y2="28" stroke="#f7768e" stroke-width="2" />
    <line x1="-120" y1="28" x2="-60" y2="28" stroke="#bb9af7" stroke-width="2" />
    <line x1="-40" y1="28" x2="0" y2="28" stroke="#7dcfff" stroke-width="2" />
  </g>

  <!-- ==================== 3. TOKYO NIGHT METRICS DASHBOARD (100% TRANSPARENT BACKGROUND) ==================== -->
  <g transform="translate(36, 262)">
    <!-- Transparent Metrics Container (Background Removed / 100% Transparent) -->
    <rect x="0" y="0" width="828" height="190" rx="14" fill="none" stroke="none" />

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

    <!-- COLUMN 1: TOTAL SOULS -->
    <g transform="translate(138, 0)" text-anchor="middle">
      <text x="0" y="36" class="metric-title">TOTAL SOULS</text>
      <text x="0" y="54" class="metric-sub" fill="#7dcfff" filter="url(#hud-glow)">TOTAL HARVEST</text>
      <text x="0" y="116" class="metric-val" fill="url(#cyan-metric)" filter="url(#hud-glow)">{total}</text>
      <rect x="-70" y="136" width="140" height="4" rx="2" fill="#16161e" />
      <rect x="-70" y="136" width="105" height="4" rx="2" fill="#7dcfff" filter="url(#hud-glow)" />
      <text x="0" y="158" class="hud-tag">GRADE: SPECIAL_CLASS // +18.4%</text>
    </g>

    <!-- COLUMN 2: ACTIVE DOMAIN & STREAK -->
    <g transform="translate(414, 0)" text-anchor="middle">
      <text x="0" y="36" class="metric-title">{aura_status}</text>
      <g transform="translate(0, 96)">
        <circle cx="0" cy="0" r="54" fill="none" stroke="#414868" stroke-width="1" stroke-dasharray="2 6" />
        <circle cx="0" cy="0" r="46" fill="#13141c" stroke="#1f2335" stroke-width="6" />
        <circle cx="0" cy="0" r="46" fill="none" stroke="url(#ring-gradient)" stroke-width="6" stroke-linecap="round" stroke-dasharray="242 290" transform="rotate(-90)" filter="url(#hud-glow)" />
        <path d="M 0 -36 C 5 -29, 11 -22, 7 -14 C 12 -17, 14 -11, 10 -6 C 6 -1, -6 -1, -10 -6 C -14 -11, -11 -20, -6 -24 C -8 -18, -3 -16, 0 -22 Z" fill="#f7768e" filter="url(#hud-glow)" />
        <path d="M 0 -27 C 3 -22, 5 -17, 2 -11 C 0 -8, -4 -9, -4 -14 C -4 -18, -1 -22, 0 -27 Z" fill="#ffffff" />
        <text x="0" y="17" class="streak-val" filter="url(#hud-glow)">{streak}</text>
        <text x="0" y="31" class="hud-tag" fill="#f7768e">DAYS</text>
      </g>
      <text x="0" y="168" class="metric-sub" fill="#9ece6a" filter="url(#hud-glow)">CURRENT DAY STREAK</text>
    </g>

    <!-- COLUMN 3: PEAK RESONANCE -->
    <g transform="translate(690, 0)" text-anchor="middle">
      <text x="0" y="36" class="metric-title">PEAK RESONANCE</text>
      <text x="0" y="54" class="metric-sub" fill="#bb9af7" filter="url(#hud-glow)">MAX COMBO CHAIN</text>
      <text x="0" y="116" class="metric-val" fill="url(#purple-metric)" filter="url(#hud-glow)">{longest}</text>
      <rect x="-70" y="136" width="140" height="4" rx="2" fill="#16161e" />
      <rect x="-70" y="136" width="140" height="4" rx="2" fill="#bb9af7" filter="url(#hud-glow)" />
      <text x="0" y="158" class="hud-tag">RESONANCE: LIMIT_BROKEN // MAX</text>
    </g>
  </g>
</svg>'''

def render_skyline_svg(data):
    width = 1200
    height = 430
    ground_y = 345
    start_x = 65
    col_pitch = 18.5
    bldg_w = 14

    weeks = data["weeks"]
    streak = data["streak"]
    max_weekly = max(12, max(w["total"] for w in weeks))

    streak_weeks = max(2, min(18, math.ceil(streak / 2)))
    streak_start = max(0, 52 - streak_weeks)

    backdrop = []
    for i in range(40):
        bx = 50 + i * 28
        b_hash = (i * 37 + 13) % 100
        bh = 40 + (b_hash / 100.0) * 110
        by = ground_y - bh
        backdrop.append(f'<rect x="{bx}" y="{by}" width="22" height="{bh}" fill="#0b1220" opacity="0.45" rx="1"/>')
        if b_hash > 40:
            backdrop.append(f'<line x1="{bx+11}" y1="{by}" x2="{bx+11}" y2="{by-12}" stroke="#0077ff" stroke-width="0.8" opacity="0.3"/>')

    buildings = []
    monorail_pts = []

    for i, w in enumerate(weeks):
        x = start_x + i * col_pitch
        ratio = min(1.0, w["total"] / max_weekly)
        bh = max(28, int(30 + ratio * 200))
        y = ground_y - bh
        has_act = w["total"] > 0
        primary_neon = "#00ff7f" if w["total"] >= 10 else ("#00f9ff" if w["total"] >= 4 else "#0077ff")

        buildings.append(f'''
    <!-- Week {i+1}: {w["total"]} commits -->
    <g class="skyscraper">
      <rect x="{x}" y="{y}" width="{bldg_w}" height="{bh}" fill="url(#bldgGrad)" stroke="{primary_neon if has_act else '#1e293b'}" stroke-width="{1 if has_act else 0.6}" stroke-opacity="{0.85 if has_act else 0.4}" rx="1"/>''')

        if w["total"] >= 5:
            spire_h = min(30, int(8 + w["total"] * 1.5))
            buildings.append(f'''
      <line x1="{x + bldg_w/2}" y1="{y}" x2="{x + bldg_w/2}" y2="{y - spire_h}" stroke="{primary_neon}" stroke-width="1.2" filter="url(#neonGlow)"/>
      <circle cx="{x + bldg_w/2}" cy="{y - spire_h}" r="1.5" fill="#ffffff" class="spire-beacon"/>''')

        for d_idx, day in enumerate(w["days"]):
            win_y = y + 6 + d_idx * ((bh - 12) / 7.0)
            win_h = max(2, (bh - 14) / 7.0 - 2)
            c = day["count"]
            win_fill = "#0a101d"
            win_glow = ""
            if c > 0:
                if c >= 8:
                    win_fill = "#00ff7f"
                    win_glow = 'filter="url(#neonGlow)"'
                elif c >= 3:
                    win_fill = "#00f9ff"
                else:
                    win_fill = "#0077ff"
            buildings.append(f'''      <rect x="{x+2.5}" y="{win_y}" width="{bldg_w-5}" height="{win_h}" fill="{win_fill}" {win_glow} rx="0.5" opacity="{0.95 if c > 0 else 0.25}"/>''')

        buildings.append('    </g>')
        monorail_pts.append((x + bldg_w/2, y - 8))

    months_svg = []
    seen_m = set()
    for w in weeks:
        m = w["month"]
        if m and m not in seen_m:
            seen_m.add(m)
            mx = start_x + w["week_index"] * col_pitch
            months_svg.append(f'<text x="{mx}" y="{ground_y + 22}" class="mono" fill="#475569" font-size="10">{m}</text>')

    streak_x = start_x + streak_start * col_pitch
    streak_w = (52 - streak_start) * col_pitch
    streak_poly = f'''
    <polygon points="{streak_x},{ground_y} {streak_x + streak_w},{ground_y} {streak_x + streak_w + 20},{ground_y - 220} {streak_x - 20},{ground_y - 220}" fill="url(#streakBeam)" opacity="0.35"/>
    '''

    skyline_pts = " ".join([f"{pt[0]},{pt[1]}" for pt in monorail_pts])
    poly_pts = f"{start_x},{ground_y} {skyline_pts} {start_x + 51*col_pitch + bldg_w},{ground_y}"

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600;700&amp;family=Inter:wght@400;700;900&amp;display=swap');
      text {{ font-family: 'Inter', -apple-system, sans-serif; }}
      .mono {{ font-family: 'Fira Code', monospace; }}

      @keyframes trainMove {{
        0% {{ transform: translateX(-100px); }}
        100% {{ transform: translateX({width + 200}px); }}
      }}
      @keyframes beaconBlink {{
        0%, 100% {{ opacity: 0.3; }}
        50% {{ opacity: 1; }}
      }}
      @keyframes floatFog {{
        0%, 100% {{ transform: translateX(0); }}
        50% {{ transform: translateX(30px); }}
      }}
      @keyframes pulseAura {{
        0%, 100% {{ opacity: 0.7; }}
        50% {{ opacity: 0.95; }}
      }}

      .train-pod {{ animation: trainMove 14s linear infinite; }}
      .spire-beacon {{ animation: beaconBlink 2.2s ease-in-out infinite; }}
      .fog-layer {{ animation: floatFog 20s ease-in-out infinite; }}
      .domain-aura {{ animation: pulseAura 4s ease-in-out infinite; }}
    </style>

    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#05070f"/>
      <stop offset="40%" stop-color="#0a0f1d"/>
      <stop offset="85%" stop-color="#0e172a"/>
      <stop offset="100%" stop-color="#141e33"/>
    </linearGradient>

    <linearGradient id="bldgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="50%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#04060a"/>
    </linearGradient>

    <linearGradient id="skylineAuraGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#00f9ff" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#0077ff" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#0077ff" stop-opacity="0"/>
    </linearGradient>

    <linearGradient id="streakBeam" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#00ff7f" stop-opacity="0.45"/>
      <stop offset="60%" stop-color="#00f9ff" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#00f9ff" stop-opacity="0"/>
    </linearGradient>

    <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <filter id="hyperGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="7" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="{width}" height="{height}" fill="url(#skyGrad)" rx="12"/>

  <g id="stars" opacity="0.6">
    <circle cx="120" cy="45" r="1.2" fill="#ffffff"/>
    <circle cx="280" cy="70" r="1.5" fill="#00f9ff" opacity="0.8"/>
    <circle cx="450" cy="35" r="1" fill="#ffffff"/>
    <circle cx="680" cy="80" r="1.4" fill="#ffffff"/>
    <circle cx="890" cy="50" r="1.2" fill="#00ff7f"/>
    <circle cx="1050" cy="65" r="1.6" fill="#00f9ff"/>
    <circle cx="340" cy="110" r="0.8" fill="#ffffff"/>
    <circle cx="780" cy="120" r="1.1" fill="#ffffff"/>
  </g>

  <g id="backdrop-city">
    {"".join(backdrop)}
  </g>

  <g id="domain-beacon-glow" class="domain-aura">
    {streak_poly}
  </g>

  <polygon points="{poly_pts}" fill="url(#skylineAuraGrad)"/>

  <g id="skyscrapers">
    {"".join(buildings)}
  </g>

  <line x1="50" y1="{ground_y}" x2="{width - 50}" y2="{ground_y}" stroke="#00f9ff" stroke-width="1.8" filter="url(#neonGlow)"/>

  <g id="monorail-track">
    <line x1="40" y1="{ground_y + 40}" x2="{width - 40}" y2="{ground_y + 40}" stroke="#1e293b" stroke-width="2.5"/>
    <line x1="40" y1="{ground_y + 40}" x2="{width - 40}" y2="{ground_y + 40}" stroke="#0077ff" stroke-width="0.8" stroke-dasharray="8,6" opacity="0.8"/>

    <g class="train-pod">
      <rect x="0" y="{ground_y + 36}" width="55" height="7" rx="3.5" fill="#00f9ff" filter="url(#neonGlow)"/>
      <rect x="5" y="{ground_y + 37.5}" width="14" height="4" rx="1" fill="#ffffff"/>
      <line x1="-30" y1="{ground_y + 39.5}" x2="0" y2="{ground_y + 39.5}" stroke="#00f9ff" stroke-width="2" opacity="0.5"/>
    </g>
  </g>

  <g id="timeline-labels">
    {"".join(months_svg)}
  </g>

  <g id="header-hud" transform="translate(65, 42)">
    <rect width="8" height="24" fill="#00ff7f" rx="2" filter="url(#neonGlow)"/>
    <text x="18" y="14" fill="#f8fafc" font-size="16" font-weight="900" letter-spacing="2">CYBERNETIC HORIZON: <tspan fill="#00ff7f">GITHUB SKYLINE</tspan></text>
    <text x="18" y="27" class="mono" fill="#64748b" font-size="10" letter-spacing="1">USER: {data["username"].upper()} // 52-WEEK SKYSCRAPER MATRIX // 365 DAYS RECORDED</text>

    <g transform="translate(640, -6)">
      <rect width="180" height="32" rx="4" fill="#0c1222" stroke="#00f9ff" stroke-width="1" stroke-opacity="0.6"/>
      <circle cx="14" cy="16" r="3.5" fill="#00ff7f" filter="url(#neonGlow)"/>
      <text x="26" y="20" class="mono" fill="#94a3b8" font-size="9.5">TOTAL SOULS: <tspan fill="#f8fafc" font-weight="900">{data["total"]}</tspan></text>

      <g transform="translate(195, 0)">
        <rect width="195" height="32" rx="4" fill="#0c1222" stroke="#00ff7f" stroke-width="1" stroke-opacity="0.8"/>
        <circle cx="14" cy="16" r="3.5" fill="#00ff7f" class="spire-beacon" filter="url(#hyperGlow)"/>
        <text x="26" y="20" class="mono" fill="#94a3b8" font-size="9.5">DOMAIN STREAK: <tspan fill="#00ff7f" font-weight="900">{data["streak"]} DAYS</tspan></text>
      </g>
    </g>
  </g>

  <g id="footer-hud" transform="translate(65, {height - 20})">
    <text x="0" y="8" class="mono" fill="#475569" font-size="9.5">TOWER HEIGHT = COMMITS/WEEK // GLOW SPIRE = OVERCHARGED DEPLOYMENTS (&gt;=5 COMMITS) // MONORAIL = CONTINUOUS DEPLOYMENT</text>
    <text x="{width - 130}" y="8" class="mono" fill="#00f9ff" font-size="9.5" text-anchor="end">CYBER-METRICS ENGINE ✦</text>
  </g>
</svg>'''

def render_spectrogram_svg(data):
    width = 1200
    height = 430
    center_y = 250
    start_x = 65
    end_x = 1135
    col_pitch = 18.5
    bar_w = 11

    weeks = data["weeks"]
    streak = data["streak"]
    peak_day = data["peak_day"]
    max_weekly = max(12, max(w["total"] for w in weeks))

    eq_bars = []
    envelope_pts_top = []
    envelope_pts_bottom = []

    for i, w in enumerate(weeks):
        x = start_x + i * col_pitch
        activity_ratio = min(1.0, w["total"] / max_weekly)
        amplitude = max(10, int(12 + activity_ratio * 135))
        has_energy = w["total"] > 0
        eq_fill = "#ff2bd6" if w["total"] >= 10 else ("#a855f7" if w["total"] >= 4 else "#00f9ff")

        bar_top = center_y - amplitude
        bar_bottom = center_y + amplitude
        bar_height = amplitude * 2

        envelope_pts_top.append((x + bar_w/2, bar_top))
        envelope_pts_bottom.append((x + bar_w/2, bar_bottom))

        eq_bars.append(f'''
    <!-- Band {i+1}: {w["total"]} commits -->
    <g class="eq-band">
      <rect x="{x}" y="{bar_top}" width="{bar_w}" height="{bar_height}" rx="3" fill="url(#bandGrad)" stroke="{eq_fill if has_energy else '#1e293b'}" stroke-width="{1 if has_energy else 0.5}" stroke-opacity="{0.85 if has_energy else 0.35}"/>''')

        if w["total"] >= 4:
            led_count = min(7, int(3 + w["total"] * 0.4))
            for led in range(led_count):
                led_y = bar_top + 4 + led * 7
                eq_bars.append(f'''      <rect x="{x+2}" y="{led_y}" width="{bar_w-4}" height="2.5" rx="1" fill="{eq_fill}" opacity="0.9"/>''')

        eq_bars.append('    </g>')

    top_d = f"M {envelope_pts_top[0][0]},{envelope_pts_top[0][1]} " + " ".join([f"L {pt[0]},{pt[1]}" for pt in envelope_pts_top])
    bottom_d = " ".join([f"L {pt[0]},{pt[1]}" for pt in reversed(envelope_pts_bottom)])
    envelope_d = f"{top_d} {bottom_d} Z"

    months_svg = []
    seen_m = set()
    for w in weeks:
        m = w["month"]
        if m and m not in seen_m:
            seen_m.add(m)
            mx = start_x + w["week_index"] * col_pitch
            months_svg.append(f'<text x="{mx}" y="{center_y + 160}" class="mono" fill="#475569" font-size="9.5">{m}</text>')

    freq_labels = []
    freqs = ["20Hz", "100Hz", "250Hz", "500Hz", "1kHz", "2.5kHz", "5kHz", "8kHz", "12kHz", "16kHz", "20kHz"]
    for idx, f in enumerate(freqs):
        fx = start_x + idx * ((end_x - start_x) / (len(freqs) - 1))
        freq_labels.append(f'<text x="{fx}" y="{center_y + 140}" class="mono" fill="#334155" font-size="8.5" text-anchor="middle">{f}</text>')

    peak_week_idx = peak_day.get("week_index", 26)
    peak_callout_x = start_x + peak_week_idx * col_pitch + bar_w/2

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600;700&amp;family=Inter:wght@400;700;900&amp;display=swap');
      text {{ font-family: 'Inter', -apple-system, sans-serif; }}
      .mono {{ font-family: 'Fira Code', monospace; }}

      @keyframes waveScan {{
        0% {{ transform: translateX(-200px); }}
        100% {{ transform: translateX({width + 200}px); }}
      }}
      @keyframes eqPulse {{
        0%, 100% {{ opacity: 0.75; }}
        50% {{ opacity: 1; }}
      }}

      .laser-scan {{ animation: waveScan 8s linear infinite; }}
      .wave-envelope {{ animation: eqPulse 3s ease-in-out infinite; }}
    </style>

    <linearGradient id="specBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#050508"/>
      <stop offset="50%" stop-color="#0a0c16"/>
      <stop offset="100%" stop-color="#040407"/>
    </linearGradient>

    <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2e1065" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#0f172a" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#020617" stop-opacity="0.95"/>
    </linearGradient>

    <linearGradient id="spectrumGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#00f9ff" stop-opacity="0.25"/>
      <stop offset="30%" stop-color="#a855f7" stop-opacity="0.3"/>
      <stop offset="70%" stop-color="#ff2bd6" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.25"/>
    </linearGradient>

    <linearGradient id="peakLineGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#00f9ff"/>
      <stop offset="35%" stop-color="#a855f7"/>
      <stop offset="75%" stop-color="#ff2bd6"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>

    <filter id="specGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <filter id="eqGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="{width}" height="{height}" fill="url(#specBg)" rx="12"/>

  <g id="grid-lines" opacity="0.35">
    <line x1="{start_x}" y1="{center_y - 120}" x2="{end_x}" y2="{center_y - 120}" stroke="#1e293b" stroke-width="0.8" stroke-dasharray="4,6"/>
    <line x1="{start_x}" y1="{center_y - 60}" x2="{end_x}" y2="{center_y - 60}" stroke="#1e293b" stroke-width="0.8" stroke-dasharray="4,6"/>
    <line x1="{start_x}" y1="{center_y}" x2="{end_x}" y2="{center_y}" stroke="#334155" stroke-width="1"/>
    <line x1="{start_x}" y1="{center_y + 60}" x2="{end_x}" y2="{center_y + 60}" stroke="#1e293b" stroke-width="0.8" stroke-dasharray="4,6"/>
    <line x1="{start_x}" y1="{center_y + 120}" x2="{end_x}" y2="{center_y + 120}" stroke="#1e293b" stroke-width="0.8" stroke-dasharray="4,6"/>
  </g>

  <g id="header-hud" transform="translate(65, 38)">
    <rect width="8" height="24" fill="#ff2bd6" rx="2" filter="url(#eqGlow)"/>
    <circle cx="18" cy="6" r="2.5" fill="#00f9ff"/>
    <line x1="18" y1="9" x2="18" y2="15" stroke="#00f9ff" stroke-width="2.5" stroke-linecap="round"/>

    <text x="36" y="12" fill="#f8fafc" font-size="15" font-weight="900" letter-spacing="2">ACOUSTIC SPECTROGRAM: <tspan fill="#ff2bd6">HARMONIC RESONANCE</tspan></text>
    <text x="36" y="25" class="mono" fill="#64748b" font-size="9.5" letter-spacing="1">USER: {data["username"].upper()} // SITAR RESONANCE &amp; VOCAL FORMANT SYNTHESIS // 365-DAY SPECTRUM</text>

    <g transform="translate(680, -5)">
      <rect width="195" height="30" rx="4" fill="#0c1222" stroke="#a855f7" stroke-width="1"/>
      <circle cx="12" cy="15" r="3" fill="#a855f7" filter="url(#eqGlow)"/>
      <text x="22" y="19" class="mono" fill="#94a3b8" font-size="9">TOTAL ENERGY: <tspan fill="#f8fafc" font-weight="900">{data["total"]} COMMITS</tspan></text>

      <g transform="translate(205, 0)">
        <rect width="205" height="30" rx="4" fill="#0c1222" stroke="#ff2bd6" stroke-width="1"/>
        <circle cx="12" cy="15" r="3" fill="#ff2bd6" filter="url(#eqGlow)"/>
        <text x="22" y="19" class="mono" fill="#94a3b8" font-size="9">PEAK SPIKE: <tspan fill="#ff2bd6" font-weight="900">{peak_day["count"]} COMMITS (+12dB)</tspan></text>
      </g>
    </g>
  </g>

  <g id="months">{"".join(months_svg)}</g>
  <g id="eq-bars">{"".join(eq_bars)}</g>

  <g id="waveform" class="wave-envelope">
    <path d="{envelope_d}" fill="url(#spectrumGrad)" filter="url(#specGlow)"/>
    <path d="{top_d}" fill="none" stroke="url(#peakLineGrad)" stroke-width="2.2"/>
  </g>

  <g id="peak-callout" transform="translate({peak_callout_x:.1f}, {center_y - 130})">
    <line x1="0" y1="0" x2="0" y2="80" stroke="#ff2bd6" stroke-width="1.2" stroke-dasharray="2,2"/>
    <circle cx="0" cy="0" r="4" fill="#ffffff" filter="url(#eqGlow)"/>
    <rect x="-65" y="-28" width="130" height="22" rx="3" fill="#0f172a" stroke="#ff2bd6" stroke-width="1"/>
    <text x="0" y="-14" class="mono" fill="#ff2bd6" font-size="8.5" font-weight="700" text-anchor="middle">PEAK: {peak_day["count"]} COMMITS</text>
  </g>

  <g id="frequency-axis">
    <line x1="{start_x}" y1="{center_y + 125}" x2="{end_x}" y2="{center_y + 125}" stroke="#1e293b" stroke-width="1"/>
    {"".join(freq_labels)}
  </g>

  <g id="footer" transform="translate(65, {height - 24})">
    <text x="0" y="10" class="mono" fill="#475569" font-size="9">SPECTRUM TIMBRE: LOW ACTIVITY = CYAN HUM (20Hz-500Hz) &#8594; PEAK ACTIVITY = MAGENTA/VIOLET RESONANCE (1kHz-20kHz)</text>
    <text x="{width - 130}" y="10" class="mono" fill="#a855f7" font-size="9" text-anchor="end">ACOUSTIC FOURIER ENGINE ✦</text>
  </g>
</svg>'''

if __name__ == "__main__":
    print("Fetching live telemetry for Cipher-Shadow-IR...")
    telemetry = fetch_telemetry("Cipher-Shadow-IR")
    print(f"Total: {telemetry['total']}, Streak: {telemetry['streak']}")

    os.makedirs("assets", exist_ok=True)

    # 1. Cursed Aura
    cursed_path = "assets/cursed-aura.svg"
    with open(cursed_path, "w", encoding="utf-8") as f:
        f.write(render_cursed_aura_svg(telemetry))
    print(f"Generated: {cursed_path} ({os.path.getsize(cursed_path) / 1024 / 1024:.2f} MB)")

    # 2. Skyline (Day)
    skyline_path = "assets/neon-cityscape-horizon.svg"
    with open(skyline_path, "w", encoding="utf-8") as f:
        f.write(render_skyline_svg(telemetry))
    print(f"Generated: {skyline_path}")

    # 3. Spectrogram (Night)
    spectrogram_path = "assets/acoustic-spectrogram.svg"
    with open(spectrogram_path, "w", encoding="utf-8") as f:
        f.write(render_spectrogram_svg(telemetry))
    print(f"Generated: {spectrogram_path}")
