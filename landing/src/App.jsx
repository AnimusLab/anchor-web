import { useState, useEffect, useRef, useCallback } from "react";

/* ── TOKENS ─────────────────────────────────────────────────
   Color schema: Deep obsidian + crisp white + judicial gold
   Fonts: Playfair Display (headings) + DM Mono (data/UI)
────────────────────────────────────────────────────────────── */
const C = {
  bg: "#08080D",
  bg1: "#0D0D14",
  bg2: "#121219",
  bg3: "#181820",
  border: "#1E1E2A",
  borderB: "#2A2A3A",
  gold: "#C9A84C",
  goldB: "#E8C97A",
  goldD: "rgba(201,168,76,.09)",
  goldG: "rgba(201,168,76,.18)",
  cyan: "#00D4B8",
  cyanD: "rgba(0,212,184,.08)",
  green: "#2ECC8A",
  greenD: "rgba(46,204,138,.08)",
  red: "#E05A5A",
  redD: "rgba(224,90,90,.09)",
  amber: "#E8A030",
  ambD: "rgba(232,160,48,.09)",
  txt: "#F5F0E8",    /* crisp warm white — maximum readability */
  txtS: "#C8C0AE",   /* light secondary — clearly visible */
  txtD: "#6A6660",   /* mid dim */
  mono: "'DM Mono','IBM Plex Mono','JetBrains Mono',monospace",
  serif: "'Playfair Display','Georgia',serif",
  chart1: "#2ECC8A", /* green */
  chart2: "#E8A030", /* amber */
  chart3: "#E05A5A", /* red */
  chart4: "#00D4B8", /* cyan */
};

/* ── GLOBAL STYLES INJECTED ONCE ───────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,900;1,400;1,700&family=DM+Mono:wght@300;400;500&family=Inter:wght@400;500;600;700&display=swap');

  @keyframes fadeUp    { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes slideLeft { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }
  @keyframes scanDown  { 0%{top:0%;opacity:0} 4%{opacity:.9} 88%{opacity:.5} 95%{top:100%;opacity:0} 100%{top:100%;opacity:0} }
  @keyframes tickerMove{ from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes pulse     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.85)} }
  @keyframes float     { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(1deg)} }
  @keyframes spin3d    { 
    0%  { transform:perspective(1200px) rotateY(0deg) rotateX(8deg); }
    50% { transform:perspective(1200px) rotateY(180deg) rotateX(-8deg); }
    100%{ transform:perspective(1200px) rotateY(360deg) rotateX(8deg); }
  }
  @keyframes spin3dFast { 
    0%  { transform:perspective(900px) rotateY(0deg) rotateX(12deg); }
    50% { transform:perspective(900px) rotateY(180deg) rotateX(-12deg); }
    100%{ transform:perspective(900px) rotateY(360deg) rotateX(12deg); }
  }
  @keyframes stampIn   {
    0%  { opacity:0; transform:perspective(800px) scale(4) translateY(-80px) rotateX(50deg); filter:blur(20px); }
    50% { opacity:1; transform:perspective(800px) scale(.94) translateY(4px) rotateX(-4deg); filter:blur(0); }
    68% { transform:perspective(800px) scale(1.06) rotateX(2deg); }
    82% { transform:perspective(800px) scale(.98); }
    100%{ transform:perspective(800px) scale(1) rotateX(0); }
  }
  @keyframes terminalScroll { from{transform:translateY(0)} to{transform:translateY(-100%)} }
  @keyframes logoAssemble  { 
    0%   { opacity:0; transform:scale(3) rotateX(45deg); filter:blur(20px) brightness(2); }
    100% { opacity:1; transform:scale(1) rotateX(0); filter:blur(0) brightness(1); }
  }
  @keyframes glitch {
    0%   { clip-path:inset(40% 0 61% 0); transform:translate(-2px,2px); }
    20%  { clip-path:inset(92% 0 1% 0); transform:translate(1px,-3px); }
    40%  { clip-path:inset(43% 0 1% 0); transform:translate(-1px,3px); }
    60%  { clip-path:inset(25% 0 58% 0); transform:translate(3px,1px); }
    80%  { clip-path:inset(54% 0 7% 0); transform:translate(-2px,-2px); }
    100% { clip-path:inset(58% 0 43% 0); transform:translate(2px,1px); }
  }
  @keyframes overlayOut { from{opacity:1} to{opacity:0;pointer-events:none} }
  @keyframes barGrow    { from{transform:scaleX(0)} to{transform:scaleX(1)} }
  @keyframes drawLine   { from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0% 0 0)} }
  @keyframes countUp    {}
  @keyframes shimmer    { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  @keyframes glowPulse  {
    0%,100%{ box-shadow:0 0 20px rgba(201,168,76,.2),0 0 40px rgba(201,168,76,.08); }
    50%    { box-shadow:0 0 60px rgba(201,168,76,.5),0 0 120px rgba(201,168,76,.2); }
  }
  @keyframes ringExpand {
    0%   { transform:scale(.5); opacity:.9; }
    100% { transform:scale(2.8); opacity:0; }
  }
  @keyframes particleDrift {
    0%   { transform:translateY(0) translateX(0) scale(1); opacity:.7; }
    100% { transform:translateY(-120px) translateX(var(--dx,20px)) scale(0); opacity:0; }
  }
  @keyframes beamSweep {
    0%   { opacity:0; transform:rotate(-30deg) scaleX(0); }
    30%  { opacity:.6; }
    100% { opacity:0; transform:rotate(30deg) scaleX(1.5); }
  }
  @keyframes textReveal {
    0%   { opacity:0; letter-spacing:.6em; transform:translateY(12px); }
    100% { opacity:1; letter-spacing:.2em; transform:none; }
  }
  @keyframes borderDraw {
    0%   { clip-path:inset(0 100% 100% 0); }
    25%  { clip-path:inset(0 0 100% 0); }
    50%  { clip-path:inset(0 0 0 0); }
    100% { clip-path:inset(0 0 0 0); }
  }
  @keyframes ambientFloat {
    0%,100% { transform:translateY(0) translateX(0); }
    33%     { transform:translateY(-18px) translateX(10px); }
    66%     { transform:translateY(-8px) translateX(-12px); }
  }

  * { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  body { background:#08080D; overflow-x:hidden; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-track { background:#08080D; }
  ::-webkit-scrollbar-thumb { background:rgba(201,168,76,.3); border-radius:2px; }

  .scan-line {
    position:absolute; left:0; right:0; top:0; height:1px; pointer-events:none;
    background:linear-gradient(90deg,transparent,${C.gold},rgba(201,168,76,.8),${C.gold},transparent);
    animation:scanDown 8s linear infinite; z-index:2; opacity:0;
  }
  .hover-lift { transition:transform .25s ease, box-shadow .25s ease; }
  .hover-lift:hover { transform:translateY(-3px); box-shadow:0 12px 40px rgba(201,168,76,.1); }

  @media (max-width: 768px) {
    .nav-links { display: none !important; }
    .nav-cta   { display: none !important; }
    .nav-clock { display: none !important; }
    .nav-inner { padding: 0 20px !important; }
    .hero-grid { grid-template-columns: 1fr !important; }
    .hero-divider { display: none !important; }
    .hero-left  { padding: 56px 0 32px !important; }
    .hero-right { padding: 0 0 56px !important; }
    .problem-grid { grid-template-columns: 1fr !important; }
    .engine-grid  { grid-template-columns: 1fr !important; }
    .coverage-grid{ grid-template-columns: 1fr !important; }
    .stats-grid   { grid-template-columns: 1fr 1fr !important; }
    .audit-label  { display: none !important; }
    .section-pad  { padding: 60px 20px !important; }
    .databar      { display: none !important; }
    .contact-btn  { padding: 18px 32px !important; font-size: 14px !important; }
    .footer-inner { flex-direction: column !important; gap: 24px !important; }
    .footer-links { flex-wrap: wrap !important; gap: 16px !important; }
  }
`;

function GlobalStyles() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  return null;
}

/* ── MOBILE HOOK ─────────────────────────────────────────── */
function useIsMobile(bp = 768) {
  const [m, setM] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const fn = () => setM(window.innerWidth < bp);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return m;
}

/* ── REVEAL HOOK ─────────────────────────────────────────── */
function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, v];
}

