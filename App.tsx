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

type CrawfordState = 'none' | 'crawford' | 'post-crawford';

interface MatchState {
  player1Score: number;
  player2Score: number;
  matchLength: number;
  crawfordState: CrawfordState;
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
    if (crawfordState === 'crawford') {
      setCrawfordState('post-crawford');
    }

    if (player === 1) {
      const newScore = player1Score + points;
      setPlayer1Score(newScore);
      triggerBounce(score1Anim);

      if (crawfordState === 'none' && newScore === matchLength - 1 && player2Score < matchLength - 1) {
        setCrawfordState('crawford');
      }

      if (newScore >= matchLength) {
        HapticFeedback.trigger('notificationSuccess', HAPTIC_OPTIONS);
        Alert.alert('Match Over!', `Left Player wins ${newScore} to ${player2Score}!`, [
          { text: 'New Match', onPress: resetScores },
        ]);
      }
    } else {
      const newScore = player2Score + points;
      setPlayer2Score(newScore);
      triggerBounce(score2Anim);

      if (crawfordState === 'none' && newScore === matchLength - 1 && player1Score < matchLength - 1) {
        setCrawfordState('crawford');
      }

      if (newScore >= matchLength) {
        HapticFeedback.trigger('notificationSuccess', HAPTIC_OPTIONS);
        Alert.alert('Match Over!', `Right Player wins ${newScore} to ${player1Score}!`, [
          { text: 'New Match', onPress: resetScores },
        ]);
      }
    }
  };

  const decreasePoint = (player: number) => {
    const currentScore = player === 1 ? player1Score : player2Score;
    if (currentScore === 0) return;

    Alert.alert('Decrease point?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decrease',
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

  const MATCH_LENGTHS = [3, 5, 7, 9, 11, 13, 15, 17, 21];

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
    if (player1Score === 0 && player2Score === 0) {
      const currentIndex = MATCH_LENGTHS.indexOf(matchLength);
      setMatchLength(MATCH_LENGTHS[(currentIndex - 1 + MATCH_LENGTHS.length) % MATCH_LENGTHS.length]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeepAwake />
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      <View style={styles.mainContent}>
        {/* Player 1 Section - Left Side */}
        <Pressable
          style={({ pressed }) => [styles.playerSection, { opacity: pressed ? 0.7 : 1 }]}
          onPressIn={() => HapticFeedback.trigger('selection', HAPTIC_OPTIONS)}
          onPress={() => addPoint(1, 1)}
          onLongPress={() => decreasePoint(1)}
        >
          <View style={styles.scoreBox}>
            <Animated.Text
              style={[styles.scoreText, { transform: [{ scale: score1Anim }] }]}
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.4}
            >
              {player1Score}
            </Animated.Text>
          </View>
        </Pressable>

        {/* Center Section */}
        <View style={styles.centerSection}>
          <Pressable
            style={({ pressed }) => [styles.matchLengthButton, { opacity: pressed ? 0.7 : 1 }]}
            onPress={handleMatchButtonPress}
            onLongPress={handleMatchLongPress}
          >
            <Text style={styles.matchText}>MATCH TO</Text>
            <Text style={styles.matchNumber}>{matchLength}</Text>
          </Pressable>

          <View style={styles.crawfordContainer}>
            {crawfordState !== 'none' && (
              <View style={styles.crawfordIndicator}>
                <Text style={styles.crawfordText}>
                  {crawfordState === 'crawford' ? 'CRAWFORD' : 'POST CRAWFORD'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Player 2 Section - Right Side */}
        <Pressable
          style={({ pressed }) => [styles.playerSection, { opacity: pressed ? 0.7 : 1 }]}
          onPressIn={() => HapticFeedback.trigger('selection', HAPTIC_OPTIONS)}
          onPress={() => addPoint(2, 1)}
          onLongPress={() => decreasePoint(2)}
        >
          <View style={styles.scoreBox}>
            <Animated.Text
              style={[styles.scoreText, { transform: [{ scale: score2Anim }] }]}
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.4}
            >
              {player2Score}
            </Animated.Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
    gap: 20,
  },
  playerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBox: {
    width: '90%',
    height: '90%',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  scoreText: {
    fontSize: 180,
    fontWeight: '500',
    color: '#2a2a2a',
    marginTop: -10,
  },
  centerSection: {
    width: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchLengthButton: {
    width: 110,
    height: 110,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  matchText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  matchNumber: {
    fontSize: 56,
    fontWeight: '300',
    color: '#2a2a2a',
  },
  crawfordContainer: {
    marginTop: 30,
    width: 120,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crawfordIndicator: {
    width: 120,
    paddingVertical: 10,
    backgroundColor: '#e85d5d',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#e85d5d',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  crawfordText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.8,
  },
});

export default App;
