# Miles — Project Context for Claude

## What this is

Miles is a React Native + Expo app for long-distance couples (and close
friends) — moods, distance counter, photo sharing, watch/listen together,
games, memory jar, time capsules. Designed to be monetized via $4.99/mo
Premium, $7.99/mo Duo, and a $2.99 AI Coach add-on.

The codebase has been redesigned end-to-end with a **cinematic-romance**
aesthetic: cream-warm base, dark cards, gradient CTAs, bold display
typography, SVG arc distance ring, circular mood ring, floating pill
tab bar.

---

## Stack

| Layer | Tech |
|---|---|
| App | Expo ~54, React Native 0.81, TypeScript strict |
| Navigation | @react-navigation/native-stack + bottom-tabs v6 |
| State | Zustand (with `persist` middleware to AsyncStorage) |
| Backend | Supabase (project `zowwuzepcttifosnjxki` — region ap-northeast-1) |
| Realtime | Supabase Realtime (single channel per couple) |
| Push | expo-notifications + Expo Push API via a Supabase edge function |
| IAP | RevenueCat (`react-native-purchases`) — keys not yet provisioned |
| Date util | date-fns |
| Animations | RN Animated API; LayoutAnimation for theme transitions |
| SVG | react-native-svg (the distance arc) |

Secrets are loaded from `.env` via `expo-constants` (`app.config.js`).
See `.env.example` for required vars.

---

## Directory map

```
src/
├── lib/
│   ├── supabase.ts            # typed Supabase client, reads .env
│   └── database.types.ts      # generated; regen via mcp__supabase__generate_typescript_types
├── store/
│   ├── coupleStore.ts         # main app state, persists togetherMode/onboarding/reunionDate
│   └── entitlementsStore.ts   # RevenueCat entitlements (premium/duo/coach)
├── theme/
│   └── ThemeContext.tsx       # apart vs together palette switch; useTheme(); animateThemeTransition()
├── services/                  # ALL backend calls live here — never call supabase from a screen
│   ├── realtime.ts            # subscribeToCouple() — single channel per couple
│   ├── moods.ts               # sendMood, fetchLatestMoodFromPartner
│   ├── heartbeats.ts          # sendHeartbeat (rate-limited)
│   ├── photos.ts              # pickOrCapturePhoto, uploadAndSharePhoto, getSignedUrl
│   ├── notes.ts               # leaveNote, fetchPartnerNotes, markNoteOpened
│   ├── timeCapsules.ts        # sealCapsule (server enforces open_at via RLS)
│   ├── togetherState.ts       # fetch/setTogetherStateRemote — bidirectional sync
│   ├── widgetConfig.ts        # per-user widget prefs (upsert)
│   ├── notifications.ts       # registerForPushNotifications() — writes profile.push_token
│   └── purchases.ts           # RevenueCat — dynamic-imports SDK, no-ops in Expo Go
├── navigation/
│   └── AppNavigator.tsx       # auth gating, profile load, realtime subscription, push register
├── components/
│   ├── ui/                    # Button (gradient primary), Card, Avatar (pulse ring)
│   ├── widgets/               # DistanceMeterWidget (SVG arc), CountdownWidget, PhotoWidget, DrawingWidget
│   ├── PartnerHeader.tsx      # tab-screen header with ⚙ Settings entry
│   ├── TogetherModeBanner.tsx # shown on every non-home tab when together mode is active
│   └── OnboardingOverlay.tsx  # 3-step welcome shown once after couple-linking
└── screens/
    ├── auth/                  # WelcomeScreen, LoginScreen, CoupleLinkScreen
    ├── home/                  # HomeScreen (mood ring, widgets, heartbeat, photo)
    ├── together/              # TogetherScreen, WatchTogether, ListenTogether, Games
    ├── dates/                 # DatesScreen (88pt countdown), DatePlannerScreen
    ├── memories/              # MemoriesScreen (tabs, jar CTA), MemoryJarScreen
    ├── widgets/               # WidgetsScreen (phone mockup + theme picker)
    ├── shop/                  # ShopScreen (Premium/Duo/Coach + virtual gifts)
    └── settings/              # SettingsScreen (profile, logout, unlink, reunion-date)
```

---

## Supabase schema (Phase 2 + 3)

Migrations (all applied):
1. `initial_schema` — profiles, couples, couple_invites + RPC functions
2. `partner_activity_tables` — moods, heartbeats, photos, drawings,
   memory_jar_notes, time_capsules, together_state, widget_config + RLS +
   realtime publication
3. `couple_photos_storage_bucket` — Storage bucket + object RLS
4. `push_notifications_columns` — profiles.push_token, notification_prefs
5. `enable_pg_net` — async HTTP from triggers
6. `notify_partner_triggers` — AFTER INSERT triggers on partner-activity
   tables that call the edge function via pg_net
7. `harden_function_search_paths` — fixed mutable search_path advisor
8. `revoke_handle_new_user_rpc` — handle_new_user no longer exposed via REST

Helper: `public.is_couple_member(couple_id uuid)` — SECURITY DEFINER,
search_path=''. Used by every couple-scoped RLS policy. Revoked from
anon/authenticated since it's only meant to be called from policies, not
the REST API.

Storage bucket: `couple-photos` (private, 10 MB cap, image MIME only).
Path layout: `{couple_id}/{uuid}.{ext}`. RLS lets couple members read +
upload, only owner can update/delete.

