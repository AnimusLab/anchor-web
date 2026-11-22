import Link from "next/link";

export const metadata = { title: "Terms of Service | AnimusLab" };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#09090C] text-slate-900 dark:text-slate-100 px-6 py-24">
      <article className="max-w-3xl mx-auto space-y-6 text-sm leading-relaxed">
        <h1 className="text-3xl font-extrabold">Terms of Service</h1>
        <p className="text-slate-600 dark:text-slate-400">Last updated: October 2026. Draft for review; contact tan@animuslab.dev with questions.</p>

        <h2 className="text-xl font-bold pt-4">Open-source software</h2>
        <p>The Anchor library is licensed under the Apache License 2.0 and is provided &quot;as is&quot;, without warranty.</p>

        <h2 className="text-xl font-bold pt-4">Not legal advice</h2>
        <p>Anchor rules map to the provisions they relate to. A rule match is a technical finding, not a legal determination of compliance or violation. Consult qualified counsel for legal conclusions.</p>

        <h2 className="text-xl font-bold pt-4">Coverage and limits</h2>
        <p>Runtime checks apply only to functions you wrap with <code>@guard</code>. Pattern-based checks can be circumvented by rephrasing, so Anchor should be used as one layer of a defense-in-depth strategy.</p>

        <h2 className="text-xl font-bold pt-4">Paid services</h2>
        <p>Assessments, hub access and support are governed by the order form or contract agreed with AnimusLab.</p>

        <p className="pt-4"><Link href="/" className="underline">Back to home</Link></p>
      </article>
    </main>
  );
}
