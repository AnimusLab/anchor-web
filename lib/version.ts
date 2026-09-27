/**
 * Anchor package version — single source of truth for all UI version strings.
 *
 * The actual version is resolved at BUILD TIME in next.config.mjs by fetching
 * the PyPI JSON API. It is embedded as NEXT_PUBLIC_ANCHOR_VERSION and available
 * in every server and client component without any runtime fetch.
 *
 * Auto-update flow:
 *   1. `anchor-audit` is published to PyPI on each release.
 *   2. .github/workflows/deploy-web.yml in the Anchor repo fires on every
 *      new version tag (v*.*.*) and triggers a Vercel deploy hook.
 *   3. Vercel rebuilds anchor-web; next.config.mjs re-fetches from PyPI and
 *      bakes the new version into the build.
 *   4. Every string that imports ANCHOR_VERSION here updates automatically —
 *      no manual edits required in anchor-web.
 *
 * Fallback: if PyPI was unreachable at the last build, this will return the
 * fallback value set in next.config.mjs ("6.0.2"). Update that fallback
 * manually only after repeated build failures.
 */

export const ANCHOR_VERSION: string =
  process.env.NEXT_PUBLIC_ANCHOR_VERSION ?? "6.0.2";

/** e.g. "v6.0.2" */
export const ANCHOR_VERSION_TAG: string = `v${ANCHOR_VERSION}`;

/** e.g. "Anchor Protocol (v6.0.2)" */
export const ANCHOR_VERSION_LABEL: string = `Anchor Protocol (${ANCHOR_VERSION_TAG})`;

/** e.g. "Core Protocol v6.0.2" */
export const ANCHOR_CORE_LABEL: string = `Core Protocol ${ANCHOR_VERSION_TAG}`;
