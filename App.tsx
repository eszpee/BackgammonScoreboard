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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HapticFeedback from 'react-native-haptic-feedback';
import KeepAwake from 'react-native-keep-awake';

const STORAGE_KEY = 'matchState';
const HAPTIC_OPTIONS = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };
const MATCH_LENGTHS = [3, 5, 7, 9, 11, 13, 15, 17, 21];

type CrawfordState = 'none' | 'crawford' | 'post-crawford';

interface MatchState {
  player1Score: number;
  player2Score: number;
  matchLength: number;
  crawfordState: CrawfordState;
}

function CoilBinding({ count = 14 }: { count?: number }) {
  return (
    <View style={styles.coilRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.coilLoop} />
      ))}
    </View>
  );
}

function App() {
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [matchLength, setMatchLength] = useState(5);
  const [crawfordState, setCrawfordState] = useState<CrawfordState>('none');

  const score1Anim = useRef(new Animated.Value(1)).current;
  const score2Anim = useRef(new Animated.Value(1)).current;
  const isRestored = useRef(false);
  const stateRef = useRef<MatchState>({ player1Score: 0, player2Score: 0, matchLength: 5, crawfordState: 'none' });
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
          }
        } catch {
          console.warn('[BackgammonScoreboard] Failed to parse saved match state');
        }
      }
      isRestored.current = true;
    });
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
    stateRef.current = { player1Score, player2Score, matchLength, crawfordState };
    if (!isRestored.current) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ player1Score, player2Score, matchLength, crawfordState }),
    );
  }, [player1Score, player2Score, matchLength, crawfordState]);

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
  };

  const addPoint = (player: number, points: number) => {
    const current = stateRef.current;
    if (player === 1 && current.player1Score >= current.matchLength) return;
    if (player === 2 && current.player2Score >= current.matchLength) return;

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

          if (p1New < ml - 1 && p2New < ml - 1) {
            // Neither player at match-1: Crawford never happened at these scores
            setCrawfordState('none');
          } else if (cs === 'post-crawford') {
            // One player still at match-1, going backward: revert to Crawford game
            setCrawfordState('crawford');
          }
          // else: already 'crawford' with one player still at match-1, keep it
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

  return (
    <SafeAreaView style={styles.container}>
      <KeepAwake />
      <StatusBar barStyle="dark-content" />

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
          <CoilBinding />
          <View style={styles.scoreCard}>
            <Animated.Text
              style={[styles.scoreText, { transform: [{ scale: score1Anim }] }]}
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.4}
            >
              {player1Score}
            </Animated.Text>
            {player1Score === 0 && player2Score === 0 && (
              <Text style={styles.hintText}>hold to correct</Text>
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
          <CoilBinding count={6} />
          <View style={styles.centerCard}>
            <Text style={styles.matchToLabel} maxFontSizeMultiplier={1.5}>MATCH TO</Text>
            <Text style={styles.matchNumberLabel} maxFontSizeMultiplier={1.5}>{matchLength}</Text>
            {crawfordState !== 'none' && (
              <View style={[styles.crawfordBadge, { backgroundColor: crawfordState === 'crawford' ? '#c0392b' : '#4a5568' }]}>
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
          <CoilBinding />
          <View style={styles.scoreCard}>
            <Animated.Text
              style={[styles.scoreText, { transform: [{ scale: score2Anim }] }]}
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.4}
            >
              {player2Score}
            </Animated.Text>
            {player1Score === 0 && player2Score === 0 && (
              <Text style={styles.hintText}>hold to correct</Text>
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
    backgroundColor: '#f0ede8',
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
    borderColor: '#3c3c3e',
    backgroundColor: '#f0ede8',
  },
  // Score card
  scoreCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Center card
  centerCard: {
    height: 172,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  // Score numbers
  scoreText: {
    fontSize: 210,
    fontFamily: 'HelveticaNeue-CondensedBlack',
    color: '#111111',
    letterSpacing: -2,
  },
  // Center panel text
  matchToLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888888',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  matchNumberLabel: {
    fontSize: 44,
    fontWeight: '800',
    color: '#111111',
    textAlign: 'center',
    lineHeight: 50,
  },
  // Hint text inside score cards at 0–0
  hintText: {
    position: 'absolute',
    bottom: 14,
    fontSize: 11,
    color: '#c8c4be',
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
