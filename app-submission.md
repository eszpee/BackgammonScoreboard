# App Store Submission Guide — Paper Backgammon Scoreboard

A step-by-step checklist for publishing **Paper Backgammon Scoreboard** to the
Apple App Store.
This is a first submission, so each step is spelled out. Check boxes off as you go.

## Reference info (you'll need these repeatedly)

| Item | Value |
|---|---|
| Bundle ID | `com.peterszasz.BackgammonScoreboard` |
| Apple Team ID | `42X8P6QCN9` |
| App Store name | Paper Backgammon Scoreboard |
| Apple ID (App Store Connect) | `6771722520` |
| Home-screen name | Backgammon Scoreboard (truncates to "Backgammon…") |
| Marketing version | `1.0` |
| Build number | `1` |
| Min iOS | 15.1 — iPhone only, landscape only |
| Privacy policy URL | https://eszpee.github.io/BackgammonScoreboard/privacy.html |
| Support URL | https://eszpee.github.io/BackgammonScoreboard/ |
| Pricing | Paid app |
| App Store Connect | https://appstoreconnect.apple.com |
| Apple Developer portal | https://developer.apple.com/account |

---

## Phase 0 — Code preparation ✅ DONE

- [x] Added `ITSAppUsesNonExemptEncryption = false` to `Info.plist`
- [x] Set `TARGETED_DEVICE_FAMILY = 1` (iPhone only) in `project.pbxproj`
- [x] Verified version `1.0` / build `1`
- [x] Crawford logic tests pass (25/25)

---

## Phase 1 — Paid-app agreements (do this FIRST — it can lag)

In App Store Connect → **Business** (also called *Agreements, Tax, and Banking*):

- [x] Accept the **Paid Applications Agreement** — done; appears under **Agreements**
      with status **"Pending User Info"**
- [ ] Add **bank account** details for payouts — ⏳ *blocked: Wise account, see note below*
- [x] Complete **tax forms** — W-8BEN-E submitted, status **Active**
- [x] Declare **Trader status** (EU DSA) — done, status **Active** (see note below)
- [ ] Confirm the Paid Apps agreement shows **Active** — ⏳ *it flips from "Pending User
      Info" to "Active" automatically once the bank account is added; the bank is the only
      missing item*

> You can start the other phases in parallel — but the app cannot go *on sale* until this
> is Active.

### Bank account — Wise EUR account (in progress)

Account: Wise (Wise Europe SA), Belgium — IBAN `BE96 9056 7675 9105`, BIC `TRWIBEB1XXX`,
account holder `NOVO-KUNST Kft.`

- App Store Connect's "Add Bank Account" flow returned **"We could not find any banks
  matching the search criteria"** — Apple's bank directory does not list Wise's Belgian
  entity.
- Apple Developer Support (case `102895694220`, agent Jennifer) replied with a generic
  "try a different branch" message and **referred to the Finance team** via *Contact Us
  About Financial Information*.
- ⏳ **Finance team case submitted** (Subject: Banking setup → Category: Add or edit
  banking information). Vendor ID left blank (none assigned yet — agreement still
  Pending). Awaiting reply.
  - Finance Case-ID: `20152487` (Apple Media Services Finance Support,
    `iTSPayments@apple.com`)
  - Media Services Team ID shown on the ack: `8A5T6N3965` *(note: separate from the
    Developer Program Team ID `42X8P6QCN9` — Apple Media Services uses its own
    identifier)*
  - Follow-up: reply to the ack email using the same subject line, including
    `Case-ID: 20152487`.
- [ ] When Finance replies, finish adding the bank account
- Fallback if Wise can't be added: use a traditional Hungarian bank account in the
  company's name (a standard IBAN is always in Apple's directory).

### Tax form — W-8BEN-E (done)

Submitted as an **Organization** form for `NOVO-KUNST … Kft.`:
- Chapter 3 status: **Corporation**; country: **Hungary**; Foreign TIN: `HU12184794`
- No U.S. TIN (left blank — none required)
- **Part III left empty / box 14 unchecked** — the US–Hungary income tax treaty was
  terminated (no effect for withholding from 1 Jan 2024), so no treaty benefits are
  claimed. Consequence: the default **30% US withholding** applies, but only to the
  US-customer share of revenue; EU and rest-of-world sales are unaffected.

### EU Digital Services Act — Trader status (done)

App Store Connect requires every developer to declare a **Trader status** under the EU
DSA. Because this is a **paid app, you are a Trader**.

- [x] Done — it lives under **Business → Compliance → Digital Services Act** (*not* a
      separate menu). Status shows **Active** for 27 EU countries.

> ⚠️ **The contact info you entered there is published publicly** on your App Store
> product page across all 27 EU countries. Changing it later requires re-verification.

