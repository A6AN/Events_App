# 🧠 Project Milo — Master Developer Encyclopedia

> **The Single Source of Truth.** This document synthesizes the overarching brand vision, precise technical architecture, database schemas, proprietary algorithms, and granular team sprint timelines. Every developer, designer, and marketer must align with this guide.

---

## 1. Brand Identity & Product Mission

A **local events discovery & social platform** currently operating under the working title: *Project Milo*. 
Think *Partiful meets Instagram meets Google Maps* exclusively tailored for college students. Users can browse events, RSVP, book tickets, discover venues, follow friends, chat in event group chats, and host their own events.

### 1.1 The Brand Narrative & Core Mission
**Milo is FOMO prevention.** 
The central product philosophy and brand tagline is: **"One stage. Every story."**
The psychological hook used in marketing is: *"Never be the friend who finds out about the party after it happens."* 

Every UI element and backend feature must serve this narrative. When a user opens the app, they should immediately feel the urgency and excitement of what is happening nearby right now.

### 1.2 Target Audience & Growth Strategy
- **Audience:** GenZ college students across tier-1 cities (starting with alpha launches in Mumbai, Bangalore, and Delhi).
- **Growth Engine:** The brand relies on a "Zero-Budget" WhatsApp and QR-poster campus takeover strategy. Interns drop Milo deep-links directly into college group chats. Therefore, **frictionless onboarding** and **flawless QR code ticket generation** are the most critical technical pillars of the app.
- **The Social Flywheel:** Employs a VIP Referral incentive (*"Invite 3 friends and get a VIP badge"*) to transition initial alpha testers organically into the Milo ecosystem.

### 1.3 Tone of Voice & Visual Emotion
The app should feel **exclusive yet accessible, premium, and spontaneous.** It must not look like a sterile utility app (like Eventbrite). It must feel like a VIP nightlife companion. This is why the app exclusively uses a **Midnight Navy and Gold** aesthetic to convey nighttime luxury.

---

## 2. Tech Stack & Architectural Justifications

| Layer | Technology | Architectural Rationale |
|---|---|---|
| **Framework** | React 18 + TypeScript | Industry standard for complex, state-heavy interfaces. Strict typings prevent runtime UI bugs during rapid iterative development. |
| **Bundler** | Vite 6 | Lightning-fast HMR (Hot Module Replacement) to support the rapid UI iteration cycles needed by the frontend team. |
| **Styling** | TailwindCSS | Utility-first approach guarantees UI consistency while allowing extremely fast prototyping of complex glassmorphic effects. |
| **Backend / DB** | Supabase | Chosen over Firebase for raw PostgreSQL power. Crucial for complex relational joins (e.g., "Find events my friends are attending") and PostGIS spatial queries required for the Map. |
| **Maps** | OlaMaps Web SDK | Selected over Google Maps to heavily reduce API overhead costs in the Indian market while maintaining premium tile rendering. |
| **Mobile** | Capacitor 7 | Allows us to maintain a single web codebase but interact with native iOS/Android APIs (Push Notifications, Camera, FaceID) via plugins. |

---

## 3. Directory Structure & Code Conventions

The repository is modularly structured. **Never mix business logic with UI presentation.**

```
Events_app/
├── src/
│   ├── components/       # Presentational UI. No direct Supabase calls here if possible.
│   │   ├── modals/       # Heavy logic wizards (Event Creation, Settings).
│   │   └── ui/           # Generic shadcn/ui primitives.
│   ├── context/          # Global State (AuthContext, ThemeContext).
│   ├── hooks/            # (Planned) React Query custom hooks for data fetching.
│   ├── lib/              # Infrastructure. `supabase.ts` holds ALL database transactions.
│   ├── pages/            # Top-level route containers.
│   ├── styles/           # Global CSS variables (`globals.css`).
│   └── types.ts          # Centralized TypeScript interface definitions.
```

---

## 4. State Machines & Core App Flows