function Reveal({ children, delay = 0, dir = "up" }) {
  const [ref, v] = useReveal();
  const anim = { up: "fadeUp", left: "slideLeft", in: "fadeIn" }[dir] || "fadeUp";
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      animation: v ? `${anim} .65s ease ${delay}ms both` : "none",
    }}>
      {children}
    </div>
  );
}

/* ── DIGITAL MARK — Bloomberg Style Logo ──────────────────── */
function DigitalMark({ size = 48, animate = "", glow = true }) {
  const s2 = size / 2;
  return (
    <div style={{
      width: size, height: size, position: "relative", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: animate,
    }}>
      {/* Outer structural frame */}
      <div style={{
        position: "absolute", inset: 0, border: `1.5px solid ${C.gold}`,
        opacity: .4, borderRadius: size * 0.1,
      }} />
      <div style={{
        position: "absolute", inset: size * 0.15, border: `1px solid ${C.gold}`,
        opacity: .2, borderRadius: size * 0.05,
      }} />
      
      {/* Central 'A' structure */}
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <path d="M12 4L4 20H7L12 8L17 20H20L12 4Z" fill={C.gold} />
        <rect x="9" y="14" width="6" height="1.5" fill={C.gold} />
      </svg>

      {/* Data corner pips */}
      {[ [0,0], [1,0], [0,1], [1,1] ].map(([x,y], i) => (
        <div key={i} style={{
          position: "absolute", width: size * 0.08, height: size * 0.08,
          background: C.gold, top: y ? "auto" : 0, bottom: y ? 0 : "auto",
          left: x ? "auto" : 0, right: x ? 0 : "auto",
          opacity: .6,
        }} />
      ))}
      
      {glow && (
        <div style={{
          position: "absolute", inset: -4, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(201,168,76,.15) 0%, transparent 70%)`,
          filter: "blur(8px)", zIndex: -1,
        }} />
      )}
    </div>
  );
}

/* ── DATA VISUALIZATIONS ──────────────────────────────────── */
function FinancialChart({ data, width = 60, height = 30, color = C.gold, fill = true }) {
  const max = Math.max(...data) || 1;
  const min = Math.min(...data) || 0;
  const range = max - min || 1;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * (height - 4) - 2
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${path} L${width},${height} L0,${height} Z`;

  return (
    <div style={{ position: "relative", width, height }}>
      <svg width={width} height={height} style={{ display: "block", overflow: "visible" }}>
        {/* Grid lines */}
        {[0, 0.5, 1].map(v => <line key={v} x1={0} y1={v * height} x2={width} y2={v * height} stroke={C.border} strokeWidth=".5" strokeDasharray="1 2" />)}
        {[0, 0.5, 1].map(v => <line key={v} x1={v * width} y1={0} x2={v * width} y2={height} stroke={C.border} strokeWidth=".5" strokeDasharray="1 2" />)}
        
        {fill && <path d={areaPath} fill={`${color}22`} />}
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2" fill={color} />
      </svg>
      <div style={{ position: "absolute", right: -3, top: points[points.length-1].y - 3, width: 6, height: 6, borderRadius: "50%", background: color, animation: "pulse 1.5s infinite", opacity: .5 }} />
    </div>
  );
}

function Sparkline({ data = [20, 45, 30, 80, 50, 90, 60], width = 80, height = 24, color = C.chart1 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((d, i) => `${(i / (data.length - 1)) * width},${height - ((d - min) / range) * height}`).join(" ");

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={height - ((data[data.length-1] - min) / range) * height} r="2" fill={color} />
    </svg>
  );
}

function MiniBarChart({ data = [4, 7, 2, 9, 5], width = 60, height = 20, color = C.gold }) {
  const max = Math.max(...data);
  const bw = width / data.length;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, width, height }}>
      {data.map((d, i) => (
        <div key={i} style={{
          width: bw - 2, height: `${(d / max) * 100}%`,
          background: color, opacity: 0.3 + (i / data.length) * 0.7,
          transition: "height 0.4s ease",
        }} />
      ))}
    </div>
  );
}


/* ── ANIMATED COUNTER ────────────────────────────────────── */
function Counter({ target, suffix = "" }) {
  const [n, setN] = useState(0);
  const [ref, v] = useReveal(0.5);
  const done = useRef(false);
  useEffect(() => {
    if (!v || done.current || !target) return;
    done.current = true;
    const steps = 60, dur = 1600;
    let c = 0;
    const t = setInterval(() => {
      c += target / steps;
      if (c >= target) { setN(target); clearInterval(t); }
      else setN(Math.floor(c));
    }, dur / steps);
  }, [v, target]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/* ── COPY BUTTON ─────────────────────────────────────────── */
function CopyBtn({ text }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); }}
      style={{ background: ok ? C.green : C.gold, border: "none", color: "#08080D", fontFamily: C.mono, fontSize: "10px", letterSpacing: ".08em", fontWeight: 700, padding: "0 16px", cursor: "pointer", transition: "background .2s", whiteSpace: "nowrap", minWidth: "56px" }}>
      {ok ? "✓" : "copy"}
    </button>
  );
}

