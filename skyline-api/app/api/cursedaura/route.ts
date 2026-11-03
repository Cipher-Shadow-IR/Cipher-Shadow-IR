import { NextRequest } from 'next/server';
import { fetchGitHubTelemetry } from '@/lib/github';
import { renderCursedEnergySvg } from '@/lib/cursed-aura-svg';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || process.env.GITHUB_USERNAME || 'Cipher-Shadow-IR';
    const demo = searchParams.get('demo') === '1';
    const force8k = searchParams.get('quality') === '8k' || searchParams.get('full') === '1';

    // 1. Fetch GitHub Data
    const data = await fetchGitHubTelemetry(username, undefined, demo);

    // 2. Locate and load the Katana GIF into Base64
    let base64Gif = '';
    const preferredOrder = force8k
      ? ['flaming-aur-katana-8k.gif', 'flaming-katana-web.gif']
      : ['flaming-katana-web.gif', 'flaming-aur-katana-8k.gif'];

    const searchDirs = [
      path.join(process.cwd(), 'public', 'assets'),
      path.join(process.cwd(), 'assets'),
      path.join(process.cwd(), '..', 'assets'),
      path.join(__dirname, '..', '..', '..', 'public', 'assets'),
      path.join(__dirname, '..', '..', '..', 'assets'),
    ];

    for (const filename of preferredOrder) {
      for (const dir of searchDirs) {
        const fullPath = path.join(dir, filename);
        if (fs.existsSync(fullPath)) {
          try {
            const gifBuffer = fs.readFileSync(fullPath);
            base64Gif = `data:image/gif;base64,${gifBuffer.toString('base64')}`;
            break;
          } catch (e) {
            console.warn(`Could not read Katana GIF at ${fullPath}:`, e);
          }
        }
      }
      if (base64Gif) break;
    }

    // 3. Render dynamic Cursed Aura SVG with Base64 embedded GIF (or vector fallback)
    const svg = renderCursedEnergySvg(data, base64Gif);

    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    const errorSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="120" viewBox="0 0 600 120" style="background:#050508;">
        <rect width="600" height="120" fill="#050508" stroke="#e11d48" stroke-width="1.5" rx="8"/>
        <text x="24" y="50" fill="#e11d48" font-family="monospace" font-size="14" font-weight="bold">ERROR: Failed to render Cursed Aura</text>
        <text x="24" y="80" fill="#64748b" font-family="monospace" font-size="11">${String(err?.message || 'Internal Server Error')}</text>
      </svg>
    `.trim();

    return new Response(errorSvg, {
      status: 500,
      headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
    });
  }
}
