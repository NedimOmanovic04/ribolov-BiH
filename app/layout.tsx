import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ribolov BiH - Portal i Prognoza Ribolovnih Uslova za Vode BiH',
  description: 'Autentični portal za ribolovce u Bosni i Hercegovini. Spaja vremenske uslove, solunarni proračun po vrstama riba, te vodič kroz rijeke i jezera BiH.',
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
        <link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#0b120f] text-[#f4f3ef] min-h-screen flex flex-col font-sans antialiased selection:bg-[#27523e] selection:text-white">
        {children}
      </body>
    </html>
  );
}
