# Implementation Plan

**Project**: backgammon-scoreboard-ios
**Generated**: 2026-02-18T00:00:00Z

## Technical Context & Standards

- **Architecture**: Single-file React Native app (`App.tsx`), all logic and styles colocated
- **Framework**: React Native 0.81.4, New Architecture enabled, iOS only
- **Styling**: `StyleSheet` (React Native built-in), dark theme (#1a1a1a bg, #f5f5f5 cards)
- **State**: `useState` (no external library). Add state snapshot ref for undo.
- **Persistence**: `AsyncStorage` for match state (silent restore on launch)
- **Haptics**: React Native built-in `Vibration` API (no new native deps needed)
- **Animation**: React Native built-in `Animated` API
- **Conventions**: TypeScript, functional components, hooks. Keep everything in `App.tsx` unless a component grows unwieldy.

---

## Phase 1: Code Cleanup

- [ ] **Remove unused imports** (ref: PRD Additional Context)
  Task ID: `phase-1-cleanup-01`
  > **Implementation**: Edit `App.tsx` line 1.
  > **Details**: Remove `useEffect` and `useRef` from the React import. Remove `Platform` from the `react-native` import. Leave all other imports intact.

- [ ] **Remove unused dependency** (ref: PRD Additional Context)
  Task ID: `phase-1-cleanup-02`
  > **Implementation**: Run `npm uninstall @react-native/new-app-screen` in the project root.
  > **Details**: This is the React Native template welcome screen package imported nowhere in the project. Verify `package.json` no longer lists it after uninstalling.

- [ ] **Replace TouchableOpacity with Pressable** (ref: PRD polish)
  Task ID: `phase-1-cleanup-03`
  > **Implementation**: Edit `App.tsx`. Replace all three `TouchableOpacity` instances (player 1 section, player 2 section, match length button) with `Pressable`.
  > **Details**: Use Pressable's `style` prop with the pressed state to replicate the opacity feedback: `style={({ pressed }) => [styles.playerSection, { opacity: pressed ? 0.7 : 1 }]}`. Remove `activeOpacity` prop (Pressable doesn't use it). Keep `onPress` and add `onLongPress` placeholder (wired up in Phase 3).

- [ ] **Add font safety to score text** (ref: PRD Feature 11)
  Task ID: `phase-1-cleanup-04`
  > **Implementation**: Edit `App.tsx`. Find both score `<Text style={styles.scoreText}>` elements (lines 111 and 143).
  > **Details**: Add `adjustsFontSizeToFit={true}`, `numberOfLines={1}`, and `minimumFontScale={0.4}` props to both. This prevents overflow at high scores (e.g., match to 21 on small devices) while keeping the large font on modern iPhones.

---

## Phase 2: State Persistence

- [ ] **Install AsyncStorage** (ref: PRD Technical Requirements)
  Task ID: `phase-2-persistence-01`
  > **Implementation**: Run `npm install @react-native-async-storage/async-storage` then `cd ios && pod install`.
  > **Details**: This is the standard RN community package for persistent key-value storage. Required for saving match state across app restarts. Verify it appears in `package.json` dependencies after install.

- [ ] **Implement match state persistence** (ref: PRD Feature 10)
  Task ID: `phase-2-persistence-02`
  > **Implementation**: Edit `App.tsx`.
  > **Details**:
  > 1. Import `AsyncStorage` from `@react-native-async-storage/async-storage`.
  > 2. On app launch, read the saved state key `'matchState'` from AsyncStorage. Parse JSON. If found and scores are non-zero, silently restore `player1Score`, `player2Score`, `matchLength`, and `crawfordState`. Use a `useEffect` with an empty dependency array for this.
  > 3. After every state change that affects scores, match length, or Crawford, write the current state to AsyncStorage under key `'matchState'`. Use a `useEffect` that depends on `[player1Score, player2Score, matchLength, crawfordState]`.
  > 4. On "New Match" reset (both the Alert confirmation path and the match-win path), clear or overwrite the stored state with zeros so restore doesn't bring back a finished match.
  > 5. Remove the module-level `savedMatchLength` variable and its assignments entirely.

---

## Phase 3: Undo

- [ ] **Implement undo state snapshot** (ref: PRD Feature 6)
  Task ID: `phase-3-undo-01`
  > **Implementation**: Edit `App.tsx`.
  > **Details**:
  > 1. Add a `useRef` to hold the previous state snapshot: `const previousState = useRef<{player1Score: number, player2Score: number, crawfordState: 'none'|'crawford'|'post-crawford'} | null>(null)`.
  > 2. At the top of `addPoint`, before any state updates, save the current state into `previousState.current`.
  > 3. Add an `undoLastPoint` function: if `previousState.current` is not null, show an `Alert.alert('Undo last point?', '', [{ text: 'Cancel', style: 'cancel' }, { text: 'Undo', onPress: () => { restore previousState.current; set previousState.current = null; } }])`. Only one level of undo.
  > 4. Wire `undoLastPoint` to `onLongPress` on **both** player `Pressable` components (long press on either side — this is simpler and correctly handles Crawford state reversions).
  > 5. If `previousState.current` is null (nothing to undo), the long press does nothing silently.
  > 6. Note: `matchLength` is intentionally excluded from undo scope; match length changes are deliberate.

