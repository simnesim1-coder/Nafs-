# NAFS Telegram revision — implementation and release status

## Implemented in the existing project

- [x] Preserve framework, guest key, historical records and old email sign-in. Source snapshot before work; additive migrations 004–005.
- [x] All-free features; no active AI, credits, subscriptions, payments, ads or premium gates.
- [x] Concept-inspired violet/charcoal/cyan redesign, light theme, category colors, responsive/safe-area CSS, RTL and reduced motion.
- [x] Exactly five tabs with an elevated circular Today button; top Profile and SOS.
- [x] Working Today hub and quick actions; retained functional planner, tasks, habits and real analytics.
- [x] Twenty free 21-day programs / 420 activities; 12 lifestyle plus eight optional Islamic programs, never replacing the ordinary catalog.
- [x] Three-step custom-plan wizard and full existing plan lifecycle/history.
- [x] Honest elapsed/completed/missed marathon counts, catch-up, pause and restart.
- [x] SOS with scenario-specific support, five-stage timer and no religious quotations in either mode.
- [x] Eight earned-badge types, XP/levels, focus timer/history, rule-based weekly report with weekday counts.
- [x] Exact approved Russian About story, translations and approved @werllap contact.
- [x] Official Telegram SDK bridge, version checks, BackButton, themes/viewport/safe areas, links and truthful home-screen installation state.
- [x] HMAC initData validation, stale/tampered/replay rejection, opaque hashed server sessions and isolated identity mapping; logout/deletion revocation.
- [x] Guest-definition import made repeatable without overwriting account history.
- [x] Four-language UI/program content, offline guest shell and deployment/BotFather/native preparation documentation.

## External setup or human/device validation still required

- [ ] Configure actual Supabase and Telegram bot credentials, apply migrations, seed catalog and verify real end-to-end sign-in.
- [ ] Verify iOS/Android Telegram/WebView and Safari/Chrome at 375/390/430 px, notch/keyboard, text scaling, visual overflow, accessibility and safe areas. Chromium rendering was checked at these widths; native device behavior remains unverified.
- [ ] Verify real add-to-home-screen events and embedded-cookie behavior. No installation on a real phone was performed here.
- [ ] Independent native-speaker/editorial review of translations and specialist review of practical Islamic programs. All former scripture text, translations and quotation sources were removed.
- [ ] Actual local prayer-time integration. Programs currently guide users to a trusted local timetable; no times or rulings are invented.
- [ ] Full guest-history import and authenticated email↔Telegram account linking; definitions-only import is available and original histories remain separate.
- [ ] Reliable scheduled background reminders, web push, native notifications and native secure-storage/WidgetKit implementation.
- [ ] Operator-specific legal/privacy/retention details and release monitoring without sensitive payloads.
- [ ] Explicit authorization before deployment. Owner-private guest previews can be updated under existing preview authorization. No public launch, bot registration, App Store submission or live integration is implied.

## Dynamic motivation extension

- [x] Exactly 365 unique original messages, four language versions; legacy bookmark texts preserved separately.
- [x] Stable IDs, categories, deterministic daily selection, local midnight, recent exclusion.
- [x] Today card, manual refresh, persisted favorites and dedicated Profile library.
- [x] Contextual before/after/SOS/setback/21-day support; actual completion gating.
- [x] No automatic religious quotation cards; retired preference cannot reenable them.
- [x] Guest schema defaults, authenticated atomic snapshot, favorites import/export/deletion.
- [x] Original compact mountain accents from the supplied concept, reduced-motion styling.
- [x] Unit, interaction, localization and database isolation checks added.
- [ ] Independent editorial/native-speaker review of all new messages.
- [ ] Actual Safari/Telegram mobile visual, accessibility, installation and configured sync checks.

## Privacy and reliability upgrade

- [x] Sensitive themes default OFF, explicit confirmation ON, neutral existing-attempt cards and reversible visibility.
- [x] Islamic-first catalog ordering; ordinary programs preserved, sensitive topics last.
- [x] Versioned 21-day snapshots, three effort levels and archived setback attempts.
- [x] Accurate zero-plan and mixed daily progress, next action, multiple compact active cards.
- [x] Server-authorized administrator drafts, confirmation, opt-in recipients, atomic queue and protected scheduler endpoint.
- [x] SQL audience totals beyond 1,000 rows, consent revocation, idempotent jobs and cautious ambiguous-send handling.
- [ ] Configure and manually verify real administrator broadcasting with approved test users.
