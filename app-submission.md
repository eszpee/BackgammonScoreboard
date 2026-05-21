# App Store Submission Guide — Minimalistic Backgammon Scoreboard

A step-by-step checklist for publishing **Minimalistic Backgammon Scoreboard** to the
Apple App Store.
This is a first submission, so each step is spelled out. Check boxes off as you go.

## Reference info (you'll need these repeatedly)

| Item | Value |
|---|---|
| Bundle ID | `com.peterszasz.BackgammonScoreboard` |
| Apple Team ID | `42X8P6QCN9` |
| App Store name | Minimalistic Backgammon Scoreboard |
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

- [ ] Accept the **Paid Applications Agreement** *(must be done by the account holder)*
- [ ] Add **bank account** details for payouts
- [ ] Complete **tax forms** (residency / withholding info for your country)
- [ ] Confirm the agreement status shows **Active**

> You can start the other phases in parallel — but the app cannot go *on sale* until this
> is Active.

### EU Digital Services Act — Trader status

App Store Connect requires every developer to declare a **Trader status** under the EU
DSA. Because this is a **paid app, you are a Trader** — you're commercializing the app,
and the "non-trader" exception only covers hobbyists with no intent to monetize.

- [ ] Open the **Trader status** declaration in App Store Connect → select **Trader**
- [ ] Provide the required contact info: **address (or P.O. Box)**, **phone**, **email**
- [ ] Certify the app complies with applicable EU law

> ⚠️ **This contact info is published publicly** on your App Store product page across all
> 27 EU countries. As an individual you may use a **P.O. Box** instead of your home
> address — decide this *before* submitting, since changes require re-verification.

### App Store Small Business Program (recommended)

- [ ] Enrol in the **App Store Small Business Program**
      (developer.apple.com → Agreements → App Store Small Business Program)
- [ ] This drops Apple's commission from **30% → 15%** while you earn under $1M/year

> VAT note: Apple is the merchant of record for App Store sales and collects/remits EU
> VAT itself — you do not need to register for VAT just to sell on the App Store.

---

## Phase 2 — Create the app record

In App Store Connect → **Apps** → **＋** → **New App**:

- [ ] Platform: **iOS**
- [ ] Name: **Minimalistic Backgammon Scoreboard**
      *("Backgammon Scoreboard" alone is already taken on the App Store; the
      "Minimalistic" prefix makes it unique. The on-device icon name stays
      "Backgammon Scoreboard" and does not have to match the App Store name.)*
- [ ] Primary language: **English**
- [ ] Bundle ID: select **`com.peterszasz.BackgammonScoreboard`** from the dropdown
      *(If it's not listed: register it at developer.apple.com → Certificates, IDs &
      Profiles → Identifiers → ＋, then come back.)*
- [ ] SKU: any internal code, e.g. `backgammon-scoreboard-001`
- [ ] User Access: **Full Access**
- [ ] Click **Create**

---

## Phase 3 — App listing metadata

On the app's **1.0 — Prepare for Submission** page.

### Text fields
- [ ] **Subtitle** (≤30 chars) — e.g. `Tournament match scoreboard`
- [ ] **Description** — adapt from `README.md`; lead with the "does one thing well" idea,
      then the feature list
- [ ] **Keywords** (≤100 chars, comma-separated, no spaces after commas) —
      e.g. `backgammon,scoreboard,match,crawford,tournament,board game,score`
- [ ] **Promotional text** (optional) — editable later without review
- [ ] **Support URL** — `https://eszpee.github.io/BackgammonScoreboard/`
- [ ] **Marketing URL** (optional) — leave blank or use the support URL
- [ ] **Copyright** — e.g. `2026 Péter Szász`

### Screenshots
- [ ] Upload the files from `screenshots/` into the **iPhone 6.9" display** slot
      *(they are 2868×1320, landscape — the current required size)*
- [ ] Pick up to 10 — choose the dark set, the light set, or a mix
- [ ] First 1–3 screenshots matter most (shown in search results)

### Categorisation
- [ ] Primary category: **Games** → secondary genre **Board**
- [ ] **Age Rating** — open the questionnaire, answer all "None"/"No" → resolves to **4+**

### App Privacy (separate "App Privacy" section in the sidebar)
- [ ] Privacy Policy URL — `https://eszpee.github.io/BackgammonScoreboard/privacy.html`
- [ ] Data collection question — answer **"No, we do not collect data from this app"**
      *(matches the empty `NSPrivacyCollectedDataTypes` in `PrivacyInfo.xcprivacy`)*

### Pricing and Availability (separate section)
- [ ] Set a **price** — recommended **$2.99** tier (Apple auto-localizes it to every
      currency; you pick only one tier)
- [ ] Choose **availability** — keep the **EU enabled** so the Phase 1 Trader setup is
      worthwhile; otherwise all countries or a subset
- [ ] Note: the price can be changed anytime later, freely

> Why $2.99: a fair price for a focused, polished niche tool. $0.99 undervalues it;
> $4.99+ is a stretch for a first app with no reviews yet. You could launch lower (e.g.
> $1.99) to gather early reviews and raise later if you prefer.

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
      Apple ID**, install the Minimalistic Backgammon Scoreboard build

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
