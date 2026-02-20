# App Store Registration — Organization (Novo-Kunst Kft.)

**Use this plan if:** you want a proper B2B VAT invoice for the €99 annual fee, and you're okay with the App Store showing "Novo-Kunst Kft." as the seller name.

**Trade-offs vs. individual:**
- ✅ Proper reverse-charge VAT invoice from Apple Distribution International Ltd (Ireland)
- ✅ Company name on App Store (professional for B2B contexts)
- ❌ Requires D-U-N-S number — adds up to 10 business days before you can enroll
- ❌ Requires company domain email (not Gmail/iCloud)
- ❌ Apple will call your company phone to verify
- ❌ More paperwork: banking, tax forms in App Store Connect

---

## Phase 0 — Prepare before touching Apple

### 0.1 Gather what you'll need
- **Legal entity name** exactly as registered: `Novo-Kunst Korlátolt Felelősségű Társaság`
  (Use the full form — Apple matches against D&B records; "Kft." abbreviation may not match)
- **HU VAT number** (adószám): format `HU` + 8-digit prefix, e.g. `HU12345678`
- **Company registered address**
- **Company phone number** — Apple will call this during verification
- **Company website** — must be publicly accessible, domain must belong to the company
- **Company domain email** — e.g. `peter@novo-kunst.hu` — Gmail/iCloud/Outlook not accepted

### 0.2 Look up or request D-U-N-S number
1. Go to: `https://developer.apple.com/enroll/duns-lookup/`
2. Enter company name, address, phone → select Hungary
3. **If found** → note the 9-digit number, proceed to Phase 1
4. **If not found** → submit the form to request one (free)
   - D&B sends the number within 5 business days
   - After receiving it, allow 2 more business days for Apple's systems to sync
   - Use this waiting time to complete Phase 1

---

## Phase 1 — Prepare your Apple ID

### 1.1 Choose your Apple ID
- Use your personal Apple ID — this becomes the "Account Holder"
- The legal entity is Novo-Kunst Kft., but the human account holder is you personally
- Your existing Apple ID (for iPhone, etc.) is fine to use

### 1.2 Enable two-factor authentication
1. iPhone: **Settings → [your name] → Sign-In & Security → Two-Factor Authentication → Turn On**
2. Verify with a trusted device or phone number
3. Confirm it shows "On" — enrollment is blocked without 2FA

---

## Phase 2 — Enroll in the Apple Developer Program

> Must be done on the web — organization enrollment is not available in the iOS app.

### 2.1 Start enrollment
1. Go to `https://developer.apple.com/programs/enroll/`
2. Click **Start Your Enrollment**
3. Sign in with Apple ID → verify with 2FA
4. Entity Type: select **Company / Organization** → Continue

### 2.2 Confirm signing authority
- Select: **"I am the owner/founder and have the authority to bind my organization to legal agreements"**
- Enter your **company domain email** (e.g. `peter@novo-kunst.hu`)

### 2.3 Enter organization info
| Field | Value |
|---|---|
| Legal Entity Name | `Novo-Kunst Korlátolt Felelősségű Társaság` |
| D-U-N-S Number | Your 9-digit number |
| Website | Company website URL |
| Headquarters Phone | Company phone — Apple will call this |

### 2.4 Review and submit
1. Verify all details match your D&B profile exactly
2. Check **"This is the correct headquarters address for my organization"**
3. Click **Submit**
4. You'll receive: *"Your program enrollment has been received"*

### 2.5 Wait for Apple verification
- Apple reviews and may call the company phone
- Typically 3–5 business days
- You'll receive: *"Your Apple Developer Program enrollment is complete — please complete your purchase"*

### 2.6 Complete payment
1. Click the link in the email → sign in
2. Review and agree to the **Apple Developer Program License Agreement**
3. Pay the annual fee (~€99 EUR, charged by Apple Distribution International Ltd, Ireland)
4. Receive confirmation: *"Thank you for purchasing a membership"*

---

## Phase 3 — Get a proper VAT invoice

### 3.1 Download the membership invoice
1. `https://developer.apple.com` → sign in → your name top right → **Account**
2. **Membership → Purchase History**
3. Find the Developer Program fee → click **View Invoice** → download PDF
4. Issued by: Apple Distribution International Ltd, Hollyhill Industrial Estate, Cork, Ireland

### 3.2 Add your VAT number
1. Go to `https://appleid.apple.com` → sign in → **Payment & Shipping**
2. Click your payment method → find the **VAT Number / Tax ID** field (visible for EU billing addresses)
3. Enter: `HU` + your 8-digit adószám prefix (e.g. `HU12345678`) → Save

If the VAT field isn't visible in Apple ID settings, contact Apple Developer Support
(`https://developer.apple.com/contact/`) and request they add your VAT number. Reference your order number.

> **Result:** With a valid EU VAT number, the €99 fee should be invoiced under **reverse charge**.
> You account for Hungarian VAT (27%) on your side. Your accountant handles this entry.
> Without a VAT number, Apple adds VAT directly (~€125.73 total).

---

## Phase 4 — App Store Connect: Agreements, Tax, Banking

