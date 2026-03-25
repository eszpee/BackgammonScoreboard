# BackgammonScoreboard — Code Walkthrough

*2026-03-24T19:26:14Z by Showboat 0.6.1*
<!-- showboat-id: f585c1a5-9f7c-401b-8f1f-86f85f5202ca -->

## Overview

BackgammonScoreboard is a single-file React Native app (~730 lines) that serves as a digital tournament backgammon scoreboard. It's iOS-only, landscape-oriented, and deliberately minimal — if it wouldn't appear on a paper scoreboard, it's not here. No player names, no timers, no doubling cube.

The entire app lives in `App.tsx`. It exports five components:
- **FlipCard** — an animated card that simulates a physical flip-chart page turn
- **CoilBinding** — a decorative row of spiral-binding loops along the top of each card
- **App** — the main component: state, logic, and layout
- **ErrorBoundary** — a class component that catches render errors and offers crash recovery
- **AppWithBoundary** — the default export, wrapping `App` in `ErrorBoundary`

## 1. Imports & Constants

```bash
sed -n '1,26p' App.tsx
```

```output
import React, { useState, useRef, useEffect } from 'react';
import {
  Text,
  View,
  Pressable,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
  useColorScheme,
  Settings,
  AppState,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HapticFeedback from 'react-native-haptic-feedback';
import KeepAwake from 'react-native-keep-awake';

const STORAGE_KEY = 'matchState';
const HAPTIC_OPTIONS = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };
const MATCH_LENGTHS = [3, 5, 7, 9, 11, 13, 15, 17, 21];
const SCORE_FONT_SIZE = 210;
const FLIP_DURATION_OUT = 180;
const FLIP_DURATION_IN = 200;
const BUILD_ID = '20260228-3';

```

The app uses only three external native dependencies beyond React Native itself:

- **react-native-safe-area-context** — handles notch/island insets on modern iPhones
- **@react-native-async-storage/async-storage** — persists match state across app restarts
- **react-native-haptic-feedback** — tactile feedback on score changes
- **react-native-keep-awake** — prevents the screen from dimming mid-match

Everything else comes from React Native's built-in modules: `Animated` for flip animations, `Settings` for reading the iOS Settings.bundle appearance preference, `AppState` for detecting app foregrounding, `Alert` for confirmation dialogs, and `Pressable` for touch handling.

Key constants:
- `MATCH_LENGTHS` — the allowed match lengths, cycled through by tapping the center panel
- `SCORE_FONT_SIZE` at 210 — the large score digits dominate the screen by design
- `FLIP_DURATION_OUT` / `FLIP_DURATION_IN` — the two phases of the flip animation (180ms out, 200ms in) are intentionally asymmetric for a natural feel
- `BUILD_ID` — a visible version stamp rendered in the corner for debugging

## 2. Types & Theme Palettes

```bash
sed -n '27,66p' App.tsx
```

```output
type CrawfordState = 'none' | 'crawford' | 'post-crawford';
type AppearanceMode = 'system' | 'light' | 'dark';

interface MatchState {
  player1Score: number;
  player2Score: number;
  matchLength: number;
  crawfordState: CrawfordState;
  crawfordBaseScore: number;
}

const LIGHT = {
  background:       '#f0ede8',
  card:             '#ffffff',
  scoreText:        '#111111',
  matchLabel:       '#888888',
  matchNumber:      '#111111',
  coilBg:           '#f0ede8',
  coilBorder:       '#b0aeab',
  hintText:         '#6e6b68',
  statusBar:        'dark-content' as const,
  shadowOpacity:    0.18,
  crawfordBg:       '#c0392b',
  postCrawfordBg:   '#4a5568',
};

const DARK = {
  background:       '#1c1a17',
  card:             '#2c2926',
  scoreText:        '#f0ede8',
  matchLabel:       '#8a8480',
  matchNumber:      '#f0ede8',
  coilBg:           '#1c1a17',
  coilBorder:       '#5a5855',
  hintText:         '#9a9794',
  statusBar:        'light-content' as const,
  shadowOpacity:    0.40,
  crawfordBg:       '#e74c3c',
  postCrawfordBg:   '#64748b',
};
```

