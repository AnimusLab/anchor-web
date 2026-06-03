# Anchor v5.0.4 - Complete Mermaid Diagram Suite

Six institutional-grade diagrams for governance architecture (NATO/DoD aesthetic).

---

## DIAGRAM I: The Sovereign Hub-Spoke Lattice
**Section:** IV | **Theme:** Federated topology architecture

```mermaid
graph TB
    subgraph Mesh ["Sovereign Hub-Spoke Lattice"]
        subgraph Spokes ["Sovereign Spokes"]
            S1["🔐 Spoke A<br/>Jurisdiction: EMEA"]
            S2["🔐 Spoke B<br/>Jurisdiction: APAC"]
            S3["🔐 Spoke C<br/>Jurisdiction: Americas"]
        end
        
        subgraph Gateways ["Relay Gateways"]
            RG1["⚡ Gateway 1<br/>Encryption: AES-256"]
            RG2["⚡ Gateway 2<br/>Encryption: AES-256"]
        end
        
        subgraph Hub ["Federated Hub"]
            FH["🌐 Hub Authority<br/>Consensus: BFT"]
        end
        
        subgraph Oversight ["Oversight Nodes"]
            ON1["👁️ Monitor A<br/>Audit: Real-time"]
            ON2["👁️ Monitor B<br/>Audit: Real-time"]
        end
    end
    
    S1 -->|Mesh Protocol| RG1
    S2 -->|Mesh Protocol| RG1
    S3 -->|Mesh Protocol| RG2
    RG1 -->|Verified Link| FH
    RG2 -->|Verified Link| FH
    FH -->|Governance State| ON1
    FH -->|Governance State| ON2
    ON1 -->|Forensic Feed| FH
    ON2 -->|Forensic Feed| FH
    
    style Mesh fill:#0f172a,stroke:#06b6d4,stroke-width:3px,color:#e0e7ff
    style S1 fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#e0e7ff
    style S2 fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#e0e7ff
    style S3 fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#e0e7ff
    style RG1 fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#e0e7ff
    style RG2 fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#e0e7ff
    style FH fill:#0f172a,stroke:#06b6d4,stroke-width:3px,color:#fbbf24
    style ON1 fill:#1e293b,stroke:#ef4444,stroke-width:2px,color:#e0e7ff
    style ON2 fill:#1e293b,stroke:#ef4444,stroke-width:2px,color:#e0e7ff
```

---

## DIAGRAM II: Four-Verb Constitutional Execution Cycle
**Section:** V | **Theme:** HANDSHAKE → INTERCEPT → HASH → REPLAY recursive loop

```mermaid
graph LR
    A["HANDSHAKE<br/>Identity Verification<br/>━━━━━━━<br/>⊢ Cryptographic Proof<br/>⊢ Authority Chain<br/>⊢ Capability Object"]
    
    B["INTERCEPT<br/>Runtime Interception<br/>━━━━━━━<br/>⊢ Policy Check<br/>⊢ Authority Validation<br/>⊢ Drift Detection"]
    
    C["HASH<br/>Semantic Commitment<br/>━━━━━━━<br/>⊢ Content Hash<br/>⊢ Lineage Proof<br/>⊢ Immutable Record"]
    
    D["REPLAY<br/>Deterministic Reconstruction<br/>━━━━━━━<br/>⊢ Event Reordering<br/>⊢ Causality Chain<br/>⊢ Constitutional Proof"]
    
    E["🔄 Recursive Feedback"]
    
    A -->|Identity Locked| B
    B -->|Policy Verified| C
    C -->|Committed| D
    D -->|Authority Valid| E
    E -->|Recursive Authority| A
    
    style A fill:#0f172a,stroke:#06b6d4,stroke-width:3px,color:#e0e7ff
    style B fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#e0e7ff
    style C fill:#1e293b,stroke:#8b5cf6,stroke-width:2px,color:#e0e7ff
    style D fill:#1e293b,stroke:#ec4899,stroke-width:2px,color:#e0e7ff
    style E fill:#020617,stroke:#06b6d4,stroke-width:3px,color:#fbbf24,font-weight:bold
```

---

## DIAGRAM III: Decision Audit Chain (DAC)
**Section:** VIII | **Theme:** Parent-linked governance lineage with semantic hashing

