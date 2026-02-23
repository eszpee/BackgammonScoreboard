# App Store Registration — Individual (Péter Szász)

**Use this plan if:** you want the simplest, fastest path to the App Store, you don't need a VAT invoice for the fee, and you're happy with your personal name appearing as the seller.

**Trade-offs vs. company:**
- ✅ No D-U-N-S number needed — can start enrollment today
- ✅ Personal Apple ID and personal email are fine (no company domain required)
- ✅ No phone verification call, no company document verification
- ✅ No banking setup needed for a free app
- ✅ Seller name on App Store = your personal name (Péter Szász)
- ❌ No VAT invoice — Apple charges you personally, no reverse charge
- ❌ Apple will add Hungarian VAT (27%) on top of the €99 fee (~€125.73 total)
- ❌ Seller name is your legal personal name, locked in — cannot be a company name later without converting the account

---

## Phase 0 — Prepare before touching Apple

### 0.1 What you need
- Your **personal Apple ID** (existing one is fine — the same you use for your iPhone)
- Two-factor authentication enabled on that Apple ID
- That's it — no D-U-N-S, no company docs, no business email

### 0.2 Check two-factor authentication
1. iPhone: **Settings → [your name] → Sign-In & Security → Two-Factor Authentication**
2. If it shows "On" → you're ready
3. If not: **Turn On** → verify with your trusted phone number

---

## Phase 1 — Enroll in the Apple Developer Program

> Can be done via web or the Apple Developer iOS app for individual enrollment.

### 1.1 Start enrollment
1. Go to `https://developer.apple.com/programs/enroll/`
2. Click **Start Your Enrollment**
3. Sign in with your personal Apple ID → verify with 2FA
4. Entity Type: select **Individual / Sole Proprietor** → Continue

### 1.2 Confirm your identity
- Apple will ask you to verify your identity
- You may be prompted to enter your full legal name: **Péter Szász**
  (This becomes your permanent seller name on the App Store — use it exactly as you want it displayed)
- Follow any prompted identity verification steps (may include entering a payment method for identity, not charged yet)

### 1.3 Review and pay
1. Review the **Apple Developer Program License Agreement**
2. Click **Continue to Purchase**
3. Pay the annual fee (~€99 EUR + 27% Hungarian VAT = ~€125.73, charged to your personal payment method)
4. Receive confirmation email: *"Thank you for purchasing a membership"*

> **VAT note:** You pay the gross amount personally. Apple Distribution International Ltd (Ireland) issues the receipt. There is no reverse-charge invoice — this is a personal purchase.

---

## Phase 2 — App Store Connect: Agreements

For a **free app**, you only need to sign the free distribution agreement — no banking setup required.

### 2.1 Sign the free app distribution agreement
1. Go to `https://appstoreconnect.apple.com`
2. You should see a prompt to review agreements, or go to **Business → Agreements**
3. Under **Free Applications**: click **View and Agree to Terms** → agree
4. This is sufficient for distributing a free app

> **If you ever want paid apps or in-app purchases:** you'll need to add banking (IBAN) and tax info at that point. Skip for now.

---

## Phase 3 — Create App Record

### 3.1 Register the Bundle ID (if not already done via Xcode)
1. `https://developer.apple.com` → **Account → Certificates, Identifiers & Profiles → Identifiers**
2. Click **+** → **App IDs** → **App** → Continue
3. Description: `Backgammon Scoreboard`
4. Bundle ID: **Explicit** → `com.peterszasz.BackgammonScoreboard`
5. Capabilities: none needed → Continue → Register

### 3.2 Create app record in App Store Connect
1. `https://appstoreconnect.apple.com` → **My Apps → +** → **New App**
2. Fill in:
   | Field | Value |
   |---|---|
   | Platform | iOS |
   | Name | `Backgammon Scoreboard` |
   | Primary Language | English (U.S.) |
   | Bundle ID | `com.peterszasz.BackgammonScoreboard` |
   | SKU | `backgammon-scoreboard-v1` (internal only, not shown to users) |
   | User Access | Full Access |

