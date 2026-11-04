import fs from 'fs';
import path from 'path';
import { fetchGitHubTelemetry } from '../lib/github';
import { renderSkylineSvg } from '../lib/skyline-svg';
import { renderSpectrogramSvg } from '../lib/spectrogram-svg';
import { renderCursedEnergySvg } from '../lib/cursed-aura-svg';

async function main() {
  const username = 'Cipher-Shadow-IR';
  console.log(`[Asset Generator] Fetching live telemetry for ${username}...`);
  const data = await fetchGitHubTelemetry(username, undefined, false);
  console.log(`[Asset Generator] Telemetry fetched: ${data.totalContributions} total, ${data.streak} streak`);

  const assetsDir = path.resolve(__dirname, '..', '..', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // 1. Generate Skyline SVG (Day) directly from skyline-svg.ts
  const skylineSvg = renderSkylineSvg(data);
  const skylinePath = path.join(assetsDir, 'neon-cityscape-horizon.svg');
  fs.writeFileSync(skylinePath, skylineSvg, 'utf-8');
  console.log(`[Asset Generator] Created ${skylinePath}`);

  // 2. Generate Spectrogram SVG (Night) directly from spectrogram-svg.ts
  const spectrogramSvg = renderSpectrogramSvg(data);
  const spectrogramPath = path.join(assetsDir, 'acoustic-spectrogram.svg');
  fs.writeFileSync(spectrogramPath, spectrogramSvg, 'utf-8');
  console.log(`[Asset Generator] Created ${spectrogramPath}`);

  // 3. Generate Cursed Aura SVG directly from cursed-aura-svg.ts
  const gifPath = path.join(assetsDir, 'flaming-katana-web.gif');
  let base64Gif = '';
  if (fs.existsSync(gifPath)) {
    const buf = fs.readFileSync(gifPath);
    base64Gif = `data:image/gif;base64,${buf.toString('base64')}`;
  }
  const cursedSvg = renderCursedEnergySvg(data, base64Gif);
  const cursedPath = path.join(assetsDir, 'cursed-aura.svg');
  fs.writeFileSync(cursedPath, cursedSvg, 'utf-8');
  console.log(`[Asset Generator] Created ${cursedPath}`);

  console.log('[Asset Generator] All assets generated successfully from TypeScript sources!');
}

main().catch((err) => {
  console.error('[Asset Generator] Error:', err);
  process.exit(1);
});
