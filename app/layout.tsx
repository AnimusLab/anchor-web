import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import TopNavigationProgress from "@/components/ui/TopNavigationProgress";

export const metadata: Metadata = {
  title: "Anchor Governance Hub — Deterministic AI Governance",
  description: "Official web interface for Anchor. Providing deterministic, cryptographically auditable governance for agentic AI systems.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('anchor-theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                  if (theme !== 'light') {
                    localStorage.setItem('anchor-theme', 'light');
                  }
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen font-sans antialiased bg-[#F8F9FA] dark:bg-[#09090C] text-black dark:text-white">
        <Suspense fallback={null}>
          <TopNavigationProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
