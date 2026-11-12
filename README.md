# nafs. — free Telegram Mini App · Developed by Werllap

NAFS was upgraded **in the existing Next.js / React / TypeScript / Tailwind / Supabase project**. No new application or paid tier was created. The Telegram guest preview (revision 4) was published privately on 2026-11-06 under the earlier preview authorization. The motivation revision was subsequently published to the same owner-only guest preview upon request; its publication record is in `MOTIVATION-RELEASE.md`. No live Telegram/database credentials are configured.

## Run locally

Requires Node 24+:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open **http://localhost:3000**. Guest mode works without keys. For an optimized local run:

```sh
npm run build
npm run preview:offline
npm start
```

The offline generator writes `../NAFS-preview.html` and `public/offline.html` using the same React components and domain logic. It disables account/support API calls; browser-local functions work without a backend. An iPhone file viewer may not run downloaded HTML: use Safari against a web server. Generating an artifact is not publishing it.

## Implemented

- Five bottom tabs: **Planner · Tasks · Today · Progress · Marathons**. Today is a circular violet central button. Telegram/device safe areas, compact charcoal/violet/cyan design, colorful categories, light theme, Arabic RTL and reduced-motion styling.
- Dynamic motivation: exactly 365 original messages with RU/EN/TR/AR text, a continuous 365-local-date cycle without repeat, independent refresh with recent exclusion, persisted favorites, contextual recognition and private SOS selection. Retired original texts remain available only in explicitly saved bookmarks. See [docs/motivation/README.md](docs/motivation/README.md).
- Today: date/greeting, actual daily completion ring, task/remaining/XP totals, editable tasks, habit check-ins, next appointment, multiple active/paused marathons, one next action and working add/focus/SOS shortcuts. Empty daily plans show no misleading success percentage.
- Planner: local-time day/week views, dated/recurring color-coded blocks, task links, reminders, edit/delete, current-time label and upcoming events. Recurrence preserves wall-clock time when the device timezone changes; time blocks may overlap.
- Tasks: CRUD, reopen, priority/due date/category, description, subtasks, search/filter/grouping and dated recurrence with bounded stable IDs. Completion is explicit; repeated toggles do not re-award XP.
- Habits: CRUD, daily/rolling-seven-day targets, reminders, icons/colors, pause/resume, dated check-ins and preserved history.
- **20 free 21-day programs / 420 activities:** 12 standard and 8 additional Islamic programs. Each has 21 distinct activities, stages, confirmation criteria, reflection and honest completed/elapsed/missed metrics. Future activities unlock by elapsed time excluding pauses; catch-up is available. No permanent-habit or medical guarantee.
- Custom marathons: three-step wizard, locally generated editable template, 21 individual activities/reflections, icon/color/category/start/reminder, edit/duplicate/pause/resume/restart/archive/soft-delete. Previous attempts remain; maintenance habit and completion certificate export are available.
- SOS: five-minute pause/breathing/grounding/alternative/reflection flow, situation-specific original scripts, optional local device voice, voluntary reflection saving, exit anytime. **No Quran or hadith quotations in SOS**, even in Islamic mode. Sensitive topics are hidden by default, require confirmation, and appear last when enabled.
- Progress: real charts, heatmap, task/habit/marathon/focus totals, levels, personal records, earned badge history, and deterministic weekly reports with productive weekdays. Report rules explain their basis and do not invent causes. Legacy checkmarks without dates are not assigned to a week.
- Focus: 15/25/45/custom duration, task link, timestamp timer, pause/resume/stop, persistence and explicit completed-session saving. A linked task is never completed automatically.
- Exact approved Russian About story plus EN/TR/AR translations. Compact **@werllap → https://t.me/werllap** contact card. Subtle developer attribution.
- Official Telegram SDK adapter, signed server authentication, opaque sessions, theme/viewport/BackButton, Telegram link opening and feature-detected home-screen installation. These need external setup for live use.
- Email account fallback, optional onboarding, profile/preferences, generic foreground reminders, export/deletion, corruption recovery and guest-only PWA fallback.

No subscriptions, ads, Pro locks, Stripe/OpenAI dependencies, payment routes, paid AI or credit features are active. Historical financial/AI tables are deliberately retained privately for preservation/export, not used to grant access. Former providers must be disabled separately by an operator if any real legacy contracts existed.

## Telegram and database setup

See **[docs/telegram/README.md](docs/telegram/README.md)** for BotFather, URLs, SDK/auth protocol and actual-device checks, and **[DEPLOYMENT.md](DEPLOYMENT.md)** for deployment.