/* ── WELCOME ANIMATION (Terminal Boot) ────────────────────── */
function WelcomeScreen({ onDone }) {
  // phases: boot → matrix → ready → done
  const [phase, setPhase] = useState("boot");
  const logs = [
    "INITIALIZING ANCHOR KERNEL v5.0.0...",
    "LOADING SEC REGULATORY MODULES [OK]",
    "LOADING EU AI ACT PROTOCOLS [OK]",
    "ESTABLISHING CRYPTOGRAPHIC TRUST CHAIN...",
    "BOOTING LLM ENFORCEMENT LAYER...",
    "SYNCING STATUTES: 170 MAPPED RULES LOADED",
    "VERIFYING WASM SANDBOX INTEGRITY...",
    "CONNECTING TO GLOBAL SOVEREIGN MESH...",
    "ESTABLISHING HUB-SPOKE RELAY [OK]",
    "SYSTEM STATUS: COMPLIANT",
    "ANCHOR READY."
  ];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("matrix"), 2000);
    const t2 = setTimeout(() => setPhase("ready"),  4000);
    const t3 = setTimeout(() => setPhase("done"),   6500);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  useEffect(() => { if (phase === "done") onDone?.(); }, [phase, onDone]);
  if (phase === "done") return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#08080D",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      animation: phase === "ready" ? "overlayOut 0.8s ease 1.2s both" : "none",
      pointerEvents: phase === "ready" ? "none" : "auto",
      fontFamily: C.mono,
    }}>
      {/* Background Data Flow */}
      {phase === "boot" && (
        <div style={{ position: "absolute", inset: "20px", overflow: "hidden", opacity: 0.3 }}>
          <div style={{ animation: "terminalScroll 2s linear infinite", display: "flex", flexDirection: "column", gap: 8 }}>
            {[...Array(20)].map((_, i) => (
              <div key={i} style={{ fontSize: "10px", color: C.txtD, whiteSpace: "nowrap" }}>
                {`0x${Math.random().toString(16).slice(2, 10).toUpperCase()} >> SYNC_BLOCK_${i} >> STATUS_OK >> 0.00ms`}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
        {phase === "boot" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {logs.map((log, i) => (
              <div key={i} style={{
                color: log.includes("OK") ? C.green : (log.includes("READY") ? C.gold : C.txtS),
                fontSize: "12px", opacity: 0,
                animation: `fadeIn 0.2s ${i * 0.15}s ease forwards`,
                textAlign: "left"
              }}>
                <span style={{ marginRight: 12 }}>{`>`}</span>
                {log}
              </div>
            ))}
          </div>
        )}

        {phase === "matrix" && (
          <div style={{ animation: "logoAssemble 0.8s ease both" }}>
            <DigitalMark size={160} glow={false} />
            <div style={{ 
              marginTop: 32, fontSize: "28px", fontWeight: 900, 
              color: C.txt, letterSpacing: "0.2em", textTransform: "uppercase",
              fontFamily: C.serif
            }}>
              Anchor
            </div>
            <div style={{
              fontSize: "10px", color: C.gold, letterSpacing: "0.4em", 
              marginTop: 12, textTransform: "uppercase"
            }}>
              Governing the Unseen
            </div>
          </div>
        )}

        {phase === "ready" && (
          <div style={{ animation: "glitch 0.2s infinite" }}>
            <div style={{ fontSize: "42px", color: C.gold, fontWeight: 900 }}>SYSTEM READY</div>
          </div>
        )}
      </div>

      {/* Grid Overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(201,168,76,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.03) 1px,transparent 1px)`,
        backgroundSize: "40px 40px",
        maskImage: "radial-gradient(circle, black, transparent 80%)",
      }} />
    </div>
  );
}


/* ── TICKER ──────────────────────────────────────────────── */
function Ticker() {
  const m = useIsMobile();
  if (m) return null;
  const items = [
    "RBI FREE-AI · 26 Mandatory Recommendations",
    "EU AI Act · Full Enforcement August 2026",
    "CFPB · Goldman Sachs $45M Penalty · October 2024",
    "SEC · AI Governance #1 Exam Priority · 2026",
    "FCA · CCO Personal Liability · September 2026",
    "SEBI · 5-Year AI Data Retention Mandate",
    "NIST AI RMF 1.0 · Govern · Map · Measure · Manage",
    "OWASP LLM Top 10 · 2025 Edition",
    "FINOS AI Governance Framework · 23 Rules",
  ];
  return (
    <div style={{ background: `linear-gradient(90deg,${C.gold},#E8C050,${C.gold})`, overflow: "hidden", padding: "9px 0" }}>
      <div style={{ display: "flex", whiteSpace: "nowrap", width: "max-content", animation: "tickerMove 45s linear infinite" }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} style={{ fontFamily: C.mono, fontSize: "10px", letterSpacing: ".1em", color: "#08080D", padding: "0 36px", textTransform: "uppercase", fontWeight: 700 }}>
            {item} <span style={{ opacity: .4 }}>§</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── LIVE CLOCK ──────────────────────────────────────────── */
function LiveClock() {
  const [t, setT] = useState(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
  useEffect(() => {
    const id = setInterval(() => setT(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })), 1000);
    return () => clearInterval(id);
  }, []);
  return <span style={{ fontFamily: C.mono, fontSize: "11px", color: C.txtS, letterSpacing: ".08em", borderLeft: `1px solid ${C.borderB}`, paddingLeft: "16px" }}>{t} IST</span>;
}

/* ── NAV ─────────────────────────────────────────────────── */
function Nav({ loaded }) {
  const [scrolled, setScrolled] = useState(false);
  const [hoverLink, setHoverLink] = useState(null);
  const m = useIsMobile();
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      background: scrolled ? "rgba(8,8,13,.97)" : "rgba(8,8,13,.0)",
      backdropFilter: scrolled ? "blur(24px)" : "none",
      borderBottom: `1px solid ${scrolled ? C.borderB : "transparent"}`,
      transition: "all .35s ease",
      opacity: loaded ? 1 : 0,
      transform: loaded ? "none" : "translateY(-10px)",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: m ? "0 20px" : "0 40px", height: "66px", display: "flex", alignItems: "center", gap: "16px" }}>
        <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, textDecoration: "none" }}>
          <DigitalMark size={40} glow={false} />
          <div>
            <div style={{ fontFamily: C.serif, fontWeight: 700, fontSize: "20px", color: C.txt, lineHeight: 1, letterSpacing: "-.01em" }}>Anchor</div>
            <div style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: ".14em", color: C.gold, lineHeight: 1.3 }}>SOVEREIGN GOVERNANCE MESH</div>
          </div>
          {!m && <span style={{ fontFamily: C.mono, fontSize: "10px", letterSpacing: ".1em", color: "rgba(201,168,76,.65)", border: `1px solid rgba(201,168,76,.25)`, padding: "2px 8px" }}>v5.0.0</span>}
        </a>

        {!m && <LiveClock />}

        {!m && (
          <div style={{ display: "flex", gap: "28px", marginLeft: "auto" }}>
            {[["§ Problem", "#problem"], ["§ Engine", "#engine"], ["§ Coverage", "#coverage"], ["§ Audits", "#audits"], ["§ Contact", "#contact"], ["GitHub ↗", "https://github.com/Tanishq1030/Anchor"]].map(([label, href]) => (
              <a key={label} href={href}
                target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                style={{ fontFamily: C.mono, fontSize: "12px", fontWeight: 500, letterSpacing: ".06em", color: hoverLink === label ? C.goldB : C.txtS, transition: "color .2s", textDecoration: "none" }}
                onMouseEnter={() => setHoverLink(label)}
                onMouseLeave={() => setHoverLink(null)}
              >{label}</a>
            ))}
          </div>
        )}

        <a href="https://app.anchorgovernance.tech" target="_blank" rel="noreferrer"
          style={{ marginLeft: m ? "auto" : undefined, fontFamily: C.mono, fontSize: "11px", letterSpacing: ".12em", fontWeight: 600, color: "#08080D", background: `linear-gradient(135deg,${C.gold},${C.goldB})`, padding: "8px 16px", textDecoration: "none", flexShrink: 0, transition: "opacity .2s", boxShadow: "0 4px 24px rgba(201,168,76,.3)" }}
          onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >{m ? "Launch" : "LAUNCH CONSOLE"}</a>
      </div>
      <div style={{ height: "1.5px", background: `linear-gradient(90deg,transparent,${C.gold},${C.goldB},${C.gold},transparent)`, opacity: .45 }} />
    </nav>
  );
}

/* ── DATA BAR ────────────────────────────────────────────── */
function DataBar({ loaded }) {
  const m = useIsMobile();
  if (m) return null;
  return (
    <div style={{
      background: C.bg1, borderBottom: `1px solid ${C.borderB}`,
      padding: "11px 0", marginTop: "58px",
      opacity: loaded ? 1 : 0, transition: "opacity .6s .3s ease",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px", display: "flex", gap: "0", alignItems: "center", flexWrap: "wrap" }}>
        {[
          { label: "FEDERATED NODES", val: "12", change: "6 US · 4 EU · 2 IN", up: true, data: [2, 5, 8, 10, 12] },
          { label: "DOMAIN RULES", val: "43", change: "+12 v4", up: true, data: [28, 31, 35, 40, 43] },
          { label: "TOTAL COVERAGE", val: "170", change: "+114 mappings", up: true, chart: "bar", data: [65, 90, 120, 150, 170] },
          { label: "SELF-AUDIT", val: "PASS", change: "✓ CRYPTO-SEALED", up: true, data: [0, 0, 0, 0] },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "0 28px", borderRight: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: ".1em", color: C.txtD, textTransform: "uppercase" }}>{item.label}</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontFamily: C.mono, fontSize: "14px", fontWeight: 700, color: C.txt }}>{item.val}</span>
                <span style={{ fontFamily: C.mono, fontSize: "9px", color: item.up ? C.green : C.txtS, fontWeight: 500 }}>{item.change}</span>
              </div>
            </div>
            {item.chart === "bar" ? (
              <MiniBarChart data={item.data} width={32} height={16} color={C.gold} />
            ) : (
              <Sparkline data={item.data} width={32} height={16} color={item.up ? C.green : C.gold} />
            )}
          </div>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "7px" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, animation: "pulse 1.5s infinite" }} />
          <span style={{ fontFamily: C.mono, fontSize: "10px", letterSpacing: ".12em", color: C.green, textTransform: "uppercase" }}>Live</span>
        </div>
      </div>
    </div>
  );
}

