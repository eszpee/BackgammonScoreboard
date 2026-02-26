# Backgammon Scoreboard

A minimal iOS scoreboard for tournament backgammon matches. Designed to do one thing well: track match scores with Crawford rule support. No player names, no timers, no doubling cube — if it wouldn't be on a paper scoreboard, it isn't here.

## Features

- **Two score panels** — tap either side to add a point; the score bounces to confirm
- **Score correction** — long-press a panel to decrease a score by one (confirmation required)
- **Match length** — tap the center when scores are 0–0 to cycle forward (3, 5, 7 … 21); long-press to cycle backward
- **New match** — tap or long-press the center while a match is in progress to reset scores
- **Crawford rule** — automatically detected and displayed; transitions to Post-Crawford after the following game
- **Match over alert** — shown when a player reaches the target score, with an option to start a new match
- **State persistence** — match state is saved and silently restored when the app is reopened
- **Screen always on** — the display stays awake while the app is open
- **Haptic feedback** — taps, corrections, and match events all have distinct feedback
- **Light and dark themes** — follows the system appearance by default; override in iOS Settings

## Appearance

The app supports light mode, dark mode, and system-following mode. To change the preference, go to **iOS Settings → Backgammon Scoreboard → Appearance**.

## Development

### Prerequisites

- Node 20+
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

## Tech stack

- React Native 0.81.4 (New Architecture)
- TypeScript
- [`@react-native-async-storage/async-storage`](https://github.com/react-native-async-storage/async-storage) — state persistence
- [`react-native-haptic-feedback`](https://github.com/mkuczera/react-native-haptic-feedback) — haptics
- [`react-native-keep-awake`](https://github.com/corbt/react-native-keep-awake) — screen always on

## License

MIT
