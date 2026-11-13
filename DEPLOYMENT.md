# Current audit and staging

Read [docs/REVIEW-2026-11-13.md](docs/REVIEW-2026-11-13.md) first. Existing databases with 001–006 need additive 007 before this version can authenticate Telegram users. Do not apply it to production without owner approval.

# Deployment checklist — explicit authorization required

- [ ] Product owner explicitly authorizes the target deployment/audience. The owner-only static motivation preview is published under explicit preview authorization. A public launch or backend deployment needs its own authorization.
- [ ] Back up the current database and export important guest data from its original origin. Keep the existing source backup.
- [ ] Supply Node 24+ and a Next.js-compatible HTTPS host such as Vercel. A static HTML host cannot execute the secure Telegram/auth/data routes.
- [ ] Apply unapplied migrations 001–007, then run `npm run seed` with the required environment variables. Do not rerun already applied migrations manually or delete historical billing/AI records.
- [ ] Set `APP_URL` to the exact target HTTPS origin, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`. The last two are server-only. Optional `NEXT_PUBLIC_WERLLAP_URL` links the small footer; the approved contact card is fixed to https://t.me/werllap.
- [ ] Run lint, typecheck, tests and production build. Generate `public/offline.html` after the build using `npm run preview:offline`, before the hosting artifact is packaged. On Vercel use build command `npm run build && npm run preview:offline`; confirm the generated public fallback is included in the deployment output.
- [ ] Keep private/API responses uncacheable. Forward authentic Origin and proxy IP headers. Do not broadly permit frames or enable permissive cross-origin credentials. Telegram frame ancestors are configured in `next.config.ts`.
- [ ] Follow `docs/telegram/README.md` to register/configure the actual bot, menu/Main Mini App URL, icon and direct-link launch. Do not point BotFather at the old owner-private static Sites preview.
- [ ] For email fallback, configure Supabase site URL, allowed callback URLs, SMTP and recovery, and test email login/logout outside Telegram. Email and Telegram accounts are not automatically linked.
- [ ] Test real Telegram iOS/Android/Web signed login, expired/tampered initData, two different owners, concurrent saves, refresh/logout, installation status, export and account deletion. Confirm partitioned-cookie behavior where supported.
- [ ] Verify local-midnight motivation rotation, favorite reload/export, 400-date uniqueness in each of the two modes, sensitive-content confirmation, and no saved SOS topic. Motivation uses the existing private workspace snapshot; no extra SQL migration or credentials.
- [ ] Test 375/390/430 px, landscape, large text, keyboard, focus trap/BackButton, light/dark, Arabic RTL, safe areas and scroll content above the five-item navigation.
- [ ] Review all four languages and practical Islamic program content; confirm no scripture or religious quotations remain in active sources or UI; Islamic mode prioritizes practical programs only.
- [ ] Set legal operator/contact/retention details in the privacy policy and review intimate self-control data handling. Keep logs free of raw initData, session tokens, notes and private task titles.
- [ ] Confirm reminders are accurately described as foreground browser features. No claim of bot/background notifications or native widgets.
- [ ] Configure admin UUIDs and optional worker scheduler as described in `docs/BROADCAST.md`; test consent, blocked recipients, 429, cancellation and ambiguous delivery with approved test accounts.
- [ ] If old live billing contracts ever existed, cancel renewals with the former provider separately; removing code cannot cancel external contracts.
- [ ] After authorization and publication, record the actual URL/version, verify guest and authenticated paths, and retain a rollback artifact. Never report publication based solely on a local build.
