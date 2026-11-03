import os
import io
import base64
from PIL import Image

def build_reveal_svg():
    assets_dir = r"c:\Users\anroy\Desktop\CAREER\IR-PROJECTS\GITHUB README\Cipher-Shadow-IR\assets"
    img1_path = os.path.join(assets_dir, "Ishaan-Ray-Hero.png")
    img2_path = os.path.join(assets_dir, "Cipher-Shadow-Hero.png")
    out_svg = os.path.join(assets_dir, "IR-Image-Reveal.svg")

    # Load and normalize both images to identical 600x800 dimensions (3:4 aspect ratio)
    target_w, target_h = 600, 800
    
    im1 = Image.open(img1_path).convert("RGB")
    im2 = Image.open(img2_path).convert("RGB")

    # Resize with high quality Lanczos filter
    im1_fit = im1.resize((target_w, target_h), Image.Resampling.LANCZOS)
    im2_fit = im2.resize((target_w, target_h), Image.Resampling.LANCZOS)

    # Convert to Base64 JPEG data URIs
    b1 = io.BytesIO()
    im1_fit.save(b1, format="JPEG", quality=88)
    b64_1 = base64.b64encode(b1.getvalue()).decode("ascii")
    uri_1 = f"data:image/jpeg;base64,{b64_1}"

    b2 = io.BytesIO()
    im2_fit.save(b2, format="JPEG", quality=88)
    b64_2 = base64.b64encode(b2.getvalue()).decode("ascii")
    uri_2 = f"data:image/jpeg;base64,{b64_2}"

    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {target_w} {target_h}" width="{target_w}" height="{target_h}" style="background:#07090e; font-family:'Segoe UI', system-ui, -apple-system, sans-serif; cursor:pointer; user-select:none;">
  <defs>
    <!-- Cyan & Magenta Cyber Gradients -->
    <linearGradient id="cyberBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f9ff"/>
      <stop offset="50%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>

    <linearGradient id="scanBeam" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00f9ff" stop-opacity="0"/>
      <stop offset="50%" stop-color="#00f9ff" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#00f9ff" stop-opacity="0"/>
    </linearGradient>

    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <clipPath id="cardClip">
      <rect x="0" y="0" width="{target_w}" height="{target_h}" rx="24"/>
    </clipPath>
  </defs>

  <style>
  <![CDATA[
    /* Smooth Transition and Reveal Logic */
    .hero-container {{
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }}
    .reveal-overlay {{
      opacity: 0;
      transform: scale(1.02);
      transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    }}
    .scan-line {{
      opacity: 0;
      transform: translateY(-800px);
      transition: transform 0.8s ease-out, opacity 0.3s ease;
      pointer-events: none;
    }}
    .badge-default {{
      opacity: 1;
      transition: opacity 0.4s ease;
    }}
    .badge-reveal {{
      opacity: 0;
      transition: opacity 0.4s ease;
    }}
    .card-border {{
      transition: stroke-width 0.4s ease, filter 0.4s ease;
    }}

    /* Active on Hover OR Click / Touch (:hover and :active) */
    svg:hover .reveal-overlay,
    svg:active .reveal-overlay,
    svg:focus .reveal-overlay {{
      opacity: 1;
      transform: scale(1);
    }}
    svg:hover .scan-line,
    svg:active .scan-line {{
      opacity: 0.9;
      transform: translateY(800px);
    }}
    svg:hover .badge-default,
    svg:active .badge-default {{
      opacity: 0;
    }}
    svg:hover .badge-reveal,
    svg:active .badge-reveal {{
      opacity: 1;
    }}
    svg:hover .card-border,
    svg:active .card-border {{
      stroke-width: 3.5;
      filter: url(#neonGlow);
    }}
    .mono {{
      font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Courier New', monospace;
    }}
  ]]>
  </style>

  <!-- Card Clipped Body -->
  <g clip-path="url(#cardClip)">
    <!-- Base Background -->
    <rect width="{target_w}" height="{target_h}" fill="#0d1117"/>

    <!-- 1. BASE IMAGE: Ishaan Ray (Normal Portrait) -->
    <image class="hero-container" href="{uri_1}" x="0" y="0" width="{target_w}" height="{target_h}" preserveAspectRatio="xMidYMid slice"/>

    <!-- 2. REVEAL IMAGE: Cipher Shadow (Matrix Alter-Ego) -->
    <image class="reveal-overlay" href="{uri_2}" x="0" y="0" width="{target_w}" height="{target_h}" preserveAspectRatio="xMidYMid slice"/>

    <!-- 3. Dynamic Laser Scan Sweep Line -->
    <rect class="scan-line" x="0" y="0" width="{target_w}" height="40" fill="url(#scanBeam)"/>

    <!-- Dark Gradient Vignettes for Header/Footer Legibility -->
    <rect x="0" y="0" width="{target_w}" height="100" fill="black" opacity="0.45"/>
    <rect x="0" y="{target_h - 100}" width="{target_w}" height="100" fill="black" opacity="0.55"/>

    <!-- Header Status HUD -->
    <g transform="translate(24, 28)">
      <!-- Default Header -->
      <g class="badge-default">
        <rect width="250" height="30" rx="15" fill="#090d16" stroke="#00f9ff" stroke-width="1.2" opacity="0.9"/>
        <circle cx="16" cy="15" r="4" fill="#00f9ff"/>
        <text x="28" y="19" class="mono" fill="#00f9ff" font-size="10.5" font-weight="700" letter-spacing="1">ISHAAN RAY // REALITY</text>
      </g>
      <!-- Revealed Header -->
      <g class="badge-reveal">
        <rect width="280" height="30" rx="15" fill="#13091e" stroke="#c084fc" stroke-width="1.5" filter="url(#neonGlow)"/>
        <circle cx="16" cy="15" r="4" fill="#c084fc"/>
        <text x="28" y="19" class="mono" fill="#c084fc" font-size="10.5" font-weight="900" letter-spacing="1">CIPHER SHADOW // UNLOCKED</text>
      </g>
    </g>

    <!-- Interactive Bottom Prompt Pill -->
    <g transform="translate({target_w / 2}, {target_h - 40})">
      <!-- Default Prompt -->
      <g class="badge-default">
        <rect x="-180" y="-16" width="360" height="32" rx="16" fill="#090d16" stroke="#334155" stroke-width="1.2" opacity="0.9"/>
        <text x="0" y="4" class="mono" fill="#94a3b8" font-size="10.5" font-weight="700" text-anchor="middle" letter-spacing="1">👁️ HOVER / CLICK TO REVEAL CIPHER SHADOW</text>
      </g>
      <!-- Revealed Prompt -->
      <g class="badge-reveal">
        <rect x="-190" y="-16" width="380" height="32" rx="16" fill="#0c1222" stroke="#00f9ff" stroke-width="1.5" filter="url(#neonGlow)"/>
        <text x="0" y="4" class="mono" fill="#00f9ff" font-size="10.5" font-weight="900" text-anchor="middle" letter-spacing="1">⚡ DIMENSION UNLOCKED: BREAKING THE MATRIX</text>
      </g>
    </g>
  </g>

  <!-- Cyberpunk Outer Border & L-Corner Brackets -->
  <rect class="card-border" x="1.5" y="1.5" width="{target_w - 3}" height="{target_h - 3}" rx="23" fill="none" stroke="url(#cyberBorder)" stroke-width="2"/>
  
  <!-- High-Tech Corner Notches -->
  <path d="M 6 36 L 6 16 L 26 16" fill="none" stroke="#00f9ff" stroke-width="3"/>
  <circle cx="6" cy="6" r="2.5" fill="#00f9ff"/>
  <path d="M {target_w - 6} 36 L {target_w - 6} 16 L {target_w - 26} 16" fill="none" stroke="#00f9ff" stroke-width="3"/>
  <circle cx="{target_w - 6}" cy="6" r="2.5" fill="#00f9ff"/>
  <path d="M 6 {target_h - 36} L 6 {target_h - 16} L 26 {target_h - 16}" fill="none" stroke="#c084fc" stroke-width="3"/>
  <path d="M {target_w - 6} {target_h - 36} L {target_w - 6} {target_h - 16} L {target_w - 26} {target_h - 16}" fill="none" stroke="#c084fc" stroke-width="3"/>
</svg>'''

    with open(out_svg, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Generated self-contained reveal SVG at: {out_svg} (Size: {len(svg_content)} bytes)")

if __name__ == "__main__":
    build_reveal_svg()
