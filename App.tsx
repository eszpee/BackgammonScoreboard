import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import KeepAwake from 'react-native-keep-awake';

// Simple in-memory persistence (survives until app is force-quit)
let savedMatchLength = 5;

function App() {
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [matchLength, setMatchLength] = useState(savedMatchLength);
  const [crawfordState, setCrawfordState] = useState<'none' | 'crawford' | 'post-crawford'>('none');

  const addPoint = (player: number, points: number) => {
    // If we're in Crawford, any point scored moves to post-crawford
    if (crawfordState === 'crawford') {
      setCrawfordState('post-crawford');
    }

    if (player === 1) {
      const newScore = player1Score + points;
      setPlayer1Score(newScore);

      // Check if we should enter Crawford
      if (crawfordState === 'none' && newScore === matchLength - 1 && player2Score < matchLength - 1) {
        setCrawfordState('crawford');
      }

      if (newScore >= matchLength) {
        Alert.alert('Match Over!', `Left Player wins ${newScore} to ${player2Score}!`, [
          { text: 'New Match', onPress: () => {
            setPlayer1Score(0);
            setPlayer2Score(0);
            setCrawfordState('none');
          }}
        ]);
      }
    } else {
      const newScore = player2Score + points;
      setPlayer2Score(newScore);

      // Check if we should enter Crawford
      if (crawfordState === 'none' && newScore === matchLength - 1 && player1Score < matchLength - 1) {
        setCrawfordState('crawford');
      }

      if (newScore >= matchLength) {
        Alert.alert('Match Over!', `Right Player wins ${newScore} to ${player1Score}!`, [
          { text: 'New Match', onPress: () => {
            setPlayer1Score(0);
            setPlayer2Score(0);
            setCrawfordState('none');
          }}
        ]);
      }
    }
  };

  const handleMatchButtonPress = () => {
    // If match hasn't started (0:0), cycle match length
    if (player1Score === 0 && player2Score === 0) {
      const lengths = [3, 5, 7, 9, 11, 13, 15, 17, 21];
      const currentIndex = lengths.indexOf(matchLength);
      const nextIndex = (currentIndex + 1) % lengths.length;
      const newMatchLength = lengths[nextIndex];
      setMatchLength(newMatchLength);
      // Save to memory (persists during app session)
      savedMatchLength = newMatchLength;
    } else {
      // Otherwise, confirm before starting a new match
      Alert.alert(
        'New Match?',
        'Start a new match and reset scores?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'New Match',
            onPress: () => {
              setPlayer1Score(0);
              setPlayer2Score(0);
              setCrawfordState('none');
            }
          }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeepAwake />
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      <View style={styles.mainContent}>
        {/* Player 1 Section - Left Side */}
        <TouchableOpacity
          style={styles.playerSection}
          onPress={() => addPoint(1, 1)}
          activeOpacity={0.7}
        >
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>{player1Score}</Text>
          </View>
        </TouchableOpacity>

        {/* Center Section */}
        <View style={styles.centerSection}>
          <TouchableOpacity
            style={styles.matchLengthButton}
            onPress={handleMatchButtonPress}
          >
            <Text style={styles.matchText}>MATCH TO</Text>
            <Text style={styles.matchNumber}>{matchLength}</Text>
          </TouchableOpacity>

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
        <TouchableOpacity
          style={styles.playerSection}
          onPress={() => addPoint(2, 1)}
          activeOpacity={0.7}
        >
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>{player2Score}</Text>
          </View>
        </TouchableOpacity>
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
