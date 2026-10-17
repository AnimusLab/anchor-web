'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AnchorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navLinks = [
    {
      name: "Overview",
      href: "/anchor",
      active: pathname === "/anchor",
    },
    {
      name: "Manifesto",
      href: "/anchor/manifesto",
      active: pathname === "/anchor/manifesto",
    },
    {
      name: "Whitepaper",
      href: "/anchor/whitepaper",
      active: pathname === "/anchor/whitepaper",
    },
    {
      name: "Architecture",
      href: "/anchor/architecture",
      active: pathname === "/anchor/architecture",
    },
    {
      name: "Research",
      href: "/anchor/research",
      active: pathname === "/anchor/research",
    },
    {
      name: "Roadmap",
      href: "/anchor/roadmap",
      active: pathname === "/anchor/roadmap",
    },
    {
      name: "Enterprise System",
      href: "/",
      active: false,
    },
    {
      name: "Telemetry Hub",
      href: "https://hub.animuslab.dev",
      active: false,
    },
    {
      name: "Oversight Portal",
      href: "https://oversight.animuslab.dev",
      active: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e5e5] flex flex-col antialiased">
      {/* Global Header */}
      <Header />

      <section className="px-6 md:px-12 py-16 border-b border-neutral-900 bg-[#070707]/30">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs text-indigo-400 font-mono tracking-widest block uppercase">
              // Flagship_Research_Product
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Anchor Governance Infrastructure by AnimusLab
            </h1>
            <p className="text-sm text-neutral-400 max-w-xl font-light leading-relaxed">
              Deterministic runtime capability resolution, Abstract Syntax Tree validation, and isolation boundaries for autonomous systems.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://pypi.org/project/anchor-audit/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40 px-4 py-2 font-bold transition-colors rounded-sm flex items-center gap-1.5"
            >
              <span>🛡️ PyPI // v6.0.1</span>
            </a>
            <a
              href="https://github.com/AnimusLab/Anchor"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono border border-neutral-800 hover:border-neutral-700 px-4 py-2 hover:text-white transition-colors"
            >
              GitHub // v6.0.1
            </a>
          </div>
        </div>
      </section>

      <nav className="border-b border-neutral-900 bg-[#060606] sticky top-[80px] z-40">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 flex gap-6 md:gap-8 overflow-x-auto no-scrollbar py-4 text-xs font-mono">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`uppercase tracking-wider transition-colors whitespace-nowrap ${
                link.active
                  ? "text-indigo-400 font-bold"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 md:px-12 py-16">
        {children}
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