Required server configuration: `APP_URL`, Supabase URL/anon key, server-only service role key, and server-only `TELEGRAM_BOT_TOKEN`. No real credentials are present. Apply migrations 001–005 in order and run `npm run seed` with the Supabase variables supplied to the shell. The seed upserts 20 programs/420 days without resetting progress.

Migration 004 adds private Telegram identity/session/replay records and an atomic replay-consumption function. No old table is destructively removed. Validated Telegram identities map to trusted backend UUIDs; arbitrary frontend IDs are never accepted. Authenticated saves use runtime validation, origin checks, database rate limits and revision-locked transactions with per-user authorization.

## Data preservation and limits

Source backups: `/workspace/nafs-before-telegram.zip` and `/workspace/nafs-before-motivation.zip`. It is not a backup of external database contents or a user's browser storage.

The guest key **`nafs-guest-v1`** stays unchanged, with the pre-existing migration backup and safe schema defaults. Corrupt JSON is not overwritten. Guest storage is not encrypted and does not synchronize across devices/origins. Export before switching devices or URLs. Account export includes retained historical records; deletion removes the account and private records, and explicitly clears local workspace/backup too.

Guest-to-account import copies task/habit **definitions and chosen motivation favorites**, uses stable new IDs, skips repeated imports and does not overwrite account records. Full guest-history merge and email/Telegram account linking are not implemented. Both original histories remain separate and exportable. Motivation state uses the existing private workspace snapshot; no destructive schema changes or new external services are required. Do not imply they have merged.

Equal operational limits apply to everyone: 2,000 tasks, 100 habits, 1,000 schedule blocks/journals/SOS reflections, 300 marathon attempts, 100 custom programs and 2,000 focus sessions. No limit is a paywall. XP has idempotent keys and a 500/day cap. Earned badges survive deletion/setbacks; no religious leaderboards exist.

## Islamic content

Optional programs cover salah, Quran reading, dhikr, character, knowledge, gratitude, good deeds and spiritual discipline, **alongside all lifestyle programs**. These contain original practical planning activities, no religious quotations/rulings or invented local prayer times. Salah planning explicitly includes all five obligatory prayers. Actual prayer times must come from a trusted local source; there is no prayer-time API configured.

Scripture, translations, religious quotation cards and their former source dataset were removed. Islamic programs are prioritized when enabled, while ordinary programs remain accessible. Switching modes never deletes active attempts: hidden subjects have neutral titles in general views. Program translations and pedagogy still require independent specialist/native-speaker review. See `content/ISLAMIC-AUDIT.md`.

## Notifications, offline and iOS

Current reminders require permission and an **open, visible app**. They use generic text, never intimate goal names. Scheduled reminders/web push are not implemented. Separately, consent-based administrator broadcasts are implemented for a configured Telegram backend; see [docs/BROADCAST.md](docs/BROADCAST.md). No real message was sent during development. Saving a reminder time does not enable notifications by itself.

The service worker caches only the generated public guest fallback and icons, never authenticated/API responses. First use requires connectivity; account edits require a connection. Native WidgetKit widgets, secure native storage and Capacitor packaging are preparation only: see `docs/ios/README.md`.

## Verification and remaining release work

```sh
npm run typecheck
npm run lint
npm test -- --pool=threads
npm run build
npm run preview:offline
```

Tests cover real domain calculations, DOM workflows at 375/390/430 viewport settings, signed Telegram validation, mocked SDK/routes/session behavior, and populated PostgreSQL/PGlite migrations/RLS. Rendered Chromium tests additionally exercise all five tabs at 375/390/430px, light theme, Arabic RTL and reduced-height dialogs. Native keyboards, physical iPhone/Android Telegram, installation and live Supabase authentication still require real-device testing.

Consult [docs/UPGRADE-2026-11.md](docs/UPGRADE-2026-11.md) for the current upgrade, privacy rules, broadcast setup and verification; `MOTIVATION-RELEASE.md` records historical checks and `RELEASE-REPORT.md` for the earlier Telegram report and `IMPLEMENTATION-CHECKLIST.md` for remaining work. Before publication: real-device QA, configured backend/bot, native-speaker/content review, and operator-specific privacy/retention/legal details. No App Store or public deployment is implied.

## Administrator broadcasts

Server-only `/admin` requires a verified NAFS account UUID in `NAFS_ADMIN_USER_IDS`. Draft preview and explicit confirmation precede queueing. Only Telegram users who opened the bot and enabled messages are eligible. Process batches manually or configure the protected worker using `CRON_SECRET`. Duplicate queue jobs are prevented; ambiguous Telegram delivery is not retried automatically. This is not included in the static guest preview. See [docs/BROADCAST.md](docs/BROADCAST.md).