### App Store Small Business Program (recommended)

- [ ] Enrol in the **App Store Small Business Program** — ⏳ *gated: the enrolment option
      only becomes available once the **Paid Apps Agreement is Active** (i.e. after the
      bank account is added). It is not a visible menu item on the Business page until
      then — don't go hunting for it now.*
- [ ] This drops Apple's commission from **30% → 15%** while you earn under $1M/year

> VAT note: Apple is the merchant of record for App Store sales and collects/remits EU
> VAT itself — you do not need to register for VAT just to sell on the App Store.

---

## Phase 2 — Create the app record ✅ DONE

App record created — **Paper Backgammon Scoreboard** (Apple ID `6771722520`).

- [x] Platform: **iOS**
- [x] Name: **Paper Backgammon Scoreboard**
      *("Backgammon Scoreboard" alone is taken; "Minimalistic Backgammon Scoreboard" was
      34 characters — over Apple's 30-char limit — so the final App Store name is
      "Paper Backgammon Scoreboard" (27 chars). The on-device icon name stays
      "Backgammon Scoreboard" and does not have to match.)*
- [x] Primary language: **English (U.S.)**
- [x] Bundle ID: **`com.peterszasz.BackgammonScoreboard`**
      *(registered first in developer.apple.com → Certificates, Identifiers & Profiles →
      Identifiers, as an Explicit App ID with no extra capabilities)*
- [x] SKU: `backgammon-scoreboard-001`
- [x] User Access: **Full Access**
- [x] Click **Create**

---

## Phase 3 — App listing metadata

On the app's **1.0 — Prepare for Submission** page.

### Text fields

- [x] **Subtitle** (≤30 chars):
  ```
  Pocket scoreboard for matches
  ```
- [x] **Description**:
  ```
  A minimal scoreboard for in-person backgammon matches. Designed to do
  one thing well: track the match score with Crawford rule support, and
  nothing else. No player names, no timers, no doubling cube — if it
  wouldn't be on a paper scoreboard, it isn't here. It's for casual play
  across the board, not tournament clock-and-clipboard duty.

  FEATURES

  • Two score panels — tap either side to add a point
  • Flip-chart animation — scores animate with a physical flip-card
    effect, rotating around the coil axis
  • Score correction — long-press a panel to decrease a score by one
    (confirmation required)
  • Match length — tap the center when scores are 0–0 to cycle forward
    (3, 5, 7 … 21); long-press to cycle backward
  • New match — tap or long-press the center while a match is in progress
    to reset scores
  • Crawford rule — automatically detected and displayed; transitions to
    Post-Crawford after the following game
  • Match over alert — shown when a player reaches the target score
  • State persistence — your match is silently restored when reopened
  • Screen always on — the display stays awake while the app is open
  • Haptic feedback — taps, corrections, and match events have distinct
    feedback
  • Light and dark themes — follows the system appearance by default;
    override in iOS Settings
  • Accessibility — VoiceOver labels and roles on all interactive elements
  • iPhone, landscape-only

  PRIVACY

  This app collects no data, makes no network requests, and uses no
  analytics or tracking.
  ```
- [x] **Keywords** (≤100 chars, comma-separated, no spaces after commas):
  ```
  backgammon,scoreboard,match,crawford,board,game,score,points,counter,live,tournament
  ```
- [x] **Promotional text** (≤170 chars, editable later without review):
  ```
A pocket scoreboard for live backgammon. Tap to score, Crawford rule, and flip-chart animation. Minimalistic on purpose: no clock, no clutter, just the score.
  ```
- [x] **Support URL** — `https://eszpee.github.io/BackgammonScoreboard/`
- [x] **Marketing URL** (optional) — leave blank or use the support URL
- [x] **Copyright**:
  ```
  2026 Péter Szász
  ```

### Screenshots
- [x] Upload the files from `screenshots/` into the **iPhone 6.9" display** slot
      *(they are 2868×1320, landscape — the current required size)*
- [x] Pick up to 10 — choose the dark set, the light set, or a mix
- [x] First 1–3 screenshots matter most (shown in search results)

### Categorisation
- [x] Primary category: **Games** → secondary genre **Board**
- [x] **Age Rating** — open the questionnaire, answer all "None"/"No" → resolves to **4+**

### App Privacy (separate "App Privacy" section in the sidebar)
- [x] Privacy Policy URL — `https://eszpee.github.io/BackgammonScoreboard/privacy.html`
- [x] Data collection question — answer **"No, we do not collect data from this app"**
      *(matches the empty `NSPrivacyCollectedDataTypes` in `PrivacyInfo.xcprivacy`)*

### Pricing and Availability (separate section)
- [x] Set a **price** — **999 HUF** base tier (Apple auto-localizes to every currency)
- [x] Choose **availability** — **all countries** (EU included, so the Phase 1 Trader
      setup remains worthwhile)
