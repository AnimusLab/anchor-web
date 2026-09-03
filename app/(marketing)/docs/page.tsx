"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  ArrowRight, Shield, Lock, FileCheck, Scale, Cpu, Globe, Server, 
  Key, Users, Terminal, Code2, BookOpen, Layers, CheckCircle2, 
  Copy, Check, ChevronRight, ChevronDown, Binary, ExternalLink, Sun, Moon, 
  GitBranch, RefreshCw, AlertCircle, FileText, Search, CornerDownRight,
  Info, AlertTriangle, Lightbulb, Zap, ArrowLeft, Hash
} from "lucide-react";
import { AnchorLogo } from "@/components/AnchorLogo";
import { useTheme } from "@/lib/theme";
import { DOCS_TAXONOMY, DocCategory, DocSubItem } from "./data/docsData";

/* ─────────────────────────────────────────────────────────
   ANCHOR PROTOCOL — PALANTIR-GRADE ENTERPRISE DOCUMENTATION
   Hierarchical Multi-Level Navigation + Deep Technical Specs
───────────────────────────────────────────────────────── */

const ICON_MAP: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="w-4 h-4" />,
  FileCheck: <FileCheck className="w-4 h-4" />,
  Cpu: <Cpu className="w-4 h-4" />,
  Lock: <Lock className="w-4 h-4" />,
  Scale: <Scale className="w-4 h-4" />,
  Code2: <Code2 className="w-4 h-4" />,
};