**CrawfordState** is a backgammon-specific concept. In tournament play, when one player reaches match point (one win away from winning the match), the *Crawford rule* applies: the next game must be played without the doubling cube. After that single Crawford game, doubling is allowed again (post-Crawford). The app tracks this as a three-state machine: `none` → `crawford` → `post-crawford`.

**crawfordBaseScore** records the *other* player's score at the moment Crawford was triggered. This is needed for the undo logic — if someone decreases a score, the app needs to know whether to revert from post-Crawford back to Crawford.

**MatchState** bundles everything needed to fully restore a match: both scores, the match length, and the Crawford tracking fields.

The **LIGHT** and **DARK** palettes are structurally identical objects with warm, muted tones — not pure black/white. The dark theme uses `#1c1a17` (warm charcoal) and the light uses `#f0ede8` (warm cream). The Crawford badge gets a brighter red in dark mode (`#e74c3c` vs `#c0392b`) for better contrast. Shadow opacity also increases in dark mode (0.40 vs 0.18) since shadows need more intensity against dark backgrounds.

## 3. FlipCard — The Animation Engine

FlipCard is the most technically interesting component. It simulates a physical flip-chart — like an airport departure board or a desk calendar — where pages rotate around a coil binding at the top edge.

The component uses a **two-layer model**: a bottom card (always static) and a top card (animated). When the value changes, one layer shows the old value and the other shows the new value, and the top layer animates a rotation to reveal or cover the bottom.

```bash
sed -n '82,90p' App.tsx
```

```output
function FlipCard({ value, renderContent, style, cardStyle }: FlipCardProps) {
  // Two-layer model:
  //   bottom – static card always visible behind the top layer (destination value)
  //   top    – animated card that rotates away/in around the top (coil) axis
  const [bottomVal, setBottomVal] = useState(value);
  const [topVal, setTopVal] = useState(value);
  const prevValue = useRef(value);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [cardHeight, setCardHeight] = useState(0);
```

