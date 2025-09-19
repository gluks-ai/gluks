import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { cookies } from 'next/headers';
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
}

export default async function RootLayout({
  children,
}: RootLayoutProps) {
<<<<<<< HEAD
  // ---- Read ref from cookies (set by your API route) ----
  let ref: string | null = null;

  try {
    // Handle both sync and async versions of cookies()
    const cookieStore = cookies();
    const resolvedCookies = cookieStore instanceof Promise ? await cookieStore : cookieStore;
    ref = resolvedCookies.get('ref')?.value ?? null;
  } catch (error) {
    console.warn('Failed to read cookies:', error);
    ref = null;
=======
  // ---- Get ref from query params or cookies ----
  let ref: string | null = Array.isArray(searchParams?.ref)
    ? searchParams.ref[0]
    : searchParams?.ref ?? null;

  // If no ref in query params, try to read from cookies
  if (!ref) {
    const cookieStore = await cookies();
    ref = cookieStore.get('ref')?.value ?? null;
>>>>>>> d1d0e319c66f654c6f817892e45e26ef0c53e1cf
  }

  // Note: Setting cookies in layout is not recommended.
  // You should handle cookie setting in a server action, API route, or middleware.
  // For now, we'll just read the existing ref from cookies if no query param exists.

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
      style={{ height: '100%' }}
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