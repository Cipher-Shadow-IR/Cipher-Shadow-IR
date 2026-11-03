import { NextRequest } from 'next/server';
import { fetchGitHubTelemetry } from '@/lib/github';
import { renderSkylineSvg } from '@/lib/skyline-svg';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || process.env.GITHUB_USERNAME || 'Cipher-Shadow-IR';
    const demo = searchParams.get('demo') === '1';

    const data = await fetchGitHubTelemetry(username, undefined, demo);
    const svg = renderSkylineSvg(data);

    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    const errorSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="120" viewBox="0 0 600 120" style="background:#090d16;">
        <rect width="600" height="120" fill="#090d16" stroke="#ef4444" stroke-width="1.5" rx="8"/>
        <text x="24" y="50" fill="#ef4444" font-family="monospace" font-size="14" font-weight="bold">ERROR: Failed to render Neon Skyline</text>
        <text x="24" y="80" fill="#94a3b8" font-family="monospace" font-size="11">${String(err?.message || 'Internal Server Error')}</text>
      </svg>
    `.trim();

    return new Response(errorSvg, {
      status: 500,
      headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
    });
  }
}