The component tracks:
- `bottomVal` / `topVal` — the numbers displayed on each layer (independent of the parent's `value`)
- `prevValue` — a ref to detect direction of change (increment vs decrement)
- `flipAnim` — a single `Animated.Value` controlling the rotation angle (0° = flat, 90° = edge-on)
- `cardHeight` — measured via `onLayout`, needed for the pivot-point math

The animation logic is direction-aware:

```bash
sed -n '105,134p' App.tsx
```

```output
    if (dir === 1) {
      // INCREMENT: new card appears underneath; old top card folds backward from coil axis.
      setBottomVal(value);        // bottom shows destination immediately
      setTopVal(oldValue);        // ensure top shows the correct current value (guards against rapid taps)
      flipAnim.setValue(0);       // top is flat
      Animated.timing(flipAnim, {
        toValue: 90,              // top folds backward (away from viewer)
        duration: FLIP_DURATION_OUT,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setTopVal(value);       // sync top to new value
          flipAnim.setValue(0);   // reset top to flat
        }
      });
    } else {
      // DECREMENT: new lower card falls in from above the coil, covering the old card.
      setBottomVal(oldValue);     // keep old value as the background
      setTopVal(value);           // top shows new (lower) value
      flipAnim.setValue(90);      // top starts "behind" coil (same position as end of increment)
      Animated.timing(flipAnim, {
        toValue: 0,               // top falls to flat, covering bottom
        duration: FLIP_DURATION_IN,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setBottomVal(value);    // sync bottom
        }
      });
    }
```

**Increment** (score goes up): The bottom layer immediately shows the new value. The top layer shows the *old* value and rotates from 0° to 90° (folds backward away from the viewer), revealing the new value underneath. Once the animation finishes, the top layer resets to flat showing the new value — visually seamless.

**Decrement** (score goes down): The opposite choreography. The bottom keeps the old value. The top starts at 90° (hidden above the coil) showing the new value, then rotates from 90° to 0° (falls into place), covering the old bottom.

The `if (finished)` guard prevents state corruption when animations are interrupted by rapid taps. The `useNativeDriver: true` is critical — it runs the animation on the native UI thread for 60fps smoothness, and was the key finding during development (the JS-thread-driven `useNativeDriver: false` is broken for `rotateX` on RN 0.84's Fabric renderer).

Now for the pivot-point math:

```bash
sed -n '138,165p' App.tsx
```

```output
  const half = cardHeight / 2;
  const rotateX = flipAnim.interpolate({ inputRange: [-90, 90], outputRange: ['-90deg', '90deg'] });

  // Rotate around the TOP edge (coil axis) using the translate-rotate-translate trick.
  const animStyle = {
    transform: [
      { perspective: 900 },
      { translateY: -half },
      { rotateX },
      { translateY: half },
    ],
  };

  return (
    <View
      style={style}
      onLayout={e => setCardHeight(e.nativeEvent.layout.height)}
    >
      {/* Bottom layer: destination card, becomes visible as top card rotates away */}
      <View style={[StyleSheet.absoluteFill, cardStyle as object]}>
        {renderContent(bottomVal)}
      </View>
      {/* Top layer: animated card rotating around the top (coil) axis */}
      <Animated.View style={[StyleSheet.absoluteFill, cardStyle as object, animStyle]}>
        {renderContent(topVal)}
      </Animated.View>
    </View>
  );
```

The **translate-rotate-translate trick** is the key to making rotation happen around the top edge instead of the center. By default, `rotateX` rotates around the vertical center of the element. The transform chain:

1. `translateY: -half` — shifts the card up so its top edge is at the transform origin
2. `rotateX` — rotates around what is now the top edge
3. `translateY: +half` — shifts it back down

The result: the card appears to hinge at its top edge, exactly where the coil binding sits. The `perspective: 900` adds depth — without it, the rotation would look flat and orthographic.

The render tree is two absolutely-positioned layers inside a measured container. The outer `View` captures its height via `onLayout`. Both layers use `StyleSheet.absoluteFill` to stack perfectly, with the `Animated.View` on top receiving the rotation transform.

The `renderContent` prop is a render function — the parent decides what to display (score number, match length, etc.) while FlipCard handles the animation.

## 4. CoilBinding — Decorative Detail

```bash
sed -n '170,178p' App.tsx
```

```output
function CoilBinding({ count = 14, bgColor, borderColor }: { count?: number; bgColor: string; borderColor: string }) {
  return (
    <View style={styles.coilRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.coilLoop, { backgroundColor: bgColor, borderColor }]} />
      ))}
    </View>
  );
}
```

A pure visual component — no logic, no state. It renders a row of small rounded rectangles (11×20px, `borderRadius: 5.5` makes them pill-shaped) that look like the wire spirals of a coil-bound notebook. The score cards get 14 loops; the narrower center panel gets 6.

The coil row has `marginBottom: -6` which makes it overlap the top edge of the card below it, creating the illusion that the card pages thread through the coils. The `zIndex: 2` ensures the coils render on top of the card.

## 5. App Component — State Initialization

```bash
sed -n '182,202p' App.tsx
```

```output
function App() {
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [matchLength, setMatchLength] = useState(5);
  const [crawfordState, setCrawfordState] = useState<CrawfordState>('none');
  const [crawfordBaseScore, setCrawfordBaseScore] = useState(0);

  const systemScheme = useColorScheme() ?? 'light';
  const [storedMode, setStoredMode] = useState<AppearanceMode>(
    () => (Settings.get('appearance_mode') as AppearanceMode | null) ?? 'system',
  );

  const effectiveScheme: 'light' | 'dark' =
    storedMode === 'dark' ? 'dark'
    : storedMode === 'light' ? 'light'
    : systemScheme;
  const t = effectiveScheme === 'dark' ? DARK : LIGHT;

  const isRestored = useRef(false);
  const stateRef = useRef<MatchState>({ player1Score: 0, player2Score: 0, matchLength: 5, crawfordState: 'none', crawfordBaseScore: 0 });
  const cycleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
```

The state is flat — five `useState` calls, no reducers or context. This is deliberate for a single-screen app.

**Theme resolution** follows a three-tier cascade:
1. Read `appearance_mode` from iOS Settings.bundle (the native Settings app, not in-app UI)
2. If set to `'system'` (or unset), fall back to `useColorScheme()` which tracks the device's system-wide dark/light mode
3. The result selects `DARK` or `LIGHT` palette, assigned to `t` (short for "theme") and threaded through the entire render tree

**Three refs serve different purposes:**
- `isRestored` — a flag to prevent persisting the default state before AsyncStorage has loaded. Without this, launching the app would immediately overwrite saved state with zeros.
- `stateRef` — a mutable mirror of the current state. React state is captured by closure at render time, so event handlers inside `Alert.alert` callbacks would see stale values. `stateRef.current` always has the latest.
- `cycleIntervalRef` — tracks the `setInterval` used for rapid match-length cycling on long press.

## 6. Side Effects — Restore, Persist, Keep Awake

```bash
sed -n '204,265p' App.tsx
```

```output
  // Restore state on launch
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          if (
            typeof saved.player1Score === 'number' &&
            typeof saved.player2Score === 'number' &&
            typeof saved.matchLength === 'number' &&
            MATCH_LENGTHS.includes(saved.matchLength) &&
            ['none', 'crawford', 'post-crawford'].includes(saved.crawfordState)
          ) {
            setPlayer1Score(saved.player1Score);
            setPlayer2Score(saved.player2Score);
            setMatchLength(saved.matchLength);
            setCrawfordState(saved.crawfordState as CrawfordState);
            setCrawfordBaseScore(typeof saved.crawfordBaseScore === 'number' ? saved.crawfordBaseScore : 0);
          }
        } catch {
          console.warn('[BackgammonScoreboard] Failed to parse saved match state');
        }
      }
      isRestored.current = true;
    });
  }, []);

  // Keep screen awake for the lifetime of the app
  useEffect(() => {
    KeepAwake.activate();
    return () => KeepAwake.deactivate();
  }, []);

  // Clear cycling interval on unmount
  useEffect(() => {
    return () => {
      if (cycleIntervalRef.current !== null) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }
    };
  }, []);

  // Keep stateRef in sync and persist state on every change
  useEffect(() => {
    stateRef.current = { player1Score, player2Score, matchLength, crawfordState, crawfordBaseScore };
    if (!isRestored.current) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ player1Score, player2Score, matchLength, crawfordState, crawfordBaseScore }),
    );
  }, [player1Score, player2Score, matchLength, crawfordState, crawfordBaseScore]);

  // Re-read the Settings.bundle appearance preference when the app becomes active.
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        setStoredMode((Settings.get('appearance_mode') as AppearanceMode | null) ?? 'system');
      }
    });
    return () => sub.remove();
  }, []);
```

Five `useEffect` hooks, each with a single responsibility:

1. **Restore on launch** (lines 205–229): Reads the JSON blob from AsyncStorage, validates every field defensively (type checks + allowlist for match lengths and Crawford states), then hydrates all five state variables. The `isRestored.current = true` flag is set *after* hydration, even if the stored data was invalid or missing — this unblocks the persist effect.

2. **Keep awake** (lines 232–235): Activates KeepAwake on mount, deactivates on unmount. A scoreboard left on a table during a match should never go dark.

3. **Interval cleanup** (lines 238–245): Safety net — clears the match-length cycling interval if the component unmounts mid-long-press.

4. **Persist on change** (lines 248–255): Runs on every state change. First updates `stateRef.current` (always needed), then persists to AsyncStorage — but only after the initial restore is complete (`isRestored` guard). Without the guard, the effect would fire during initial render with the default zeros, clobbering saved data.

5. **Appearance sync** (lines 258–265): Listens for `AppState` changes. When the app returns to the foreground (`'active'`), it re-reads the appearance preference from `Settings`. This is how the iOS Settings.bundle integration works: the user changes a preference in the Settings app, switches back, and the theme updates immediately.

## 7. Score Logic — Adding Points & Crawford Rules

```bash
sed -n '267,312p' App.tsx
```

```output
  const resetScores = () => {
    HapticFeedback.trigger('notificationWarning', HAPTIC_OPTIONS);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setCrawfordState('none');
    setCrawfordBaseScore(0);
  };

  const addPoint = (player: number, points: number) => {
    const current = stateRef.current;
    if (current.player1Score >= current.matchLength || current.player2Score >= current.matchLength) return;

    if (player === 1) {
      const newScore = player1Score + points;
      setPlayer1Score(newScore);

      if (newScore >= matchLength) {
        HapticFeedback.trigger('notificationSuccess', HAPTIC_OPTIONS);
        Alert.alert('Match over!', `${newScore} – ${player2Score}`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'New Match', onPress: resetScores },
        ]);
      } else if (crawfordState === 'crawford') {
        setCrawfordState('post-crawford');
      } else if (crawfordState === 'none' && newScore === matchLength - 1 && player2Score < matchLength - 1) {
        setCrawfordState('crawford');
        setCrawfordBaseScore(player2Score);
      }
    } else {
      const newScore = player2Score + points;
      setPlayer2Score(newScore);

      if (newScore >= matchLength) {
        HapticFeedback.trigger('notificationSuccess', HAPTIC_OPTIONS);
        Alert.alert('Match over!', `${player1Score} – ${newScore}`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'New Match', onPress: resetScores },
        ]);
      } else if (crawfordState === 'crawford') {
        setCrawfordState('post-crawford');
      } else if (crawfordState === 'none' && newScore === matchLength - 1 && player1Score < matchLength - 1) {
        setCrawfordState('crawford');
        setCrawfordBaseScore(player1Score);
      }
    }
  };
```

**resetScores** zeroes everything and fires a warning haptic. Called from "New Match" buttons in various Alert dialogs.

**addPoint** is the core scoring function. It reads from `stateRef.current` (not React state) for the guard check — this prevents a race condition where rapid taps could push a score past the match length because the closure captured a stale score value.

The Crawford state machine has three transitions on increment:
1. **Match won** (`newScore >= matchLength`): success haptic + "Match over!" alert with option to start a new match. The Cancel button keeps the final score visible.
2. **Crawford game just played** (`crawfordState === 'crawford'`): any point scored advances to `'post-crawford'`. This is correct because if it was a Crawford game and someone scored, that game is over.
3. **Reaching match point** (`newScore === matchLength - 1` while opponent is NOT also at match point): triggers Crawford. The opponent's current score is saved as `crawfordBaseScore` for undo tracking.

Note the asymmetry guard: Crawford only triggers if the *other* player is NOT also at match point. If both players are at match point simultaneously, Crawford doesn't apply (both need one win, the cube is irrelevant).

## 8. Score Correction — decreasePoint with Undo Logic

```bash
sed -n '314,349p' App.tsx
```

```output
  const decreasePoint = (player: number) => {
    const currentScore = player === 1 ? player1Score : player2Score;
    if (currentScore === 0) return;

    const label = player === 1 ? 'Left' : 'Right';
    Alert.alert(`${label}: ${currentScore} → ${currentScore - 1}?`, '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'OK',
        onPress: () => {
          HapticFeedback.trigger('impactMedium', HAPTIC_OPTIONS);
          const { player1Score: p1, player2Score: p2, matchLength: ml, crawfordState: cs } = stateRef.current;
          const latestScore = player === 1 ? p1 : p2;
          if (latestScore <= 0) return;
          const newScore = latestScore - 1;
          const p1New = player === 1 ? newScore : p1;
          const p2New = player === 2 ? newScore : p2;

          if (player === 1) {
            setPlayer1Score(newScore);
          } else {
            setPlayer2Score(newScore);
          }

          const { crawfordBaseScore: base } = stateRef.current;
          if (p1New < ml - 1 && p2New < ml - 1) {
            setCrawfordState('none');
          } else if (cs === 'post-crawford') {
            if ((p1New === ml - 1 && p2New === base) || (p2New === ml - 1 && p1New === base)) {
              setCrawfordState('crawford');
            }
          }
        },
      },
    ]);
  };
```

Score correction is triggered by long-pressing a player's score panel. It always shows a confirmation alert first ("Left: 5 → 4?") to prevent accidental changes.

Inside the OK callback, it reads fresh state from `stateRef` — critical because time may have passed between showing the alert and the user tapping OK. The `latestScore <= 0` re-check guards against a scenario where the score changed to 0 between alert display and confirmation.

The Crawford undo logic handles two cases:
1. **Neither player at match point anymore** (`p1New < ml-1 && p2New < ml-1`): Crawford state resets to `'none'`
2. **Reverting from post-Crawford back to Crawford**: If we're in post-Crawford and the resulting scores match the exact moment Crawford was originally triggered (one player at match point, the other at `crawfordBaseScore`), it restores the Crawford state. This is why `crawfordBaseScore` exists — without it, there'd be no way to know if "one player at match point" means we're *in* Crawford or just transitioning *through* it.

## 9. Match Length Controls

```bash
sed -n '351,395p' App.tsx
```

```output
  const handleMatchButtonPress = () => {
    if (player1Score === 0 && player2Score === 0) {
      const currentIndex = MATCH_LENGTHS.indexOf(matchLength);
      setMatchLength(MATCH_LENGTHS[(currentIndex + 1) % MATCH_LENGTHS.length]);
    } else {
      Alert.alert(
        'New Match?',
        'Start a new match and reset scores?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'New Match', onPress: resetScores },
        ],
      );
    }
  };

  const handleMatchLongPress = () => {
    if (cycleIntervalRef.current !== null) {
      clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
    if (player1Score === 0 && player2Score === 0) {
      const step = () => setMatchLength(prev =>
        MATCH_LENGTHS[(MATCH_LENGTHS.indexOf(prev) - 1 + MATCH_LENGTHS.length) % MATCH_LENGTHS.length],
      );
      step();
      cycleIntervalRef.current = setInterval(step, 250);
    } else {
      Alert.alert(
        'New Match?',
        'Start a new match and reset scores?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'New Match', onPress: resetScores },
        ],
      );
    }
  };

  const handleMatchPressOut = () => {
    if (cycleIntervalRef.current !== null) {
      clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
  };
```

The center panel has dual behavior depending on whether a match is in progress:

**Scores are 0–0** (no match in progress):
- **Tap**: cycles forward through `MATCH_LENGTHS` (3 → 5 → 7 → ... → 21 → 3)
- **Long press**: cycles *backward* (21 → 17 → ... → 3 → 21) with auto-repeat every 250ms. This creates a natural "hold to scrub" interaction. The interval is cleaned up on `onPressOut`.

**Scores are non-zero** (match in progress):
- Both tap and long press show the same "New Match?" confirmation alert. You can't change match length mid-match — that would be cheating.

The modular arithmetic with `MATCH_LENGTHS.length` makes the cycling wrap around in both directions.

## 10. Render Helpers

```bash
sed -n '407,435p' App.tsx
```

```output
  const renderScore = (v: number, otherScore: number) => (
    <>
      <Text
        style={[styles.scoreText, { color: t.scoreText }]}
        adjustsFontSizeToFit
        numberOfLines={1}
        minimumFontScale={0.4}
      >
        {v}
      </Text>
      {v === 0 && otherScore === 0 && (
        <Text style={[styles.hintText, { color: t.hintText }]}>tap to increase{'\n'}hold to correct</Text>
      )}
    </>
  );

  const renderCenter = (ml: number) => (
    <>
      <Text style={[styles.matchToLabel, { color: t.matchLabel }]} maxFontSizeMultiplier={1.5}>MATCH TO</Text>
      <Text style={[styles.matchNumberLabel, { color: t.matchNumber }]} maxFontSizeMultiplier={1.5}>{ml}</Text>
      {crawfordState !== 'none' && (
        <View style={[styles.crawfordBadge, { backgroundColor: crawfordState === 'crawford' ? t.crawfordBg : t.postCrawfordBg }]}>
          <Text style={styles.crawfordText} allowFontScaling={false}>
            {crawfordState === 'crawford' ? 'CRAWFORD' : 'POST CRAWFORD'}
          </Text>
        </View>
      )}
    </>
  );
```

These are the render functions passed to FlipCard's `renderContent` prop.

**renderScore**: Displays the score number in a massive 210px condensed bold font. `adjustsFontSizeToFit` with `minimumFontScale={0.4}` handles double-digit scores — React Native will shrink the text down to 40% of its original size to fit the container. When both scores are zero, a hint overlay appears at the bottom of the card ("tap to increase / hold to correct") to teach the interaction pattern.

**renderCenter**: Shows "MATCH TO" label and the match length number. When Crawford is active, a colored badge appears at the bottom of the card — red for Crawford, gray-blue for post-Crawford. The `maxFontSizeMultiplier={1.5}` caps how large the text can grow if the user has increased their system font size (accessibility), preventing layout breakage. The Crawford badge text uses `allowFontScaling={false}` to stay fixed — it's in a tight space.

## 11. The Layout — Three-Panel Board

```bash
sed -n '437,509p' App.tsx
```

```output
  return (
    <SafeAreaProvider>
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      <StatusBar barStyle={t.statusBar} />
      <Text style={styles.buildId}>{BUILD_ID}</Text>

      {/* Board: slight rotateX gives the "looking down at a physical scoreboard on a table" perspective */}
      <View style={styles.boardPerspective}>
        <View style={styles.mainContent}>

          {/* Player 1 Panel */}
          <Pressable
            style={({ pressed }) => [styles.panelWrapper, { opacity: pressed ? 0.84 : 1 }]}
            onPressIn={() => HapticFeedback.trigger('selection', HAPTIC_OPTIONS)}
            onPress={() => addPoint(1, 1)}
            onLongPress={() => decreasePoint(1)}
            accessibilityRole="button"
            accessibilityLabel={`Left player score: ${player1Score}`}
            accessibilityHint="Tap to add a point, hold to decrease"
          >
            <CoilBinding bgColor={t.coilBg} borderColor={t.coilBorder} />
            <FlipCard
              value={player1Score}
              renderContent={v => renderScore(v, player2Score)}
              style={styles.flipCardFill}
              cardStyle={{ ...styles.scoreCard, backgroundColor: t.card, ...cardShadow }}
            />
          </Pressable>

          {/* Center Panel */}
          <Pressable
            style={({ pressed }) => [styles.centerWrapper, { opacity: pressed ? 0.84 : 1 }]}
            onPressIn={() => HapticFeedback.trigger('selection', HAPTIC_OPTIONS)}
            onPress={handleMatchButtonPress}
            onLongPress={handleMatchLongPress}
            onPressOut={handleMatchPressOut}
            accessibilityRole="button"
            accessibilityLabel={`Match to ${matchLength}${crawfordState !== 'none' ? `, ${crawfordState === 'crawford' ? 'Crawford game' : 'Post Crawford'}` : ''}`}
            accessibilityHint="Tap to change match length or start new match, hold to cycle backward"
          >
            <CoilBinding count={6} bgColor={t.coilBg} borderColor={t.coilBorder} />
            <FlipCard
              value={matchLength}
              renderContent={renderCenter}
              style={styles.flipCardCenter}
              cardStyle={{ ...styles.centerCard, backgroundColor: t.card, ...cardShadow }}
            />
          </Pressable>

          {/* Player 2 Panel */}
          <Pressable
            style={({ pressed }) => [styles.panelWrapper, { opacity: pressed ? 0.84 : 1 }]}
            onPressIn={() => HapticFeedback.trigger('selection', HAPTIC_OPTIONS)}
            onPress={() => addPoint(2, 1)}
            onLongPress={() => decreasePoint(2)}
            accessibilityRole="button"
            accessibilityLabel={`Right player score: ${player2Score}`}
            accessibilityHint="Tap to add a point, hold to decrease"
          >
            <CoilBinding bgColor={t.coilBg} borderColor={t.coilBorder} />
            <FlipCard
              value={player2Score}
              renderContent={v => renderScore(v, player1Score)}
              style={styles.flipCardFill}
              cardStyle={{ ...styles.scoreCard, backgroundColor: t.card, ...cardShadow }}
            />
          </Pressable>

        </View>
      </View>
    </SafeAreaView>
    </SafeAreaProvider>
  );
```

The layout is a horizontal flexbox row with three panels: two wide score panels flanking a narrow center panel.

**Structure** (outside in):
- `SafeAreaProvider` + `SafeAreaView` — handles iPhone notch/island insets
- `StatusBar` — themed to match (light icons on dark bg, dark icons on light bg)
- `boardPerspective` wrapper — applies a subtle 3D tilt (`rotateX: -10deg` with `perspective: 1200`) making the whole board look like a physical object on a table viewed from slightly above
- `mainContent` — the flex row with `gap: 14` between panels

**Each panel** is a `Pressable` containing a `CoilBinding` on top and a `FlipCard` below. The Pressable provides:
- Visual feedback: `opacity: 0.84` when pressed
- Haptic feedback: `selection` on press-in (instant tactile response)
- Touch handlers: `onPress` for scoring, `onLongPress` for correction
- Accessibility: proper role, label, and hint

The score panels use `flex: 1` to share available width equally. The center panel is a fixed `width: 110` with `alignSelf: 'flex-start'` — it doesn't stretch to full height, just takes the space its content needs (172px card height).

Players are identified as "Left" and "Right" — no names, consistent with the paper-scoreboard philosophy.

## 12. StyleSheet — Key Design Decisions

```bash
sed -n '512,543p' App.tsx
```

```output
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Subtle tilt: makes the scoreboard look like a physical object sitting on a table
  // viewed from slightly above. The top edge (coils) recedes; the bottom comes forward.
  boardPerspective: {
    flex: 1,
    transform: [
      { perspective: 1200 },
      { rotateX: '-10deg' },
    ],
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 14,
    alignItems: 'stretch',
  },
  // Panel wrappers
  panelWrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  centerWrapper: {
    width: 110,
    flexDirection: 'column',
    alignSelf: 'flex-start',
  },
```

```bash
sed -n '582,640p' App.tsx
```

```output
  // Score numbers
  scoreText: {
    fontSize: SCORE_FONT_SIZE,
    fontFamily: 'HelveticaNeue-CondensedBlack',
    letterSpacing: -2,
    lineHeight: SCORE_FONT_SIZE,
    marginTop: -12,
  },
  // Center panel text
  matchToLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  matchNumberLabel: {
    fontSize: 44,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 50,
  },
  // Hint text inside score cards at 0–0
  hintText: {
    position: 'absolute',
    bottom: 18,
    fontSize: 11,
    lineHeight: 17,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  // Crawford strip at the bottom of the center card
  crawfordBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 44,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crawfordText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    lineHeight: 17,
    textAlign: 'center',
  },
  buildId: {
    position: 'absolute',
    bottom: 20,
    right: 24,
    fontSize: 9,
    fontFamily: 'Menlo',
    color: 'rgba(128, 128, 128, 0.35)',
    zIndex: 99,
  },
});
```

Notable styling decisions:

**Score typography**: `HelveticaNeue-CondensedBlack` at 210px is chosen for maximum readability at a distance — this is a scoreboard meant to be read from across a backgammon table. The `letterSpacing: -2` tightens the digits. `lineHeight` matches `fontSize` exactly to minimize vertical padding. `marginTop: -12` nudges the text up for optical centering within the card.

**Board perspective**: The `-10deg` rotateX tilt is subtle but makes the flat screen feel three-dimensional. The `perspective: 1200` is relatively mild (lower values = more extreme foreshortening). This is the *second* perspective in the app — FlipCard uses `perspective: 900` for its rotation, and the board uses 1200 for the overall tilt. They work independently.

**Crawford badge**: Absolutely positioned at the bottom of the center card, full width. The `height: 44` matches iOS's standard touch target size. White text on a solid color strip — red for Crawford, muted blue-gray for post-Crawford.

**Build ID**: A barely-visible watermark (9px Menlo, 35% opacity gray) in the bottom-right corner. Absolute positioned with `zIndex: 99` so it floats above everything. Useful during development and TestFlight builds, unobtrusive in production.

## Summary

The entire app is ~640 lines in a single file. The architecture is intentionally flat:

| Concern | Mechanism |
|---|---|
| State | 5 `useState` hooks + `stateRef` for closure-safe access |
| Persistence | AsyncStorage with defensive JSON validation |
| Animation | Built-in `Animated` API, native driver, translate-rotate-translate pivot trick |
| Theme | iOS Settings.bundle → `Settings.get()` → LIGHT/DARK palette objects |
| Haptics | `react-native-haptic-feedback` with three distinct feedback types (selection, success, warning) |
| Crawford rules | Three-state machine (`none` → `crawford` → `post-crawford`) with undo support |
| Layout | Horizontal flex row, three Pressable panels, each with CoilBinding + FlipCard |
| Visual design | Warm color palette, 3D board tilt, coil-binding skeuomorphism, flip-chart animations |

No navigation, no Redux, no context providers beyond SafeArea. The simplicity is the feature.
