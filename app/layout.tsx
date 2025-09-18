import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { cookies } from 'next/headers'; // server-side access
import React from 'react';

// ---- NEW: Client Context for ref ----
import { RefProvider } from './RefProvider';

export const metadata: Metadata = {
  metadataBase: new URL('https://gluks.pt'),
  title: 'Gluks',
  description: 'Gluks Chatbot Assistant.',
};

export const viewport = {
  maximumScale: 1,
};

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
});

const LIGHT_THEME_COLOR = 'hsl(0 0% 100%)';
const DARK_THEME_COLOR = 'hsl(240deg 10% 3.92%)';
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

interface RootLayoutProps {
  children: React.ReactNode;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function RootLayout({
  children,
  searchParams,
}: RootLayoutProps) {
  const cookieStore = cookies();

  // ---- NEW: Get ref from query params or cookies ----
  let ref: string | null = Array.isArray(searchParams?.ref)
    ? searchParams.ref[0]
    : searchParams?.ref ?? null;

  if (ref) {
    // Persist the ref in a cookie for next visits
    (await
      // Persist the ref in a cookie for next visits
      cookieStore).set('ref', ref, { path: '/' });
  } else {
    // Read ref from cookie if no query param
    ref = (await cookieStore).get('ref')?.value ?? null;
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
      style={{ height: '100%' }} // full height
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" />
          <SessionProvider>
            {/* ---- Provide ref via React Context ---- */}
            <RefProvider refValue={ref}>
              {children}
            </RefProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
