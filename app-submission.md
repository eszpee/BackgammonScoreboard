# App Store Submission Guide — Paper Backgammon Scoreboard

A step-by-step checklist for publishing **Paper Backgammon Scoreboard** to the
Apple App Store.
This is a first submission, so each step is spelled out. Check boxes off as you go.

## Reference info (you'll need these repeatedly)

| Item | Value |
|---|---|
| Bundle ID | `com.peterszasz.BackgammonScoreboard` |
| Apple Team ID (publishing) | `8A5T6N3965` — NOVO-KUNST org (paid Developer Program) |
| Personal Team (free, do NOT use) | `42X8P6QCN9` — Péter Szász personal Apple ID |
| App Store name | Paper Backgammon Scoreboard |
| Apple ID (App Store Connect) | `6771722520` |
| Home-screen name | Backgammon Scoreboard (truncates to "Backgammon…") |
| Marketing version | `1.0` |
| Build number | `2` (was `1`; bumped to re-upload with the fixed, alpha-free app icon) |
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
- [x] Add **bank account** details for payouts — ✅ *done: the Wise EUR account was
      accepted (see note below)*
- [x] Complete **tax forms** — W-8BEN-E submitted, status **Active**
- [x] Declare **Trader status** (EU DSA) — done, status **Active** (see note below)
- [x] Confirm the Paid Apps agreement shows **Active** — ✅ *flipped to **Active** once the
      bank account was added; the app can now go on sale* 🎉

> ✅ **Phase 1 is complete** — all agreements, tax, banking, and Trader status are done and
> the Paid Apps agreement is Active. The remaining gate to launch is App Review (Phase 6).

### Bank account — Wise EUR account ✅ DONE

Account: Wise (Wise Europe SA), Belgium — IBAN `BE96 9056 7675 9105`, BIC `TRWIBEB1XXX`,
account holder `NOVO-KUNST Kft.`

- [x] **Wise account accepted** — the Belgian Wise EUR account was successfully added in
      App Store Connect, and the Paid Apps agreement flipped to **Active**. The Hungarian
      fallback was not needed.

> 💡 **The real fix (no Apple intervention actually needed):** App Store Connect's Belgian
> form asks for a **bank identifier** and a **dash-formatted account number**, not the IBAN
> — these are just *derived from the IBAN's BBAN* (the 12 digits after `BE` + check digits).
> Belgian BBAN = `BBB AAAAAAA CC` → bank identifier `BBB`, account number entered as
> `BBB-AAAAAAA-CC` (**include the dashes**).
>
> For our IBAN `BE96 9056 7675 9105`, BBAN = `905676759105` → `905` / `6767591` / `05`:
> - Bank identifier: **905**
> - Account number: **905-6767591-05**
>
> (Reference: xe.com Belgian IBAN calculator breaks any IBAN into these parts.)

History (for reference — resolved):
- App Store Connect's "Add Bank Account" flow had initially returned **"We could not find
  any banks matching the search criteria"** — Apple's bank directory did not surface Wise's
  Belgian entity at first.
- Apple Developer Support (case `102895694220`, agent Jennifer) gave a generic "try a
  different branch" message and **referred to the Finance team** via *Contact Us About
  Financial Information*.
- A Finance team case was submitted (Finance Case-ID: `20152487`, Apple Media Services
  Finance Support, `iTSPayments@apple.com`; Team ID `8A5T6N3965` — the NOVO-KUNST org
  Developer Program team).
- Resolved: the Wise account went through and banking is now complete.

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

- [x] Enrol in the **App Store Small Business Program** — ✅ *enrolled; status **being
      reviewed** by Apple (confirmation email received). Enrolled via the dedicated page —
      it is NOT on the Business page:*
      **https://developer.apple.com/app-store/small-business-program/ → "Enrol"**. *The 15%
      rate applies from the fiscal month the enrolment is approved.*
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
- [ ] ⚠️ **Click _Publish_** in the App Privacy section — filling the answers is not enough;
      until it's published, "Add for Review" fails with *"an Admin must provide information
      about the app's privacy practices."*

### Content Rights (App Information page — easy to miss)
- [ ] App → **General → App Information** → **Content Rights Information** →
      **"No, it does not contain, show, or access third-party content"** → Save.
      *Required for every app; "Add for Review" blocks without it.*

### Pricing and Availability (separate section)
- [x] Set a **price** — **999 HUF** base tier (Apple auto-localizes to every currency)
- [x] Choose **availability** — **all countries** (EU included, so the Phase 1 Trader
      setup remains worthwhile)
- [x] Note: the price can be changed anytime later, freely

> Originally drafted at $2.99; launched at **999 HUF** base (≈ $2.79 / €2.49) — a fair
> price for a focused niche tool, with EU sales enabled to make the Trader setup pay off.

---

## Phase 4 — Build, archive & upload from Xcode

- [x] In a terminal: `cd ios && bundle exec pod install`
- [x] Open **`ios/BackgammonScoreboard.xcworkspace`** *(the workspace, NOT the .xcodeproj)*
- [x] Select the **BackgammonScoreboard** target → **Signing & Capabilities**:
  - [x] "Automatically manage signing" is **ON**
  - [x] Team = **NOVO-KUNST Beruházási, Számítástechnikai… (8A5T6N3965)** — *not* the
        "Péter Szász (Personal Team)" entry, which is the free tier and cannot submit
  - [x] No red signing errors *(Xcode creates the Distribution cert/profile for you)*