### 4.1 Authentication Flow (The "Frictionless" Funnel)
To support the WhatsApp intern growth strategy, login must take `< 15 seconds`.
1. User clicks deep-link `/event/123`.
2. `<ProtectedRoute>` intercepts and redirects to `/login?redirect=/event/123`.
3. User logs in via Phone OTP (Twilio mapped through Supabase) or Google OAuth.
4. On success, `AuthContext` populates user state and immediately redirects back to the deep-linked event.

### 4.2 Event Creation Wizard Flow (Draft State Model)
Event creation is a complex 5-step wizard. To prevent data loss on mobile:
1. Every input updates a React State object AND writes to browser `localStorage('create_event_draft')`.
2. When the user eventually taps "Publish", the payload is sent via `supabase.ts`.
3. Upon 201 Success, `localStorage` is cleared, and the user is redirected to the created Event Page.

### 4.3 Navigational Architecture (The 5-Tab Setup)
The Bottom Nav divides perfectly into "Social Context" and "Utility":
1. **Feed (`SocialTab`)**: Pure Social FOMO. An algorithmic "Discover" feed of what's trending, plus a "Friends" activity feed showing who booked/is hosting what.
2. **Explore (`ExploreTab`)**: The main utility hub. Toggles between searching for Upcoming Events and browsing Venues.
3. **Map (`MapTab`)**: Geospatial discovery of happening events around you.
4. **Tickets (`TicketsTab`)**: Your digital wallet containing the secure Liquid SVG QR tickets.
5. **Profile (`ProfileTab`)**: Reputation score, verification status, and app settings.

---

## 5. Comprehensive Database Schema & RLS Strategy

All tables reside in PostgreSQL via Supabase. **Row Level Security (RLS) is mandatory for every table.**

| Table | Core Columns | Types & Constraints | RLS Intent / Privacy Rules |
|---|---|---|---|
| `profiles` | `id`, `username`, `is_private`, `rep_score`, `is_verified` | `id` (UUID, PK), `is_private` (BOOL) | `SELECT`: Allowed for all if `is_private=false`. If `true`, only `follows` can view. `UPDATE`: Only `auth.uid() == id`. |
| `events` | `id`, `host_id`, `lat`, `lng`, `capacity` | `host_id` (FK -> profiles.id) | `INSERT/UPDATE`: Only `auth.uid() == host_id`. `SELECT`: Any authenticated user. |
| `tickets` | `id`, `event_id`, `user_id`, `qr_payload`, `status` | `event_id` (FK -> events.id), `status` (ENUM) | `SELECT`: `user_id` can see their tickets. `host_id` of the event can see all tickets for that event. |
| `follows` | `follower_id`, `following_id`, `status` | `status` (ENUM: pending, accepted) | `INSERT`: Anyone. `UPDATE`: Only `following_id` can accept/reject. |
| `venue_bookings`| `venue_id`, `user_id`, `start_time`, `status` | `status` (ENUM: pending, confirmed) | `SELECT`: User and Venue Owner only. |

*Note: The `events` table will eventually require PostGIS integration for complex radius-based map queries.*

---

## 6. The "Missing Logic" Blueprints & Proprietary Algorithms

This section details the explicit algorithms the backend team (Rohit/Minhaj) must implement.

### 6.1 Gamification Engine: Rep Scores & Leagues
**The Algorithm:** The `rep_score` is an integer starting at `0`.
- `+100` points per successful event hosted (checked by ticket scans).
- `+10` points for every 5 attendees to an event.
- `+5` points per 5-star post-event review.
- `-50` points for a canceled event within 24h.

**League Tiers:**
- `0 - 500`: **Bronze** (Standard User)
- `501 - 2000`: **Silver** (Trusted Host)
- `2000+`: **Gold / "Party Planner"** (Events boosted 2x in the algorithm).

### 6.2 Monetization & Financial Strategy
The platform's revenue model scales across 3 distinct pillars:

