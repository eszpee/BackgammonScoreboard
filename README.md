# Backgammon Scoreboard

A minimal iOS scoreboard for tournament backgammon matches. Designed to do one thing well: track match scores with Crawford rule support. No player names, no timers, no doubling cube — if it wouldn't be on a paper scoreboard, it isn't here.

## Features

- **Two score panels** — tap either side to add a point
- **Flip-chart animation** — scores animate with a physical flip-card effect, rotating around the coil axis
- **Score correction** — long-press a panel to decrease a score by one (confirmation required)
- **Match length** — tap the center when scores are 0–0 to cycle forward (3, 5, 7 … 21); long-press to cycle backward
- **New match** — tap or long-press the center while a match is in progress to reset scores
- **Crawford rule** — automatically detected and displayed; transitions to Post-Crawford after the following game
- **Match over alert** — shown when a player reaches the target score, with an option to start a new match
- **State persistence** — match state is saved to AsyncStorage and silently restored when the app is reopened
- **Screen always on** — the display stays awake while the app is open
- **Haptic feedback** — taps, corrections, and match events all have distinct haptic feedback
- **Light and dark themes** — follows the system appearance by default; override in iOS Settings
- **Error boundary** — catches unexpected crashes and offers a "New Match" recovery button
- **Accessibility** — VoiceOver labels and roles on all interactive elements

## Appearance

The app supports light mode, dark mode, and system-following mode. To change the preference, go to **iOS Settings → Backgammon Scoreboard → Appearance**.

## Development

### Prerequisites

- Node 22+
- Xcode 16+ with iOS SDK
- CocoaPods (`gem install cocoapods` or via Bundler)

### Install dependencies

```sh
npm install
bundle install        # installs CocoaPods via Bundler
bundle exec pod install
```

### Run on iOS

```sh
npm run ios
```

Or open `ios/BackgammonScoreboard.xcworkspace` in Xcode and run from there.

### Run tests

```sh
npm test
```

## Tech stack

- React Native 0.84.0 (New Architecture / Fabric)
- TypeScript, single-file architecture (`App.tsx`)
- [`@react-native-async-storage/async-storage`](https://github.com/react-native-async-storage/async-storage) — state persistence
- [`react-native-haptic-feedback`](https://github.com/mkuczera/react-native-haptic-feedback) — haptics
- [`react-native-keep-awake`](https://github.com/corbt/react-native-keep-awake) — screen always on
- [`react-native-safe-area-context`](https://github.com/th3rdwave/react-native-safe-area-context) — notch/island insets

## Privacy

This app collects no data, makes no network requests, and uses no analytics or tracking. See the full [privacy policy](https://eszpee.github.io/BackgammonScoreboard/privacy.html).

## Support

- Support page: [eszpee.github.io/BackgammonScoreboard](https://eszpee.github.io/BackgammonScoreboard/)
- Report issues: [github.com/eszpee/BackgammonScoreboard/issues](https://github.com/eszpee/BackgammonScoreboard/issues)

## License

MIT
