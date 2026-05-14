# Anchor — Explained Like You Built It (Part 2: The Runtime Interceptor and Audit Chain)

## Layer 2: The Runtime Interceptor

Layer 1 catches problems before deployment. Layer 2 catches problems during deployment. It runs inside the live application, intercepting every AI call in real time. This is the part of Anchor that operates in production, silently, on every single prompt and response.

The entire runtime activates with a single line of code: "import anchor.runtime". The moment Python processes this import statement, the __init__.py file in the runtime module executes two things. First, it calls a function called _load_custom_providers_from_policy, which reads the .anchor/policy.anchor file and registers any custom AI providers the company has declared. Second, it calls activate() with the default mode of "block." From this point forward, every AI call the application makes is governed.

The activate function installs two layers of interception. The first layer is SDK-level monkey-patching. The system imports a library called wrapt, which is a Python function-wrapping utility, and uses it to patch the core methods of nine AI SDKs. For OpenAI, it patches openai.chat.completions.create. For Anthropic, it patches anthropic.messages.create. For Google Gemini, it patches google.generativeai.GenerativeModel.generate_content. For LangChain, it patches the BaseLanguageModel.invoke method. For Ollama, it patches ollama.chat. For Groq, Cohere, Mistral, and HuggingFace Transformers, it patches their respective chat or pipeline methods. The patching is conditional — if the developer has not installed a particular SDK, the patcher simply skips it without error. The function returns a list of successfully patched providers so the developer knows exactly which SDKs are being governed.

The second layer is the HTTP backstop. Even if a developer uses an SDK that Anchor does not explicitly patch, or if they make raw HTTP calls using the requests or httpx libraries, the backstop catches those calls. It monkey-patches requests.Session.send and httpx.Client.send. When a patched send method fires, it extracts the URL from the outgoing request and passes it to identify_provider(), which checks the URL against a registry of over thirty known AI API domains. This registry includes all the major providers — api.openai.com, api.anthropic.com, generativelanguage.googleapis.com, api.groq.com, api.together.xyz, api.deepseek.com, api.cerebras.ai — plus cloud AI services like Azure OpenAI, AWS Bedrock, and Google Vertex AI, and even local model servers like Ollama on localhost:11434 and LM Studio on localhost:1234. If the URL matches a known AI provider, the backstop kicks in and scans the request body before it leaves the application.

There is an important engineering detail here: re-entrancy protection. When Anchor itself needs to make HTTP calls (for example, to POST an audit entry to the ANCHOR_LEDGER_URL), those calls must not be intercepted by the backstop, or you would get an infinite loop. The code handles this with a thread-local flag called _in_anchor_call. Before making its own HTTP calls, Anchor sets this flag to True. The patched send method checks this flag and, if it is True, passes the call through to the original unpatched method without any scanning.

### What Happens When Your Code Makes an AI Call

Let me walk through exactly what happens when your application calls openai.chat.completions.create with a list of messages.

The wrapt patch intercepts the call before it reaches OpenAI's library. The interceptor extracts the messages from the keyword arguments. It concatenates all message contents into a single string, prefixed by their roles — "[system] You are a helpful assistant. [user] What is the weather?" — and passes this string to the prompt scanner.

The prompt scanner checks the text against the constitutional rules. It looks for prompt injection patterns, jailbreak attempts, PII in outgoing prompts (social security numbers, credit card numbers, email addresses), credential exposure (API keys, passwords), and data exfiltration patterns. Each match produces a Finding object containing the rule ID, the severity, a human-readable message, and a snippet of the offending text.

What happens next depends on the mode. There are three modes: block, warn, and audit.

In block mode, if any finding has a severity of error or blocker, the interceptor raises an AnchorViolationError. This is a standard Python exception that inherits from Exception. It is not os.kill(). It is not sys.exit(). It does not terminate the process. The application's try/except block catches it just like any other exception. The developer's code can then substitute a safe response — "I'm sorry, I can't process that request" — and the user's session continues uninterrupted. The prompt never reaches the AI model. The dangerous content is surgically blocked at the application boundary.

In warn mode, the interceptor logs the violation as a warning but allows the call to proceed. The prompt goes through to OpenAI, the response comes back, and the application continues normally. The violation is still recorded in the audit chain.

In audit mode, the interceptor does nothing visible at all. No warnings, no blocks, no logs to stdout. It silently records the violation in the cryptographic audit chain and moves on. This mode is for organizations that want full observability without any risk of disrupting their production systems.

After the prompt scan (and potential block), the interceptor calls the original SDK method. The actual OpenAI API call executes. The response comes back. The interceptor then captures the response text and runs it through the response scanner.

The response scanner looks for different things than the prompt scanner. It checks for secrets leaking in the response (AWS keys, private keys, database connection strings), shell command injection (the AI suggesting "rm -rf /" or other dangerous commands), SQL injection patterns, PII in the output (the AI generating fake or real social security numbers), and insecure code patterns. The response scanner uses both the constitutional rules (checking the runtime_pattern field on each rule) and a hardcoded set of compiled regex patterns as a backstop. The constitutional rules take priority — if a canonical rule already triggered on a pattern, the backstop skips it to avoid double-reporting.

The response scanner never blocks. The response has already arrived from the AI model — you cannot un-receive it. Instead, the scanner records any findings and logs them. The application layer decides what to do with a flagged response (show it, redact it, or discard it).

### The AnchorGuard API

