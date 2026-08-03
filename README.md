# Anchor Web

The official web interface for Anchor.

## Capabilities

✓ **Public Marketing Site**: `animuslab.dev`  
✓ **Enterprise Governance Hub**: `hub.animuslab.dev`  
✓ **Regulatory Oversight Portal**: `oversight.animuslab.dev`  
✓ **AnimusLab Admin Portal**: `admin.animuslab.dev`  
✓ **Ingestion API**: `POST /api/v1/ingest`  

## System Boundaries

**Contains:**
- Web interfaces for Enterprise Teams & Regulatory Auditors
- Dual API Key ingestion endpoint (`ak_live_...` / `ak_test_...`)
- Cryptographic Decision Audit Chain (DAC) hash verification
- Regulatory Dialect Report Generation (EU AI Act, RBI FREE-AI, SEC 8-K)

**Does NOT contain:**
- Anchor CLI runtime
- Python drift engine
- Raw evidence files (these remain strictly on customer infrastructure)

---

## Architectural Principles

1. **Hybrid Data Sovereignty**: Raw inference logs and code evidence stay on premises. The Hub receives tamper-evident decision metadata hashes.
2. **Hardened Auditor Wall**: Database query wall enforces `WHERE entity_type = 'ai_agent'` across all auditor routes. Regulatory auditors never see codebase audit records.
3. **P2P Telemetry Stream & AnimusLab Relay**: Real-time telemetry streams via P2P. Government Auditor requests for forensic access are relayed through AnimusLab to Hub Managers for explicit approval.

---

## License

Licensed under the [Apache License 2.0](LICENSE).
