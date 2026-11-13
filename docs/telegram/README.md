# NAFS Telegram Mini App: operator setup

The existing application now has a Telegram adapter; the core planner/habit/marathon engine does not depend on Telegram. The server-backed Telegram application has **not been publicly deployed**; the separate owner-only preview is static guest mode. A bot has not been created or contacted and no bot token is configured. Local guest mode needs none of those services.

## Required configuration

Use Node 24+, Supabase and a Next.js-compatible HTTPS host (for example Vercel). The old owner-private static Sites preview is guest-only and is **not** a suitable production Mini App backend: it has no API routes and its ChatGPT access gate is not Telegram authentication.

1. Back up the real database if one exists. Apply only unapplied migrations, in order: `001_nafs.sql`, `002_free_redesign.sql`, `003_ultimate_features.sql`, `004_telegram_sessions.sql`, `005_broadcast.sql`, `006_owner_visits.sql`, `007_auth_reliability.sql`. No migration drops historical user/billing/AI records.
2. Set `APP_URL` to the exact HTTPS origin, without a path. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` and `TELEGRAM_BOT_TOKEN` in the host's secret configuration. Never prefix the last two with `NEXT_PUBLIC_`; never paste them into chats, client bundles or logs.
3. Run `npm run seed` with Supabase URL/service key provided to the command's environment. It upserts 20 free programs and 420 days without resetting enrollments. Existing Quran/dhikr IDs are retained while their practical activities have been revised.
4. Build with `npm run build`, then generate the public guest fallback with `npm run preview:offline` **before** packaging the application. The Next server must serve `public/offline.html`, `public/sw.js`, manifest and icons. API/auth responses must not be cached by a CDN or service worker.
5. Publish only after the product owner explicitly authorizes it. No secret setup alone constitutes permission to publish.

## BotFather

1. Open the verified **@BotFather** account in Telegram. Use `/newbot`, choose the display name **nafs.**, and choose your own available bot username. No username is invented by this project.
2. Save the issued token directly into the server-only `TELEGRAM_BOT_TOKEN` secret. Revoke and replace it if exposed.
3. Open `/mybots`, select your bot, and use BotFather's Mini App configuration to set the authorized HTTPS application URL and main Mini App name. BotFather's menu wording can vary by client/version.
4. Configure the chat menu button using `/setmenubutton`, select your bot, enter the same HTTPS URL and a label such as **Открыть NAFS**.
5. If you want a named direct-link Mini App, use `/newapp` and follow BotFather's prompts for its title, description, photo, short name and URL. For a configured main app the link is `https://t.me/<your_bot_username>?startapp`; a named app uses `https://t.me/<your_bot_username>/<your_short_name>?startapp`. Substitute real configured values.
6. Upload the brand icon from `public/icon-512.png` using BotFather's bot/profile or Mini App media settings. Use `/setuserpic` for the bot's profile picture. Provide product screenshots only after actual device QA.
7. Open through the main app button, configured menu button or named app link. A normal browser visit to the website is guest/email mode and does not manufacture signed Telegram identity.

No bot webhook or bot-message permission is required for this Mini App's browser-to-backend login. Optional administrator broadcasts use the consent-based queue described in `../BROADCAST.md`; no actual messages have been sent during implementation. It must not claim that foreground browser reminders are Telegram push notifications.

## Authentication protocol

Official SDK: `https://telegram.org/js/telegram-web-app.js`, loaded only on a Telegram launch. The client calls `ready()`/`expand()`, responds to theme/viewport/safe-area events, and wires BackButton to close dialogs, leave a marathon detail, or return to Today. Telegram's own close control remains available. Browser mode has no dependency on the SDK.