- [x] Note: the price can be changed anytime later, freely

> Originally drafted at $2.99; launched at **999 HUF** base (≈ $2.79 / €2.49) — a fair
> price for a focused niche tool, with EU sales enabled to make the Trader setup pay off.

---

## Phase 4 — Build, archive & upload from Xcode

- [ ] In a terminal: `cd ios && bundle exec pod install`
- [ ] Open **`ios/BackgammonScoreboard.xcworkspace`** *(the workspace, NOT the .xcodeproj)*
- [ ] Select the **BackgammonScoreboard** target → **Signing & Capabilities**:
  - [ ] "Automatically manage signing" is **ON**
  - [ ] Team = **Péter Szász (42X8P6QCN9)**
  - [ ] No red signing errors *(Xcode creates the Distribution cert/profile for you)*
- [ ] Set the run destination to **"Any iOS Device (arm64)"** (top bar, not a simulator)
- [ ] Menu: **Product → Archive** — wait for the build to finish
- [ ] The **Organizer** window opens with the new archive selected
- [ ] Click **Distribute App** → **App Store Connect** → **Upload** → accept defaults
- [ ] Wait for the upload to succeed, then wait for the build to finish **processing** in
      App Store Connect (minutes to ~1 hour — you'll get an email)

> If you ever need to upload again, first **bump the build number**
> (`CURRENT_PROJECT_VERSION` in the project settings) to a higher value. The marketing
> version `1.0` can stay.

---

## Phase 5 — TestFlight beta

- [ ] App Store Connect → your app → **TestFlight** tab → confirm the build is listed and
      no longer "Processing"
- [ ] If asked for **Export Compliance**, answer **No**
      *(the Phase 0 Info.plist change should make this not even appear)*
- [ ] Under **Internal Testing**, create a group / add yourself as a tester
- [ ] On your iPhone: install **TestFlight** from the App Store, sign in with the **same
      Apple ID**, install the Paper Backgammon Scoreboard build

### On-device verification (do all of these, in landscape)
- [ ] Tap each side panel — score increases, flip animation plays
- [ ] Long-press a panel — correction confirm dialog appears, score decreases by 1
- [ ] Tap center at 0–0 — match length cycles forward (3, 5, 7 … 21)
- [ ] Long-press center at 0–0 — match length cycles backward
- [ ] Tap/long-press center mid-match — new-match reset
- [ ] Play to a Crawford game — Crawford indicator shows, then Post-Crawford after
- [ ] Reach the target score — match-over alert appears
- [ ] Force-quit the app and reopen — match state is restored
- [ ] Screen stays awake during play; haptics fire on taps
- [ ] Toggle theme in iOS Settings → Backgammon Scoreboard → light & dark both look right

- [ ] If a bug is found: fix it → bump build number → re-archive (Phase 4) → re-test

---

## Phase 6 — Submit for App Store review

Back on the **1.0 — Prepare for Submission** page:

- [ ] In the **Build** section, click **＋** and select the TestFlight-verified build
- [ ] Re-check every section has a green check: metadata, screenshots, pricing,
      age rating, App Privacy
- [ ] **App Review Information**:
  - [ ] Contact name, email, phone
  - [ ] Sign-in required? **No** — leave demo account blank (the app has no login)
  - [ ] Notes (optional but helpful): *"Landscape-only tournament scoreboard. Tap a side
        panel to add a point; tap the center at 0–0 to set match length."*
- [ ] **Version Release**: choose **Automatically** or **Manually** release after approval
- [ ] Click **Add for Review** → **Submit for Review**

---

## Phase 7 — After submission

- [ ] Watch the status: *Waiting for Review → In Review → Approved / Rejected*
      (typically 24–48h)
- [ ] **If rejected**: read the message in **Resolution Center**, reply there or fix &
      resubmit. Common causes: metadata mismatch, missing privacy answers, a crash on the
      review device.
- [ ] **If approved**: it releases automatically, or press **Release This Version** if you
      chose manual release
- [ ] 🎉 App is live on the App Store

---

## Quick troubleshooting

| Problem | Fix |
|---|---|
| Bundle ID not in the New App dropdown | Register it at developer.apple.com → Identifiers |
| Signing errors in Xcode | Ensure you're signed into Xcode with the Apple ID on team `42X8P6QCN9`; toggle "Automatically manage signing" off and on |
| "Archive" is greyed out | Run destination must be "Any iOS Device", not a simulator |
| Upload rejected — duplicate build | Bump `CURRENT_PROJECT_VERSION` and re-archive |
| Build stuck "Processing" > 1h | Usually resolves on its own; check email for any compliance prompt |
