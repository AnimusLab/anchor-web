---
id: N-003
title: "Three-Tier Forensic Telemetry & SQLite Spoke Databases"
date: 2026-04-19
author: "Tanishq Dasari"
category: "Technical Essay"
excerpt: "My design decisions regarding user privacy, explaining why I built a decoupled three-tier persistence topology that keeps raw code assets off central servers."
tags:
  - Privacy
  - Telemetry
  - SQLite
  - Forensic Logs
---

When I was architecting the telemetry layer for Anchor, I faced a major dilemma. Traditional observability stacks are built to collect everything, sending raw inputs, outputs, and system logs back to a centralized cloud database for analysis. In an enterprise governance context, this is a privacy nightmare. If an intelligent agent is refactoring proprietary source code, that raw code should never leave the local environment. I refuse to build systems that force users to trust a third-party server with their intellectual property.

My solution was to design a decoupled three-tier persistence topology that isolates sensitive client payloads at the edge. At the lowest level (Tier 3), we write to a local, append-only JSONL audit chain created at the execution runtime. This file is cryptographically signed with SHA-256 to prevent tampering. In Tier 2, the fully-detailed payloads are stored in an encrypted SQLite Spoke database, `anchor.db`, hosted locally on the developer's machine or server.

At the top layer (Tier 1), the only information we transmit to the central database at `app.anchor.animuslab.dev` is a tiny, 200-byte WebSocket packet containing metadata: a unique hub identifier, a timestamp, the specific rule ID matched, and the compliance status. Central dashboards see whether a policy was violated, but they never see the code or prompts that triggered it. This is a zero-trust audit mesh, and it proves that absolute observability does not require sacrificing privacy. You can explore our telemetry boundaries on the [Architecture page](/anchor/architecture).
