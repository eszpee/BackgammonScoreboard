export type CrawfordState = 'none' | 'crawford' | 'post-crawford';

export interface MatchState {
  player1Score: number;
  player2Score: number;
  matchLength: number;
  crawfordState: CrawfordState;
  crawfordBaseScore: number;
}

export function initialState(matchLength = 5): MatchState {
  return { player1Score: 0, player2Score: 0, matchLength, crawfordState: 'none', crawfordBaseScore: 0 };
}

/** Returns null if the point cannot be added (match already won). */
export function addPoint(state: MatchState, player: 1 | 2, points = 1): MatchState | null {
  if (state.player1Score >= state.matchLength || state.player2Score >= state.matchLength) return null;

  const newP1 = player === 1 ? state.player1Score + points : state.player1Score;
  const newP2 = player === 2 ? state.player2Score + points : state.player2Score;
  const newScore = player === 1 ? newP1 : newP2;
  const otherScore = player === 1 ? newP2 : newP1;

  let crawfordState = state.crawfordState;
  let crawfordBaseScore = state.crawfordBaseScore;

  if (newScore >= state.matchLength) {
    // Match won — no Crawford change needed
  } else if (crawfordState === 'crawford') {
    crawfordState = 'post-crawford';
  } else if (crawfordState === 'none' && newScore === state.matchLength - 1 && otherScore < state.matchLength - 1) {
    crawfordState = 'crawford';
    crawfordBaseScore = otherScore;
  }

  return { player1Score: newP1, player2Score: newP2, matchLength: state.matchLength, crawfordState, crawfordBaseScore };
}

/** Returns the new state after decreasing a player's score by 1. Returns null if score is already 0. */
export function decreasePoint(state: MatchState, player: 1 | 2): MatchState | null {
  const currentScore = player === 1 ? state.player1Score : state.player2Score;
  if (currentScore <= 0) return null;

  const newScore = currentScore - 1;
  const p1New = player === 1 ? newScore : state.player1Score;
  const p2New = player === 2 ? newScore : state.player2Score;

  let crawfordState = state.crawfordState;
  if (p1New < state.matchLength - 1 && p2New < state.matchLength - 1) {
    crawfordState = 'none';
  } else if (state.crawfordState === 'post-crawford') {
    if (
      (p1New === state.matchLength - 1 && p2New === state.crawfordBaseScore) ||
      (p2New === state.matchLength - 1 && p1New === state.crawfordBaseScore)
    ) {
      crawfordState = 'crawford';
    }
  }

  return { player1Score: p1New, player2Score: p2New, matchLength: state.matchLength, crawfordState, crawfordBaseScore: state.crawfordBaseScore };
}

export function resetMatch(matchLength: number): MatchState {
  return initialState(matchLength);
}