/* ── SECTION HEADER ──────────────────────────────────────── */
function SH({ rev, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
      <div style={{ flex: 1, height: "1px", background: `linear-gradient(to left,${C.gold},transparent)`, opacity: .3, animation: "drawLine .8s ease both" }} />
      <span style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: ".2em", color: `rgba(201,168,76,.6)` }}>REV {rev}</span>
      <span style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: ".16em", textTransform: "uppercase", color: C.txtD }}>—</span>
      <span style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: ".16em", textTransform: "uppercase", color: C.txtS }}>{title}</span>
      <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right,${C.gold},transparent)`, opacity: .3 }} />
    </div>
  );
}

/* ── TERMINAL ────────────────────────────────────────────── */
const LINES = [
  { text: "anchor init --mesh global --role enterprise", type: "cmd", delay: 0 },
  { text: "⚓  Anchor v5 — Sovereign Mesh Node", type: "info", delay: 600 },
  { text: "  ✓ Hub Relay (Regulate) — CONNECTED", type: "ok", delay: 900 },
  { text: "  ✓ Spoke Node (Sovereign) — LOCAL_READY", type: "ok", delay: 1100 },
  { text: "  ✓ Privacy Shield — ACTIVE", type: "ok", delay: 1300 },
  { text: "  ✓ Agentic Enforcement Flow", type: "ok", delay: 1500 },
  { text: "  ✓ RBI/EU Sync — 170 Mappings", type: "ok", delay: 1700 },
  { text: "  ✓ Lattice Signature — VERIFIED", type: "ok", delay: 1900 },
  { text: "  ✓ MESH_RELAY_ID: sha256:d238a6d5...", type: "ok", delay: 2100 },
  { text: "", type: "blank", delay: 2400 },
  { text: "$ anchor check .", type: "cmd", delay: 2600 },
  { text: "Scanning 164 paths · 43 domains · 170 active mappings", type: "info", delay: 3000 },
  { text: "Diamond Cage: ACTIVE · WASM verified", type: "cage", delay: 3300 },
  { text: "Analyzing  ████████████████████  100%", type: "info", delay: 3900 },
  { text: "", type: "blank", delay: 4200 },
  { text: "  BLOCKER : 0", type: "ok", delay: 4500 },
  { text: "  ERROR   : 0", type: "ok", delay: 4650 },
  { text: "  WARNING : 0", type: "ok", delay: 4800 },
  { text: "", type: "blank", delay: 5000 },
  { text: "PASSED — All laws satisfied. Schema: CLEAN.", type: "pass", delay: 5200 },
];

function TerminalLine({ line, onComplete }) {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (line.type === "blank") {
      onComplete?.();
      return;
    }

    if (line.type === "cage" || line.type === "pass") {
      setDisplayed(line.text);
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      if (index < line.text.length) {
        setDisplayed(prev => prev + line.text[index]);
        setIndex(prev => prev + 1);
      } else {
        clearInterval(timer);
        if (line.text.includes("Analyzing")) {
          setShowProgress(true);
        } else {
          onComplete?.();
        }
      }
    }, 15);
    return () => clearInterval(timer);
  }, [index, line, onComplete]);

  useEffect(() => {
    if (showProgress) {
      const pTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(pTimer);
            setTimeout(() => onComplete?.(), 400);
            return 100;
          }
          return prev + 5;
        });
      }, 50);
      return () => clearInterval(pTimer);
    }
  }, [showProgress, onComplete]);

  const lc = { cmd: C.txt, info: C.txtS, ok: C.green, cage: C.cyan, pass: C.green, blank: "transparent" };
  
  const renderText = () => {
    if (line.text.includes("Analyzing")) {
      const bars = Math.floor(progress / 5);
      const barStr = "█".repeat(bars) + "░".repeat(20 - bars);
      return `Analyzing  ${barStr}  ${progress}%`;
    }
    return displayed;
  };

  return (
    <div style={{ 
      color: lc[line.type] || C.txtS, 
      whiteSpace: "pre-wrap", 
      wordBreak: "break-all",
      fontWeight: line.type === "pass" ? 700 : 400,
      marginBottom: line.type === "blank" ? "12px" : "0"
    }}>
      {line.type === "cmd" && <span style={{ opacity: .5, marginRight: 8 }}>$</span>}
      {renderText()}
    </div>
  );
}

function Terminal() {
  const [idx, setIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ 
      background: C.bg1, 
      border: `1px solid ${C.borderB}`, 
      overflow: "hidden", 
      boxShadow: `0 0 60px rgba(201,168,76,.05), 0 20px 60px rgba(0,0,0,.4)`,
      position: "relative"
    }}>
      {/* Scanline overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))", zIndex: 10, pointerEvents: "none", backgroundSize: "100% 4px, 3px 100%" }} />
      
      <div style={{ background: C.bg2, borderBottom: `1px solid ${C.border}`, padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px", position: "relative", zIndex: 11 }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {["#FF5F57", "#FFBD2E", "#28C840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
        </div>
        <span style={{ fontFamily: C.mono, fontSize: "10px", color: C.txtD, marginLeft: "8px", flex: 1 }}>anchor — governance shell</span>
        <span style={{ fontFamily: C.mono, fontSize: "8px", letterSpacing: ".12em", color: C.gold, border: `1px solid rgba(201,168,76,.3)`, padding: "2px 8px", fontWeight: 700 }}>SEALED</span>
      </div>

      <div style={{ padding: "24px", minHeight: "280px", fontFamily: C.mono, fontSize: "11px", lineHeight: "1.8", position: "relative", zIndex: 11, overflowX: "auto" }}>
        {started && LINES.slice(0, idx + 1).map((l, i) => (
          <TerminalLine 
            key={i} 
            line={l} 
            onComplete={() => {
              if (i === idx && idx < LINES.length - 1) {
                setTimeout(() => setIdx(prev => prev + 1), l.type === "blank" ? 0 : 200);
              }
            }} 
          />
        ))}
        {started && idx < LINES.length - 1 && (
          <span style={{ display: "inline-block", width: 7, height: 13, background: C.gold, animation: "blink 1s step-end infinite", verticalAlign: "middle", marginLeft: 4 }} />
        )}
      </div>
    </div>
  );
}

/* ── HERO ────────────────────────────────────────────────── */
function AmbientParticles() {
  const dots = [
    { top:"20%",left:"8%",  size:3, delay:0,    dur:"7s",  dx:"14px" },
    { top:"55%",left:"14%", size:2, delay:1.2,  dur:"9s",  dx:"-10px" },
    { top:"30%",left:"92%", size:3, delay:0.5,  dur:"8s",  dx:"-18px" },
    { top:"70%",left:"88%", size:2, delay:2,    dur:"11s", dx:"12px" },
    { top:"80%",left:"50%", size:2, delay:0.8,  dur:"10s", dx:"8px" },
    { top:"15%",left:"60%", size:3, delay:1.6,  dur:"8.5s",dx:"-14px" },
  ];
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
      {dots.map((d,i) => (
        <div key={i} style={{
          position:"absolute", top:d.top, left:d.left,
          width:d.size, height:d.size, borderRadius:"50%",
          background:`rgba(201,168,76,${d.size===3?.55:.35})`,
          animation:`particleDrift ${d.dur} ${d.delay}s ease-in-out infinite`,
          "--dx": d.dx,
        }} />
      ))}
    </div>
  );
}

/* ── MESH SECTION ───────────────────────────────────────── */
function MeshSection() {
  const m = useIsMobile();
  return (
    <section style={{ padding: m ? "60px 20px" : "88px 40px", borderBottom: `1px solid ${C.border}`, background: C.bg1 }} id="mesh">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Reveal>
          <SH rev="MX" title="Federated Architecture" />
          <h2 style={{ fontFamily: C.serif, fontSize: "clamp(32px,3.5vw,48px)", color: C.txt, marginBottom: "52px", fontWeight: 900, textAlign: "center" }}>
            Data Stays Local.<br />
            <span style={{ color: C.gold }}>Compliance Stays Global.</span>
          </h2>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1px 1fr", gap: m ? "40px" : "0", alignItems: "start" }}>
          {/* Spoke */}
          <Reveal dir="left">
            <div style={{ padding: m ? 0 : "0 60px 0 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{ background: C.cyanD, border: `1px solid ${C.cyan}`, padding: "6px 12px", fontFamily: C.mono, fontSize: "10px", color: C.cyan, fontWeight: 700 }}>THE SPOKE</div>
                <span style={{ fontFamily: C.mono, fontSize: "9px", color: C.txtD, tracking: ".1em" }}>ENTERPRISE NODE</span>
              </div>
              <h3 style={{ fontFamily: C.serif, fontSize: "28px", color: C.txt, marginBottom: "20px" }}>Absolute Sovereignty.</h3>
              <p style={{ fontFamily: C.mono, fontSize: "13px", color: C.txtS, lineHeight: 1.8 }}>
                The Spoke node is deployed inside the corporate firewall. Your logs, your keys, and your inference data never leave your infrastructure. Governance is executed locally at the speed of code.
              </p>
            </div>
          </Reveal>

          {!m && <div style={{ background: C.border, alignSelf: "stretch" }} />}

          {/* Hub */}
          <Reveal dir="up">
            <div style={{ padding: m ? 0 : "0 0 0 60px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{ background: C.goldD, border: `1px solid ${C.gold}`, padding: "6px 12px", fontFamily: C.mono, fontSize: "10px", color: C.gold, fontWeight: 700 }}>THE HUB</div>
                <span style={{ fontFamily: C.mono, fontSize: "9px", color: C.txtD, tracking: ".1em" }}>REGULATORY RELAY</span>
              </div>
              <h3 style={{ fontFamily: C.serif, fontSize: "28px", color: C.txt, marginBottom: "20px" }}>Universal Integrity.</h3>
              <p style={{ fontFamily: C.mono, fontSize: "13px", color: C.txtS, lineHeight: 1.8 }}>
                The Hub acts as a cryptographically sealed registry of every regulatory framework. It relays mandated rule-sets to local spokes while providing a single pane of oversight for authorized regulatory agents.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Hero() {
  const m = useIsMobile();
  return (
    <section style={{ borderBottom: `1px solid ${C.border}`, padding: m ? "0 20px" : "0 40px", position:"relative", overflow:"hidden" }}>
      <AmbientParticles />
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1px 1fr", alignItems: "center", gap: 0 }}>

        {/* Left */}
        <div style={{ padding: m ? "56px 0 32px" : "72px 64px 72px 0", animation: "fadeUp .8s .1s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: ".18em", color: "rgba(201,168,76,.75)", textTransform: "uppercase" }}>v5.0.0 — Governance Fleet · AnimusLab</span>
          </div>

          <h1 style={{ fontFamily: C.serif, fontSize: "clamp(48px,5.5vw,76px)", lineHeight: 0.95, letterSpacing: "-.03em", color: C.txt, marginBottom: "24px", fontWeight: 900 }}>
            One Sovereign Mesh.<br />
            Global <span style={{ color: C.gold, fontStyle: "italic" }}>Enforcement.</span>
          </h1>

          <p style={{ fontFamily: C.mono, fontSize: "14px", lineHeight: 1.7, color: C.txtS, maxWidth: "450px", marginBottom: "40px", paddingLeft: "16px", borderLeft: `2px solid ${C.gold}` }}>
            Federated governance for the agentic age. Enterprises maintain data sovereignty via Spoke nodes; regulators maintain cryptographic oversight via the Global Hub.
          </p>

          <div style={{ display: "flex", gap: "16px", marginBottom: "32px", flexWrap: m ? "column" : "row" }}>
            <a href="https://app.anchorgovernance.tech" target="_blank" rel="noreferrer" style={{
              fontFamily: C.mono, fontSize: "13px", fontWeight: 700, color: C.bg, background: `linear-gradient(135deg, ${C.gold}, ${C.goldB})`,
              padding: "18px 32px", textDecoration: "none", letterSpacing: ".1em", textTransform: "uppercase", boxShadow: "0 12px 30px rgba(201,168,76,.2)"
            }}>Launch Enterprise Console</a>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {["Apache 2.0", "Python 3.8+", "43 domain rules", "170 regulatory mappings"].map(c => (
              <span key={c} style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: ".07em", textTransform: "uppercase", color: C.txtS, background: C.bg1, border: `1px solid ${C.border}`, padding: "4px 10px", transition: "border-color .2s, color .2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.txtS; }}
              >{c}</span>
            ))}
          </div>
        </div>

        {!m && <div style={{ background: C.border, margin: "40px 0" }} />}

        {/* Right — seal + terminal */}
        <div style={{ padding: m ? "0 0 56px" : "72px 0 72px 64px", animation: "fadeUp .8s .25s ease both" }}>
          {/* Authority badge — floating above terminal */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
            <DigitalMark size={72} glow animate="float 5s ease-in-out infinite" />
            <div style={{ paddingLeft: 12, borderLeft: `1px solid ${C.borderB}` }}>
              <div style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: ".14em", color: C.txtD, textTransform: "uppercase", marginBottom: "4px" }}>Live audit demonstration</div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, animation: "pulse 1.5s infinite" }} />
                  <span style={{ fontFamily: C.mono, fontSize: "9px", color: C.green, letterSpacing: ".1em" }}>DIAMOND CAGE: ACTIVE</span>
                </div>
                <Sparkline data={[40, 42, 41, 44, 43, 45]} width={50} height={12} color={C.green} />
              </div>
            </div>
          </div>
          <Terminal />
        </div>
      </div>
    </section>
  );
}

/* ── PROBLEM ─────────────────────────────────────────────── */
function ProblemSection() {
  const m = useIsMobile();
  return (
    <section style={{ padding: m ? "60px 20px" : "88px 40px", borderBottom: `1px solid ${C.border}` }} id="problem">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Reveal>
          <SH rev="01" title="Problem Statement" />
          <h2 style={{ fontFamily: C.serif, fontSize: "clamp(38px,4.5vw,60px)", lineHeight: 1.02, letterSpacing: "-.02em", color: C.txt, marginBottom: "52px", fontWeight: 900 }}>
            The regulators have<br />started counting.
          </h2>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: "1px", background: C.border, border: `1px solid ${C.border}` }}>
          {[
            { amount: "$45M", label: "CFPB ENFORCEMENT — OCTOBER 2024", desc: "Goldman Sachs. Not because their AI model was wrong. Because they couldn't explain what it decided.", primary: true },
            { amount: "Aug 2026", label: "EU AI ACT 2024/1689", desc: "Full enforcement begins. Credit scoring, AML monitoring, and fraud detection are legally high-risk AI." },
            { amount: "26", label: "RBI FREE-AI — AUGUST 2025", desc: "Mandatory recommendations. Per-decision audit trails reportable to CIMS. No fine ceiling." },
            { amount: "#1", label: "SEC 2026 EXAMINATION PRIORITIES", desc: "AI governance named the top examination priority — overtaking cryptocurrency for the first time." },
          ].map((card, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="hover-lift" style={{
                background: card.primary ? C.goldD : C.bg1,
                padding: "40px",
                borderLeft: card.primary ? `3px solid ${C.gold}` : "none",
                cursor: "default",
                transition: "background .25s",
                position: "relative", overflow: "hidden",
              }}
                onMouseEnter={e => e.currentTarget.style.background = card.primary ? C.goldG : C.bg2}
                onMouseLeave={e => e.currentTarget.style.background = card.primary ? C.goldD : C.bg1}
              >
                <div style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: ".18em", color: C.gold, opacity: .65, marginBottom: "10px", textTransform: "uppercase" }}>
                  {card.label.split(" — ")[0]}
                </div>
                <div style={{ fontFamily: C.serif, fontSize: "clamp(44px,5vw,62px)", lineHeight: 1, letterSpacing: "-.02em", marginBottom: "12px", color: card.primary ? C.goldB : C.txt, fontWeight: 900 }}>
                  {card.amount}
                </div>
                <div style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: ".12em", textTransform: "uppercase", color: C.txtD, marginBottom: "16px", paddingBottom: "14px", borderBottom: `1px solid ${C.border}` }}>
                  {card.label}
                </div>
                <p style={{ fontFamily: C.mono, fontSize: "12px", lineHeight: 1.8, color: C.txtS }}>{card.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── ENGINE ──────────────────────────────────────────────── */
function EngineSection() {
  const m = useIsMobile();
  const feat = (items, color) => items.map((f, i) => (
    <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
      <span style={{ color, flexShrink: 0, marginTop: "1px" }}>✓</span>
      <span style={{ fontFamily: C.mono, fontSize: "11px", color: C.txtS, lineHeight: 1.55 }}>{f}</span>
    </div>
  ));

  return (
    <section style={{ padding: m ? "60px 20px" : "88px 40px", borderBottom: `1px solid ${C.border}`, background: C.bg1 }} id="engine">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Reveal>
          <SH rev="02" title="Engine Architecture" />
          <h2 style={{ fontFamily: C.serif, fontSize: "clamp(38px,4.5vw,60px)", lineHeight: 1.02, letterSpacing: "-.02em", color: C.txt, marginBottom: "52px", fontWeight: 900 }}>
            Two layers.<br />One audit chain.
          </h2>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 56px 1fr", gap: 0, marginBottom: "56px", alignItems: "start" }}>
          <Reveal>
            <div style={{ background: C.bg, border: `1px solid ${C.borderB}`, borderTop: `2px solid ${C.green}`, padding: "32px", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 40px rgba(46,204,138,.06)`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              <div style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: ".2em", color: C.txtD, marginBottom: "8px" }}>LAYER 01</div>
              <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "20px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block", animation: "pulse 1.5s infinite" }} />
                <span style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: ".12em", color: C.green, textTransform: "uppercase", fontWeight: 700 }}>LIVE NOW</span>
              </div>
              <h3 style={{ fontFamily: C.serif, fontSize: "28px", color: C.txt, marginBottom: "18px", fontWeight: 700 }}>Static Code Analysis</h3>
              <p style={{ fontFamily: C.mono, fontSize: "12px", lineHeight: 1.85, color: C.txtS, marginBottom: "24px", paddingLeft: "14px", borderLeft: `2px solid ${C.borderB}` }}>
                Tree-sitter AST parsing against a cryptographically sealed constitutional rule set. Every violation gets a <code style={{ color: C.gold, fontSize: "11px" }}>violation_id</code> mapped to the exact regulation it breaches.
              </p>
              <div style={{ marginBottom: "24px" }}>
                {feat(["31 domain rules across 9 namespaces", "9 regulatory frameworks absorbed", "CI/CD + Git pre-commit hook", "Diamond Cage WASM sandbox", "Healer — automated fix suggestions"], C.green)}
              </div>
              <div style={{ display: "flex", alignItems: "stretch", height: "38px", border: `1px solid ${C.borderB}`, overflow: "hidden" }}>
                <code style={{ padding: "0 14px", fontFamily: C.mono, fontSize: "11px", flex: 1, color: C.txt, background: C.bg1, display: "flex", alignItems: "center" }}>pip install anchor-audit</code>
                <CopyBtn text="pip install anchor-audit" />
              </div>
            </div>
          </Reveal>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 10px", marginTop: "80px" }}>
            <div style={{ width: 1, height: 64, background: `linear-gradient(to bottom,transparent,${C.borderB},transparent)` }} />
            <DigitalMark size={44} glow={false} animate="float 4s ease-in-out infinite" />
            <div style={{ width: 1, height: 64, background: `linear-gradient(to bottom,transparent,${C.borderB},transparent)` }} />
          </div>

          <Reveal delay={120}>
            <div style={{ background: C.bg, border: `1px solid ${C.borderB}`, borderTop: `2px solid ${C.borderB}`, padding: "32px" }}>
              <div style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: ".2em", color: C.txtD, marginBottom: "8px" }}>LAYER 02</div>
              <div style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: ".12em", color: C.txtS, marginBottom: "20px" }}>◌ IN DEVELOPMENT</div>
              <h3 style={{ fontFamily: C.serif, fontSize: "28px", color: C.txt, marginBottom: "18px", fontWeight: 700 }}>Federated Governance Relay</h3>
              <p style={{ fontFamily: C.mono, fontSize: "12px", lineHeight: 1.85, color: C.txtS, marginBottom: "24px", paddingLeft: "14px", borderLeft: `2px solid ${C.borderB}` }}>
                Decentralized forensic audit chain brokered via Hub-Spoke architecture. Real-time CIMS-compliant telemetry for global regulators without compromising Spoke data sovereignty.
              </p>
              {feat(["Hub-Spoke Blockchain Link", "SHA-256 Hash Chaining", "cims_payload() — RBI CIMS Format", "Cross-Border Forensic Handover", "Regulatory Node Oversight"], C.txtS)}
            </div>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.gold, animation: "pulse 1.5s infinite" }} />
            <span style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: ".14em", color: C.txtD, textTransform: "uppercase" }}>Live scan output — governance shell</span>
          </div>
          <Terminal />
        </Reveal>
      </div>
    </section>
  );
}

