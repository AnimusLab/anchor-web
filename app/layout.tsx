import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anchor Governance Hub — Deterministic AI Governance",
  description: "Official web interface for Anchor. Providing deterministic, cryptographically auditable governance for agentic AI systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
