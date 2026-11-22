import Link from "next/link";

export const metadata = { title: "Privacy Policy | AnimusLab" };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#09090C] text-slate-900 dark:text-slate-100 px-6 py-24">
      <article className="max-w-3xl mx-auto space-y-6 text-sm leading-relaxed">
        <h1 className="text-3xl font-extrabold">Privacy Policy</h1>
        <p className="text-slate-600 dark:text-slate-400">Last updated: October 2026. Draft for review; contact tan@animuslab.dev with questions.</p>

        <h2 className="text-xl font-bold pt-4">The open-source library (anchor-audit)</h2>
        <p>The library does not contact any server by default. Telemetry is opt-in (set <code>ANCHOR_TELEMETRY=on</code>). When enabled it sends only the fields documented at <a className="underline" href="https://github.com/AnimusLab/Anchor/blob/main/docs/telemetry.md">docs/telemetry.md</a>: event ID, tenant ID, project name, node key fingerprint, verdict, risk score, and violation metadata (rule ID, severity, file/function path). Source code and call payloads are not sent.</p>

        <h2 className="text-xl font-bold pt-4">This website and the hub</h2>
        <p>If you create an account or request access we store the information you provide (such as name, email and organization) and operational logs needed to run the service. We use it to provide and secure the service and to contact you about it. We do not sell personal data.</p>

        <h2 className="text-xl font-bold pt-4">Your choices</h2>
        <p>You can request access to or deletion of your account data by emailing tan@animuslab.dev.</p>

        <p className="pt-4"><Link href="/" className="underline">Back to home</Link></p>
      </article>
    </main>
  );
}
