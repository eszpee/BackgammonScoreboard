# Optimization & App Store Submission Plan

## HIGH PRIORITY — Bug Fixes & Critical UX

### 1. Add unit tests for Crawford game logic (TDD)
- **Files:** `__tests__/`
- **Why:** Crawford rule is the most complex part and has a known bug. Write tests first, then fix — prevents regressions.
- [ ] Test Crawford triggers correctly when one player reaches match-1
- [ ] Test Crawford does NOT trigger if both players reach match-1 simultaneously
- [ ] Test post-Crawford transition after Crawford game is played
- [ ] Test match win detection for both players
- [ ] Test match length cycling
- [ ] Test new match reset

### 2. Fix Crawford state management
- **Files:** App.tsx lines 23-66
- **Why:** `addPoint` transitions Crawford to `'post-crawford'` on line 26 *before* checking if the other player just reached match-1. The state machine is fragile and has edge cases.
- **Key insight:** Crawford state can't be fully derived from scores alone — you need a `crawfordGamePlayed` boolean to track whether the Crawford game has been played.
- [ ] Replace the string state machine with a `crawfordGamePlayed` boolean
- [ ] Derive display state (`'none'` | `'crawford'` | `'post-crawford'`) via `useMemo` from scores + boolean
- [ ] Handle edge case: both players reaching match-1 simultaneously (no Crawford)
- [ ] Handle edge case: gammon/backgammon jumps that skip past match-1
- [ ] Ensure all unit tests pass

### 3. Add state persistence with `react-native-mmkv`
- **Files:** App.tsx, package.json
- **Why:** The module-level `savedMatchLength` variable (line 15) is lost on app kill. Losing match state mid-game is a critical UX problem.
- [ ] Install `react-native-mmkv`
- [ ] Persist `player1Score`, `player2Score`, `matchLength`, and `crawfordGamePlayed` immediately on each state change (not on unmount)
- [ ] Restore state on app launch — consider a "Resume Match?" prompt for non-zero scores
- [ ] Remove the module-level `savedMatchLength` variable
- [ ] Test on both iOS and Android (MMKV requires native module linking)

### 4. Remove unused imports
- **Files:** App.tsx line 1, line 10
- **Why:** `useEffect`, `useRef`, and `Platform` are imported but never used.
- [ ] Remove `useEffect` and `useRef` from the React import
- [ ] Remove `Platform` from the react-native import

## MEDIUM PRIORITY — UX Improvements & Quality

### 5. Add undo last score
- **Files:** App.tsx
- **Why:** Accidental taps are inevitable during real play. No way to correct a mistake currently.
- [ ] Implement score history stack (or single previous-state snapshot)
- [ ] Add long-press gesture or small undo button that appears briefly after scoring
- [ ] Show brief undo toast/indicator
- [ ] Persist undo history in MMKV

### 6. Replace `TouchableOpacity` with `Pressable`
- **Files:** App.tsx lines 105, 117, 137
- **Why:** `TouchableOpacity` is legacy. `Pressable` is the recommended API with better performance and press feedback.
- [ ] Replace all three `TouchableOpacity` instances with `Pressable`
- [ ] Add `style` feedback using Pressable's pressed state (e.g. opacity or subtle scale)

### 7. Add haptic feedback on score tap
- **Files:** App.tsx
- **Why:** Haptic feedback makes scoring feel satisfying and confirms the tap registered.
- [ ] Start with built-in `Vibration` API (zero dependencies, sufficient for this use case)
- [ ] Add subtle vibration on score increment
- [ ] Add slightly different haptic on match win
- [ ] Only upgrade to `react-native-haptic-feedback` if you need iOS Taptic Engine patterns

### 8. Add error boundary
- **Files:** App.tsx (or new ErrorBoundary component)
- **Why:** No crash recovery exists. If any component errors during render, the entire app crashes.
- [ ] Add a top-level error boundary with a "Something went wrong" fallback
- [ ] Include a "New Match" button in the fallback to recover

### 9. Remove unused `@react-native/new-app-screen` dependency
- **Files:** package.json line 13
- **Why:** Template welcome screen package from project init, not used anywhere.
- [ ] `npm uninstall @react-native/new-app-screen`

### 10. Fix score text overflow for double digits
- **Files:** App.tsx line 111, 143, style on line 184
- **Why:** The 180px font works for single digits but will overflow at scores >= 10 in longer matches.
- [ ] Add `adjustsFontSizeToFit={true}`, `numberOfLines={1}`, and `minimumFontScale={0.5}` to score `Text` components
- [ ] Test with scores 10+ to verify layout

### 11. Add accessibility labels
- **Files:** App.tsx
- **Why:** No `accessibilityLabel` or `accessibilityHint` props anywhere. VoiceOver users can't use the app.
- [ ] Add `accessibilityLabel` and `accessibilityRole="button"` to player score areas
- [ ] Add `accessibilityLabel` to match length button
- [ ] Add `accessibilityLabel` to Crawford indicator

## LOW PRIORITY — Refactoring & Future Features

### 12. Refactor score state to `useReducer`
- **Files:** App.tsx
- **Why:** If the app grows (undo, doubling cube, game history), `useReducer` makes state transitions atomic and testable. Not necessary at current complexity — React 18+ automatic batching already handles multiple `setState` calls.
- [ ] Define action types: `SCORE`, `CYCLE_MATCH_LENGTH`, `NEW_MATCH`, `UNDO`
- [ ] Move all score/Crawford logic into a reducer function
- [ ] Replace multiple `useState` calls with one `useReducer`

