# Future iOS packaging — preparation, not a shipped native app

The existing Next.js/Supabase app remains the web source of truth. No Xcode project, native build, WidgetKit extension, TestFlight upload or App Store submission has been made. Apple credentials are not needed for the web work.

## Staged Capacitor path

1. Complete real Safari/iPhone accessibility, safe-area, offline, text scaling and keyboard QA. Supply operator privacy/legal contacts and app content ratings.
2. Decide whether the native shell uses a bundled guest-first web build plus the existing HTTPS API or an audited hosted origin. Do not embed a service role key. Supabase browser auth tokens require a reviewed native secure-storage adapter; localStorage is not equivalent to Keychain.
3. Add Capacitor and iOS platform dependencies only in the native integration phase. Configure an immutable bundle ID, HTTPS allowlist, universal-link auth callback and session expiry/recovery. Avoid broad navigation permissions or arbitrary remote-code loading.
4. Implement a platform adapter for native local notifications, opt-in haptics and secure storage. The current app uses feature-detected web APIs only. Foreground browser reminders and vibration do not imply iOS native support.
5. Use local notifications for planned times with explicit permissions; keep lock-screen content generic by default. Rebuild pending schedules after timezone/DST changes, edits, cancellation and logout. Do not promise unrestricted background execution.
6. Add a WidgetKit target later. `lib/widget-snapshot.ts` defines a minimal versioned projection and `CompactWidgets` provides reusable visual concepts. Store only this projection in an App Group, refreshed through the containing native app. Private titles are excluded unless separately authorized. Widget timeline refresh timing is controlled by iOS. No home-screen widget works yet.
7. Define backup/export/deletion semantics across WebView, Keychain, App Group and Supabase. Account deletion must remove all app-controlled native snapshots and notification schedules. Historical provider records need the operator's retention policy.
8. Verify authentication/account deletion, privacy policy, accessibility, content, in-app browsing and review guidance on actual hardware. Complete App Privacy disclosures and review encryption/export requirements.
9. Create development signing, internal TestFlight and App Store assets only with explicit authorization. Approval is not guaranteed.

A static guest artifact can be built with `npm run preview:offline`; it is a test artifact, not a production native architecture by itself. Keep the secure backend separate from any bundled client code.


## Telegram-first adapter boundary

The current primary target is Telegram Mini App. `lib/telegram/client.ts` and `components/tools/telegram.tsx` isolate the platform bridge from domain state/reducers. Standalone iOS should use its own authenticated session adapter and Keychain design; never reuse an unsigned Telegram user object or hardcode a bot token. Telegram home-screen shortcuts are not WidgetKit widgets, and Telegram haptic APIs do not establish a native iOS build. See `docs/telegram/README.md` for current live-integration prerequisites.