```mermaid
graph TB
    subgraph DAC ["Decision Audit Chain (DAC)"]
        B0["Block 0<br/>Genesis Authority<br/>━━━━━━━━<br/>Hash: 0x4a2f..."]
        
        B1["Block 1<br/>Policy Decision A<br/>━━━━━━━━<br/>Parent: 0x4a2f...<br/>Hash: 0x7d1b..."]
        
        B2["Block 2<br/>Policy Decision B<br/>━━━━━━━━<br/>Parent: 0x7d1b...<br/>Hash: 0x3e9c..."]
        
        B3["Block 3<br/>Governance Mutation<br/>━━━━━━━━<br/>Parent: 0x3e9c...<br/>Hash: 0x5f2a..."]
        
        B4["Block 4<br/>Replay Proof<br/>━━━━━━━━<br/>Parent: 0x5f2a...<br/>Hash: 0x9d8c..."]
    end
    
    B0 -->|Parent Link| B1
    B1 -->|Parent Link| B2
    B2 -->|Parent Link| B3
    B3 -->|Parent Link| B4
    
    B0 -.->|Verification| B4
    
    style DAC fill:#0f172a,stroke:#06b6d4,stroke-width:3px,color:#e0e7ff
    style B0 fill:#1e293b,stroke:#22c55e,stroke-width:2px,color:#e0e7ff
    style B1 fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#e0e7ff
    style B2 fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#e0e7ff
    style B3 fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#e0e7ff
    style B4 fill:#1e293b,stroke:#ef4444,stroke-width:2px,color:#e0e7ff
```

---

## DIAGRAM IV: Cross-Jurisdiction Constitutional Translation
**Section:** XI | **Theme:** Semantic equivalence engine bridging regulatory dialects

```mermaid
graph LR
    subgraph Input ["Canonical Event"]
        I["Decision Event<br/>━━━━━━━━<br/>Risk: MEDIUM<br/>Type: Autonomous<br/>Authority: Level-3"]
    end
    
    subgraph Engine ["Semantic Translation Engine"]
        T["Policy Compiler<br/>━━━━━━━━<br/>⊢ Normalization<br/>⊢ Jurisdiction Map<br/>⊢ Dialect Compile"]
    end
    
    subgraph Dialects ["Jurisdictional Output"]
        D1["RBI Compliance<br/>━━━━━━━━<br/>Clause: 4.2.1<br/>Status: COMPLIANT"]
        D2["EU AI Act<br/>━━━━━━━━<br/>Article: 14(5)<br/>Status: APPROVED"]
        D3["SEC Governance<br/>━━━━━━━━<br/>Rule: AI-2024-7<br/>Status: VERIFIED"]
    end
    
    I -->|Canonical Form| T
    T -->|RBI Translate| D1
    T -->|EU Translate| D2
    T -->|SEC Translate| D3
    
    style Input fill:#0f172a,stroke:#06b6d4,stroke-width:2px,color:#e0e7ff
    style I fill:#1e293b,stroke:#06b6d4,stroke-width:2px,color:#e0e7ff
    style Engine fill:#0f172a,stroke:#8b5cf6,stroke-width:3px,color:#e0e7ff
    style T fill:#1e293b,stroke:#8b5cf6,stroke-width:2px,color:#e0e7ff
    style Dialects fill:#0f172a,stroke:#06b6d4,stroke-width:2px,color:#e0e7ff
    style D1 fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#e0e7ff
    style D2 fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#e0e7ff
    style D3 fill:#1e293b,stroke:#22c55e,stroke-width:2px,color:#e0e7ff
```

---

## DIAGRAM V: Diamond Cage Differential Verification
**Section:** XIII | **Theme:** Twin WASM execution paths with behavioral comparison

```mermaid
graph TB
    subgraph DC ["Diamond Cage Architecture"]
        subgraph Path1 ["Execution Path A"]
            WA["WASM Runtime A<br/>━━━━━━━━<br/>⊢ Policy Enforcement<br/>⊢ State Tracking<br/>⊢ Event Capture"]
        end
        
        subgraph Path2 ["Execution Path B"]
            WB["WASM Runtime B<br/>━━━━━━━━<br/>⊢ Policy Enforcement<br/>⊢ State Tracking<br/>⊢ Event Capture"]
        end
        
        subgraph Comp ["Behavioral Comparator"]
            BC["Differential Verifier<br/>━━━━━━━━<br/>⊢ Output Comparison<br/>⊢ Mutation Detection<br/>⊢ Divergence Alert"]
        end
    end
    
    Input["Runtime Input<br/>Decision Event"]
    Output["Verified Output<br/>Constitutional OK"]
    
    Input -->|Twin Path| WA
    Input -->|Twin Path| WB
    WA -->|Execution Result| BC
    WB -->|Execution Result| BC
    BC -->|Behavioral Match| Output
    
    style DC fill:#0f172a,stroke:#06b6d4,stroke-width:3px,color:#e0e7ff
    style Path1 fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#e0e7ff
    style Path2 fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#e0e7ff
    style WA fill:#1e293b,stroke:#3b82f6,stroke-width:1px,color:#e0e7ff
    style WB fill:#1e293b,stroke:#3b82f6,stroke-width:1px,color:#e0e7ff
    style Comp fill:#1e293b,stroke:#ef4444,stroke-width:2px,color:#e0e7ff
    style BC fill:#1e293b,stroke:#ef4444,stroke-width:2px,color:#e0e7ff
    style Input fill:#020617,stroke:#06b6d4,stroke-width:2px,color:#fbbf24
    style Output fill:#020617,stroke:#22c55e,stroke-width:2px,color:#fbbf24
```

