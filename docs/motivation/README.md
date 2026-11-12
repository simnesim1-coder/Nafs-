# Dynamic motivation — NAFS 1.0

This is part of the existing app, with no AI, payment, additional service or credential.

## Content and behavior

`content/motivation.json` contains **exactly 365 original messages**, with stable IDs, category, eligible contexts and RU/EN/TR/AR text. All 365 are suitable for the daily card and have no fabricated attribution. Ten categories cover discipline, consistency, procrastination, impulses, resilience, responsibility, habits, recovery, growth and intention. Translations have not received independent native-speaker review.

The date-only ordinal and a fixed permutation select every entry exactly once in 365 consecutive local dates. This is a continuous cycle, including leap days, rather than a calendar-year reset. A visible page checks local date every 15 seconds and on focus/visibility changes. Manual refresh persists for that date but never changes the following day's scheduled message. It excludes the most recent 24 entries and reserves the upcoming 24 daily choices. Language changes do not change the selected ID. Account actions use the validated `x-nafs-timezone` header.

Contextual cards appear before available marathon activities/focus sessions, after confirmed saved task/habit/activity/focus completion, and after all 21 activities are actually complete. Viewing or editing a task is not completion. Completion notices dismiss automatically after 18 seconds and can be closed. Contextual message browsing is ephemeral; small pools exclude the most recent eligible messages and fall back to the least-recent candidates. SOS picks an appropriate pool for stress, procrastination, impulses, low motivation or setbacks, without interpolating task or marathon names.

Profile → Saved motivation opens the dedicated favorite library. Bookmark saves a stable ID; removing it is an explicit idempotent mutation. Favorites retain their identity when the UI language changes. Thirteen retired texts keep their old IDs and exact text in `motivation-legacy-favorites.json`, accessible only through explicit existing bookmarks. Their daily-safe replacements have new `-v2` IDs. The archive is not an automatic source. These are original NAFS prose, never scripture or attributed quotations. Old preference fields remain for backward compatibility; they cannot reenable automatic religious messages.

## Privacy and data preservation

- Guest storage key stays `nafs-guest-v1`; the existing backup is retained.
- Runtime schema migration adds an empty `motivation` object and default-off preference to old snapshots. Tasks, habits, history, progress and unknown legacy fields remain intact. Invalid data is not overwritten.
- Authenticated favorites, daily selection and recent daily IDs live inside **`user_preferences.state`**, already protected by owner RLS, server authorization and the revision-locked `save_workspace` transaction. No new SQL migration or second copy of this state is necessary. Apply the existing migrations 001–005 for a fresh backend.
- Daily browsing history contains only Today message IDs. SOS issue choices, viewed support messages, and contextual reading history remain in page memory. No journaling text or goal name is used for selection, URLs, notifications or logs.
- Saving a favorite or SOS reflection is explicit. The favorite itself can reveal its subject; the UI explains local guest storage is not encrypted. It does not claim cross-device guest synchronization.
- Workspace export includes favorites and daily state. Existing account deletion cascades the owning preferences row; local deletion clears the workspace and old backup. Guest-to-account import can copy chosen favorites idempotently alongside task/habit definitions, without importing browsing history.
- Message selection and bookmarks award no XP.

## Editing rules

Never reuse an ID for a different message. Keep all four translations and category labels together. If retiring a message, preserve its ID in existing snapshots; unknown IDs are not rendered. Do not add public-figure attribution without independently verified source evidence. Religious quotations do not belong in this library.

The small mountain landscape is an original vector in `public/images/nafs-horizon.svg`. It is decorative and has no user data. The offline generator embeds it directly. CSS supports light/dark, Arabic RTL, 44px action targets, reduced motion and Telegram safe-area layout.

## Checks and remaining verification

Unit tests cover content uniqueness/completeness, local midnight and DST, deterministic selection, repeat exclusion, absence of automatic religious content, 365-day uniqueness across leap dates, independent refresh, data preservation, explicit completion recognition, validation, guest import/export/deletion. DOM tests cover favorites, refresh/remount, open-page midnight, languages/themes, SOS privacy, five-tab navigation at 375/390/430px. PGlite checks atomic workspace persistence and owner isolation.

DOM viewport tests do not prove pixel layout or real Safari/Telegram behavior. Real iPhone/Android visual checks, screen-reader checks and configured backend/device synchronization remain release tasks. Current-session checks are recorded in `MOTIVATION-RELEASE.md`.
