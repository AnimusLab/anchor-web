import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