---

## Phase 4: Haptic Feedback

- [ ] **Add haptic feedback on score and match win** (ref: PRD Feature 7)
  Task ID: `phase-4-haptics-01`
  > **Implementation**: Edit `App.tsx`.
  > **Details**:
  > 1. Add `Vibration` to the `react-native` import (it's already available, just needs to be imported).
  > 2. In `addPoint`, after updating the score but before the match-win Alert, call `Vibration.vibrate(10)` for a subtle tap feedback.
  > 3. For match win, use a distinct pattern: `Vibration.vibrate([0, 30, 60, 30])` (short-pause-short pattern) just before the Alert fires. Place this inside both the player 1 and player 2 win branches.
  > 4. No haptic on undo — silent feels more appropriate.

---

## Phase 5: Score Animation

- [ ] **Add score bounce animation on point scored** (ref: PRD Feature 9)
  Task ID: `phase-5-animation-01`
  > **Implementation**: Edit `App.tsx`.
  > **Details**:
  > 1. Import `Animated` from `react-native`.
  > 2. Create two animated values: `const score1Anim = useRef(new Animated.Value(1)).current` and `const score2Anim = useRef(new Animated.Value(1)).current`.
  > 3. Write a `triggerBounce(anim: Animated.Value)` helper: `Animated.sequence([Animated.timing(anim, { toValue: 1.15, duration: 80, useNativeDriver: true }), Animated.spring(anim, { toValue: 1, useNativeDriver: true })])`.
  > 4. Call `triggerBounce(score1Anim)` when player 1 scores, `triggerBounce(score2Anim)` when player 2 scores.
  > 5. Wrap each `<Text style={styles.scoreText}>` in `<Animated.Text>` with `style={[styles.scoreText, { transform: [{ scale: scoreNAnim }] }]}`.

---

## Phase 6: iOS / App Store Prep

- [ ] **Fix Info.plist: remove location permission** (ref: PRD App Store Blocker #14)
  Task ID: `phase-7-appstore-01`
  > **Implementation**: Edit `ios/BackgammonScoreboard/Info.plist`.
  > **Details**: Remove lines 34-35 — the `<key>NSLocationWhenInUseUsageDescription</key>` and its empty `<string></string>` value. This empty permission string will cause App Store rejection.

- [ ] **Fix Info.plist: add required keys** (ref: PRD Recommended #18, #19)
  Task ID: `phase-7-appstore-02`
  > **Implementation**: Edit `ios/BackgammonScoreboard/Info.plist`.
  > **Details**: Add two keys before the closing `</dict>`:
  > 1. `<key>UIRequiresFullScreen</key><true/>` — prevents iPad split-screen from breaking the landscape layout.
  > 2. `<key>UIUserInterfaceStyle</key><string>Dark</string>` — forces dark mode system-wide for this app, preventing the status bar or any system alerts from going light.

- [ ] **Fix LaunchScreen.storyboard** (ref: PRD App Store Blocker #13)
  Task ID: `phase-7-appstore-03`
  > **Implementation**: Edit `ios/BackgammonScoreboard/LaunchScreen.storyboard`.
  > **Details**:
  > 1. Remove the `<label>` element with `text="Powered by React Native"` (id `MN2-I3-ftu`) and its associated `<constraint>` elements that reference it (`OZV-Vh-mqD`, `akx-eg-2ui`, `i1E-0Y-4RG`).
  > 2. Change the view background color from `systemBackgroundColor` to a custom color matching `#1a1a1a`: replace `<color key="backgroundColor" systemColor="systemBackgroundColor" cocoaTouchSystemColor="whiteColor"/>` with `<color key="backgroundColor" red="0.10196" green="0.10196" blue="0.10196" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>`.
  > 3. Update the remaining app name label (id `GJd-Yh-RWb`) text color to white: add `<color key="textColor" white="1" alpha="1" colorSpace="calibratedWhite"/>` inside it.

- [ ] **Create app icon** (ref: PRD App Store Blocker #12)
  Task ID: `phase-7-appstore-04`
  > **Implementation**: Manual design + file placement task.
  > **Details**:
  > 1. Design or source a 1024×1024px master PNG. No transparency, no rounded corners (Apple applies them). Suggested direction: dark background (#1a1a1a) with a clean backgammon-related mark (e.g., a stylized board, pips, or score numerals in white).
  > 2. Use a generator tool (appicon.co, MakeAppIcon, or Xcode's asset importer) to produce all required sizes from the master: 40×40, 58×58, 60×60, 80×80, 87×87, 120×120, 180×180, 1024×1024.
  > 3. Place all PNGs in `ios/BackgammonScoreboard/Images.xcassets/AppIcon.appiconset/`.
  > 4. Update `Contents.json` in that directory to add `"filename"` fields referencing each PNG for the matching `idiom`/`scale`/`size` entry.

- [ ] **App Store Connect listing** (ref: PRD App Store Blocker #15)
  Task ID: `phase-7-appstore-05`
  > **Implementation**: Manual task in App Store Connect (appstoreconnect.apple.com).
  > **Details**:
  > 1. Create new app. Bundle ID: `com.peterszasz.BackgammonScoreboard`. Name: "Backgammon Scoreboard".
  > 2. Category: Games → Board.
  > 3. Age rating: 4+ (no objectionable content).
  > 4. Description (suggested): "A clean, distraction-free backgammon match scoreboard. Tap left or right to score. Supports all standard match lengths, the Crawford rule, and keeps your screen awake during play. No ads, no accounts, no internet required."
  > 5. Keywords: `backgammon,score,scoreboard,board game,match,crawford,gammon,tournament`
  > 6. Review notes: "Simple backgammon scoreboard. Tap left/right to add points, long press to undo. Tap center to cycle match length or start new match. No network, no data collection, no login required."
  > 7. Support URL: GitHub repository URL (or a simple page).
  > 8. Privacy policy URL: Optional page stating "This app collects no personal data."

- [ ] **Xcode signing setup** (ref: PRD App Store Blocker #16)
  Task ID: `phase-7-appstore-06`
  > **Implementation**: Manual task in Xcode.
  > **Details**:
  > 1. Open `ios/BackgammonScoreboard.xcworkspace`.
  > 2. Select the `BackgammonScoreboard` target → Signing & Capabilities tab.
  > 3. Enable "Automatically manage signing". Select team `42X8P6QCN9`.
  > 4. Verify provisioning profile is auto-created with no errors.
  > 5. Set version to 1.0 and build number to 1 in the General tab.

- [ ] **Capture App Store screenshots** (ref: PRD Recommended #21)
  Task ID: `phase-7-appstore-07`
  > **Implementation**: Manual task using iOS Simulator.
  > **Details**:
  > 1. Run app on iPhone 16 Pro Max simulator (landscape, required size: 2868×1320px).
  > 2. Capture at least 3 screenshots: (a) fresh 0-0 scoreboard, (b) active match mid-game (e.g., 4-2 in a match to 7), (c) Crawford indicator visible.
  > 3. Also capture on iPhone 8 Plus simulator (2208×1242px) for older device support.
  > 4. Upload in App Store Connect under the iOS app listing.

- [ ] **Physical device testing** (ref: PRD Recommended #20)
  Task ID: `phase-6-appstore-08`
  > **Implementation**: Manual QA task.
  > **Details**: Test on a real iPhone (not just simulator). Verify: all match lengths cycle correctly, Crawford triggers and clears correctly, undo confirmation works, haptics fire, screen stays awake, landscape lock holds, state persists after force-quit and restore, app doesn't crash during extended play.

---

## Backlog (Future Release)

### Tally Marks
A paper-scoreboard-style tally display below each score, toggled via iOS Settings app.
- Create `Settings.bundle` in Xcode with a "Show Tally" toggle
- Read `NSUserDefaults` via RN's built-in `Settings` module, subscribe to live changes
- Implement `TallyMarks` component: groups of 5 (4 vertical strokes + diagonal cross), rendered as styled `View` elements
- Add below each score box, conditionally shown based on the setting

---

## Implementation Order Rationale

1. **Phase 1 first** — cleanup reduces noise before adding new code
2. **Phase 2 before Phase 3** — persistence needs to be in place before undo
3. **Phase 4 & 5 are independent** — can be done in any order after Phase 2
4. **Phase 6 last** — app must be feature-complete before App Store prep

---

## Related Files
- Full PRD: `.clavix/outputs/backgammon-scoreboard-ios/full-prd.md`
- Quick PRD: `.clavix/outputs/backgammon-scoreboard-ios/quick-prd.md`
- Source: `App.tsx` (single-file app)
- iOS config: `ios/BackgammonScoreboard/Info.plist`
- Launch screen: `ios/BackgammonScoreboard/LaunchScreen.storyboard`
- App icons: `ios/BackgammonScoreboard/Images.xcassets/AppIcon.appiconset/`

*Generated by Clavix /clavix:plan*