Edge function: `notify-partner` (verify_jwt: false). DB triggers POST
the new row's `{kind, couple_id, sender_id, hint}` to it. The function
looks up the OTHER partner's push_token + notification_prefs and
dispatches via Expo Push API. Optional `MILES_NOTIFY_SECRET` env var
adds a shared-secret check.

---

## Architecture conventions

**State flows down, events flow up.** No screen should call
`supabase` directly — go through `src/services/`. Services return typed
domain objects (e.g. `Mood`, `Photo`, `MemoryJarNote`) from
`database.types.ts`.

**Together mode = whole-app theme switch.** When `togetherMode` flips
in `coupleStore`, the `ThemeContext` swaps to the warm coral-amber
palette. Tab bar pill changes color, screen backgrounds shift, the
`TogetherModeBanner` appears on every non-home tab. Always wrap the
toggle in `animateThemeTransition()` for a smooth cross-fade.

**Realtime = one channel per couple.** `subscribeToCouple()` in
`services/realtime.ts` is the single subscription. It filters out
self-events and dispatches to per-table callbacks. Mounted once in
`AppNavigator` after couple-linking; unsubscribed on logout.

**Optimistic UI everywhere.** Sending a mood, photo, or heartbeat
updates the UI immediately and fires the remote write
fire-and-forget. Errors log but don't roll back the UI — the user
already had their moment, and the partner just doesn't get notified.

**Persistence is selective.** Zustand `persist` only writes
`togetherMode`, `hasSeenOnboarding`, and `reunionDate` to AsyncStorage.
Auth state and partner profile are always re-hydrated from Supabase
on launch — no stale-session bugs.

---

## Known limitations / next steps

- **Push + IAP need a dev build.** Both `expo-notifications` and
  `react-native-purchases` rely on native modules. Run `eas build --profile development` to test on real devices. Expo Go silently no-ops both.
- **RevenueCat keys are blank.** `src/services/purchases.ts` has a setup
  checklist at the top. Fill in App Store / Play Console product IDs
  and the SDK keys, then real subscriptions activate.
- **Leaked-password protection is off.** Enable in the Supabase
  dashboard under Auth → Password security.
- **Video sync in WatchTogether is a UI mock.** The "Pause both" button
  toggles local state but doesn't actually sync between devices. Add a
  Supabase Realtime broadcast channel for the watch session when ready.
- **No analytics or crash reporting yet.** Wire Sentry via the
  `EXPO_PUBLIC_SENTRY_DSN` env var when ready.
- **No tests.** Add Jest + React Native Testing Library when you have
  free cycles; smoke-test the auth flow and the realtime subscription.
- **HomeScreen.tsx is 800+ lines.** Consider running the `simplify`
  skill on it — split into `useHomeData`, `MoodRing`, `HeartbeatCard`,
  `TogetherView` once the feature surface is locked.

---

## Useful Claude Code skills for this project

Already installed (bundled with Claude Code or via `npx skills add`):

| Skill | When to use |
|---|---|
| `frontend-design` | Any new screen / visual polish |
| `supabase` | Schema changes, RLS audits, edge functions |
| `supabase-postgres-best-practices` | Query / index optimization |
| `security-review` | Run on every PR before merging |
| `simplify` | When a file grows past ~500 lines |
| `claude-api` | Building the AI Coach add-on backend |
| `review` | PR review automation |
| `init` | Regenerating this file when architecture shifts |
| `fewer-permission-prompts` | One-time setup to allow common dev commands |

MCP servers configured:
- **Supabase** — `mcp__supabase__*` tools. Used for schema migrations,
  type generation, advisor checks, edge function deploys.

---

## Common tasks

**Add a new partner-sync feature** (e.g. shared playlists):
1. New table in Supabase: `playlists` with `couple_id`, `sender_id`,
   etc. Add RLS using `is_couple_member(couple_id)`.
2. Add to the realtime publication: `ALTER PUBLICATION supabase_realtime ADD TABLE public.playlists;`
3. Generate types: `mcp__supabase__generate_typescript_types`
4. New service file: `src/services/playlists.ts`
5. Add a callback to `subscribeToCouple()` in `services/realtime.ts`
6. Wire UI to the service; keep it optimistic

**Add a database trigger that notifies the partner**:
1. Add a new `kind` to the edge function `notify-partner` switch
2. Add `AFTER INSERT` trigger in a migration calling
   `public.dispatch_partner_notification()` (already exists)

**Regenerate `database.types.ts` after a migration**:
- Call `mcp__supabase__generate_typescript_types` and paste into
  `src/lib/database.types.ts`.

**Run a Supabase migration safely**:
- `mcp__supabase__apply_migration` (records history) for production DDL.
- `mcp__supabase__execute_sql` for one-off queries / data fixes.

---

## Branding

- **Yellow** `#FFB830` (golden hour) — primary CTA, accents
- **Coral** `#FF7A5C` — affection / love-themed
- **Cream** `#FFFDF5` — base background
- **Dark** `#1A1814` — card surface in apart mode
- **Together palette** — warmer base `#FFF6EE`, coral-tinted dark
- Typography: System font with `fontWeight: 900` for hero display

The aesthetic is "cinematic romance — premium consumer app, not generic
dating app." Always lean into dark cards on cream, gradient buttons,
generous letter-spacing, and warm gold accents.