### 4.1 Sign the Paid Applications Agreement
1. Go to `https://appstoreconnect.apple.com`
2. **Business → Agreements**
3. Under **Paid Applications**: click **Set Up** → agree to terms
   (Required even for free apps — this is the distribution agreement)

### 4.2 Enter banking information
1. **Business → Payments and Financial Reports → Add Bank Account**
2. Enter company Hungarian bank account:
   - Bank name, BIC/SWIFT
   - IBAN (format: HU + 26 digits)
   - Currency: EUR or HUF
3. Apple may send micro-deposits to verify — check your bank after 1–3 days and confirm the amounts in App Store Connect

### 4.3 Add VAT number in App Store Connect
1. **Business → Tax Information**
2. Select: Hungary / European Union
3. Enter your EU VAT number: `HU12345678`
4. This covers VAT handling on your App Store proceeds

---

## Phase 5 — Create App Record

### 5.1 Register the Bundle ID in developer portal (if not already done via Xcode)
1. `https://developer.apple.com` → **Account → Certificates, Identifiers & Profiles → Identifiers**
2. Click **+** → **App IDs** → **App** → Continue
3. Description: `Backgammon Scoreboard`
4. Bundle ID: **Explicit** → `com.peterszasz.BackgammonScoreboard`
5. Capabilities: none needed → Continue → Register

### 5.2 Create app record in App Store Connect
1. `https://appstoreconnect.apple.com` → **My Apps → +** → **New App**
2. Fill in:
   | Field | Value |
   |---|---|
   | Platform | iOS |
   | Name | `Backgammon Scoreboard` |
   | Primary Language | English (U.S.) |
   | Bundle ID | `com.peterszasz.BackgammonScoreboard` |
   | SKU | `backgammon-scoreboard-v1` (internal only) |
   | User Access | Full Access |

### 5.3 Set the developer/seller name — ONE TIME, IRREVERSIBLE
> This is the name shown under your app on the App Store ("By Novo-Kunst Kft.").

- The **Company Name** field when creating your first app becomes your permanent developer name
- You cannot change it later without contacting Apple Support (and approval is not guaranteed)
- Apple requires it to be the enrolled legal name, or a registered trade name / DBA
- **Recommended**: `Novo-Kunst Kft.` — matches enrolled entity, no additional documentation needed

### 5.4 Complete App Information
- **Category**: Games → Board
- **Content Rights**: "No, it does not contain, show, or access third-party content"
- **Age Rating**: complete questionnaire → all "None/No" → **4+**
- **Privacy Policy URL**: page or GitHub README stating the app collects no data
- **Description** (suggested):
  > A clean, distraction-free backgammon match scoreboard. Tap left or right to score. Supports all standard match lengths, the Crawford rule, and keeps your screen awake during play. No ads, no accounts, no internet required.
- **Keywords**: `backgammon,score,scoreboard,board game,match,crawford,gammon,tournament`
- **Review Notes**: `Simple backgammon scoreboard. Tap left/right to add points, long press to correct. Tap center to cycle match length or start new match. No network, no data collection, no login required.`

---

## Phase 6 — Build, Sign, and Submit

### 6.1 Xcode signing setup
1. Open `ios/BackgammonScoreboard.xcworkspace` in Xcode
2. Select the `BackgammonScoreboard` target → **Signing & Capabilities** tab
3. Check **Automatically manage signing**
4. Team: `42X8P6QCN9`
5. Verify provisioning profile is auto-created with no errors
6. **General tab**: Version `1.0`, Build `1`

### 6.2 Capture App Store screenshots
1. Run on **iPhone 16 Pro Max** simulator (landscape) — required size: 2868×1320px
   - Screenshot A: fresh 0–0 scoreboard (shows hint text)
   - Screenshot B: active match mid-game (e.g. 4–2 in a match to 7)
   - Screenshot C: Crawford indicator visible
2. Run on **iPhone 8 Plus** simulator (landscape) — size: 2208×1242px
   - Same 3 shots for older device support
3. Use ⌘+S in Simulator or `xcrun simctl io booted screenshot ~/Desktop/screenshot.png`
4. Upload in App Store Connect → app record → **App Store** tab → version → iOS screenshots

### 6.3 Archive and upload
1. Xcode → **Product → Archive** (ensure scheme is set to the device target, not simulator)
2. In the Organizer window → **Distribute App → App Store Connect → Upload**
3. Keep default options (include bitcode, upload symbols) → Next → Upload
4. Build appears in App Store Connect under **TestFlight** after ~15 minutes processing

### 6.4 Submit for review
1. App Store Connect → your app → **+** next to iOS App under the App Store tab → new version
2. Link the uploaded build to the version
3. Complete all required fields (screenshots, description, etc.)
4. Click **Add for Review** → **Submit to App Review**
5. Typical review time: 24–48 hours

---

## Timing summary

| Step | Time |
|---|---|
| D-U-N-S lookup / request | 0–7 business days |
| Apple sync after D-U-N-S | +2 business days |
| Enrollment verification | +3–5 business days |
| Banking micro-deposit verification | +1–3 business days |
| App Review | +1–2 business days |
| **Total (worst case)** | ~3 weeks |
| **Total (if D-U-N-S exists)** | ~1 week |
