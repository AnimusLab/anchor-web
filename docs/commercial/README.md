# Anchor Contract Package

**Reference:** `ANC-PKG-2026-0104`  
**Status:** illustrative specimen / draft for legal review  
**Not legal advice.** Have a qualified contracts lawyer review the package before it is used with a real customer.

This directory replaces the earlier two-document demo (`checkout-receipt.html` and `order-form-contract.html`,
now under `archive/`). The new set is a complete commercial package rather than a single order form with an
embedded summary.

## Documents

| # | Document | PDF | Status |
|---|---|---|---|
| 00 | Document Index & order of precedence | `00-document-index.pdf` | Complete |
| 01 | Order Form `ANC-OF-2026-0104` | `01-order-form.pdf` | 3 pages |
| 02 | Tax Invoice `ANC-INV-2026-0104` | `02-invoice.pdf` | 1 page |
| 03 | Receipt `ANC-RCT-2026-0104` | `03-receipt.pdf` | 1 page |
| 04 | Master Subscription Agreement (MSA v2.1) | `04-msa.pdf` | 5 pages |
| 05 | Data Processing Agreement (DPA) | `05-dpa.pdf` | 2 pages |
| 06 | Service Level Agreement (SLA) | `06-sla.pdf` | 2 pages |
| 07 | Security Schedule | `07-security-schedule.pdf` | Outline |
| 08 | Acceptable Use Policy | `08-acceptable-use-policy.pdf` | Outline |
| 09 | Detached Integrity Certificate | `09-integrity-certificate.pdf` | Hashes of the PDFs |

A combined 19-page package is also available as
`Anchor-Contract-Package-ANC-PKG-2026-0104.pdf`.

## What changed after the review

1. **Empty-input hash removed.** No document prints its own SHA-256. The build now produces a detached
   `09-integrity-certificate.pdf` and `integrity-certificate.json` containing the SHA-256 of each issued PDF.
2. **Execution is internally consistent.** The Order Form is marked `Executed — illustrative`, with visible
   signature marks and e-signature metadata. The Invoice and Receipt are consistent with that status and are
   clearly labelled as illustrative specimens.
3. **One billing model.** Full-term prepayment: one invoice on execution, Net 30, no annual invoices. The
   conflicting "annual upfront / Net 30 / full-term prepay" language is gone.
4. **Provider identity is not invented.** Registration number, GSTIN, LUT, registered address and bank details
   are explicit placeholders. There is no fake SWIFT code.
5. **One customer entity.** Acme Financial Technologies Ltd. is the contracting, billing and receipt party.
   The earlier Acme UK Holdings split is removed.
6. **Full agreement set.** The Order Form is short and commercial; the legal terms live in MSA v2.1, the DPA,
   the SLA, the Security Schedule and the Acceptable Use Policy. The index states the order of precedence.
7. **Compliance claims are scoped.** References to the EU AI Act, UK FCA/PRA expectations and DORA are
   design commitments that support the Customer's compliance programme, not warranties of compliance.
   SEC Reg SCI and RBI references are removed for this UK customer. The "never receives" wording is replaced
   with a scoped data-minimisation commitment.
8. **Retention is aligned.** DAC retention defaults to 5 years and is configurable up to 7. The DPA explains
   how erasure requests are handled against an immutable chain.
9. **Manifest structure is complete.** The manifest shows `issued_at`, term dates, a nonce, canonicalisation,
   algorithm, key ID and a signature field. It explicitly states that a manifest without a populated signature
   is not a valid entitlement record.
10. **Standard document names.** The set uses Order Form, Tax Invoice and Receipt. The invoice carries a VAT/GST
    legend and a bank block. The receipt states that it is not a tax invoice.
11. **Year convention is consistent.** Document numbers, invoice date and receipt date are all in the 2026
    series. The service term starts on 1 January 2027.
12. **Onboarding claim is backed by code.** The receipt describes the single-use token because the flow now
    exists in the repository; see below.

## Onboarding invitation flow (code)

The commercial documents describe a private, single-use onboarding link. The implementation lives here:

- `prisma/schema.prisma` — `OnboardingInvitation` model (token hash, expiry, revocation, consumption, delivery state).
- `lib/onboarding/invitations.ts` — token generation, SHA-256 hashing, activation gate, atomic redemption, revocation.
- `lib/onboarding/provision.ts` — atomic redemption plus Hub Manager provisioning and TOTP enrolment.
- `app/api/v1/admin/invitations/route.ts` — admin-only issue and list endpoints.
- `app/api/v1/admin/invitations/[id]/revoke/route.ts` — admin-only revocation.
- `app/api/v1/onboard/redeem/route.ts` — public redemption endpoint, IP rate-limited.
- `app/onboard/page.tsx` and `app/onboard/OnboardClient.tsx` — redemption UI.

Security properties:

- The raw token is 256 bits of CSPRNG output, base64url-encoded, and is returned only once at creation.
- Only the SHA-256 hash is stored. The raw token is never logged and is not stored in the database.
- The link is short-lived (default 7 days, configurable) and revocable.
- Redemption is a conditional update inside a single transaction, so two concurrent requests cannot both succeed.
- Provisioning is in the same transaction as consumption, so a failed provisioning run cannot silently burn the token.
- The activation gate requires an `EXECUTED` contract and an `ACTIVE` entitlement grant within its effective dates.
- The invitation credential and the Ed25519 licence manifest have separate lifecycles.

Tests (run against the live Neon database, self-cleaning):

```bash
npx --no-install tsx scripts/test-onboarding-invitations.ts
npx --no-install tsx scripts/test-onboarding-provision.ts
```

Last run: 18/18 invitation assertions and 8/8 provisioning assertions passed.

## Regenerating the PDFs

```bash
node scripts/build-contract-pdfs.mjs
python scripts/merge-package.py
```

`build-contract-pdfs.mjs` renders every HTML file to A4, adds page-number footers, computes the SHA-256 of
each PDF, writes the detached certificate, and renders it. `merge-package.py` concatenates the set in order.

## Placeholders to complete before real use

- Provider's registered legal name, CIN, GSTIN, LUT, registered address and bank details.
- Customer's signatory authority and notice addresses.
- Insurance limits, subprocessor list, transfer risk assessment, SCC/UK Addendum annexes.
- SOC 2 / ISO 27001 status, penetration-test cadence and actual support hours.
- Every `[bracketed]` value in the MSA, DPA, SLA, Security Schedule and Acceptable Use Policy.

The Security Schedule and Acceptable Use Policy are deliberately outlines. Do not claim a certification,
insurance limit, support window or regulatory mapping that the team cannot evidence.