For developers who are building their own AI systems and not using standard SDKs, Anchor provides a first-party integration class called AnchorGuard. You instantiate it with a provider name and a mode, and then call two methods: scan_prompt and scan_response. This gives developers explicit control over when scanning happens, rather than relying on the automatic monkey-patching.

The AnchorGuard uses the exact same scanning logic as the automatic interceptors. Under the hood, scan_prompt and scan_response call the same functions. The difference is that the developer controls the integration points rather than having them auto-injected.

### The @enforce Decorator

There is also a decorator called @enforce for wrapping custom AI functions. You put @enforce(mode="conversational", jurisdiction="IN") above any function, and the decorator will run the function normally, then scan its return value through the response pipeline and log the result to the audit chain. The decorator never interrupts the function — it follows the "Audit-Not-Block" architecture. The audit result is attached to the return value as a _anchor_audit attribute for convenience, but the primary record is always the side-effect written to the cryptographic ledger.

## The Cryptographic Audit Chain

Every single runtime decision — every prompt scanned, every response checked, every violation detected or clean pass confirmed — is recorded in a cryptographic audit chain. This is the evidentiary backbone of the entire system.

The chain is managed by a singleton class called DecisionAuditor. The first time it is instantiated, it warms up by loading the constitutional rules and building an Aho-Corasick automaton for ethics compliance checking. The Aho-Corasick automaton is a multi-pattern string matching algorithm that can check text against hundreds of prohibited patterns in a single pass. It is used specifically for ETH domain compliance — checking whether the AI's response uses prohibited proxy variables (like zip code as a proxy for race in lending) or fails explainability requirements.

When the auditor records a decision, it creates an AuditEntry. This entry has a specific structure that I need to explain because it is the core data model of the entire system.

The entry contains five universal primitives, inspired by the formal verification concept of recording Actions on Objects in Contexts by Authorities through Flows. The action field records what happened (for example, "ai_decision" or "prompt_block"). The object field records what was affected ("llm_output" or "credit_application"). The context field records the jurisdiction ("global" or "retail_banking_india"). The authority field records who made the decision ("anchor" or "credit_llm_v4"). The flow field records how the decision moved through the system ("runtime_audit" or "api_egress"). These five primitives are the canonical truth of the record. Everything else is derived from them.

The entry also contains cryptographic fields. The findings_hash is a SHA-256 hash of the serialized findings list. The chain_hash is a SHA-256 hash of the previous entry's chain_hash concatenated with the current findings_hash. This means every entry cryptographically depends on the entry before it. If someone modifies a record in the middle of the chain, every chain_hash downstream will be wrong, and the tampering is immediately detectable.

The signature field is an HMAC-SHA256 digest of the chain_hash, keyed by the ANCHOR_SECRET_KEY environment variable. This ties the signature to the deploying entity. A different key produces a different signature, so you cannot copy audit records from one organization to another without the forgery being detectable. If the ANCHOR_SECRET_KEY is not set, the signature field is simply null. The system still works — the chain hashing alone provides tamper evidence — but the signature adds entity-level non-repudiation for production deployments.

The chain is written to a local JSONL file at .anchor/runtime_chain.jsonl. Each line is one complete JSON audit entry. This file grows over the lifetime of the application. It can be independently verified by any tool that knows how to compute SHA-256 and HMAC.

If the ANCHOR_LEDGER_URL environment variable is set, the auditor also performs an HTTP POST of the audit entry to that URL. This is a fire-and-forget call — it does not block the application if the URL is unreachable. In the Sovereign Mesh architecture, this URL points to the Spoke node's /api/spoke/ingest endpoint, which stores the full payload locally and relays metadata to the Hub. But any HTTP endpoint that accepts JSON can serve as the ledger URL. A company could point it at a Splunk ingestion endpoint, a Datadog webhook, or their own internal compliance API.

## Multi-Dialect Regulatory Translation

One of the most powerful features of the AuditEntry is its ability to translate itself into different regulatory formats. The same violation record can be exported as three different documents depending on who is requesting it.

The to_rbi_json method maps the entry to the RBI's FREE-AI framework, specifically Pillar 2 and the Seven Sutras. It uses the rule ID prefix to determine which Sutra applies: ETH rules map to Fairness (Sutra 4) and Explainability (Sutra 7), SEC rules map to Cyber Resilience (Sutra 5), PRV rules map to Data Sovereignty (Sutra 3), and governance rules map to Governance and Accountability (Sutra 6). The output includes the branch context, the severity level (CRITICAL for violations, LOW for clean passes), and the chain verification hash.

The to_sec_json method maps the entry to SEC Regulation S-K, specifically Item 1.05 which covers material AI risk events. It categorizes the event as "Algorithmic Risk Management," describes the breach, notes that it was effectively mitigated via the Anchor interceptor, and includes a truncated verification hash prefixed with "sha256:". This is the format a publicly traded company would use to document AI governance events for their 8-K filings.

The to_eu_article12_json method maps the entry to Article 12.2 of the EU AI Act, which requires automatic recording of events for high-risk AI systems. It includes the system ID, the period of use, the event type, a preview of the input data, the reference database (the Anchor constitution version), whether a human-in-the-loop was notified, a conformity declaration referencing ISO/IEC 42001:2023, and the HMAC signature as an integrity proof.

All three translations operate on the exact same underlying data. The violation does not change. Only the presentation layer changes. A webhook subscription in the Sovereign Mesh can be configured with a dialect parameter — "RBI", "SEC", or "EU" — and the dispatch manager will automatically translate the audit entry into the appropriate format before delivering it.
