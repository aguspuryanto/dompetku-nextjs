import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { Providers } from './providers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyFinance - Pelacak Keuangan Pribadi",
  description: "Aplikasi pelacak keuangan pribadi yang sederhana dan indah. Lacak pemasukan dan pengeluaran Anda dengan mudah.",
  keywords: ["keuangan", "pelacak", "uang", "anggaran", "pemasukan", "pengeluaran", "Next.js", "TypeScript", "Tailwind CSS"],
  authors: [{ name: "MyFinance Team" }],
  openGraph: {
    title: "MyFinance - Pelacak Keuangan Pribadi",
    description: "Aplikasi pelacak keuangan pribadi yang sederhana dan indah",
    url: "https://myfinance.app",
    siteName: "MyFinance",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyFinance - Pelacak Keuangan Pribadi",
    description: "Aplikasi pelacak keuangan pribadi yang sederhana dan indah",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MyFinance",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MyFinance" />
        <meta name="application-name" content="MyFinance" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground mobile-viewport mobile-no-bounce`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