**1. Transaction Fees (Ticketing & Booking):**
Currently, booking flows are mocked. The final production flow takes a cut of ticket sales:
1. User books a ₹500 ticket.
2. API triggers Razorpay Order creation.
3. Razorpay Webhook hits Supabase Edge Function.
4. Edge Function calculates: **Platform Fee (8% = ₹40)**, **Host Payout (92% = ₹460)**.
5. Money is routed via Razorpay Route to the Host's connected account.

**2. Sponsored Content (Promoted Events & Venues):**
Hosts and Venue Owners can easily purchase "Boosts" to sponsor their listings. Sponsoring forces the event/venue to the top of the `ExploreTab` and injects it organically as an algorithmic fixed card within the `Discover` feed. Sponspor payloads will carry an `is_sponsored` boolean that gives it an artificially massive `fomo_score`.

**3. League Subscriptions (Future Monetization):**
Eventually, the Gamification Engine's "Gold / Party Planner" tier will be gated behind a subscription or pay-per-use structure, allowing creators to unlock advanced analytics and SMS blasting to their followers.

### 6.3 The Three-Pronged Content Engine
The application relies on 3 distinct algorithms to surface content across the new Navigational Architecture:

**1. The "Explore" Utility Filters (Events & Venues)**
The `ExploreTab` must implement precise filtering logic:
- **Events:** Filter by `date` (Today, Tomorrow, This Weekend), `category` (Club, Comedy, DJ Night), and `distance` (using PostGIS `ST_DWithin` sorting).
- **Venues:** Filter by `capacity` (<= 50, 50-200, 200+), `pricePerHour` thresholds, and specific `amenities` (Rooftop, Dance Floor).

**2. The "Discover" FOMO Feed Algorithm**
The `SocialTab -> Discover` feed does not show traditional event posters. It maps event data into social activity cards ranked by a **FOMO Score**.
- **`fomo_score` = (`recent_ticket_sales` * 10) + (`friends_attending` * 5) + (`total_likes` * 2) - (`hours_until_start` * 0.5) + (`host_tier_boost`).**
- The high multiplier on `recent_ticket_sales` (velocity) ensures that parties organically blowing up pin themselves to the top of everyone's feed natively.

**3. The "Friends" Activity Ledger**
The `SocialTab -> Friends` tab runs a strictly chronological query pulling from a unified `user_activity` view:
- `SELECT * FROM user_activity WHERE user_id IN (SELECT following_id FROM follows WHERE follower_id = auth.uid()) ORDER BY created_at DESC`.
- This pulls instances of: checking into venues, buying tickets, and hosting events.

### 6.4 The Complete QR Ticket Workflow
The application uses a custom "Liquid" SVG QR component (`TicketQRCode.tsx`) to render visually premium, branded tickets. Here is the operational lifecycle from creation to scanning:

1. **Creation (Booking & Payload):**
   - When a user confirms a booking, an entry is created in the Supabase `tickets` table.
   - A Supabase Edge Function immediately generates a **JWT (JSON Web Token)** payload: `{ ticketId, eventId, userId, exp: EventEndTime }`.
   - This JWT is signed with a secret `TICKET_SIGNING_KEY` known only to the backend, making it cryptographically secure against forgery. This JWT is stored in the `qr_payload` column.

2. **Display (The Liquid Render):**
   - In the frontend, `TicketCard.tsx` fetches the user's ticket.
   - It passes the `qr_payload` string into the `<TicketQRCode>` React component.
   - The component generates a raw data matrix and paints the sophisticated "Liquid" SVG aesthetic exclusively designed for Milo (connected styling, proportional finders, beige background) on the screen.

3. **Scanning (The "Host Mode" Dashboard):**
   - We will build a dedicated **Host View** active route in the app for event organizers.
   - This screen will feature two tabs: **1. Scanner** and **2. Guest List**.
   - The **Scanner** tab leverages the native `@capacitor-community/barcode-scanner` plugin to open the device camera within the app, allowing hyper-fast, continuous ticket scanning.
   - The **Guest List** tab will display a real-time list of expected attendees, allowing hosts to manually check people in if their phone dies, or proactively remove uninvited users.

