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
  cardBack:         '#f5f3f0',
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
  cardEdge:         '#d8d5d0',
};

const DARK = {
  background:       '#1c1a17',
  card:             '#2c2926',
  cardBack:         '#3a3733',
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
  cardEdge:         '#1a1815',
};

// ─── FlipCard ────────────────────────────────────────────────────────────────
// Simulates a flip-chart page rotating around the top-edge (coil) axis.
// Two-phase animation: old page lifts to edge-on (0° → 90°), then new page
// falls into place (90° → 0°), with content swapped at the invisible pivot.
// Uses the built-in Animated API with useNativeDriver: true — UI-thread animation,
// no extra dependencies required.

interface FlipCardProps {
  value: number;
  renderContent: (v: number) => React.ReactNode;
  style?: object;
  cardStyle?: object;
}

function FlipCard({ value, renderContent, style, cardStyle }: FlipCardProps) {
  const [shown, setShown] = useState(value);
  const prevValue = useRef(value);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [cardHeight, setCardHeight] = useState(0);

  useEffect(() => {
    if (value === prevValue.current) return;

    const dir: 1 | -1 = value > prevValue.current ? 1 : -1;
    prevValue.current = value;
    const next = value;

    // No layout yet → update instantly without animation.
    if (cardHeight === 0) {
      setShown(next);
      return;
    }

    // Phase 1: current page pivots away (bottom goes into screen).
    Animated.timing(flipAnim, {
      toValue: dir * 90,
      duration: FLIP_DURATION_OUT,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        // Swap content at the invisible edge-on moment.
        setShown(next);
        // Jump to opposite side so the new page arrives from the same direction.
        flipAnim.setValue(-dir * 90);
        // Phase 2: new page falls into place.
        Animated.timing(flipAnim, {
          toValue: 0,
          duration: FLIP_DURATION_IN,
          useNativeDriver: true,
        }).start();
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, cardHeight]);

  const half = cardHeight / 2;

  // Rotate around the TOP edge (coil axis) using the translate-rotate-translate trick.
  const animStyle = {
    transform: [
      { perspective: 900 },
      { translateY: -half },
      { rotateX: flipAnim.interpolate({ inputRange: [-90, 90], outputRange: ['-90deg', '90deg'] }) },
      { translateY: half },
    ],
  };

  return (
    <View
      style={style}
      onLayout={e => setCardHeight(e.nativeEvent.layout.height)}
    >
      <Animated.View style={[StyleSheet.absoluteFill, cardStyle as object, animStyle]}>
        {renderContent(shown)}
      </Animated.View>
    </View>
  );
}

// ─── CoilBinding ─────────────────────────────────────────────────────────────

function CoilBinding({ count = 14, bgColor, borderColor }: { count?: number; bgColor: string; borderColor: string }) {
  return (
    <View style={styles.coilRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.coilLoop, { backgroundColor: bgColor, borderColor }]} />
      ))}
    </View>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

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

  const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: t.shadowOpacity,
    shadowRadius: 10,
    elevation: 8,
  };

  // ── render helpers ──

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

  return (
    <SafeAreaProvider>
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      <StatusBar barStyle={t.statusBar} />

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
}

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
  // FlipCard containers (the outer View that defines bounds)
  flipCardFill: {
    flex: 1,
  },
  flipCardCenter: {
    height: 172,
  },
  // Coil binding
  coilRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    height: 24,
    paddingHorizontal: 8,
    zIndex: 2,
    marginBottom: -6,
  },
  coilLoop: {
    width: 11,
    height: 20,
    borderRadius: 5.5,
    borderWidth: 2.5,
  },
  // Score card (applied to FlipCard's inner Animated.View via cardStyle)
  scoreCard: {
    flex: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Center card
  centerCard: {
    height: 172,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
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
});

export default App;
