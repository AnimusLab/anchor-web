/** @type {import('next').NextConfig} */

async function fetchAnchorVersion() {
  try {
    const res = await fetch("https://pypi.org/pypi/anchor-audit/json", {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`PyPI ${res.status}`);
    const data = await res.json();
    const v = data?.info?.version;
    if (!v || !/^\d+\.\d+\.\d+/.test(v)) throw new Error("Unexpected version shape");
    console.log(`[next.config] anchor-audit version from PyPI: ${v}`);
    return v;
  } catch (err) {
    const fallback = "6.0.2";
    console.warn(`[next.config] PyPI fetch failed, using fallback ${fallback}:`, err.message);
    return fallback;
  }
}

const anchorVersion = await fetchAnchorVersion();

const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  env: {
    // Embedded at build time — available in server and client components as
    // process.env.NEXT_PUBLIC_ANCHOR_VERSION (e.g. "6.0.2")
    // Automatically refreshed on every Vercel build triggered by a new Anchor tag.
    NEXT_PUBLIC_ANCHOR_VERSION: anchorVersion,
  },
};

export default nextConfig;

