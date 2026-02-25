## Why

Three interaction points in the app fire no haptic feedback despite being meaningful user actions: pressing the match-length selector, confirming a score decrease, and confirming a new match reset. The score panels already use haptic consistently — these gaps break the tactile contract the app establishes.

## What Changes

- Center panel press triggers `selection` haptic (matches score panels)
- Score decrease confirmation ("OK") triggers `impactMedium` haptic
- New match reset triggers `notificationWarning` haptic

## Capabilities

### New Capabilities

- `center-panel-haptic`: Tactile response when pressing the match-length selector
- `decrease-confirm-haptic`: Tactile response when confirming a score correction
- `new-match-haptic`: Tactile response when starting a new match

## Impact

- `App.tsx`: 3 one-line additions, no new dependencies
