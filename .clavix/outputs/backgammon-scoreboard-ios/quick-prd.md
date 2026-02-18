# Backgammon Scoreboard iOS - Quick PRD

Build the digital equivalent of a tournament paper scoreboard for backgammon. One thing, done well. The app already exists (React Native, iOS, landscape-only) with core scoring and Crawford rule tracking. This release adds: undo via long press on a player side (no dialog), haptic feedback on score tap with a distinct haptic on match win, per-game tally marks below each score (paper scoreboard style: groups of 5 with 4 vertical strokes + diagonal cross, one mark per point scored; toggled via iOS Settings app), a subtle score animation (bounce/scale) when a point is added, and silent state persistence so match state is fully restored after force-quit. Also add `adjustsFontSizeToFit` to score text as a safety net for smaller devices.

Tech stack is React Native (existing). Use AsyncStorage or react-native-mmkv for persistence. Built-in `Vibration` API for haptics (no new native dependencies unless Taptic Engine patterns are needed). React Native `Animated` or `react-native-reanimated` for score animation. Tally marks are derived from score state and rendered below each score number. Settings are exposed via a native iOS `Settings.bundle` (no in-app settings screen needed); the tally toggle reads its value from `NSUserDefaults` at render time. This settings approach is extensible for future preferences. Preserve the existing design: dark background (#1a1a1a), light score boxes (#f5f5f5), red Crawford indicator, landscape-only orientation.

App Store submission requires: custom app icon (1024×1024 master), launch screen without React Native branding (dark #1a1a1a background), remove `NSLocationWhenInUseUsageDescription` from Info.plist (causes rejection), add `UIRequiresFullScreen` and `UIUserInterfaceStyle=Dark` to Info.plist, App Store Connect listing (bundle ID `com.peterszasz.BackgammonScoreboard`, category Games > Board, 4+ rating), signing configured in Xcode (Team ID `42X8P6QCN9`), support URL, and physical device testing across all match lengths. Out of scope: player names, timers, gammon/backgammon as separate actions (user taps multiple times), doubling cube, multiple themes, iPad layout, cross-match history, sound, social features, network, or analytics.

---

*Generated with Clavix Planning Mode*
*Generated: 2026-02-18T00:00:00Z*