---

## DIAGRAM VI: Institutional Identity Subtype Gating
**Section:** XVI | **Theme:** Context filters and capability manifest compilation

```mermaid
graph TB
    subgraph Gate ["Governance Identity Gating"]
        subgraph Request ["Authorization Request"]
            R["Identity Token<br/>━━━━━━━━<br/>User: aud_001<br/>Scope: cross_hub<br/>Jurisdiction: IN"]
        end
        
        subgraph Filters ["Context Filters"]
            F1["Scope Validator<br/>━━━━━━<br/>✓ cross_hub"]
            F2["Jurisdiction Check<br/>━━━━━━<br/>✓ RBI Approved"]
            F3["Capability Audit<br/>━━━━━━<br/>✓ Export Auth"]
        end
        
        subgraph Manifest ["Capability Manifest"]
            M1["Visibility: ORG_WIDE"]
            M2["Replay: RESTRICTED"]
            M3["Forensic: DENIED"]
        end
        
        subgraph Grant ["Access Grant"]
            G["Signed Capability Token<br/>━━━━━━━<br/>Exp: +24h<br/>Nonce: 0x7f2a..."]
        end
    end
    
    R -->|Pass| F1
    F1 -->|Validate| F2
    F2 -->|Verify| F3
    F3 -->|Compile| M1
    F3 -->|Compile| M2
    F3 -->|Compile| M3
    M1 -->|Token| G
    M2 -->|Token| G
    M3 -->|Token| G
    
    style Gate fill:#0f172a,stroke:#06b6d4,stroke-width:3px,color:#e0e7ff
    style Request fill:#1e293b,stroke:#06b6d4,stroke-width:2px,color:#e0e7ff
    style R fill:#1e293b,stroke:#06b6d4,stroke-width:1px,color:#e0e7ff
    style Filters fill:#1e293b,stroke:#8b5cf6,stroke-width:2px,color:#e0e7ff
    style F1 fill:#1e293b,stroke:#3b82f6,stroke-width:1px,color:#e0e7ff
    style F2 fill:#1e293b,stroke:#3b82f6,stroke-width:1px,color:#e0e7ff
    style F3 fill:#1e293b,stroke:#3b82f6,stroke-width:1px,color:#e0e7ff
    style Manifest fill:#1e293b,stroke:#22c55e,stroke-width:2px,color:#e0e7ff
    style M1 fill:#1e293b,stroke:#22c55e,stroke-width:1px,color:#e0e7ff
    style M2 fill:#1e293b,stroke:#22c55e,stroke-width:1px,color:#e0e7ff
    style M3 fill:#1e293b,stroke:#22c55e,stroke-width:1px,color:#e0e7ff
    style Grant fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#e0e7ff
    style G fill:#1e293b,stroke:#f59e0b,stroke-width:1px,color:#e0e7ff
```

---

## Design Specifications

| Element | Value | Hex Code |
|---------|-------|----------|
| **Background** | Dark Navy | `#0f172a` |
| **Deep Background** | Darker Navy | `#020617` |
| **Midtone** | Slate-800 | `#1e293b` |
| **Primary Accent** | Cyan (Anchor) | `#06b6d4` |
| **Secondary** | Blue | `#3b82f6` |
| **Tertiary** | Purple | `#8b5cf6` |
| **Warning** | Amber | `#f59e0b` |
| **Critical** | Red | `#ef4444` |
| **Success** | Green | `#22c55e` |
| **Accent** | Pink | `#ec4899` |
| **Text** | Light Slate | `#e0e7ff` |
| **Highlight** | Amber-300 | `#fbbf24` |

---

## Usage

1. **Live Preview**: Visit [mermaid.live](https://mermaid.live)
2. **Copy & Paste**: Copy each code block above (starting with `graph`)
3. **Markdown**: Wrap with ` ```mermaid` and ` ``` `
4. **PDF Embedding**: Use `mermaid-cli` to convert to SVG/PNG
5. **Documentation**: Add to Anchor governance architecture documentation

### Installation (for local rendering):

```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i diagram.mmd -o diagram.svg
```

---

## Diagram Placement in PDF

| Diagram | Section | Pages |
|---------|---------|-------|
| I | IV | ~50-60 |
| II | V | ~65-75 |
| III | VIII | ~110-130 |
| IV | XI | ~160-180 |
| V | XIII | ~250-280 |
| VI | XVI | ~350-380 |

---

All diagrams follow **NATO/DoD institutional aesthetic** with high-contrast stroking, dense node structures, and professional governance terminology.
