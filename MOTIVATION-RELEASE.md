> Historical report. Current upgrade and verification: [docs/UPGRADE-2026-11.md](docs/UPGRADE-2026-11.md).

# NAFS 1.0 — dynamic motivation release

Date: 2026-11-06. Modified the existing `/workspace/nafs` project. Source backup: `/workspace/nafs-before-motivation.zip`. No database was reset, no remote user record was modified, and no new project was created.

## Implemented

- 116 original structured messages: 108 Russian messages in nine requested categories, plus eight optional messages about sincerity, patience, gratitude and character. All have English, Turkish and Arabic versions. No external author attribution, AI service, religious quotation or new dependency.
- Today card with stable local-calendar daily choice, manual refresh, exclusion of the last 24 daily messages, persisted selection, subtle reduced-motion-aware transitions and bookmark controls.
- Saved motivation in Profile: list, remove, request another message; favorites persist across guest reload, account saves and language changes. Guest-to-account import also supports favorites idempotently.
- Before-activity encouragement, recognition only after real saved completions, 21-day completion recognition, and situation-appropriate SOS/setback support. SOS topic and viewed messages stay in page memory; only explicit bookmarks/reflections are stored.
- Separate default-off faith-sensitive motivation toggle within Islamic mode. No Quran/hadith quotations in SOS. Saved favorites are intentionally preserved when modes change.
- Original compact mountain landscape and refined message cards based on the newly supplied reference. Existing five tabs, central Today button, light/dark, RTL and safe-area handling remain. Exact approved About story is unchanged.
- Additive guest schema defaults and existing authenticated owner-protected workspace transaction. No extra SQL migration required; migrations 001–004 remain the baseline. Existing tasks, XP, habits, focus sessions, journals and marathon records are preserved.
- Offline guest fallback regenerated as v6 with embedded artwork and full local functionality. Guest storage remains device/origin-local and unencrypted.

## Executed checks

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm test -- --pool=threads` — **112 tests passed, 14 files**, 18.08 seconds in the final full run.
- `npm run build` — passed, all 10 static page-generation steps and server routes compiled.
- `npm run preview:offline` — passed; `/workspace/NAFS-preview.html` and `public/offline.html`, about 1,877 KB.
- Standalone JavaScript syntax, v6 marker, embedded landscape/content and absence of server-only credential configuration names — verified.
- Service-worker JavaScript syntax — passed; distinct v6 cache keeps earlier fallback intact until installation succeeds.

New tests cover midnight while open, DST, deterministic choices, bounded history, non-repeating refresh, four-language content, faith opt-in, favorites/remount/import/export/deletion, old-state preservation, privacy, actual-completion gating, and database owner isolation. Existing tests still cover task/planner/habit/marathon workflows, five-tab navigation at 375/390/430px, Telegram HMAC/session validation, account deletion, and the approved About text.

Vitest emits a non-failing warning about a future ESM config default. No test was skipped or assertion weakened to obtain the result.

## Preview and publication status

**Updated on the owner’s later request to test:** the existing owner-only Site now serves the motivation revision. Deployment succeeded at 2026-11-06T12:53:15.535384+00:00. URL: https://nafs-private-check-werllap.placidmarshmallow1.chatgpt.site . See `PREVIEW-PUBLICATION.md` for the exact source/version/deployment record. This is a static guest preview; no public launch, live account backend or BotFather operation was performed.

For a local computer:

```sh
cd /workspace/nafs
npm ci
npm run dev
```

Open `http://localhost:3000` on that same computer. `localhost` on an iPhone points to the iPhone and cannot reach the development machine. The standalone HTML is a browser artifact; iPhone Quick Look is not a reliable application runtime. Updating the hosted preview is a separate deployment step.

Deliverable: `/workspace/nafs-motivation-source.zip`, excluding build output, dependencies and private environment files. Full setup: `README.md`, `DEPLOYMENT.md`, `docs/telegram/README.md`, `docs/motivation/README.md`.

## Remaining limitations

- No actual browser-control tool was available. DOM viewport tests do not prove CSS layout, contrast, keyboard handling or physical-device safe areas. Visual iPhone/Android/Telegram QA remains.
- Telegram and Supabase require actual configuration. Cryptography, SDK mocks and local PostgreSQL/RLS tests passed, but live signed login, device synchronization and installation were not tested.
- All four new language versions are implemented; independent native-speaker/editorial review remains. Unverified religious quotations remain excluded as before.
- Browser reminders remain foreground-only. Native widgets, iOS packaging, background push, automatic prayer times, full guest-history merging and email/Telegram account linking remain outside the working web features.

## External setup and deployment checklist

1. Create/configure the bot through BotFather (`/newbot`); configure its Mini App/Main App/menu URL and icon using the HTTPS URL of a server-capable deployment. Use `docs/telegram/README.md` for detailed launch/testing steps.
2. Supply `.env.local` / hosting secrets: `APP_URL`, Supabase URL/anon key, server-only service-role key and `TELEGRAM_BOT_TOKEN`. No keys are required for guest motivation.
3. Apply existing unapplied migrations 001–004, then seed 20 programs. Back up real data before any migration.
4. Keep the approved developer contact `https://t.me/werllap`. Optional footer URL is configurable.
5. Test two real authenticated users, actual devices, home-screen feature support, export/deletion and day-boundary favorites behavior.
6. Obtain deployment authorization, preserve the intended audience, publish the reviewed artifact, verify its returned URL/version and retain rollback files. A static guest preview cannot run secure Telegram auth routes.
