'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';

// Initialize once at module level
let initialized = false;
let idSeq = 0;

function ensureInit() {
  if (initialized) return;
  initialized = true;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: 13,
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis',
    },
    sequence: {
      useMaxWidth: true,
      boxMargin: 4,
      messageMargin: 35,
      mirrorActors: false,
    },
    er: {
      useMaxWidth: true,
    },
    securityLevel: 'loose',
  });
}

export default function MermaidDiagram({
  chart,
  label,
  color = 'text-green-500',
}: {
  chart: string;
  label?: string;
  color?: string;
}) {
  const [svg, setSvg] = useState('');
  const [err, setErr] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const uid = useRef(`mmd-${++idSeq}`);

  // Render diagram
  useEffect(() => {
    ensureInit();
    let alive = true;
    const renderId = `${uid.current}-${Date.now()}`;

    mermaid
      .render(renderId, chart.trim())
      .then(({ svg: s }) => {
        if (alive) setSvg(s);
      })
      .catch((e) => {
        if (alive) {
          console.error('Mermaid error:', e);
          setErr(String(e));
        }
      });

    return () => {
      alive = false;
    };
  }, [chart]);

  // Escape key closes modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Viewport ref for non-passive wheel listener ─────────────────────
  const viewportRef = useRef<HTMLDivElement>(null);

  // Attach wheel listener as non-passive so preventDefault() actually works.
  // Only zoom when Ctrl (Windows/Linux) or Meta (Mac) is held — otherwise
  // let the browser scroll the page normally.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return; // no modifier → scroll page
      e.preventDefault();
      setScale((s) => Math.max(0.15, Math.min(5, s - e.deltaY * 0.0015)));
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  };

  const onMouseUp = () => {
    dragging.current = false;
  };

  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  // ── Loading state ─────────────────────────────────────────────────
  if (!svg && !err) {
    return (
      <div className="flex items-center gap-2 py-8 text-gray-600 text-xs">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        Rendering diagram...
      </div>
    );
  }

  // ── Error fallback: show raw code ─────────────────────────────────
  if (err) {
    return (
      <pre className="text-gray-500 text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
        {chart}
      </pre>
    );
  }

  return (
    <>
      {/* ── Inline diagram ──────────────────────────────────────── */}
      <div className="relative group">
        {/* Hover controls */}
        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={resetView}
            title="Reset zoom & pan"
            className="bg-[#181818]/95 border border-gray-700 text-gray-400 hover:text-white text-xs px-2 py-0.5 rounded font-mono backdrop-blur-sm transition-colors"
          >
            ⟲ reset
          </button>
          <button
            onClick={() => setExpanded(true)}
            title="Expand fullscreen"
            className="bg-[#181818]/95 border border-gray-700 text-gray-400 hover:text-white text-xs px-2 py-0.5 rounded font-mono backdrop-blur-sm transition-colors"
          >
            ⤢ expand
          </button>
        </div>

        {/* Hint bar */}
        <p className="text-gray-700 text-xs mb-1.5 select-none font-mono">
          Ctrl+scroll to zoom · drag to pan · hover for controls
        </p>

        {/* Viewport */}
        <div
          ref={viewportRef}
          className="overflow-hidden rounded border border-gray-800/50 min-h-[80px] bg-[#0c0c0c]"
          style={{ cursor: dragging.current ? 'grabbing' : 'grab' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: 'top center',
              willChange: 'transform',
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
            className="[&>svg]:max-w-full [&>svg]:h-auto [&>svg]:mx-auto [&>svg]:block [&>svg]:py-4"
          />
        </div>
      </div>

      {/* ── Fullscreen modal ─────────────────────────────────────── */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-start justify-center p-4 overflow-auto"
          onClick={() => setExpanded(false)}
        >
          <div
            className="bg-[#0d1117] border border-gray-700 rounded-xl w-full max-w-7xl mt-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex justify-between items-center px-6 py-3 border-b border-gray-800">
              <span className="text-gray-400 text-sm font-mono tracking-widest">
                // {label ?? 'DIAGRAM'}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 text-xs font-mono">ESC to close</span>
                <button
                  onClick={() => setExpanded(false)}
                  className="text-gray-500 hover:text-white text-sm font-mono transition-colors"
                >
                  [ ✕ ]
                </button>
              </div>
            </div>

            {/* Modal content — full SVG no transforms */}
            <div
              className="p-6 overflow-auto [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:mx-auto [&>svg]:block"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </div>
      )}
    </>
  );
}