- [x] Set the run destination to **"Any iOS Device (arm64)"** (top bar, not a simulator)
- [x] Menu: **Product → Archive** — wait for the build to finish
- [x] The **Organizer** window opens with the new archive selected
- [x] Click **Distribute App** → **App Store Connect** → **Upload** → accept defaults
- [x] Wait for the upload to succeed, then wait for the build to finish **processing** in
      App Store Connect (minutes to ~1 hour — you'll get an email)

> If you ever need to upload again, first **bump the build number**
> (`CURRENT_PROJECT_VERSION` in the project settings) to a higher value. The marketing
> version `1.0` can stay.

> 🔁 **Build 2 re-archive (icon fix):** build `1` shipped with an alpha-channel marketing
> icon, so App Store Connect showed the placeholder grid. Fixed `1024.png` → RGB, bumped
> `CURRENT_PROJECT_VERSION` to `2`, re-archived (`xcodebuild … archive`), and uploaded the
> new build via the **Xcode Organizer → Distribute App** GUI (CLI export failed with "No
> Accounts / No signing certificate" — the command-line tools can't see the Xcode account;
> the Organizer can). Marketing version stayed `1.0`.

---

## Phase 5 — TestFlight beta

> TestFlight does **not** require the Paid Apps agreement or a bank account — those only
> gate the app going *on sale*. You can beta test now while the banking case is pending.

- [x] App Store Connect → your app → **TestFlight** tab → confirm the build is listed and
      no longer "Processing"
- [x] If asked for **Export Compliance**, answer **No**
      *(the Phase 0 Info.plist change should make this not even appear)*
- [x] Under **Internal Testing**, create a group / add yourself as a tester
- [x] On your iPhone: install **TestFlight** from the App Store, sign in with the **same
      Apple ID**, install the Paper Backgammon Scoreboard build

### Inviting a friend (internal tester)

Internal testers get every new build **instantly** — no Beta App Review wait. The trade-off
is the friend must be added to the App Store Connect team (scoped by role).

- [x] App Store Connect → **Users and Access** → **＋** → invite the friend by email.
  - [x] Role: a limited role is enough for TestFlight (e.g. **Developer** or **App
        Manager**; even **Customer Support** works). Note this grants them access to the
        NOVO-KUNST App Store Connect account, scoped to that role.
- [ ] Friend accepts the email invite and finishes setting up their Apple ID on the team.
- [x] App Store Connect → app → **TestFlight** → **Internal Testing** group → tick the
      checkbox next to the friend to enable them as a tester for that group.
- [ ] Friend installs the **TestFlight** app from the App Store, signs in with the **same
      Apple ID they were invited with**, and installs the build.
- [ ] Every later upload reaches internal testers automatically (no review).

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

## Phase 6 — Submit for App Store review ✅ DONE

> 🎉 **Submitted 6 Jun 2026, 17:39** — status **Waiting for Review**.
> Submission ID `0a800097-19ff-464a-b1aa-a21812949349`, build **1.0 (2)**, submitted by
> Péter Szász. To withdraw: Distribution → the submission → **Cancel Submission**.

> ✅ **Build 2 processed** — showed **Complete / Ready to Submit** in TestFlight (the build
> thumbnails render the real icon, confirming the alpha fix). Two gates had to be cleared
> first: **App Privacy published** and **Content Rights** set (both in Phase 3).

- [x] In the **Build** section, selected the TestFlight-verified build (**2**)
- [x] Every section green: metadata, screenshots, pricing, age rating, App Privacy
- [x] **App Review Information** — contact info; Sign-in required **No**
- [x] **Version Release** chosen
- [x] **Add for Review** → **Submit for Review**

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
| Signing errors in Xcode | Ensure the selected Team is **NOVO-KUNST (`8A5T6N3965`)**, not "Péter Szász (Personal Team)" (`42X8P6QCN9`, free tier — can't register the bundle ID); the Apple ID logged into Xcode → Settings → Accounts must be a member of the NOVO-KUNST team. Toggle "Automatically manage signing" off and on |
| "Archive" is greyed out | Run destination must be "Any iOS Device", not a simulator |
| Upload rejected — duplicate build | Bump `CURRENT_PROJECT_VERSION` and re-archive |
| Build stuck "Processing" > 1h | Usually resolves on its own; check email for any compliance prompt |
| "Upload completed **with warnings**" → *Upload Symbols Failed* for React.framework / ReactNativeDependencies.framework / hermesvm.framework | **Harmless — the upload succeeded.** Just missing dSYMs for React Native's prebuilt frameworks (they ship without them). dSYMs only symbolicate crash reports; this app has no crash reporting, so it's irrelevant. Does not block processing, TestFlight, or review. Click **Done**. |
| App shows the placeholder grid icon in App Store Connect | The 1024×1024 marketing icon had an **alpha channel** — Apple silently drops it (and emails an "Invalid App Store Icon" warning). Fixed: `1024.png` flattened to RGB (no alpha). The new icon only appears after you **bump the build number, re-archive & re-upload** (Phase 4) — App Store Connect reads the icon from the build. |
