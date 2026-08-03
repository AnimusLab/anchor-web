import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-4xl mx-auto">
      <Link href="/" className="inline-flex items-center space-x-2 text-slate-400 hover:text-slate-200 mb-8 text-sm">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>
      <div className="flex items-center space-x-3 mb-6">
        <BookOpen className="w-8 h-8 text-emerald-400" />
        <h1 className="text-3xl font-bold tracking-tight">Anchor Documentation</h1>
      </div>
      <p className="text-slate-400 mb-8">
        Official documentation for Anchor CLI integration, dialect schemas, and Governance Hub configuration.
      </p>
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
        <h2 className="text-xl font-semibold text-slate-200">Ingestion API Specification</h2>
        <p className="text-sm text-slate-400">
          Send decision audit records directly to your Hub via standard HTTP POST requests:
        </p>
        <pre className="bg-slate-950 p-4 rounded border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
{`POST /api/v1/ingest
Authorization: Bearer ak_live_xxxxxxxxxxxxxxxx

{
  "project": "payments-service",
  "entity_type": "ai_agent",
  "payload": {
    "decision_id": "dec_8921",
    "status": "COMPLIANT",
    "dialect": "RBI"
  },
  "chain_hash": "0x8f2a...9a12"
}`}
        </pre>
      </div>
    </div>
  );
}
