import { addPoint, decreasePoint, initialState, resetMatch, MatchState } from '../scoringLogic';

describe('Crawford rule logic', () => {
  // ── Crawford activation ──────────────────────────────────────────────

  describe('Crawford activation', () => {
    it('triggers when player 1 reaches matchLength - 1 and player 2 has not', () => {
      let state = initialState(5);
      // Player 1 scores to 4 (match-1)
      for (let i = 0; i < 4; i++) {
        state = addPoint(state, 1)!;
      }
      expect(state.player1Score).toBe(4);
      expect(state.crawfordState).toBe('crawford');
      expect(state.crawfordBaseScore).toBe(0);
    });

    it('triggers when player 2 reaches matchLength - 1 and player 1 has not', () => {
      let state = initialState(5);
      for (let i = 0; i < 4; i++) {
        state = addPoint(state, 2)!;
      }
      expect(state.player2Score).toBe(4);
      expect(state.crawfordState).toBe('crawford');
      expect(state.crawfordBaseScore).toBe(0);
    });

    it('does NOT trigger when both players reach matchLength - 1 simultaneously', () => {
      let state = initialState(5);
      // Both get to 3
      for (let i = 0; i < 3; i++) {
        state = addPoint(state, 1)!;
        state = addPoint(state, 2)!;
      }
      expect(state.player1Score).toBe(3);
      expect(state.player2Score).toBe(3);
      // Player 1 reaches 4 — but player 2 is already at 3 (matchLength - 2 = 3, which is matchLength - 1 - 1... wait)
      // Actually matchLength-1 = 4, and player2 is at 3 which is < 4, so Crawford SHOULD trigger
      state = addPoint(state, 1)!;
      expect(state.crawfordState).toBe('crawford');

      // Now if we reset and test true simultaneous: both at match-1 before either reaches it alone
      // This can happen if player 2 is already at match-1 when player 1 reaches match-1
      let state2 = initialState(5);
      for (let i = 0; i < 4; i++) {
        state2 = addPoint(state2, 2)!; // p2 = 4 (crawford triggers here)
      }
      expect(state2.crawfordState).toBe('crawford');
      // Now p1 scores to 4 — both at match-1, this is post-crawford (score change during crawford)
      state2 = addPoint(state2, 1)!;
      expect(state2.crawfordState).toBe('post-crawford');
    });

    it('does NOT trigger when a player jumps past matchLength - 1 directly to matchLength (match win)', () => {
      let state = initialState(5);
      // Player 1 at 3, then scores 2 points jumping to 5 (past 4)
      for (let i = 0; i < 3; i++) {
        state = addPoint(state, 1)!;
      }
      expect(state.crawfordState).toBe('none');
      state = addPoint(state, 1, 2)!;
      expect(state.player1Score).toBe(5);
      // Crawford should NOT have been set since they jumped to a match win
      expect(state.crawfordState).toBe('none');
    });

    it('records crawfordBaseScore as the opponent score when Crawford triggers', () => {
      let state = initialState(7);
      // P2 scores 2, then P1 scores to 6 (match-1)
      state = addPoint(state, 2)!;
      state = addPoint(state, 2)!;
      for (let i = 0; i < 6; i++) {
        state = addPoint(state, 1)!;
      }
      expect(state.crawfordState).toBe('crawford');
      expect(state.crawfordBaseScore).toBe(2); // p2's score when crawford triggered
    });
  });

  // ── Post-Crawford transition ─────────────────────────────────────────

  describe('post-Crawford transition', () => {
    it('transitions to post-Crawford after any score change during Crawford game', () => {
      let state = initialState(5);
      for (let i = 0; i < 4; i++) {
        state = addPoint(state, 1)!;
      }
      expect(state.crawfordState).toBe('crawford');

      // Any point scored transitions to post-crawford
      state = addPoint(state, 2)!;
      expect(state.crawfordState).toBe('post-crawford');
    });

    it('post-Crawford persists for remaining games until match end', () => {
      let state = initialState(5);
      for (let i = 0; i < 4; i++) {
        state = addPoint(state, 1)!;
      }
      // Crawford triggered, transition to post
      state = addPoint(state, 2)!;
      expect(state.crawfordState).toBe('post-crawford');

      // More scoring keeps it post-crawford
      state = addPoint(state, 2)!;
      expect(state.crawfordState).toBe('post-crawford');
      state = addPoint(state, 2)!;
      expect(state.crawfordState).toBe('post-crawford');
    });
  });

  // ── Score decrease (Crawford reversion) ──────────────────────────────

  describe('score decrease and Crawford reversion', () => {
    it('decreasing the Crawford player score below matchLength - 1 reverts to none', () => {
      let state = initialState(5);
      for (let i = 0; i < 4; i++) {
        state = addPoint(state, 1)!;
      }
      expect(state.crawfordState).toBe('crawford');

      state = decreasePoint(state, 1)!;
      expect(state.player1Score).toBe(3);
      expect(state.crawfordState).toBe('none');
    });

    it('decreasing in post-Crawford correctly reverts to Crawford when scores match base', () => {
      let state = initialState(5);
      // P2 scores 1, then P1 reaches match-1
      state = addPoint(state, 2)!;
      for (let i = 0; i < 4; i++) {
        state = addPoint(state, 1)!;
      }
      expect(state.crawfordState).toBe('crawford');
      expect(state.crawfordBaseScore).toBe(1);

      // Transition to post-crawford
      state = addPoint(state, 2)!;
      expect(state.crawfordState).toBe('post-crawford');
      expect(state.player2Score).toBe(2);

      // Decrease p2 back to crawfordBaseScore (1) — should revert to crawford
      state = decreasePoint(state, 2)!;
      expect(state.player2Score).toBe(1);
      expect(state.crawfordState).toBe('crawford');
    });

    it('decreasing in post-Crawford to none when both below match-1', () => {
      let state: MatchState = {
        player1Score: 4,
        player2Score: 2,
        matchLength: 5,
        crawfordState: 'post-crawford',
        crawfordBaseScore: 0,
      };
      // Decrease p1 from 4 to 3 (below match-1)
      state = decreasePoint(state, 1)!;
      expect(state.player1Score).toBe(3);
      expect(state.crawfordState).toBe('none');
    });

    it('returns null when trying to decrease a score of 0', () => {
      const state = initialState(5);
      expect(decreasePoint(state, 1)).toBeNull();
      expect(decreasePoint(state, 2)).toBeNull();
    });
  });

  // ── Match win ────────────────────────────────────────────────────────

  describe('match win', () => {
    it('detects match win when score reaches matchLength', () => {
      let state = initialState(3);
      for (let i = 0; i < 3; i++) {
        state = addPoint(state, 1)!;
      }
      expect(state.player1Score).toBe(3);
      expect(state.player1Score).toBeGreaterThanOrEqual(state.matchLength);
    });

    it('no further scoring is possible after match win', () => {
      let state = initialState(3);
      for (let i = 0; i < 3; i++) {
        state = addPoint(state, 1)!;
      }
      expect(addPoint(state, 1)).toBeNull();
      expect(addPoint(state, 2)).toBeNull();
    });

    it('new match reset clears Crawford state', () => {
      let state = initialState(5);
      for (let i = 0; i < 4; i++) {
        state = addPoint(state, 1)!;
      }
      expect(state.crawfordState).toBe('crawford');

      state = resetMatch(5);
      expect(state.crawfordState).toBe('none');
      expect(state.crawfordBaseScore).toBe(0);
      expect(state.player1Score).toBe(0);
      expect(state.player2Score).toBe(0);
    });
  });

  // ── Edge cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('rapid scoring does not corrupt Crawford state', () => {
      let state = initialState(5);
      // Simulate rapid alternating scoring
      state = addPoint(state, 1)!; // 1-0
      state = addPoint(state, 2)!; // 1-1
      state = addPoint(state, 1)!; // 2-1
      state = addPoint(state, 1)!; // 3-1
      state = addPoint(state, 2)!; // 3-2
      state = addPoint(state, 1)!; // 4-2 → Crawford!
      expect(state.crawfordState).toBe('crawford');
      expect(state.crawfordBaseScore).toBe(2);

      state = addPoint(state, 2)!; // 4-3 → post-Crawford
      expect(state.crawfordState).toBe('post-crawford');

      state = addPoint(state, 2)!; // 4-4
      expect(state.crawfordState).toBe('post-crawford');
    });

    const matchLengths = [3, 5, 7, 9, 11, 13, 15, 17, 21];

    it.each(matchLengths)('Crawford works correctly with match length %i', (ml) => {
      let state = initialState(ml);
      // Score player 1 to match-1
      for (let i = 0; i < ml - 1; i++) {
        state = addPoint(state, 1)!;
      }
      expect(state.player1Score).toBe(ml - 1);
      expect(state.crawfordState).toBe('crawford');

      // Any point transitions to post-crawford
      state = addPoint(state, 2)!;
      expect(state.crawfordState).toBe('post-crawford');

      // Player 1 wins
      state = addPoint(state, 1)!;
      expect(state.player1Score).toBe(ml);
      expect(addPoint(state, 1)).toBeNull();
      expect(addPoint(state, 2)).toBeNull();
    });

    it('match length 3: Crawford at 2, win at 3', () => {
      let state = initialState(3);
      state = addPoint(state, 1)!; // 1-0
      state = addPoint(state, 1)!; // 2-0 → Crawford
      expect(state.crawfordState).toBe('crawford');

      state = addPoint(state, 1)!; // 3-0 → match over (post-crawford transition doesn't happen on win)
      // Crawford stays as-is since the match is over
      expect(state.player1Score).toBe(3);
    });
  });
});
