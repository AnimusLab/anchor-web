'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [visitorCount, setVisitorCount] = useState<string | null>(null);

  useEffect(() => {
    // Simple local counter (which does not make network requests and will never be blocked by ad blockers)
    const stored = localStorage.getItem('animuslab_visits');
    let count = stored ? parseInt(stored, 10) : 0;

    // Check url search params for admin or reset keys
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      document.cookie = 'owner=true; path=/; max-age=31536000'; // 1 year
    }
    if (params.get('reset') === 'true') {
      localStorage.removeItem('animuslab_visits');
      count = 0;
    }

    const isOwner = document.cookie.includes('owner=true') || 
                    window.location.hostname.includes('localhost') ||
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname.includes('local');

    if (!isOwner) {
      count += 1;
      localStorage.setItem('animuslab_visits', count.toString());
    }

    const formatted = String(count).padStart(6, '0');
    setVisitorCount(formatted);
  }, []);

  return (
    <>
      <footer className="w-full border-t border-neutral-900/50 bg-[#050505] px-6 md:px-12 py-10 flex flex-col lg:flex-row items-center justify-between gap-6 text-[11px] text-neutral-600 font-mono">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
          <span>© {currentYear} AnimusLab. All rights reserved.</span>
          <span className="hidden md:inline text-neutral-800">|</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>STATUS: SECURE_WSS_ACTIVE</span>
          </span>
          {visitorCount !== null && (
            <>
              <span className="hidden md:inline text-neutral-800">|</span>
              <span className="text-indigo-400 font-bold">SYS_VISITS: {visitorCount}</span>
            </>
          )}
        </div>

        {/* Website Launches Badge */}
        <div className="flex items-center justify-center opacity-45 hover:opacity-90 transition-all duration-300">
          <a 
            href="https://websitelaunches.com/site/animuslab.dev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block transform hover:scale-[1.02] transition-transform duration-200"
          >
            <img 
              src="https://websitelaunches.com/badge/animuslab.dev.svg" 
              alt="Established online - Public launch record" 
              width="170" 
              height="37" 
              className="h-8 w-auto filter grayscale contrast-150 brightness-75 hover:grayscale-0 hover:contrast-100 hover:brightness-100 transition-all duration-300"
            />
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/anchor/architecture" className="hover:text-indigo-400 text-neutral-400 transition-colors">
            ARCHITECTURE
          </Link>
          <span className="hidden md:inline text-neutral-800">|</span>
          <a
            href="https://github.com/AnimusLab"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-400 transition-colors"
          >
            REPOS // v6.0.2
          </a>
        </div>
      </footer>

      {visitorCount !== null && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#050505]/80 backdrop-blur-md border border-neutral-800/40 px-3 py-1.5 rounded-sm shadow-xl shadow-black/80 text-[10px] text-neutral-500 font-mono select-none hover:border-neutral-700/80 hover:text-neutral-300 transition-all duration-300 group">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400/50 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
          </span>
          <span className="font-bold tracking-wider text-neutral-500 group-hover:text-indigo-400 transition-colors">
            SYS_VISITS: {visitorCount}
          </span>
        </div>
      )}
    </>
  );
}
