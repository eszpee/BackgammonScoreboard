import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import HapticFeedback from 'react-native-haptic-feedback';
import KeepAwake from 'react-native-keep-awake';

const STORAGE_KEY = 'matchState';
const HAPTIC_OPTIONS = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };
const MATCH_LENGTHS = [3, 5, 7, 9, 11, 13, 15, 17, 21];
const SCORE_FONT_SIZE = 210;

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
  coilBorder:       '#3c3c3e',
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

function CoilBinding({ count = 14, bgColor, borderColor }: { count?: number; bgColor: string; borderColor: string }) {
  return (
    <View style={styles.coilRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.coilLoop, { backgroundColor: bgColor, borderColor }]} />
      ))}
    </View>
  );
}

function App() {
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [matchLength, setMatchLength] = useState(5);
  const [crawfordState, setCrawfordState] = useState<CrawfordState>('none');
  const [crawfordBaseScore, setCrawfordBaseScore] = useState(0);

  const systemColorScheme = useColorScheme();
  const [storedMode, setStoredMode] = useState<AppearanceMode>(
    () => (Settings.get('appearance_mode') as AppearanceMode | null) ?? 'system',
  );

  const effectiveScheme: 'light' | 'dark' =
    storedMode === 'dark' ? 'dark'
    : storedMode === 'light' ? 'light'
    : (systemColorScheme ?? 'light');
  const t = effectiveScheme === 'dark' ? DARK : LIGHT;

  const score1Anim = useRef(new Animated.Value(1)).current;
  const score2Anim = useRef(new Animated.Value(1)).current;
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

  // Refresh appearance preference when returning from iOS Settings
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        setStoredMode((Settings.get('appearance_mode') as AppearanceMode | null) ?? 'system');
      }
    });
    return () => sub.remove();
  }, []);

  const triggerBounce = (anim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 1.15, duration: 80, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const resetScores = () => {
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
      triggerBounce(score1Anim);

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
      triggerBounce(score2Anim);

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      <StatusBar barStyle={t.statusBar} />

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
          <View style={[styles.scoreCard, { backgroundColor: t.card }, cardShadow]}>
            <Animated.Text
              style={[styles.scoreText, { color: t.scoreText, transform: [{ scale: score1Anim }] }]}
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.4}
            >
              {player1Score}
            </Animated.Text>
            {player1Score === 0 && player2Score === 0 && (
              <Text style={[styles.hintText, { color: t.hintText }]}>tap to increase{'\n'}hold to correct</Text>
            )}
          </View>
        </Pressable>

        {/* Center Panel */}
        <Pressable
          style={({ pressed }) => [styles.centerWrapper, { opacity: pressed ? 0.84 : 1 }]}
          onPress={handleMatchButtonPress}
          onLongPress={handleMatchLongPress}
          onPressOut={handleMatchPressOut}
          accessibilityRole="button"
          accessibilityLabel={`Match to ${matchLength}${crawfordState !== 'none' ? `, ${crawfordState === 'crawford' ? 'Crawford game' : 'Post Crawford'}` : ''}`}
          accessibilityHint="Tap to change match length or start new match, hold to cycle backward"
        >
          <CoilBinding count={6} bgColor={t.coilBg} borderColor={t.coilBorder} />
          <View style={[styles.centerCard, { backgroundColor: t.card }, cardShadow]}>
            <Text style={[styles.matchToLabel, { color: t.matchLabel }]} maxFontSizeMultiplier={1.5}>MATCH TO</Text>
            <Text style={[styles.matchNumberLabel, { color: t.matchNumber }]} maxFontSizeMultiplier={1.5}>{matchLength}</Text>
            {crawfordState !== 'none' && (
              <View style={[styles.crawfordBadge, { backgroundColor: crawfordState === 'crawford' ? t.crawfordBg : t.postCrawfordBg }]}>
                <Text style={styles.crawfordText} allowFontScaling={false}>
                  {crawfordState === 'crawford' ? 'CRAWFORD' : 'POST CRAWFORD'}
                </Text>
              </View>
            )}
          </View>
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
          <View style={[styles.scoreCard, { backgroundColor: t.card }, cardShadow]}>
            <Animated.Text
              style={[styles.scoreText, { color: t.scoreText, transform: [{ scale: score2Anim }] }]}
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.4}
            >
              {player2Score}
            </Animated.Text>
            {player1Score === 0 && player2Score === 0 && (
              <Text style={[styles.hintText, { color: t.hintText }]}>tap to increase{'\n'}hold to correct</Text>
            )}
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  // Score card
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
    // Collapse the large internal leading from HelveticaNeue-CondensedBlack's
    // ascender metrics so the layout box matches the visible cap height.
    lineHeight: SCORE_FONT_SIZE,
    // Empirical offset to optically center glyphs: the font's ascender space
    // above the cap height is larger than the descender space below the baseline.
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
