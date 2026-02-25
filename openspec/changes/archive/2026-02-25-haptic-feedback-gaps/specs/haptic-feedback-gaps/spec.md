## ADDED Requirements

### Requirement: Center Panel Haptic

The match-length selector SHALL fire a selection haptic on press, consistent with the score panels.

#### Scenario: User presses the center panel

- **WHEN** the user presses the center panel (match-length selector)
- **THEN** a `selection` haptic fires immediately on press
- **AND** the existing press behavior (cycle match length or show new match alert) is unchanged

---

### Requirement: Score Decrease Confirmation Haptic

Confirming a score decrease MUST trigger a haptic to confirm the correction was applied.

#### Scenario: User confirms a score decrease

- **WHEN** the user long-presses a score panel and taps "OK" in the confirmation alert
- **THEN** an `impactMedium` haptic fires at the moment of confirmation
- **AND** the score is decremented as before

---

### Requirement: New Match Reset Haptic

Starting a new match SHALL trigger a haptic to signal the significant state reset.

#### Scenario: User confirms a new match

- **WHEN** the user confirms "New Match" from any alert (match-over or manual reset)
- **THEN** a `notificationWarning` haptic fires when scores are reset
- **AND** scores reset to 0–0 as before
