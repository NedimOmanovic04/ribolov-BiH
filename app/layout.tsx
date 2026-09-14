import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ribolov BiH - Prognoza Ribolovnih Uslova & Vode',
  description: 'Najbolja aplikacija za ribolov u Bosni i Hercegovini. Spaja Open-Meteo vremensku prognozu, solunarni proračun, bazu rijeka i jezera te vrstama prilagođenu ocjenu ribolovnih uslova.',
  keywords: ['ribolov bih', 'pecanje bih', 'jablanicko jezero', 'una', 'drina', 'pliva', 'ribolovna prognoza', 'saran', 'mladica', 'stuka'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bs">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-river-950 text-emerald-50 min-h-screen flex flex-col font-sans antialiased selection:bg-emerald-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