4. **Validation (Consumption):**
   - The native scanner extracts the payload and instantly pings the Supabase endpoint.
   - The backend checks: (1) Is the signature valid? (2) Is the ticket currently `active`?
   - If both pass, the system automatically checks off that user on the Guest List, marks the ticket as `scanned`, and flashes the Host's screen **GREEN (Admit 1)**.

### 6.5 Realtime Chat Infrastructure & Offline Sync
- **Chat:** Repurpose standard `select` queries in `ChatScreen` to use Supabase `postgres_changes`. Channels must be authenticated so only users with a valid `tickets` row for that `event_id` can subscribe to the chat channel.
- **Offline Sync:** Implement Google Workbox (PWA) and `IndexedDB` to cache a user's tickets securely. If network drops at a basement venue, the cached JWT QR code must still render perfectly.

### 6.6 Verification & Trust (The Blue Tick)
Add an `is_verified` boolean to `profiles`. Verification is manual: Hosts submit their Student ID to a separated internal admin dashboard. Verified profiles bypass the `rep_score` requirement to instantly hit the "Silver" tier.

---

## 7. Granular Sprint Timelines (Road to Launch)

Specific team member allocations to hit the end-of-May launch target.

### Sprint 1: Hardening & Auth (Current)
- **Minhaj:** Fix email/password signup bugs. Configure Twilio OTP. Start drafting RLS policies for `profiles`.
- **Rohit:** Build the SQL functions for the "Happening Now" algorithm.
- **CodyMe/Shashank (UI):** Redesign the Login/Signup views. Integrate the Midnight Navy styling completely into index.css.

### Sprint 2: The Social Flywheel & Profiles
- **Minhaj:** Build the `follows` table logic. Implement Private Account access controls.
- **Rohit:** Implement the "Invite 3 friends = VIP" referral tracking SQL logic.
- **CodyMe:** Design the Public Profile screens highlighting Follower counts and VIP badges.

### Sprint 3: Payments & Ticketing
- **Rohit:** Fully implement Razorpay integration via Supabase Edge Functions. Write the Platform Fee splitting logic.
- **Minhaj:** Write the JWT Generation logic for secure QR code tickets.
- **CodyMe:** Build the "Scanner Mode" UI using Capacitor Barcode Scanner plugin.

### Sprint 4: Polish, Mobile & Launch Checks
- **ALL:** Test real-time Supabase chat subscriptions on staging. Implement IndexedDB offline caching.
- **Anadi/Gayatri:** Finalize Store presence (App Store screenshots, Privacy Policies).
- **Ayan:** Final project review, compile iOS IPA and Android AAB. Push to TestFlight.

---

## 8. Development & Contribution Architecture

### 8.1 State Management (The Shift to React Query)
While the app currenly uses `useEffect` for raw fetching, **Phase 3 will mandate TanStack React Query**.
*Why?* React Query provides out-of-the-box caching, background refetching, and offline mutation queues, which drastically reduces UI jank and handles bad 5G cell reception natively.

### 8.2 Testing Strategy
- **Unit Testing (Vitest):** Core mathematical functions like the Gamification Rep Calculator and the Platform Fee split calculator MUST be heavily tested mapping edge cases.
- **E2E Testing (Playwright):** The absolute critical path MUST have tests written: `Launch App → Phone OTP Login → Navigate Map → Book ₹500 Ticket`. If this breaks, revenue stops.

### 8.3 Git & Deployment CI/CD Conventions
- **Vercel Deployments:** Any push to `main` auto-deploys to Vercel production. Open pull requests will automatically generate Vercel Preview URLs.
- **Branch Naming:**
  - `feat/feature-name` (e.g., `feat/jwt-tickets`)
  - `fix/bug-description` (e.g., `fix/login-redirect-loop`)
- **Commit Messages:** Follow standard semantic formatting: `feat(db): add specific RLS policies for profiles`.

---