`POST /api/auth/telegram` accepts **only** `initData`. It checks exact request origin, payload size, database-backed rate limits, the official HMAC-SHA-256 signature, a maximum ten-minute authentication age, future-date tolerance, duplicate fields and a positive safe integer user ID. It does not accept `initDataUnsafe`, an unsigned ID or a frontend entitlement flag. Verified signature replay keys are consumed atomically in PostgreSQL. A still-valid same-owner session can be reused on reload; a different validated Telegram actor revokes the previous device session.

A unique Telegram identity maps to an `auth.users` UUID. New Telegram users get an unguessable synthetic account/password, not an email address supplied by the frontend. Concurrent creation uses the unique mapping constraint and removes the losing orphan account. Existing email accounts are preserved and **not automatically merged** with Telegram identities.

The cookie contains a random 256-bit opaque token; the database stores its SHA-256 hash. Sessions expire after seven days. HTTPS cookies are HttpOnly, Secure, SameSite=None and Partitioned for compatible Telegram Web embeds; localhost uses SameSite=Lax. All mutation endpoints require an exact Origin match. CSP permits embedding only by the same origin and Telegram domains. Some browser privacy settings still block embedded cookies: test actual clients and use Telegram's mobile app if needed. Do not silently weaken authentication to work around cookie restrictions.

`requireUser()` resolves the server-owned UUID from an unexpired session before reading/writing a workspace. Writes, export/deletion and support also compare the last loaded workspace UUID with the authenticated owner; a stale tab cannot write its previous account data into a newly signed-in account. This comparison never substitutes for session authentication. Direct browser access to Telegram identity/session/replay tables is denied. Service-role access is limited to server code with authenticated owner filters. Session hashes/raw initData are never exported or logged. Export includes the user's own identity mapping and workspace. Deletion cascades through identities/sessions and private records; logout revokes and expires the current session, including its partitioned cookie. A launch-scoped digest prevents automatic re-login after explicit logout/deletion in that launch only; it grants no server permissions. A new launch or another Telegram account does not inherit the choice.

## Guest data and existing accounts

Original local key: `nafs-guest-v1`. Guest data remains on its original browser origin and is not automatically synchronized or uploaded. Moving from the old private Site URL to a new domain does not move browser storage: export first. Source zip backups do not back up remote/local user records.

The explicit importer copies task/habit definitions using stable hashed IDs. Repeated imports skip existing imported records and do not overwrite account history. It does not import trusted XP or intimate journal history. Full history/account merging is a separate, unimplemented migration workflow. Original guest history stays in local storage/export.

Inside Telegram, Telegram identity is used; outside Telegram existing Supabase email sign-in remains available. Account linking between those identities needs explicit authenticated linking and is not implemented. Do not imply that two accounts have merged.

## Installation and device QA

Profile includes **Добавить NAFS на главный экран**. SDK version/method checks guard `checkHomeScreenStatus()` and `addToHomeScreen()`. Calling the API only shows a pending message; a positive status or `homeScreenAdded` event is needed for confirmation. Unsupported clients get Telegram/Safari/Chrome instructions. Availability varies by device.

Before launch, verify on iOS and Android Telegram, Safari, Chrome and Telegram Web:

- 375/390/430 px, text scaling, keyboard open/closed, RTL, notch and bottom gesture area.
- Five tabs and the elevated Today button, modals/BackButton, scroll content clear of the fixed bar.
- All Today actions, task persistence, recurring tasks, habits, custom wizard, catch-up/pause and restart history.
- A real bot-signed login, session expiry, logout, two different Telegram accounts, data export/deletion and offline failure.
- Light/dark Telegram themes, explicit manual theme override and device home-screen status events.
- All ordinary programs remain available in Islamic mode; religious quotations never appear anywhere; sensitive discovery is hidden by default.

Automated SDK tests use mocks; cryptographic verification and PostgreSQL isolation tests are real local computations. They do **not** establish a tested live bot/Supabase deployment or measured visual layout on a phone.

Official reference checked during implementation: https://core.telegram.org/bots/webapps (HMAC validation, BackButton, viewport/safe-area and installation APIs).
