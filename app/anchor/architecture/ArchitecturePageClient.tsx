'use client';

import React from 'react';
import MermaidDiagram from '../../components/MermaidDiagram';
import SovereignBoundary from '../../components/SovereignBoundary';

const CHART_SYSTEM_OVERVIEW = `
graph TB
    subgraph PKG["anchor (PyPI Package)"]
        L1["Layer 1 - Static Compliance Engine"]
        L2["Layer 2 - Runtime Interceptor"]
        DC["Diamond Cage - WASM Sandbox"]
        GOV["Governance Federation\\n9 Domains · 6 Regulators · 3 Frameworks"]
    end

    subgraph MESH["anchor-web (Sovereign Mesh)"]
        HUB["Hub Node - FastAPI Master"]
        SPOKE["Spoke Node - Enterprise Local Data Plane"]
        FE["Frontend Portals - 4 React Apps"]
    end

    L1 -->|"AST violations"| GOV
    L2 -->|"runtime audit chain"| GOV
    DC -->|"behavioral verification"| L1
    L2 -->|"HMAC-signed JSONL"| SPOKE
    SPOKE -->|"WebSocket relay (metadata only)"| HUB
    HUB -->|"REST API"| FE
`;

const CHART_GLOBAL_TOPOLOGY = `
graph TB
    subgraph PUBLIC["Public Internet"]
        USER_ENT["Enterprise User"]
        USER_OVR["Auditor / Regulator"]
    end

    subgraph PORTALS["Frontend Portals"]
        DASH["Dashboard Portal (React 19)"]
        AUDIT["Auditor Oversight Portal"]
    end

    subgraph CLOUD["Sovereign Cloud Hub (Neon Postgres)"]
        HUB_API["Central Hub Gateway"]
        LEDGER["Federated Compliance Ledger"]
    end

    subgraph LOCAL["Enterprise Network Boundary"]
        SPOKE_API["Spoke Local Node"]
        AGENT_RUN["Agent Host Application"]
        SDK["anchor-audit (SDK)"]
        DB_CELL["Local Isolated SQLite Cell"]
    end

    USER_ENT -->|HTTPS| DASH
    USER_OVR -->|HTTPS| AUDIT
    DASH -->|REST API| HUB_API
    AUDIT -->|REST API| HUB_API
    
    AGENT_RUN -->|Imports| SDK
    SDK -->|Tamper-evident logs| DB_CELL
    SPOKE_API -->|Audit synchronization| DB_CELL
    
    SPOKE_API -->|Zero-Knowledge Hash Sync| HUB_API
    HUB_API -->|Neon Transaction| LEDGER
`;

export default function AnchorArchitecture() {
  return (
    <div className="space-y-16 animate-fadeIn">
      {/* SECTION HEADER */}
      <div className="space-y-4">
        <span className="text-xs text-neutral-500 font-mono uppercase tracking-widest">// System_Architecture</span>
        <h3 className="text-2xl text-white font-semibold tracking-tight border-b border-neutral-900 pb-2">
          Sovereign Telemetry & Network Topology
        </h3>
        <p className="text-sm text-neutral-400 font-light leading-relaxed max-w-3xl">
          Anchor uses a decoupled, three-tier architecture designed to keep high-sensitivity application data, source code, and developer context within the enterprise boundary (the Spoke Node) while transmitting cryptographic compliance digests upstream to the regulatory Hub Node.
        </p>
      </div>

      {/* SOVEREIGN TELEMETRY INTERACTIVE MODEL */}
      <section className="space-y-4">
        <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">// Interactive Boundary Telemetry</h4>
        <p className="text-xs text-neutral-400 font-light">
          Interact with the telemetry cell simulator below to inspect how sensitive parameters are isolated on-premises, and only temporal compliance hashes are relayed to central ledgers.
        </p>
        <SovereignBoundary />
      </section>

      {/* MERMAID SYSTEM FLOWCHARTS */}
      <section className="space-y-12 pt-8 border-t border-neutral-900">
        <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">// Structural Flow Diagrams</h4>
        
        <div className="space-y-12">
          {/* Chart 1 */}
          <div className="space-y-4">
            <span className="text-[10px] text-neutral-500 font-mono uppercase block">
              // Figure 1.0 - Decoupled Package & Mesh Topology
            </span>
            <div className="border border-neutral-900 bg-[#080808]/20 rounded-lg p-6">
              <MermaidDiagram chart={CHART_SYSTEM_OVERVIEW} label="DECOUPLED_MESH" />
            </div>
          </div>

          {/* Chart 2 */}
          <div className="space-y-4 pt-6 border-t border-neutral-900/40">
            <span className="text-[10px] text-neutral-500 font-mono uppercase block">
              // Figure 2.0 - Global Zero-Knowledge Telemetry Route
            </span>
            <div className="border border-neutral-900 bg-[#080808]/20 rounded-lg p-6">
              <MermaidDiagram chart={CHART_GLOBAL_TOPOLOGY} label="GLOBAL_TELEMETRY" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