### 13. Consider doubling cube support
- **Files:** App.tsx
- **Why:** Real backgammon uses a doubling cube. The `points` parameter in `addPoint` already hints at multi-point scoring.
- [ ] Add long-press to add 2 points (gammon) or 3 points (backgammon)
- [ ] Consider cube state tracking for future enhancement

---

## APP STORE SUBMISSION — Required Tasks

### BLOCKERS (Must complete before submission)

### 14. Create and add app icons
- **Files:** `ios/BackgammonScoreboard/Images.xcassets/AppIcon.appiconset/`
- **Why:** No icon images exist — just empty placeholders. Required for submission.
- **Required sizes:** 40, 58, 60, 80, 87, 120, 180, and 1024px (1024x1024 for App Store marketing)
- [ ] Design/source a 1024x1024px master icon (PNG, no transparency, no rounded corners)
- [ ] Generate all required sizes using appicon.co or similar tool
- [ ] Add all PNGs to the AppIcon.appiconset directory
- [ ] Update `Contents.json` to reference the new files

### 15. Capture App Store screenshots
- **Why:** Minimum 3 screenshots required for submission.
- **Sizes needed:** 2868x1320px (iPhone 6.9" landscape), 2796x1290px (iPhone 6.7" landscape)
- [ ] Run app on iPhone 16 Pro Max simulator
- [ ] Capture: empty scoreboard (0-0), active match (e.g. 3-2), Crawford indicator visible
- [ ] Optionally add text overlays describing features

### 16. Remove `NSLocationWhenInUseUsageDescription` from Info.plist
- **Files:** `ios/BackgammonScoreboard/Info.plist` lines 34-35
- **Why:** App doesn't use location. Empty privacy description will trigger App Store **rejection**.
- [ ] Remove the `NSLocationWhenInUseUsageDescription` key and its empty string value

### 17. Set up App Store Connect listing
- **Why:** Required to submit the app.
- [ ] Create app in App Store Connect with bundle ID `com.peterszasz.BackgammonScoreboard`
- [ ] Set primary category: Games > Board
- [ ] Write app description (mention: match lengths, Crawford rule, tap-to-score, keep-awake, no ads/tracking)
- [ ] Add keywords (e.g. "backgammon,score,scoreboard,board game,match,crawford,gammon")
- [ ] Complete age rating questionnaire (should be 4+)
- [ ] Add review notes: "Simple backgammon scoreboard. Tap left/right to add points. Tap center button to cycle match length or start new match. No network, no data collection, no login required."

### HIGH PRIORITY (Strongly recommended before submission)

### 18. Update launch screen
- **Files:** `ios/BackgammonScoreboard/LaunchScreen.storyboard`
- **Why:** Still shows "Powered by React Native" — unprofessional and may raise review concerns.
- [ ] Remove React Native branding text
- [ ] Set background to match app (#1a1a1a)
- [ ] Add app name or simple icon/logo

### 19. Add `UIRequiresFullScreen` to Info.plist
- **Files:** `ios/BackgammonScoreboard/Info.plist`
- **Why:** Prevents iPad split-screen mode which would break the landscape scoreboard layout.
- [ ] Add `<key>UIRequiresFullScreen</key><true/>` to Info.plist

### 20. Create support URL
- **Why:** Required field in App Store Connect.
- [ ] Create a GitHub repository page or simple webpage with contact info

### 21. Test on physical device
- **Why:** Simulator testing is insufficient for App Store quality.
- [ ] Test all match lengths (3, 5, 7, 9, 11, 13, 15, 17, 21)
- [ ] Test Crawford rule triggers correctly
- [ ] Test screen keep-awake works
- [ ] Test landscape orientation lock
- [ ] Verify no crashes during normal gameplay

### 22. Signing & provisioning setup
- **Why:** Required for App Store builds.
- **Team ID:** `42X8P6QCN9` (already in project)
- [ ] Verify active Apple Developer Program membership ($99/year)
- [ ] Open `BackgammonScoreboard.xcworkspace` in Xcode
- [ ] Enable "Automatically manage signing" in Signing & Capabilities
- [ ] Select team and verify provisioning profile is created

### MEDIUM PRIORITY (Nice to have for v1.0)

### 23. Add `UIUserInterfaceStyle` = Dark to Info.plist
- **Files:** `ios/BackgammonScoreboard/Info.plist`
- **Why:** Forces dark mode to match the app's dark UI, preventing system light mode from affecting status bar or alerts.

### 24. Consider iPad support
- **Why:** Currently targets iPhone only (`TARGETED_DEVICE_FAMILY = 1`). iPad users can still download iPhone-only apps but they run in compatibility mode.
- [ ] Evaluate if the layout works on iPad
- [ ] If so, update `TARGETED_DEVICE_FAMILY` to `"1,2"`
- [ ] Add iPad screenshots to App Store listing

### 25. Privacy policy page
- **Why:** May be required by App Store Connect even though the app collects no data. Privacy manifest (`PrivacyInfo.xcprivacy`) is already correctly configured.
- [ ] Create a simple page: "This app collects no personal data"
- [ ] Host on GitHub Pages or similar

---

## Recommended Implementation Order

1. Unit tests for Crawford logic (#1)
2. Fix Crawford bug (#2)
3. Remove unused imports (#4) + unused dependency (#9) + Info.plist cleanup (#16)
4. State persistence with MMKV (#3)
5. Undo functionality (#5)
6. Pressable + haptics (#6, #7)
7. Error boundary (#8)
8. Score overflow fix (#10) + accessibility (#11)
9. App icons (#14) + launch screen (#18) + screenshots (#15)
10. App Store Connect setup (#17) + signing (#22) + support URL (#20)
11. Physical device testing (#21)
12. Submit to App Store
