'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const links = [
    {
      name: 'Research',
      href: '/anchor/research',
      active:
        pathname.startsWith('/anchor/research'),
    },

    {
      name: 'Manifesto',
      href: '/anchor/manifesto',
      active: pathname.startsWith('/anchor/manifesto'),
    },

    {
      name: 'Architecture',
      href: '/anchor/architecture',
      active: pathname.startsWith('/anchor/architecture'),
    },

    {
      name: 'Anchor',
      href: '/anchor',
      active: pathname.startsWith('/anchor'),
    },

    {
      name: 'Whitepaper',
      href: '/anchor/whitepaper',
      active: pathname.startsWith('/anchor/whitepaper'),
    },

    {
      name: 'Roadmap',
      href: '/anchor/roadmap',
      active: pathname.startsWith('/anchor/roadmap'),
    },

    {
      name: 'Business Landing',
      href: '/',
      active: pathname === '/',
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#04050a]/80 backdrop-blur-2xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      <div className="max-w-[1600px] mx-auto px-8 lg:px-16">
        <div className="h-20 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-white font-bold tracking-[0.2em] uppercase text-sm flex items-center gap-2 group"
            >
              <span className="h-2 w-2 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform" />
              <span>AnimusLab</span>
            </Link>

            <div className="hidden xl:block h-4 w-px bg-neutral-800" />

            <span className="hidden xl:block text-[11px] tracking-[0.2em] uppercase text-neutral-400 font-mono">
              Research Institute
            </span>
          </div>

          {/* RIGHT */}
          <nav className="flex items-center gap-8 font-mono text-xs">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative tracking-wider transition-all ${
                  link.active
                    ? 'text-indigo-400 font-bold text-glow-indigo'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {link.name}

                {link.active && (
                  <span className="absolute left-0 -bottom-7 h-0.5 w-full bg-indigo-500 shadow-[0_0_12px_#6366f1]" />
                )}
              </Link>
            ))}

            <div className="h-5 w-px bg-neutral-800" />

            <a
              href="https://github.com/AnimusLab"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm tracking-wide text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              GitHub
            </a>

            <div className="hidden md:block h-5 w-px bg-neutral-800" />

            <a
              href="mailto:tan@animuslab.dev?subject=AnimusLab%20-%20Request%20Technical%20Deep-Dive"
              className="hidden md:inline-flex items-center justify-center bg-white text-black hover:bg-neutral-200 px-4 py-2 text-xs font-bold transition-all rounded-sm shadow-md"
            >
              Request Deep-Dive
            </a>

          </nav>

        </div>

      </div>

    </header>
  );
}