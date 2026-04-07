import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zerx - Military Strategy Game',
  description: 'A multiplayer military-economic strategy game with real-time combat',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75" fill="%234ade80">Z</text></svg>',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
  themeColor: '#0a1428',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-military-dark text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
