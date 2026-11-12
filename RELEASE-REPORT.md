> Historical report. Current upgrade and verification: [docs/UPGRADE-2026-11.md](docs/UPGRADE-2026-11.md).

# NAFS Telegram revision — historical verification report

This report records the original local Telegram implementation checks. Revision 4 was subsequently published to the already authorized owner-only preview; see `PREVIEW-PUBLICATION.md`. Current motivation checks are in `MOTIVATION-RELEASE.md`.

Date: 2026-11-06. Existing source: `/workspace/nafs`. Source backup before changes: `/workspace/nafs-before-telegram.zip`. No real credentials were configured and no remote database or hosted Site was mutated. The earlier owner-private preview remains unchanged.

## Executed successfully on the final source

- `npm test -- --pool=threads`: **92 tests passed across 12 files**. Final run took 35.69 seconds.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `NEXT_TELEMETRY_DISABLED=1 npm run build`: passed; Next.js generated the app, auth/data/account/support routes, and the new `/api/auth/telegram` route.
- `npm run preview:offline`: generated `/workspace/NAFS-preview.html` and `public/offline.html` (~1.7 MB) from the updated application.
- Generated guest HTML script parsed successfully; v5 fallback/safe-area metadata present; server bot-token/service-key configuration names absent from the client artifact.

Earlier overlapping checks encountered test/worker timeouts in this runtime, including simple synchronous assertions. Checks were repeated sequentially using a single thread worker with longer test/hook time budgets. No assertions were weakened or skipped in the final successful run. Vitest still prints a non-failing future ESM configuration warning.

## Coverage

Tests exercise task CRUD/completion/recurrence/subtasks/XP, local dates and DST, schedule blocks, habit check-ins/history, marathon starts/pauses/restarts/missed days, custom-plan lifecycle and three-step UI creation, focus clocks/history, SOS stages and explicit saves, badges/reports, guest persistence/corruption/export/deletion, idempotent non-overwriting definition import, exact approved Russian story, Arabic RTL/language switching, and all five navigation actions.

Telegram tests cover HMAC verification, signature tampering, forged IDs, duplicate query fields, stale/future timestamps, replay identity, session hashing, origin rejection, trusted user mapping, cookie flags, same-owner reload, identity switching/revocation, expired sessions, email fallback, stale-tab owner mismatches, mocked SDK initialization/themes/safe areas/BackButton and honest installation confirmation.

PostgreSQL/PGlite applies migrations to populated old records, checks non-destructive preservation, RLS and write denials, revision conflicts, new Telegram table isolation, atomic replay rejection and account-deletion cascades. Content tests check 20 free programs with 21 distinct activities, four-language Islamic program coverage, existing exact source-language-reference scripture mappings, and absence of scripture in SOS.

## Verification limits

- DOM tests set 375/390/430 px viewport widths but do not measure CSS layout, physical touch targets or actual safe-area rendering. No browser-control tool was available, so real screenshot/visual overflow/keyboard testing was not performed.
- SDK and route integration tests use mocks around local cryptography and database checks. No real Telegram bot, Supabase email/Telegram account, live production session or physical-device installation was tested.
- No Telegram bot messages/background push, automatic prayer-time calculation, complete guest-history merge, email/Telegram account linking, native widgets or iOS package were shipped.
- New practical Islamic activities contain no quotations/rulings; independent editorial/native-language/specialist review remains a release step. Unverified hadith remain withheld.

## Delivery

- Existing source code and additive migration `004_telegram_sessions.sql`.
- `../NAFS-preview.html`: local guest artifact; account APIs are deliberately disabled. iPhone Quick Look is not a reliable HTML app runtime.
- `../nafs-telegram-source.zip`: portable source archive, excluding dependencies, build output and private environment files.
- `README.md`, `docs/telegram/README.md`, `DEPLOYMENT.md`, `IMPLEMENTATION-CHECKLIST.md`, and updated iOS preparation/audit documentation.

No publication or BotFather operation has been performed. A local build does not prove a tested live Mini App deployment.
