# Manual Tasks: Backgammon Scoreboard iOS

These tasks require human action outside the codebase (design tools, Xcode, App Store Connect).
All automated implementation tasks are complete.

---

## [x] 1. App Icon

**Task ID**: `phase-7-appstore-04`
**Blocker**: App Store will reject without a custom icon.

1. [x] Design or source a **1024×1024px master PNG**
   - No transparency, no rounded corners (Apple applies them)
   - Suggested direction: dark background (#1a1a1a) with a clean backgammon-related mark (stylized board, pips, or score numerals in white)
2. [x] Generate all required sizes from the master using a tool (appicon.co, MakeAppIcon, or Xcode's asset catalog importer):
   - 40×40, 58×58, 60×60, 80×80, 87×87, 120×120, 180×180, 1024×1024
3. [x] Place all PNGs in: `ios/BackgammonScoreboard/Images.xcassets/AppIcon.appiconset/`
4. [x] Update `Contents.json` in that directory — add `"filename"` fields referencing each PNG for the matching `idiom`/`scale`/`size` entry

---

## [ ] 2. App Store Connect Listing

**Task ID**: `phase-7-appstore-05`
**URL**: https://appstoreconnect.apple.com

1. Create new app
   - **Bundle ID**: `com.peterszasz.BackgammonScoreboard`
   - **Name**: Backgammon Scoreboard
2. **Category**: Games → Board
3. **Age rating**: 4+ (no objectionable content)
4. **Description** (suggested):
   > A clean, distraction-free backgammon match scoreboard. Tap left or right to score. Supports all standard match lengths, the Crawford rule, and keeps your screen awake during play. No ads, no accounts, no internet required.
5. **Keywords**: `backgammon,score,scoreboard,board game,match,crawford,gammon,tournament`
6. **Review notes**:
   > Simple backgammon scoreboard. Tap left/right to add points, long press to undo. Tap center to cycle match length or start new match. No network, no data collection, no login required.
7. **Support URL**: GitHub repository URL (or any simple page)
8. **Privacy policy URL**: Optional — a page stating "This app collects no personal data."

---

## [ ] 3. Xcode Signing

**Task ID**: `phase-7-appstore-06`

1. Open `ios/BackgammonScoreboard.xcworkspace` in Xcode
2. Select the `BackgammonScoreboard` target → **Signing & Capabilities** tab
3. Enable **Automatically manage signing**
4. Select team **42X8P6QCN9**
5. Verify provisioning profile is auto-created with no errors
6. In the **General** tab: set Version to `1.0` and Build Number to `1`

---

## [ ] 4. App Store Screenshots

**Task ID**: `phase-7-appstore-07`

Minimum 3 screenshots required. Capture in **landscape** orientation.

| Device | Simulator | Required size |
|--------|-----------|---------------|
| iPhone 16 Pro Max | iOS Simulator | 2868×1320px |
| iPhone 8 Plus | iOS Simulator | 2208×1242px |

Suggested shots:
- (a) Fresh 0-0 scoreboard
- (b) Active match mid-game (e.g., 4-2 in a match to 7)
- (c) Crawford indicator visible (one player at match-1)

Upload in App Store Connect under the iOS app listing.

---

## [ ] 5. Physical Device Testing

**Task ID**: `phase-6-appstore-08`

Test on a real iPhone before submitting. Verify:

- [ ] All match lengths cycle correctly (3 → 5 → 7 → 9 → 11 → 13 → 15 → 17 → 21)
- [ ] Crawford triggers at match-1 for either player, not when both are at match-1
- [ ] Post-Crawford clears after the Crawford game
- [ ] Long press undo shows confirmation dialog; Cancel/Undo both work
- [ ] Haptic fires on every score tap
- [ ] Stronger haptic pattern fires on match win
- [ ] Screen stays awake during play
- [ ] Landscape lock holds (no portrait rotation)
- [ ] State persists after force-quit and restore
- [ ] New Match confirmation from center button resets to 0-0
- [ ] App doesn't crash during extended play at all match lengths

---

## Optional: Cleanup Before Submission

- Consider removing `NSAllowsLocalNetworking: true` from `Info.plist` (was in the RN template for Metro bundler; the shipping app has no network dependency). Low priority — won't cause rejection, but cleaner without it.

---

*Last updated: 2026-02-18*
*Automated tasks: complete. Manual tasks remaining: 4.*