export default function DocsPage() {
  const { isDark, mounted, toggleTheme } = useTheme();

  // Active Selected Topic State
  const [activeCategoryId, setActiveCategoryId] = useState<string>("getting-started");
  const [activeItemId, setActiveItemId] = useState<string>("overview");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "getting-started": true,
    "layer1-ast": true,
    "layer2-runtime": true,
    "decision-audit-chain": true,
    "jurisdictions": true,
    "sdk-api-reference": true,
  });
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Sync with URL query param if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const topicParam = params.get("topic");
      if (topicParam) {
        for (const cat of DOCS_TAXONOMY) {
          const matched = cat.items.find((i) => i.id === topicParam);
          if (matched) {
            setActiveCategoryId(cat.id);
            setActiveItemId(matched.id);
            break;
          }
        }
      }
    }
  }, []);

  // Find active category and item
  const activeCategory = useMemo(() => {
    return DOCS_TAXONOMY.find((c) => c.id === activeCategoryId) || DOCS_TAXONOMY[0];
  }, [activeCategoryId]);

  const activeItem = useMemo(() => {
    return activeCategory.items.find((i) => i.id === activeItemId) || activeCategory.items[0];
  }, [activeCategory, activeItemId]);

  // Compute Flattened List for Prev/Next Navigation
  const allItemsFlat = useMemo(() => {
    const list: { categoryTitle: string; item: DocSubItem; categoryId: string }[] = [];
    DOCS_TAXONOMY.forEach((cat) => {
      cat.items.forEach((item) => {
        list.push({ categoryTitle: cat.title, item, categoryId: cat.id });
      });
    });
    return list;
  }, []);

  const currentIndex = allItemsFlat.findIndex((i) => i.item.id === activeItem.id);
  const prevItem = currentIndex > 0 ? allItemsFlat[currentIndex - 1] : null;
  const nextItem = currentIndex < allItemsFlat.length - 1 ? allItemsFlat[currentIndex + 1] : null;

  // Filtered Taxonomy for Search
  const filteredTaxonomy = useMemo(() => {
    if (!searchQuery.trim()) return DOCS_TAXONOMY;
    const q = searchQuery.toLowerCase();
    return DOCS_TAXONOMY.map((cat) => {
      const matchedItems = cat.items.filter((item) => 
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.content.summary.toLowerCase().includes(q) ||
        item.toc.some((t) => t.label.toLowerCase().includes(q))
      );
      return { ...cat, items: matchedItems };
    }).filter((cat) => cat.items.length > 0);
  }, [searchQuery]);

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const selectTopic = (catId: string, itemId: string) => {
    setActiveCategoryId(catId);
    setActiveItemId(itemId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("topic", itemId);
      window.history.pushState({}, "", url.toString());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className={`lp-root ${isDark ? "dark" : ""} min-h-screen flex flex-col selection:bg-[#2563EB] selection:text-white transition-colors duration-300 bg-white dark:bg-[#09090C] text-black dark:text-white`} style={{ fontFamily: "var(--font-sans)" }}>

      {/* ── FLOATING 3D NAV CAPSULE ─────────────────────────────────────── */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto flex items-center justify-between gap-6 sm:gap-8 px-6 py-2.5 sm:px-8 sm:py-3 rounded-full lp-nav-3d text-white backdrop-blur-2xl max-w-5xl w-full sm:w-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0" style={{ textDecoration: "none" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white text-black shadow-sm">
              <AnchorLogo size={16} variant="monochrome" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white whitespace-nowrap">anchor</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">DOCS</span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-7 text-xs font-medium text-slate-300 whitespace-nowrap">
            <Link href="/#product" className="hover:text-white transition-colors" style={{ textDecoration: "none" }}>Product</Link>
            <Link href="/docs" className="text-white font-semibold underline underline-offset-4" style={{ textDecoration: "none" }}>Docs</Link>
            <Link href="/compare" className="hover:text-white transition-colors" style={{ textDecoration: "none" }}>Compare</Link>
            <Link href="/benchmarks" className="hover:text-white transition-colors" style={{ textDecoration: "none" }}>Benchmarks</Link>
            <Link href="/case-studies" className="hover:text-white transition-colors whitespace-nowrap" style={{ textDecoration: "none" }}>Case Studies</Link>
            <Link href="/pricing" className="hover:text-white transition-colors" style={{ textDecoration: "none" }}>Pricing</Link>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
            {mounted && (
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle theme"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-90"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-300 transition-transform duration-300 rotate-0 hover:rotate-45" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-200 transition-transform duration-300 rotate-0 hover:-rotate-12" />
                )}
              </button>
            )}

            <Link href="/login" className="flex items-center gap-1 text-xs font-bold px-4 py-2 rounded-full lp-nav-btn-3d whitespace-nowrap" style={{ textDecoration: "none" }}>
              + Get access
            </Link>
          </div>
        </nav>
      </div>

      {/* ── MAIN DOCUMENTATION WORKSPACE ───────────────────────────────── */}
      <div className="pt-28 flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-24">
        
        {/* ── 01. LEFT NAVIGATION SIDEBAR (3 COLS) ────────────────────── */}
        <aside className="lg:col-span-3 xl:col-span-3 space-y-6 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto pr-2 custom-scrollbar">
          
          {/* Quick Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search docs, APIs, statutes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          {/* Hierarchical Category Tree */}
          <div className="space-y-4">
            {filteredTaxonomy.map((category) => {
              const isExpanded = expandedCategories[category.id] !== false;
              const hasActiveItem = category.items.some((i) => i.id === activeItemId);

              return (
                <div key={category.id} className="space-y-1">
                  {/* Category Header Button */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      hasActiveItem 
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30" 
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-400 dark:text-slate-500">
                        {ICON_MAP[category.iconName] || <BookOpen className="w-4 h-4" />}
                      </span>
                      <span>{category.title}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"}`} />
                  </button>

                  {/* Sub-Items List */}
                  {isExpanded && (
                    <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-slate-200 dark:border-white/10 ml-4">
                      {category.items.map((item) => {
                        const isSelected = item.id === activeItemId;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => selectTopic(category.id, item.id)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                              isSelected
                                ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20"
                                : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 font-medium"
                            }`}
                          >
                            <span className="truncate pr-2">{item.title}</span>
                            {item.badge && (
                              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                                isSelected 
                                  ? "bg-white/20 text-white" 
                                  : "bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-400"
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Links Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-2 text-xs">
            <p className="font-bold text-black dark:text-white">Developer Resources</p>
            <div className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <Link href="/compare" className="flex items-center justify-between hover:text-blue-600 transition-colors" style={{ textDecoration: "none" }}>
                <span>Compare Architecture</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/benchmarks" className="flex items-center justify-between hover:text-blue-600 transition-colors" style={{ textDecoration: "none" }}>
                <span>Sub-0.4ms Benchmarks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <a href="mailto:tan@animuslab.dev?subject=Anchor%20Engineering%20Discussion" className="flex items-center justify-between hover:text-blue-600 transition-colors" style={{ textDecoration: "none" }}>
                <span>Contact Engineering Team</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </aside>

        {/* ── 02. CENTER MAIN CONTENT PANE (6-7 COLS) ──────────────────── */}
        <main className="lg:col-span-6 xl:col-span-6 space-y-12 animate-fadeIn">
          
          {/* Breadcrumbs Bar */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-white/5 pb-3">
            <span>Docs</span>
            <span>/</span>
            <span>{activeCategory.title}</span>
            <span>/</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">{activeItem.title}</span>
            <span className="ml-auto text-[11px] bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
              {activeItem.readingTime}
            </span>
          </div>

          {/* Chapter Title & Lead Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {activeCategory.title.toUpperCase()}
              </span>
              {activeItem.badge && (
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                  {activeItem.badge}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-black dark:text-white leading-tight">
              {activeItem.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {activeItem.content.summary}
            </p>
          </div>

          {/* Chapter Sections Body */}
          <div className="space-y-14">
            {activeItem.content.sections.map((section, sIdx) => (
              <section key={section.id || sIdx} id={section.id} className="space-y-6 pt-6 scroll-mt-28 border-t border-slate-100 dark:border-white/5 first:border-0 first:pt-0">
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 group">
                    <a href={`#${section.id}`} className="text-slate-300 dark:text-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <Hash className="w-5 h-5" />
                    </a>
                    <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">
                      {section.heading}
                    </h2>
                  </div>
                  {section.lead && (
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {section.lead}
                    </p>
                  )}
                </div>

                {/* Paragraphs */}
                {section.paragraphs && (
                  <div className="space-y-3.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {section.paragraphs.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                  </div>
                )}

                {/* Callout Admonitions */}
                {section.callouts && (
                  <div className="space-y-4">
                    {section.callouts.map((callout, cIdx) => (
                      <div
                        key={cIdx}
                        className={`p-5 rounded-2xl border-2 space-y-1.5 ${
                          callout.type === "info"
                            ? "bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 text-blue-950 dark:text-blue-200"
                            : callout.type === "tip"
                            ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-950 dark:text-emerald-200"
                            : "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-950 dark:text-amber-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs uppercase font-mono">
                          {callout.type === "info" && <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                          {callout.type === "tip" && <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                          {callout.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                          <span>{callout.title}</span>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                          {callout.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Data Tables */}
                {section.tables && (
                  <div className="space-y-2">
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121217] shadow-sm">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/10 font-mono uppercase text-slate-500 dark:text-slate-400">
                            {section.tables.headers.map((header, hIdx) => (
                              <th key={hIdx} className="py-3.5 px-4 font-semibold">{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {section.tables.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className={`py-3.5 px-4 text-slate-700 dark:text-slate-300 leading-relaxed ${cIdx === 0 ? "font-bold text-black dark:text-white" : ""}`}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {section.tables.caption && (
                      <p className="text-[11px] font-mono text-slate-400 italic px-1">
                        {section.tables.caption}
                      </p>
                    )}
                  </div>
                )}

                {/* Code Snippets */}
                {section.codeSnippets && (
                  <div className="space-y-4">
                    {section.codeSnippets.map((snippet, snIdx) => {
                      const snippetId = `${section.id}-sn-${snIdx}`;
                      const isCopied = copiedSnippet === snippetId;

                      return (
                        <div key={snIdx} className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm bg-[#0E0E12] text-white">
                          {/* Code Header Bar */}
                          <div className="flex items-center justify-between px-4 py-2.5 bg-[#16161D] border-b border-white/5 text-xs font-mono">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Terminal className="w-3.5 h-3.5 text-blue-400" />
                              <span>{snippet.filename || snippet.language}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(snippet.code, snippetId)}
                              className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all active:scale-95"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Code Content */}
                          <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto text-slate-200 selection:bg-blue-600">
                            <code>{snippet.code}</code>
                          </pre>

                          {snippet.description && (
                            <div className="p-3 bg-white/[0.02] border-t border-white/5 text-[11px] text-slate-400 font-mono">
                              {snippet.description}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

              </section>
            ))}
          </div>

          {/* ── CHAPTER BOTTOM NAVIGATION (PREV / NEXT) ───────────────── */}
          <div className="pt-10 border-t border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevItem ? (
              <button
                type="button"
                onClick={() => selectTopic(prevItem.categoryId, prevItem.item.id)}
                className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121217] hover:border-blue-500/50 hover:shadow-md transition-all text-left space-y-1 group"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                  <span>Previous Topic</span>
                </div>
                <p className="text-sm font-bold text-black dark:text-white truncate">
                  {prevItem.item.title}
                </p>
              </button>
            ) : <div />}

            {nextItem ? (
              <button
                type="button"
                onClick={() => selectTopic(nextItem.categoryId, nextItem.item.id)}
                className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121217] hover:border-blue-500/50 hover:shadow-md transition-all text-right space-y-1 group sm:col-start-2"
              >
                <div className="flex items-center justify-end gap-1.5 text-[11px] font-mono text-slate-400">
                  <span>Next Topic</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-sm font-bold text-black dark:text-white truncate">
                  {nextItem.item.title}
                </p>
              </button>
            ) : <div />}
          </div>

        </main>

        {/* ── 03. RIGHT RAIL TABLE OF CONTENTS (3 COLS) ────────────────── */}
        <aside className="hidden xl:block xl:col-span-3 space-y-6 sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pl-4">
          
          <div className="space-y-3">
            <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              On this page
            </p>
            <nav className="space-y-1 text-xs border-l border-slate-200 dark:border-white/10 pl-3">
              {activeItem.toc.map((heading) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  className="block py-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-normal truncate"
                  style={{ textDecoration: "none" }}
                >
                  {heading.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Quick Dialect Compiler Box */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold font-mono text-[11px] uppercase">
              <Scale className="w-4 h-4" />
              <span>Jurisdictions</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
              Anchor natively compiles:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["EU AI Act", "RBI FREE-AI", "SEC Reg SCI", "FCA", "FINOS"].map((d) => (
                <span key={d} className="px-2 py-0.5 rounded bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Founder Direct Engineering Help */}
          <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2 text-xs">
            <p className="font-bold text-blue-950 dark:text-blue-200">Need Custom Dialects?</p>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              We compile enterprise-specific risk models into formal `.anchor` rules with 48-hour SLAs.
            </p>
            <a
              href="mailto:tan@animuslab.dev?subject=Anchor%20Custom%20Dialect%20Inquiry"
              className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1 text-[11px]"
              style={{ textDecoration: "none" }}
            >
              <span>Contact Founder</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

        </aside>

      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="bg-[#101014] text-white pt-20 pb-16 relative overflow-hidden rounded-t-[48px] sm:rounded-t-[64px] shadow-2xl mt-auto">
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16 border-b border-white/[0.08]">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-black shadow-sm">
                  <AnchorLogo size={18} variant="monochrome" />
                </div>
                <span className="font-bold text-xl tracking-tight text-white">anchor</span>
              </div>
              <p className="text-xs leading-relaxed max-w-sm text-slate-400 font-normal">
                Sovereign AI Governance Platform. Deterministic, cryptographically auditable governance for agentic AI systems.
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-full bg-white text-black hover:bg-slate-200 transition-all"
                  style={{ textDecoration: "none" }}
                >
                  ← Back to Home
                </Link>
              </div>
            </div>

            <nav className="space-y-3">
              <p className="text-xs font-mono font-semibold tracking-widest text-slate-400 uppercase">Platform</p>
              {[["Home", "/"], ["Documentation", "/docs"], ["Pricing Overview", "/pricing"], ["Enterprise Hub", "/login"]].map(([label, href]) => (
                <Link key={label} href={href} className="block text-xs text-slate-400 hover:text-white transition-colors" style={{ textDecoration: "none" }}>
                  {label}
                </Link>
              ))}
            </nav>

            <nav className="space-y-3">
              <p className="text-xs font-mono font-semibold tracking-widest text-slate-400 uppercase">Contact &amp; Governance</p>
              {[["Founder Contact", "mailto:tan@animuslab.dev"], ["Website", "https://animuslab.dev"], ["Terms", "#"], ["Privacy", "#"]].map(([label, href]) => (
                <Link key={label} href={href} className="block text-xs text-slate-400 hover:text-white transition-colors" style={{ textDecoration: "none" }}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
            <span>© 2026 AnimusLab · Sovereign Systems. All rights reserved.</span>
            <span>Founder: Tanishq Dasari · tan@animuslab.dev</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
