## Context

`App.tsx` uses `react-native-haptic-feedback` throughout. Score panels trigger `selection` on `onPressIn`. A shared `HAPTIC_OPTIONS` constant is already defined. Three interaction points are missing haptic calls.

## Goals / Non-Goals

**Goals:**
- Fill the three haptic gaps with appropriate feedback intensities
- Stay consistent with existing haptic usage patterns

**Non-Goals:**
- Changing haptic types on existing interactions
- Adding new dependencies

## Decisions

### Decision 1: Haptic intensity mapping

- `selection` for center panel press — same as score panels, it's a navigation gesture
- `impactMedium` for decrease confirmation — correcting a score is a deliberate, slightly forceful action
- `notificationWarning` for new match reset — resetting all state is significant; `notificationWarning` signals "something important just happened" without being alarming

### Decision 2: Where to place the new match haptic

`resetScores()` is called from three places: the match-over alert, the manual new-match alert, and potentially future paths. Adding the haptic inside `resetScores()` rather than at each call site ensures no path is missed and keeps the logic co-located.