## 9. Running the App Locally

```bash
npm install          # Install dependencies
npm run dev          # Dev server at http://localhost:5173
npm run build        # Production build
```

### Environment Variables (`.env`)
```
VITE_SUPABASE_URL=https://jquckoniyjkxuafntdlt.supabase.co
VITE_SUPABASE_ANON_KEY=<your-full-anon-key>
VITE_OLA_MAPS_API_KEY=<your-ola-maps-key>
```

---

## 10. Appendix A: The Unified Settings Architecture

The application relies on a comprehensive, 3-pillar Settings & Account management hierarchy to handle the complex privacy, creator, and legal needs of the platform. All UI development for user preferences must map exactly to this schematic.

```text
ACCOUNT AREA
│
├── 👤 PROFILE FORMAT
│     │
│     ├── Profile & Appearance
│     │     ├── Profile Photo
│     │     ├── Profile Back Theme
│     │     ├── Theme & Mood Settings
│     │     │     ├── Light / Dark / Auto
│     │     │     └── Mood-Based Themes
│     │
│     ├── Personal Details
│     │     ├── Contact Info
│     │     └── Date of Birth
│     │
│     ├── Milo Verified
│     │
│     └── Attendance Visibility
│           ├── Public
│           └── Private
│
├── 🎟️ MANAGE FORMAT
│     │
│     ├── Bookings Hub
│     │     ├── Table Bookings
│     │     ├── Music Bookings
│     │     └── Event Tickets
│     │
│     ├── Payments & Transactions
│     │     ├── Payment Methods
│     │     └── Transaction History
│     │
│     ├── Your Reviews
│     │
│     └── Reminders
│           ├── Event Reminders
│           └── Movie Reminders
│
└── ⚙️ SETTINGS FORMAT
      │
      ├── 🔐 Pass & Security
      │     ├── Change Password
      │     ├── Two-Factor Authentication
      │     ├── Verification Selfie
      │     ├── Device Permissions
      │     └── Blocked Accounts
      │
      ├── 📊 Activity Controls
      │     ├── Likes
      │     ├── Comments
      │     ├── Shares
      │     └── Tags
      │
      ├── 📍 Discovery & Experience
      │     │
      │     ├── Map Settings
      │     │     ├── Discovery Radius
      │     │     ├── Event Filters
      │     │     └── Nearby Alerts
      │     │
      │     ├── Feed Settings
      │     │     ├── Nearby Priority
      │     │     ├── Mute Categories
      │     │     └── Autoplay Media
      │     │
      │     ├── Live Settings
      │     │     ├── Live Notifications
      │     │     ├── Viewer Requests
      │     │     └── Low Data Mode
      │     │
      │     └── Chat Settings
      │           ├── Who Can Message Me
      │           ├── Read Receipts
      │           ├── Typing Indicators
      │           └── Media Auto Download
      │
      ├── ⭐ Creator Tools
      │     ├── Event Creation Defaults
      │     │     ├── Default Visibility
      │     │     ├── Default Category
      │     │     ├── Co-host Permissions
      │     │     └── Approval Required
      │     │
      │     ├── Rep Score Settings
      │     │     ├── Rep Score Visibility
      │     │     ├── Feedback Preferences
      │     │     └── Rep Notifications
      │     │
      │     └── Payouts & Verification
      │           ├── Linked Bank Account / UPI
      │           └── Tax KYC Details
      │
      └── 🛟 Support & Info
            ├── Help Center
            ├── AI Support
            ├── FAQs
            ├── Chat With Us
            ├── Privacy Policy
            ├── Terms of Use
            └── App Updates
```

### Capacitor (Mobile Development)
```bash
npx cap sync
npx cap open ios      # Opens Xcode
npx cap open android  # Opens Android Studio
```

---

## 10. Related Documents Reference
*(Note: Most old contextual documents have been meticulously combined into this encyclopedia. Legacy `task.md`, `implementation_plan.md`, or previous marketing artifacts can be safely fully ignored.)*