/* ── VIOLATIONS ──────────────────────────────────────────── */
function ViolationsSection() {
  const m = useIsMobile();
  const sevColor = { BLOCKER: C.red, ERROR: C.amber };
  const sevBg = { BLOCKER: C.redD, ERROR: C.ambD };
  return (
    <section style={{ padding: m ? "60px 20px" : "88px 40px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Reveal>
          <SH rev="02A" title="Enforcement Output" />
          <h2 style={{ fontFamily: C.serif, fontSize: "clamp(38px,4.5vw,60px)", lineHeight: 1.0, letterSpacing: "-.02em", color: C.txt, marginBottom: "52px", fontWeight: 900 }}>
            Every violation.<br />Every statute.<br />Every line.
          </h2>
        </Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            { id: "SEC-001", name: "Prompt Injection", sev: "BLOCKER", file: "src/agent.py", line: 47, fix: "Sanitize all user-controlled input before including in prompts.", statute: "OWASP LLM01 · NIST GV-1.1" },
            { id: "ETH-002", name: "Explainability Absence", sev: "ERROR", file: "src/credit_model.py", line: 112, fix: "Add SHAP/LIME wrapper. RBI Rec 14 requires specific reason codes.", statute: "RBI FREE-AI Rec 14 · CFPB Reg B" },
            { id: "AGT-003", name: "MCP Supply Chain Compromise", sev: "BLOCKER", file: "src/tools/mcp_client.py", line: 23, fix: "Verify MCP server manifests cryptographically before tool calls.", statute: "FINOS-020 · SEC-004" },
          ].map((v, i) => (
            <Reveal key={i} delay={i * 80}>
              <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderLeft: `3px solid ${sevColor[v.sev]}`, padding: "18px 22px", display: "grid", gridTemplateColumns: m ? "1fr" : "120px 1fr 190px", gap: "12px", alignItems: "start", transition: "background .2s, transform .2s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.background = C.bg2; e.currentTarget.style.transform = "translateX(4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = C.bg1; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontFamily: C.mono, fontWeight: 700, fontSize: "12px", color: C.txt }}>[{v.id}]</span>
                  <span style={{ fontFamily: C.mono, fontSize: "8px", letterSpacing: ".12em", fontWeight: 700, padding: "3px 8px", border: "1px solid", display: "inline-block", color: sevColor[v.sev], borderColor: `${sevColor[v.sev]}44`, background: sevBg[v.sev] }}>{v.sev}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <div style={{ fontFamily: C.serif, fontSize: "18px", color: C.txt, fontWeight: 600 }}>{v.name}</div>
                  <div style={{ fontFamily: C.mono, fontSize: "10px", color: C.txtD }}>◈ {v.file}:{v.line}</div>
                  <div style={{ fontFamily: C.mono, fontSize: "11px", color: C.txtS, lineHeight: 1.6 }}>→ {v.fix}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: C.mono, fontSize: "8px", letterSpacing: ".14em", textTransform: "uppercase", color: C.txtD, marginBottom: "5px" }}>Statute ref.</div>
                  <div style={{ fontFamily: C.mono, fontSize: "10px", color: C.gold, opacity: .75, lineHeight: 1.6 }}>{v.statute}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── STATS ───────────────────────────────────────────────── */
function StatsSection() {
  const m = useIsMobile();
  return (
    <section style={{ padding: m ? "60px 20px" : "88px 40px", borderBottom: `1px solid ${C.border}`, background: C.bg1 }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Reveal><SH rev="02B" title="System Metrics" /></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "repeat(4,1fr)", gap: "1px", background: C.border, border: `1px solid ${C.border}`, marginTop: "24px" }}>
          {[
            { target: 43, label: "Domain rules", data: [28, 31, 35, 40, 43], color: C.gold },
            { target: 170, label: "Total Mapped Regulations", data: [65, 90, 120, 150, 170], color: C.chart4 },
            { target: 9, label: "Regulatory frameworks", data: [6, 7, 8, 9], color: C.chart2 },
            { target: 0, label: "Violations — self-audit", green: true, data: [0, 0, 0, 0], color: C.green, note: "Anchor audited itself. CLEAN." },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div style={{ background: s.green ? C.greenD : C.bg, padding: "40px 28px", borderTop: `2px solid ${s.green ? C.green : "transparent"}`, transition: "border-top-color .3s", cursor: "default", position: "relative", overflow: "hidden" }}
                onMouseEnter={e => e.currentTarget.style.borderTopColor = s.green ? C.green : C.gold}
                onMouseLeave={e => e.currentTarget.style.borderTopColor = s.green ? C.green : "transparent"}
              >
                {/* Data corner pips */}
                <div style={{ position: "absolute", top: 8, right: 8, width: 4, height: 4, background: s.color, opacity: .3 }} />
                <div style={{ position: "absolute", bottom: 8, left: 8, width: 4, height: 4, background: s.color, opacity: .3 }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div style={{ fontFamily: C.serif, fontSize: "64px", lineHeight: 1, letterSpacing: "-.02em", color: s.green ? C.green : C.txt, fontWeight: 900 }}>
                    <Counter target={s.target} />
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <FinancialChart data={s.data} width={80} height={36} color={s.color} />
                  </div>
                </div>
                <div style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: ".1em", textTransform: "uppercase", color: C.txtS, lineHeight: 1.6 }}>{s.label}</div>
                {s.note && <div style={{ fontFamily: C.mono, fontSize: "10px", color: C.green, opacity: .7, marginTop: "12px" }}>{s.note}</div>}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── COVERAGE ────────────────────────────────────────────── */
function CoverageSection() {
  const m = useIsMobile();
  const dotC = { domain: C.green, framework: C.cyan, regulator: C.gold };
  const topB = { domain: C.green, framework: C.cyan, regulator: C.gold };
  return (
    <section style={{ padding: m ? "60px 20px" : "88px 40px", borderBottom: `1px solid ${C.border}` }} id="coverage">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Reveal>
          <SH rev="03" title="Jurisdiction Map" />
          <h2 style={{ fontFamily: C.serif, fontSize: "clamp(38px,4.5vw,60px)", lineHeight: 1.02, letterSpacing: "-.02em", color: C.txt, marginBottom: "52px", fontWeight: 900 }}>
            One engine.<br />Every jurisdiction.
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "repeat(3,1fr)", gap: "1px", background: C.border, border: `1px solid ${C.border}`, alignItems: "stretch" }}>
          {[
            {
              icon: "◈", label: "Domain Rules", sub: "Always loaded · Constitutional floor", type: "domain",
              items: ["SEC · Security", "ETH · Ethics", "PRV · Privacy", "ALN · Alignment", "AGT · Agentic AI", "LEG · Legal", "OPS · Operational", "SUP · Supply Chain", "SHR · Shared"]
            },
            {
              icon: "⊞", label: "Standards Bodies", sub: "Absorbed · Opt-in", type: "framework",
              items: ["FINOS AI Governance", "OWASP LLM Top 10 · 2025", "NIST AI RMF 1.0"]
            },
            {
              icon: "⚖", label: "Government Regulators", sub: "Obligation-mapped · Opt-in", type: "regulator",
              items: ["RBI FREE-AI 2025", "EU AI Act 2024/1689", "SEBI AI/ML 2025", "CFPB Regulation B", "FCA 2024", "SEC 2026"]
            },
          ].map((col, i) => (
            <Reveal key={i} delay={i * 100} style={{ height: "100%" }}>
              <div style={{ background: C.bg1, padding: "32px", borderTop: `2px solid ${topB[col.type]}`, transition: "background .2s", cursor: "default", height: "100%" }}
                onMouseEnter={e => e.currentTarget.style.background = C.bg2}
                onMouseLeave={e => e.currentTarget.style.background = C.bg1}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "22px", paddingBottom: "18px", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: "18px", color: dotC[col.type], width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}`, flexShrink: 0 }}>{col.icon}</div>
                  <div>
                    <div style={{ fontFamily: C.serif, fontSize: "17px", color: C.txt, marginBottom: "3px", fontWeight: 600 }}>{col.label}</div>
                    <div style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: ".08em", textTransform: "uppercase", color: C.txtD }}>{col.sub}</div>
                  </div>
                </div>
                {col.items.map((item, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "9px" }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: dotC[col.type], opacity: .7, flexShrink: 0 }} />
                    <span style={{ fontFamily: C.mono, fontSize: "11px", color: C.txtS }}>{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CASES ───────────────────────────────────────────────── */
function CasesSection() {
  const m = useIsMobile();
  return (
    <section style={{ padding: m ? "60px 20px" : "88px 40px", borderBottom: `1px solid ${C.border}`, background: C.bg1 }} id="audits">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Reveal>
          <SH rev="04" title="Audit Log — Precedent" />
          <h2 style={{ fontFamily: C.serif, fontSize: "clamp(38px,4.5vw,60px)", lineHeight: 1.02, letterSpacing: "-.02em", color: C.txt, marginBottom: "52px", fontWeight: 900 }}>
            Audited in the open.
          </h2>
        </Reveal>
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "40px", position: "relative", minHeight: "400px" }}>
          <AuditGraph data={[
            { name: "Hugging Face", n: 12, href: "https://github.com/Tanishq1030/Anchor/blob/main/case-studies/governance_audits/huggingface_hub/governance_audit.md" },
            { name: "Architecture-as-Code", n: 11, href: "https://github.com/Tanishq1030/Anchor/blob/main/case-studies/governance_audits/architecture-as-code/governance_audit.md" },
            { name: "Django 5.x", n: 7, href: "https://github.com/Tanishq1030/Anchor/blob/main/case-studies/governance_audits/django/governance_audit.md" },
            { name: "Anchor Engine", n: 5, href: "https://github.com/Tanishq1030/Anchor/blob/main/case-studies/governance_audits/anchor/governance_audit.md" },
            { name: "Open Spiel", n: 4, href: "https://github.com/Tanishq1030/Anchor/blob/main/case-studies/governance_audits/open_spiel/governance_audit.md" },
          ]} />
        </div>
      </div>
    </section>
  );
}

function AuditGraph({ data }) {
  const height = 300;
  const width = 1120;
  const maxN = 15;
  const padding = 60;
  
  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: height - padding - (d.n / maxN) * (height - padding * 2),
    ...d
  }));

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
        {/* Y Axis Grid */}
        {[0, 5, 10, 15].map(val => {
          const y = height - padding - (val / maxN) * (height - padding * 2);
          return (
            <g key={val}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke={C.border} strokeWidth="1" strokeDasharray="4 4" />
              <text x={padding - 10} y={y + 4} textAnchor="end" style={{ fontFamily: C.mono, fontSize: "10px", fill: C.txtD }}>{val}</text>
            </g>
          );
        })}
        
        {/* Axis Labels */}
        <text x={padding - 45} y={height / 2} transform={`rotate(-90, ${padding - 45}, ${height / 2})`} style={{ fontFamily: C.mono, fontSize: "9px", fill: C.gold, letterSpacing: ".1em", textTransform: "uppercase" }}>Violations Detected</text>

        {/* The Line */}
        <path d={path} fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={.6} />
        
        {/* The Points */}
        {points.map((p, i) => (
          <g key={i} style={{ cursor: "pointer" }} onClick={() => window.open(p.href, "_blank")}>
            <circle cx={p.x} cy={p.y} r="6" fill={C.bg} stroke={C.gold} strokeWidth="2">
              <title>{p.name}: {p.n} findings</title>
            </circle>
            <circle cx={p.x} cy={p.y} r="12" fill={C.gold} opacity="0">
              <animate attributeName="opacity" values="0;0.2;0" dur="2s" repeatCount="indefinite" />
              <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
            </circle>
            <text x={p.x} y={height - padding + 24} textAnchor="middle" style={{ fontFamily: C.mono, fontSize: "10px", fill: C.txtS, textTransform: "uppercase" }}>{p.name}</text>
            <text x={p.x} y={p.y - 15} textAnchor="middle" style={{ fontFamily: C.mono, fontSize: "12px", fontWeight: 700, fill: C.txt }}>{p.n}</text>
          </g>
        ))}
      </svg>
      <div style={{ marginTop: "40px", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "20px" }}>
         {data.map((d, i) => (
           <a key={i} href={d.href} target="_blank" rel="noreferrer" style={{ textDecoration: "none", background: C.bg1, border: `1px solid ${C.border}`, padding: "12px", transition: "border-color .2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.gold}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
           >
             <div style={{ fontFamily: C.mono, fontSize: "9px", color: C.gold, marginBottom: "4px" }}>{d.n} FINDINGS</div>
             <div style={{ fontFamily: C.serif, fontSize: "13px", color: C.txt, fontWeight: 600 }}>{d.name} →</div>
           </a>
         ))}
      </div>
    </div>
  );
}

/* ── GET STARTED ─────────────────────────────────────────── */
function GetStartedSection() {
  return (
    <section style={{ padding: "88px 40px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Reveal>
          <SH rev="05" title="Implementation" />
          <h2 style={{ fontFamily: C.serif, fontSize: "clamp(38px,4.5vw,60px)", lineHeight: 1.0, letterSpacing: "-.02em", color: C.txt, marginBottom: "52px", fontWeight: 900, textAlign: "center" }}>
            Ship governed AI.<br />Not just fast AI.
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <div style={{ maxWidth: "600px", margin: "0 auto 44px", border: `1px solid ${C.border}`, background: C.bg1 }}>
            {[
              { num: "01", cmd: "pip install anchor-audit", note: "Install the governance engine" },
              { num: "02", cmd: "anchor init --regulators rbi,eu", note: "Declare your jurisdiction" },
              { num: "03", cmd: "anchor check .", note: "Scan and enforce" },
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "18px", padding: "14px 18px", borderBottom: i < 2 ? `1px solid ${C.border}` : "none", transition: "background .2s" }}
                onMouseEnter={e => e.currentTarget.style.background = C.bg2}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: ".16em", color: C.gold, opacity: .55, flexShrink: 0, width: "20px" }}>{step.num}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "stretch", height: "36px", border: `1px solid ${C.borderB}`, overflow: "hidden", marginBottom: "5px" }}>
                    <code style={{ padding: "0 12px", fontFamily: C.mono, fontSize: "12px", flex: 1, color: C.txt, background: C.bg2, display: "flex", alignItems: "center" }}>{step.cmd}</code>
                    <CopyBtn text={step.cmd} />
                  </div>
                  <div style={{ fontFamily: C.mono, fontSize: "10px", color: C.txtD }}>{step.note}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={200}>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <a href="https://github.com/Tanishq1030/Anchor" target="_blank" rel="noreferrer"
              style={{ fontFamily: C.mono, fontSize: "11px", letterSpacing: ".1em", fontWeight: 700, color: "#08080D", background: `linear-gradient(135deg,${C.gold},${C.goldB})`, padding: "13px 30px", textDecoration: "none", boxShadow: "0 4px 24px rgba(201,168,76,.25)", transition: "opacity .2s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >VIEW ON GITHUB →</a>
            <a href="https://pypi.org/project/anchor-audit/" target="_blank" rel="noreferrer"
              style={{ fontFamily: C.mono, fontSize: "11px", color: C.txtS, border: `1px solid ${C.border}`, padding: "13px 22px", textDecoration: "none", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = C.txt; e.currentTarget.style.borderColor = C.gold; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.txtS; e.currentTarget.style.borderColor = C.border; }}
            >PyPI package</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── CONTACT ─────────────────────────────────────────────── */
function ContactSection() {
  const m = useIsMobile();
  return (
    <section style={{ padding: m ? "72px 20px" : "120px 40px", borderBottom: `1px solid ${C.border}`, background: C.bg }} id="contact">
      <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
        <Reveal><SH rev="06" title="Communications" /></Reveal>
        <Reveal delay={100}>
          <h2 style={{ fontFamily: C.serif, fontSize: "clamp(38px,5vw,72px)", lineHeight: 1.0, letterSpacing: "-.02em", color: C.txt, marginBottom: "32px", fontWeight: 900 }}>
            Architecting <span style={{ color: C.gold, fontStyle: "italic" }}>Enforcement.</span>
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p style={{ fontFamily: C.mono, fontSize: "14px", lineHeight: 1.8, color: C.txtS, marginBottom: "56px", maxWidth: "600px", margin: "0 auto 56px" }}>
            For partnership inquiries, custom domain governance, or regulatory strategy consultations, connect with me directly.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div style={{ display: "inline-flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
             <a href="mailto:tan@anchorgovernance.tech" style={{
              fontFamily: C.mono, fontSize: m ? "14px" : "20px", color: C.bg, background: `linear-gradient(135deg, ${C.gold}, ${C.goldB})`, textDecoration: "none", padding: m ? "18px 28px" : "24px 64px", transition: "transform .2s, box-shadow .2s", fontWeight: 700, boxShadow: "0 10px 40px rgba(201,168,76,.15)", wordBreak: "break-all"
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 15px 50px rgba(201,168,76,.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 10px 40px rgba(201,168,76,.15)"; }}
            >
              tan@anchorgovernance.tech
            </a>
            <span style={{ fontFamily: C.mono, fontSize: "9px", color: C.txtD, letterSpacing: ".15em", textTransform: "uppercase", marginTop: "12px" }}>Establishing Trusted AI Protocols Worldwide</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── FOOTER ──────────────────────────────────────────────── */
function Footer() {
  const m = useIsMobile();
  return (
    <footer style={{ borderTop: `2px solid ${C.gold}`, background: C.bg1, padding: m ? "40px 20px 28px" : "52px 40px 36px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: m ? "column" : "row", justifyContent: "space-between", alignItems: "flex-start", gap: m ? "24px" : "40px", marginBottom: "36px", paddingBottom: "28px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <DigitalMark size={52} glow={false} />
            <div>
              <div style={{ fontFamily: C.serif, fontWeight: 700, fontSize: "22px", color: C.txt, letterSpacing: "-.01em", marginBottom: "8px" }}>Anchor</div>
              <div style={{ fontFamily: C.mono, fontSize: "11px", color: C.txtS, marginBottom: "8px" }}>The surveillance and enforcement layer for AI.</div>
              <div style={{ fontFamily: C.serif, fontSize: "13px", fontStyle: "italic", color: C.txtD, marginBottom: "8px" }}>"Governance without enforcement is documentation."</div>
              <div style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: ".08em", textTransform: "uppercase", color: C.txtD, marginBottom: "8px" }}>Apache 2.0 · Open source · anchorgovernance.tech · v5.0.0</div>
              <a href="mailto:tan@anchorgovernance.tech" style={{ fontFamily: C.mono, fontSize: "10px", color: C.gold, textDecoration: "none", opacity: .8, transition: "opacity .2s" }}
                onMouseEnter={e => e.target.style.opacity = "1"}
                onMouseLeave={e => e.target.style.opacity = ".8"}
              >tan@anchorgovernance.tech</a>
            </div>
          </div>
          <div className="footer-links" style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            {[
              ["Enterprise Console", "https://app.anchorgovernance.tech"],
              ["PyPI", "https://pypi.org/project/anchor-audit/"]
            ].map(([l, h]) => (
              <a key={l} href={h} target="_blank" rel="noreferrer"
                style={{ fontFamily: C.mono, fontSize: "10px", letterSpacing: ".08em", textTransform: "uppercase", color: C.txtS, textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => e.target.style.color = C.gold}
                onMouseLeave={e => e.target.style.color = C.txtS}
              >{l}</a>
            ))}
          </div>
        </div>
        <div style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: ".1em", textTransform: "uppercase", color: C.txtD, textAlign: "center" }}>
          Anchor v5.0.0 · REV 5.0 · anchorgovernance.tech · Apache 2.0
        </div>
      </div>
    </footer>
  );
}

/* ── APP ─────────────────────────────────────────────────── */
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const handleDone = useCallback(() => setLoaded(true), []);

  return (
    <>
      <GlobalStyles />
      <WelcomeScreen onDone={handleDone} />
      <div style={{
        background: C.bg, minHeight: "100vh",
        opacity: loaded ? 1 : 0,
        transition: "opacity .5s ease",
      }}>
        <Nav loaded={loaded} />
        <DataBar loaded={loaded} />
        <Ticker />
        {/* Decree strip */}
        <div style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 40px", background: C.bg1 }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", gap: "18px" }}>
            <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right,${C.gold},transparent)`, opacity: .3 }} />
            <span style={{ fontFamily: C.serif, fontSize: "16px", fontStyle: "italic", color: C.txtS }}>"Governance without enforcement is documentation."</span>
            <div style={{ width: "28px", height: "1px", background: C.border }} />
            <span style={{ fontFamily: C.serif, fontSize: "16px", color: C.goldB }}>Anchor enforces.</span>
            <div style={{ flex: 1, height: "1px", background: `linear-gradient(to left,${C.gold},transparent)`, opacity: .3 }} />
          </div>
        </div>
        <Hero />
        <MeshSection />
        <ProblemSection />
        <EngineSection />
        <ViolationsSection />
        <StatsSection />
        <CoverageSection />
        <CasesSection />
        <GetStartedSection />
        <ContactSection />
        <Footer />
      </div>
    </>
  );
}