### 3.3 Set the developer/seller name — ONE TIME, IRREVERSIBLE
> This is the name shown under your app on the App Store ("By Péter Szász").

- For individual accounts, Apple pre-fills this with your legal name
- The **Company Name** field when creating your first app is your permanent developer name
- You cannot change it later without contacting Apple Support
- With individual enrollment this must be your personal legal name: **Péter Szász**

### 3.4 Complete App Information
- **Category**: Games → Board
- **Content Rights**: "No, it does not contain, show, or access third-party content"
- **Age Rating**: complete questionnaire → all "None/No" → **4+**
- **Privacy Policy URL**: page or GitHub README stating the app collects no data
- **Description** (suggested):
  > A clean, distraction-free backgammon match scoreboard. Tap left or right to score. Supports all standard match lengths, the Crawford rule, and keeps your screen awake during play. No ads, no accounts, no internet required.
- **Keywords**: `backgammon,score,scoreboard,board game,match,crawford,gammon,tournament`
- **Review Notes**: `Simple backgammon scoreboard. Tap left/right to add points, long press to correct. Tap center to cycle match length or start new match. No network, no data collection, no login required.`

---

## Phase 4 — Build, Sign, and Submit

### 4.1 Xcode signing setup
1. Open `ios/BackgammonScoreboard.xcworkspace` in Xcode
2. Select the `BackgammonScoreboard` target → **Signing & Capabilities** tab
3. Check **Automatically manage signing**
4. Team: select your personal team (your name, not a company) — it will show after enrollment processes
5. Verify provisioning profile is auto-created with no errors
6. **General tab**: Version `1.0`, Build `1`

> **Note:** The Team ID in Xcode (`42X8P6QCN9`) was set during an earlier session. If you enrolled as an individual, a new personal Team ID will be assigned. Update this in Xcode after enrollment.

### 4.2 Capture App Store screenshots
1. Run on **iPhone 16 Pro Max** simulator (landscape) — required size: 2868×1320px
   - Screenshot A: fresh 0–0 scoreboard (shows hint text)
   - Screenshot B: active match mid-game (e.g. 4–2 in a match to 7)
   - Screenshot C: Crawford indicator visible
2. Run on **iPhone 8 Plus** simulator (landscape) — size: 2208×1242px
   - Same 3 shots for older device support
3. Use ⌘+S in Simulator, or: `xcrun simctl io booted screenshot ~/Desktop/screenshot.png`
4. Upload in App Store Connect → app record → **App Store** tab → version → iOS screenshots

### 4.3 Archive and upload
1. Xcode → **Product → Archive** (scheme must target a device, not a simulator)
2. In the Organizer window → **Distribute App → App Store Connect → Upload**
3. Keep default options → Next → Upload
4. Build appears in App Store Connect under **TestFlight** after ~15 minutes processing

### 4.4 Submit for review
1. App Store Connect → your app → **+** next to iOS App → new version `1.0`
2. Link the uploaded build to the version
3. Verify all required fields are filled (screenshots, description, privacy policy URL, age rating)
4. Click **Add for Review** → **Submit to App Review**
5. Typical review time: 24–48 hours

---

## Timing summary

| Step | Time |
|---|---|
| Enrollment + payment | Same day |
| Agreement signing | Same day |
| App record creation | Same day |
| Screenshots | 30–60 minutes |
| Archive + upload | 30 minutes + 15 min processing |
| App Review | 1–2 business days |
| **Total** | ~2–3 days |

---

## Upgrading to a company account later

If you later want to switch to Novo-Kunst Kft. for VAT invoicing, Apple allows converting an individual account to an organization account. The process requires submitting a request to Apple Developer Support with your D-U-N-S number. Your existing apps, ratings, and reviews carry over. The seller name on the App Store will update to the company name after conversion.
