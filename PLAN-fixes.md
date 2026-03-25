# Optimization & App Store Submission Plan

## Completed (PRs #45–#50, merged to main)

- [x] Unit tests for Crawford logic (`__tests__/crawfordLogic.test.ts`) — PR #50
- [x] Fix Crawford state management (crawfordBaseScore tracking, decrease-point rollback)
- [x] State persistence with AsyncStorage (persist on every state change, restore on launch)
- [x] Remove unused imports and dependencies
- [x] Replace `TouchableOpacity` with `Pressable`
- [x] Add haptic feedback (`react-native-haptic-feedback`)
- [x] Add error boundary with crash recovery — PR #49
- [x] Score text overflow fix (`adjustsFontSizeToFit`)
- [x] Add accessibility labels and roles — PR #49
- [x] Clean up Info.plist (remove location key, add `UIRequiresFullScreen`) — PR #45
- [x] Native appearance override via `Settings.bundle` + `AppDelegate.swift` — PR #45
- [x] Update launch screen (remove React Native branding, use splash image) — PR #48
- [x] Create support page and privacy policy (GitHub Pages) — PR #47
- [x] Pre-release cleanup (version bump to 1.0.0, dev-mode error logging) — PR #46
- [x] Flip-chart score animation (built-in Animated API, `useNativeDriver: true`)
- [x] Light/dark theme support with iOS Settings.bundle toggle
- [x] Coil-binding decorative element

---

## Remaining — App Store Submission

### BLOCKERS (Must complete before submission)

### 1. Create and add app icons
- **Files:** `ios/BackgammonScoreboard/Images.xcassets/AppIcon.appiconset/`
- **Why:** No icon images exist — just empty placeholders. Required for submission.
- [ ] Design/source a 1024x1024px master icon (PNG, no transparency, no rounded corners)
- [ ] Generate all required sizes using appicon.co or similar tool
- [ ] Add all PNGs to the AppIcon.appiconset directory
- [ ] Update `Contents.json` to reference the new files

### 2. Capture App Store screenshots
- **Why:** Minimum 3 screenshots required for submission.
- **Sizes needed:** 2868x1320px (iPhone 6.9" landscape), 2796x1290px (iPhone 6.7" landscape)
- [ ] Run app on iPhone 16 Pro Max simulator
- [ ] Capture: empty scoreboard (0-0), active match (e.g. 3-2), Crawford indicator visible
- [ ] Optionally add text overlays describing features

### 3. Set up App Store Connect listing
- **Why:** Required to submit the app.
- **Bundle ID:** `com.peterszasz.BackgammonScoreboard`
- [ ] Create app in App Store Connect
- [ ] Set primary category: Games > Board
- [ ] Write app description (mention: match lengths, Crawford rule, tap-to-score, keep-awake, no ads/tracking)
- [ ] Add keywords (e.g. "backgammon,score,scoreboard,board game,match,crawford,gammon")
- [ ] Complete age rating questionnaire (should be 4+)
- [ ] Add review notes: "Simple backgammon scoreboard. Tap left/right to add points. Tap center button to cycle match length or start new match. No network, no data collection, no login required."

### 4. Signing & provisioning setup
- **Team ID:** `42X8P6QCN9` (already in project)
- [ ] Verify active Apple Developer Program membership
- [ ] Open `BackgammonScoreboard.xcworkspace` in Xcode
- [ ] Enable "Automatically manage signing" in Signing & Capabilities
- [ ] Select team and verify provisioning profile is created

### 5. Test on physical device
- [ ] Test all match lengths (3, 5, 7, 9, 11, 13, 15, 17, 21)
- [ ] Test Crawford rule triggers correctly
- [ ] Test screen keep-awake works
- [ ] Test landscape orientation lock
- [ ] Verify no crashes during normal gameplay
- [ ] Test light/dark/system appearance modes

---

## Backlog (Post v1.0)

### Consider iPad support
- Currently targets iPhone only (`TARGETED_DEVICE_FAMILY = 1`). iPad users can still download in compatibility mode.
- [ ] Evaluate if the layout works on iPad
- [ ] If so, update `TARGETED_DEVICE_FAMILY` to `"1,2"` and add iPad screenshots

### Tally marks display mode
- Toggle via Settings.bundle to show traditional tally groups of 5 alongside scores

### Doubling cube support
- Long-press to add 2 points (gammon) or 3 points (backgammon)

### Refactor to `useReducer`
- If the app grows further, move state transitions to a reducer for testability
