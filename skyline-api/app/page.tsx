'use client';

export default function Home() {
  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#f8fafc' }}>
      <header style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(0, 249, 255, 0.1)', border: '1px solid rgba(0, 249, 255, 0.4)', borderRadius: 999, color: '#00f9ff', fontSize: 13, fontFamily: 'monospace', fontWeight: 'bold', marginBottom: 16 }}>
          ⚡ CIPHER SHADOW // DYNAMIC SVG VISUALS ENGINE
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: 2, margin: '8px 0', background: 'linear-gradient(135deg, #ffffff 40%, #00ff7f 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          GITHUB TELEMETRY PROTOCOLS
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 16, maxWidth: 700, margin: '0 auto' }}>
          Serverless Next.js SVG API endpoints translating GitHub contribution graphs into cyberpunk skylines and acoustic spectrograms.
        </p>
      </header>

      {/* Visual 1: Neon Cityscape */}
      <section style={{ background: '#0a0f1d', border: '1px solid #1e293b', borderRadius: 16, padding: 24, marginBottom: 36, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontFamily: 'monospace', fontSize: 13 }}>
          <span style={{ color: '#00ff7f', fontWeight: 'bold' }}>✦ NEON CITYSCAPE HORIZON (/api/skyline)</span>
          <span style={{ color: '#64748b' }}>Endpoint: <code>/api/skyline?username=Cipher-Shadow-IR</code></span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/api/skyline" alt="Neon Cityscape Horizon" style={{ width: '100%', borderRadius: 10, display: 'block' }} />
      </section>

      {/* Visual 2: Acoustic Spectrogram */}
      <section style={{ background: '#0a0f1d', border: '1px solid #1e293b', borderRadius: 16, padding: 24, marginBottom: 36, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontFamily: 'monospace', fontSize: 13 }}>
          <span style={{ color: '#ff2bd6', fontWeight: 'bold' }}>✦ ACOUSTIC SPECTROGRAM (/api/spectrogram)</span>
          <span style={{ color: '#64748b' }}>Endpoint: <code>/api/spectrogram?username=Cipher-Shadow-IR</code></span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/api/spectrogram" alt="Acoustic Spectrogram" style={{ width: '100%', borderRadius: 10, display: 'block' }} />
      </section>

      {/* Visual 3: Cursed Energy / Aura Level */}
      <section style={{ background: '#050508', border: '1px solid #1e293b', borderRadius: 16, padding: 24, marginBottom: 36, boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontFamily: 'monospace', fontSize: 13 }}>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>✦ CURSED AURA (/api/cursedaura)</span>
          <span style={{ color: '#64748b' }}>Endpoint: <code>/api/cursedaura?username=Cipher-Shadow-IR</code></span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/api/cursedaura" alt="Cursed Aura GitHub Graph" style={{ width: '100%', borderRadius: 10, display: 'block' }} />
      </section>

      <footer style={{ textAlign: 'center', color: '#475569', fontSize: 12, fontFamily: 'monospace', marginTop: 40 }}>
        CIPHER SHADOW TELEMETRY // NEXT.JS SERVERLESS RUNTIME // REAL-TIME GITHUB GRAPHQL
      </footer>
    </main>
  );
}
