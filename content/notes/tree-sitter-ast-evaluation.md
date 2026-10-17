---
id: N-002
title: "Tree-Sitter AST & Multi-Language Adapters in PolicyEngine"
date: 2026-05-12
author: "Tanishq Dasari"
category: "Design Note"
excerpt: "My technical thesis on why post-inference scanning is a systemic failure, and how I built the PolicyEngine to scan code structures at the AST level using Tree-Sitter."
tags:
  - Governance
  - AST Scanning
  - Tree-sitter
  - PolicyEngine
---

I have always believed that scanning model outputs after they are generated is a losing battle. If you wait until a model has already generated code or formulated a response, you are attempting to catch water with a net. The damage has already been conceived, and in high-stakes environments, a post-hoc regex or safety classifier is simply security theater. I designed the AnimusLab PolicyEngine to solve this by moving the interception point to the compile-time Abstract Syntax Tree (AST) level. By parsing the structure of the developer's intent before a single token of context is compiled or executed, we establish a mathematical boundary.

To achieve this across varying environments, I leveraged Tree-Sitter to construct multi-language adapters. In the [Anchor Overview](/anchor), we map queries that scan for specific structural signatures. For instance, if an agent tries to import a public HTTP library or initiate an environment variable harvest, the engine catches it. We don't read text; we evaluate syntax trees. If a node violates any rule sealed in the [Constitution page](/constitution), execution stops instantly.

My personal stance is that safety must be built into the grammar of system operations. By emitting inline suppression warnings in the code, or forcing thread halts via custom exceptions, we make compliance deterministic. Every violation is linked to the codebase's git history, meaning we get absolute accountability. You can read more about how this integrates with our core stack on the [Anchor Overview page](/anchor) or review the full specifications in the [Anchor Whitepaper](/anchor/whitepaper).
