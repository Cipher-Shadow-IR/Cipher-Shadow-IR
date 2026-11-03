import type { ReactNode } from 'react';

export const metadata = {
  title: 'Cipher Shadow // Contribution Visuals',
  description: 'Dynamic SVG renderers for GitHub contribution data.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: '32px',
          background: '#0d1117',
          color: '#c9d1d9',
          fontFamily: "'Courier New', Courier, monospace",
        }}
      >
        {children}
      </body>
    </html>
  );
}
