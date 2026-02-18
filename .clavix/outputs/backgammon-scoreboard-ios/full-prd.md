# Product Requirements Document: Backgammon Scoreboard iOS

## Problem & Goal

Backgammon tournament players use paper scoreboards to track match progress. These are simple, reliable, and distraction-free. The goal is to build the digital equivalent: a mobile scoreboard that does one thing well — tracking a backgammon match score with tournament-accurate rules. No timers, no player names, no complexity. If it wouldn't be on a paper scoreboard, it doesn't belong in the app.

The app already exists in a functional but rudimentary state. This PRD covers what's needed to bring it to App Store quality.

---

## Requirements

### Must-Have Features

**Already implemented (keep and polish):**
1. **Tap to score** — Tap left or right player area to add 1 point. Tap as many times as needed (gammon = 2 taps, backgammon = 3 taps).
2. **Match length cycling** — Tap center button at 0-0 to cycle through standard match lengths (3, 5, 7, 9, 11, 13, 15, 17, 21).
3. **New match** — Tap center button mid-match to trigger a confirmation and reset.
4. **Crawford rule** — Automatically tracks Crawford and Post-Crawford states.
5. **Keep awake** — Screen stays on during a match.

**New for this release:**
6. **Undo last point** — Long press on a player's side to undo the last point scored for that player. No confirmation dialog needed; the gesture itself is the confirmation.
7. **Haptic feedback** — Subtle haptic on every score tap. Distinct, stronger haptic on match win.
8. **Per-game tally (optional, setting)** — Below each score, display tally marks representing games won in the current match. One mark per point scored; each player has their own tally. Tally style is traditional paper scoreboard: four vertical strokes followed by a diagonal cross for the fifth, then a new group starts (e.g., score of 7 = one full group of 5 + two singles). Toggled on/off via iOS Settings app (Settings.bundle). Default: on.
9. **Score animation** — When a point is added, the score number animates subtly (scale bounce or similar) to confirm the tap and add satisfying feedback.
10. **State persistence** — Silently restore match state (scores, match length, Crawford state) when the app is reopened after being force-quit. No prompt; just restore.
11. **Font safety** — Score text uses `adjustsFontSizeToFit` to prevent overflow on smaller devices or at high scores (e.g., match to 21).

### App Store Blockers (Required for Submission)

12. **App icon** — Design and add a proper app icon (1024×1024 master, all required sizes). No React Native defaults.
13. **Launch screen** — Remove "Powered by React Native" branding. Set dark background (#1a1a1a) to match app. Add simple app name or mark.
14. **Info.plist cleanup** — Remove `NSLocationWhenInUseUsageDescription` (app doesn't use location; empty value causes rejection).
15. **App Store Connect listing** — Bundle ID `com.peterszasz.BackgammonScoreboard`, category: Games > Board, description, keywords, age rating (4+), review notes.
16. **Signing** — Verify Apple Developer Program membership, enable automatic signing in Xcode, provisioning profile confirmed.
17. **Support URL** — Simple page with contact info (GitHub repo page is sufficient).

### Strongly Recommended Before Submission

18. **`UIRequiresFullScreen`** — Add to Info.plist to prevent iPad split-screen breaking the landscape layout.
19. **`UIUserInterfaceStyle = Dark`** — Force dark mode to match app UI; prevents system light mode affecting status bar or alerts.
20. **Physical device testing** — Test all match lengths, Crawford triggers, keep-awake, landscape lock, no crashes.
21. **App Store screenshots** — Minimum 3 required. Capture: 0-0 start, active match, Crawford visible.

---

### Technical Requirements

- **Platform:** iOS only (iPhone, landscape orientation)
- **Framework:** React Native (existing codebase)
- **Persistence:** AsyncStorage or react-native-mmkv — restore state silently on launch
- **Haptics:** Built-in `Vibration` API is sufficient; escalate to `react-native-haptic-feedback` only if Taptic Engine patterns are needed
- **Animation:** React Native's `Animated` API or `react-native-reanimated` for score bounce
- **Tally rendering:** Computed from score state; rendered as traditional tally marks (4 vertical strokes + 1 diagonal cross per group of 5) below each score number. Visibility controlled by a boolean setting read from iOS Settings app via `Settings.bundle` + `NSUserDefaults`.
- **Settings:** iOS Settings app via `Settings.bundle` (a native Xcode mechanism requiring no in-app UI). Initial setting: "Show Tally" toggle (default on). This pattern can host future settings without any in-app screen.

---

## Out of Scope

- Player names or customization
- Timers or clocks
- Gammon/backgammon as distinct scoring actions (user taps multiple times instead)
- Doubling cube tracking
- Multiple visual themes or photorealistic scoreboard skin
- iPad-specific layout (iPad can download as iPhone app in compatibility mode)
- Game history across multiple matches
- Sound effects
- Social or sharing features
- Analytics or tracking of any kind
- Network connectivity of any kind

---

## Success Criteria

- A backgammon player can pick up the app mid-tournament and use it without explanation
- Scoring feels tactile and satisfying (haptics + animation)
- No match state is ever lost unexpectedly
- App passes App Store review on first submission
- The UI looks intentional and polished, not like a template app

---

## Additional Context

- The app's design language: dark background (#1a1a1a), light score boxes (#f5f5f5), red Crawford indicator. This is correct and should be preserved.
- The app is landscape-only and should stay that way.
- Unused imports exist in App.tsx (`useEffect`, `useRef`, `Platform`) — clean these up as part of any code changes.
- The module-level `savedMatchLength` variable is a hack that will be replaced by proper persistence.
- Bundle ID: `com.peterszasz.BackgammonScoreboard`
- Team ID: `42X8P6QCN9`

---

*Generated with Clavix Planning Mode*
*Generated: 2026-02-18T00:00:00Z*
