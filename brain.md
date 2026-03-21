# 🧠 Project Milo — Master Developer Encyclopedia
**Version 2.0 — Complete Source of Truth**

> This is the single, canonical reference document for every developer, designer, and AI assistant working on Project Milo. Every architectural decision, schema definition, algorithm, business rule, and flow is documented here. You must not ask the founders to re-explain anything contained in this document. If something is unclear, re-read the relevant section. Do not deviate from the stack, schema, or flows defined here without a documented reason in a PR description.

---

## 1. Brand Identity & Product Mission

### 1.1 What Milo Is

Milo is a **local events discovery and social going-out platform** for GenZ college students in Indian metro cities. Think *Partiful meets Instagram meets Google Maps* — but built exclusively for the Indian college social context.

Users can:
- Discover events and venues near them
- See what their mutual friends are attending tonight
- RSVP, book tickets, and get in via a branded QR code
- Host their own events and get paid via integrated escrow
- Build a reputation as a trusted host over time

### 1.2 Core Mission & Brand Tagline

**Milo is FOMO prevention.**

Tagline: **"One stage. Every story."**

Psychological hook used in all marketing: *"Never be the friend who finds out about the party after it happens."*

Every UI element and backend feature must serve this narrative. When a user opens the app, they should immediately feel the urgency and excitement of what is happening nearby right now.

### 1.3 Target Audience & Growth Strategy

- **Primary audience:** GenZ college students, 18–25, in tier-1 Indian cities.
- **Launch city:** Delhi (alpha). Expanding to Bangalore and Mumbai after product-market fit is confirmed.
- **Growth engine:** Zero-budget WhatsApp and QR-poster campus takeover. Student interns drop Milo deep-links directly into college group chats. This makes **frictionless onboarding** and **flawless deep-link resolution** the most critical technical pillars of the entire app.
- **Social flywheel:** "Invite 3 friends → unlock VIP badge" referral mechanic drives organic user acquisition from within the platform.

### 1.4 Tone of Voice & Visual Identity

- **Feel:** Exclusive yet accessible. Premium and spontaneous. A VIP nightlife companion, not a sterile utility app.
- **Visual language:** Midnight Navy and Gold. Glassmorphic UI. Never looks like Eventbrite.
- **UI principle:** Every screen should make the user feel like something exciting is about to happen.

---

## 2. Tech Stack & Architectural Justifications

| Layer | Technology | Why |
|---|---|---|
| **Framework** | React 18 + TypeScript | Industry standard for complex, state-heavy interfaces. Strict typing prevents runtime UI bugs during rapid iteration. |
| **Bundler** | Vite 6 | Lightning-fast HMR to support rapid UI iteration cycles. |
| **Styling** | TailwindCSS | Utility-first approach guarantees UI consistency while enabling fast prototyping of glassmorphic effects. |
| **Component Library** | shadcn/ui | Pre-built accessible primitives that can be fully styled to Milo's design system. |
| **Server State** | TanStack React Query v5 | Mandatory from Sprint 1. Handles caching, background refetching, optimistic updates, and offline mutation queues. Eliminates raw `useEffect` fetching entirely. Critical for 5G/3G degradation at crowded venues. |
| **Backend / DB** | Supabase (PostgreSQL) | Chosen over Firebase for raw PostgreSQL power. Required for complex relational joins ("find events my friends are attending") and PostGIS spatial queries on the Map tab. |
| **Full-Text Search** | Supabase `pg_trgm` extension | GIN indexes on `events.title` and `venues.name` for fuzzy, performant search without an external service. |
| **Maps** | OlaMaps Web SDK | Chosen over Google Maps to reduce API costs in the Indian market while maintaining premium tile rendering. |
| **Mobile** | Capacitor 7 | Single web codebase with native iOS/Android API access (Push Notifications, Camera, Face ID, Barcode Scanner) via plugins. |
| **Payments** | Razorpay (Marketplace / Route) | Handles ticket payments, platform fee splitting (8%), and host payouts via Razorpay Route. Mandatory for escrow model. |
| **Push Notifications** | Firebase Cloud Messaging (FCM) + APNs | FCM for Android, APNs for iOS, bridged via `@capacitor/push-notifications` plugin. |
| **Error Monitoring** | Sentry | Automatic error capture for both frontend and Supabase Edge Functions. |
| **Product Analytics** | PostHog (self-hosted on Supabase infra or PostHog cloud) | Event tracking for conversion funnels, deep-link attribution, and retention. |
| **Media Storage** | Supabase Storage + Supabase CDN | Event banners, profile photos, venue covers. Max file size: 5MB. All images compressed to WebP on upload via Edge Function. |
| **Offline Support** | Workbox (PWA) + IndexedDB | Caches user tickets so QR codes render without network. Critical for basement venues with no signal. |

---

## 3. Directory Structure & Code Conventions

**Rule: Never mix business logic with UI presentation.**

```
Events_app/
├── src/
│   ├── components/
│   │   ├── modals/           # Heavy logic wizards (Event Creation, Booking).
│   │   └── ui/               # Generic shadcn/ui primitives.
│   ├── context/              # Global state (AuthContext, ThemeContext).
│   ├── hooks/                # React Query custom hooks. ALL data fetching lives here.
│   │   ├── useEvents.ts
│   │   ├── useFriends.ts
│   │   ├── useTickets.ts
│   │   └── useProfile.ts
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client init ONLY. No query logic here.
│   │   ├── services/         # Service layer. Each file owns its DB transactions.
│   │   │   ├── eventService.ts
│   │   │   ├── ticketService.ts
│   │   │   ├── profileService.ts
│   │   │   ├── friendService.ts
│   │   │   ├── venueService.ts
│   │   │   ├── notificationService.ts
│   │   │   └── paymentService.ts
│   │   └── utils.ts          # Pure helper functions (formatDate, calcFomoScore, etc.)
│   ├── pages/                # Top-level route containers. No business logic.
│   ├── styles/
│   │   └── globals.css       # CSS variables for Midnight Navy/Gold design system.
│   └── types.ts              # Centralized TypeScript interface definitions for ALL tables.
├── supabase/
│   ├── functions/            # All Edge Functions.
│   │   ├── generate-ticket-jwt/
│   │   ├── razorpay-webhook/
│   │   ├── release-escrow/
│   │   └── compress-image/
│   └── migrations/           # All schema changes as versioned SQL migration files.
```

**Critical conventions:**
- Components in `src/components/` make zero direct Supabase calls. They receive data via props or call hooks.
- All Supabase queries live in `src/lib/services/`.
- All React Query hooks live in `src/hooks/` and wrap service calls.
- All schema changes must be a new SQL file in `supabase/migrations/`. Never edit the DB manually in production.

---

## 4. Complete Database Schema

All tables reside in PostgreSQL via Supabase. **RLS is mandatory on every single table.** Every table has `created_at TIMESTAMPTZ DEFAULT NOW()` and `updated_at TIMESTAMPTZ DEFAULT NOW()`.

---

### 4.1 `profiles`
Extends Supabase `auth.users`. Created automatically on user signup via trigger.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,                          -- Supabase Storage URL
  date_of_birth DATE,                       -- Required at onboarding for age gating
  university TEXT,                          -- Selected at onboarding for friend discovery
  city TEXT DEFAULT 'Delhi',
  is_private BOOLEAN DEFAULT FALSE,         -- Profile visibility
  attendance_visibility TEXT DEFAULT 'friends' CHECK (attendance_visibility IN ('public', 'friends', 'private')),
  rep_score INTEGER DEFAULT 0,
  rep_tier TEXT GENERATED ALWAYS AS (
    CASE
      WHEN rep_score >= 2000 THEN 'gold'
      WHEN rep_score >= 501 THEN 'silver'
      ELSE 'bronze'
    END
  ) STORED,
  is_verified BOOLEAN DEFAULT FALSE,        -- Manual admin verification (student ID)
  vip_badge BOOLEAN DEFAULT FALSE,          -- Unlocked via referral mechanic
  phone TEXT UNIQUE,
  fcm_token TEXT,                           -- Latest push notification token (updated on login)
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.2 `device_tokens`
Stores FCM/APNs tokens per device per user. One user can have multiple devices.

```sql
CREATE TABLE device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.3 `friendships`
Mutual friends model (Snapchat-style). One row per relationship. Never two rows for the same pair.

```sql
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  blocker_id UUID REFERENCES profiles(id),  -- If status='blocked', who blocked whom
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_self_friendship CHECK (requester_id != addressee_id),
  CONSTRAINT unique_friendship UNIQUE (
    LEAST(requester_id, addressee_id),
    GREATEST(requester_id, addressee_id)
  )
);
```

**Helper function — use this everywhere to check mutual friendship:**
```sql
CREATE OR REPLACE FUNCTION are_friends(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
    AND (
      (requester_id = user_a AND addressee_id = user_b) OR
      (requester_id = user_b AND addressee_id = user_a)
    )
  );
$$ LANGUAGE sql STABLE;
```

---

### 4.4 `venues`

```sql
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  city TEXT NOT NULL,
  cover_url TEXT,                           -- Supabase Storage URL
  photo_urls TEXT[],                        -- Array of additional photo URLs
  capacity INTEGER,
  price_per_hour INTEGER,                   -- In INR paise (e.g., 500000 = ₹5000/hr)
  amenities TEXT[],                         -- e.g. ['rooftop', 'dance_floor', 'bar', 'parking']
  categories TEXT[],                        -- e.g. ['club', 'lounge', 'cafe']
  is_verified BOOLEAN DEFAULT FALSE,        -- Admin-verified venue
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PostGIS spatial index for map queries
CREATE INDEX venues_location_idx ON venues USING GIST (ST_MakePoint(lng, lat));
```

---

### 4.5 `events`

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES profiles(id),
  venue_id UUID REFERENCES venues(id),      -- NULL if host-specified custom location
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,                           -- Supabase Storage URL
  category TEXT NOT NULL CHECK (category IN ('club', 'comedy', 'dj_night', 'open_mic', 'house_party', 'networking', 'sports', 'other')),
  event_type TEXT NOT NULL DEFAULT 'standard' CHECK (event_type IN ('standard', 'table_booking', 'music_booking')),
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  city TEXT NOT NULL DEFAULT 'Delhi',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'friends_only', 'invite_only')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  is_free BOOLEAN DEFAULT FALSE,
  min_age INTEGER DEFAULT 0,               -- Age gate (e.g., 21 for alcohol events)
  is_sponsored BOOLEAN DEFAULT FALSE,      -- Paid boost
  fomo_score FLOAT DEFAULT 0,             -- Computed, stored by materialized view refresh
  total_capacity INTEGER,                  -- Sum of all ticket_types.capacity; NULL = unlimited
  is_staff_pick BOOLEAN DEFAULT FALSE,     -- Manually selected by Milo admin for cold-start feed fallback
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PostGIS spatial index
CREATE INDEX events_location_idx ON events USING GIST (ST_MakePoint(lng, lat));
-- Full-text search index
CREATE INDEX events_title_search_idx ON events USING GIN (to_tsvector('english', title));
```

---

### 4.6 `ticket_types`
Child of `events`. Every event has at least one ticket type.

```sql
CREATE TABLE ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                       -- e.g. 'General Admission', 'VIP Table', 'Couple Pass'
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,        -- In INR paise. 0 = free tier.
  capacity INTEGER,                         -- NULL = unlimited for this tier
  tickets_sold INTEGER DEFAULT 0,          -- Denormalised counter, incremented atomically
  sale_start TIMESTAMPTZ,                  -- NULL = available immediately on event publish
  sale_end TIMESTAMPTZ,                    -- NULL = available until event starts
  perks TEXT[],                            -- e.g. ['open_bar', 'priority_entry', 'merch']
  sort_order INTEGER DEFAULT 0,            -- Display order in UI (0 = first)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.7 `ticket_holds`
Temporary seat reservation during active checkout. Released after 10 minutes if payment not completed.

```sql
CREATE TABLE ticket_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supabase pg_cron job runs every minute: DELETE FROM ticket_holds WHERE expires_at < NOW();
```

---

### 4.8 `tickets`
Issued after successful payment confirmation.

```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
  user_id UUID NOT NULL REFERENCES profiles(id),          -- Ticket owner
  purchaser_id UUID NOT NULL REFERENCES profiles(id),     -- Who paid (for group purchases)
  razorpay_payment_id TEXT,                               -- Razorpay payment reference
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'scanned', 'cancelled', 'refunded')),
  scanned_at TIMESTAMPTZ,
  scanned_by UUID REFERENCES profiles(id),                -- Host/co-host who scanned
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTE: qr_payload is NOT stored in DB. JWT is generated on-demand when ticket screen is opened.
-- The source of truth for ticket validity is tickets.status = 'active'.
```

---

### 4.9 `waitlist`

```sql
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,               -- Queue position
  notified_at TIMESTAMPTZ,                -- When user was notified of availability
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'converted', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);
```

---

### 4.10 `co_hosts`

```sql
CREATE TABLE co_hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  permissions TEXT[] DEFAULT ARRAY['scan', 'view_guestlist'],
  -- Available permissions: 'scan', 'view_guestlist', 'edit_event', 'cancel_event', 'export_guestlist'
  invited_by UUID NOT NULL REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);
```

---

### 4.11 `reviews`
Post-event reviews. Only users whose ticket has `status = 'scanned'` can leave a review.

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  host_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, reviewer_id)            -- One review per event per user
);
```

---

### 4.12 `referrals`

```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id),
  referred_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
  -- 'confirmed' when referred user completes onboarding + first ticket purchase
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referred_id)                      -- Each user can only be referred once
);

-- Trigger: when referrer accumulates 3 confirmed referrals, set profiles.vip_badge = TRUE
```

---

### 4.13 `promo_codes`

```sql
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  event_id UUID REFERENCES events(id),     -- NULL = platform-wide promo
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value INTEGER NOT NULL,         -- Percentage (0-100) or flat INR paise amount
  max_uses INTEGER,                        -- NULL = unlimited
  uses_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.14 `boosts`
Sponsored event/venue listings.

```sql
CREATE TABLE boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('event', 'venue')),
  entity_id UUID NOT NULL,
  boosted_by UUID NOT NULL REFERENCES profiles(id),
  razorpay_payment_id TEXT NOT NULL,
  budget_inr INTEGER NOT NULL,             -- Total budget in INR paise
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.15 `reports`

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('event', 'profile', 'venue', 'ticket', 'message')),
  entity_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('fraud', 'spam', 'inappropriate_content', 'fake_event', 'harassment', 'other')),
  body TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed')),
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.16 `venue_follows`
Asymmetric follow mechanic for venues and event hosts. Separate from the mutual `friendships` model — affects Explore/Discover feed only, not the Friends Ledger.

```sql
CREATE TABLE venue_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('venue', 'host')),
  entity_id UUID NOT NULL,                 -- venue.id or profiles.id of the host
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, entity_type, entity_id)
);
```

**RLS:** User can follow/unfollow freely. `SELECT` is public (follow counts are visible on venue/host profiles).

---

### 4.17 `notifications`

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'friend_request', 'friend_accepted', 'event_invite', 'ticket_confirmed',
    'event_reminder', 'event_cancelled', 'friend_attending', 'waitlist_available',
    'rep_score_change', 'escrow_released', 'new_review', 'co_host_invite'
  )),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  entity_type TEXT,                        -- 'event', 'profile', 'ticket', etc.
  entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.17 `escrow_ledger`
Tracks every money movement per event. Source of truth for payout state.

```sql
CREATE TABLE escrow_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  host_id UUID NOT NULL REFERENCES profiles(id),
  total_collected INTEGER DEFAULT 0,       -- Total ticket revenue in INR paise
  platform_fee INTEGER DEFAULT 0,          -- 8% of total_collected
  host_total INTEGER DEFAULT 0,            -- total_collected - platform_fee
  pre_event_released INTEGER DEFAULT 0,    -- 50% of host_total released pre-event
  pre_event_released_at TIMESTAMPTZ,
  post_event_released INTEGER DEFAULT 0,   -- Remaining 50% released post-event
  post_event_released_at TIMESTAMPTZ,
  scan_count INTEGER DEFAULT 0,            -- Updated in real-time as tickets are scanned
  scan_threshold_met BOOLEAN DEFAULT FALSE,-- TRUE when scan_count >= 66% of tickets_sold
  status TEXT DEFAULT 'holding' CHECK (status IN ('holding', 'partially_released', 'fully_released', 'refunded', 'disputed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id)
);
```

---

### 4.18 `venue_bookings`

```sql
CREATE TABLE venue_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  event_id UUID REFERENCES events(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
  total_price INTEGER,                     -- Computed: hours * price_per_hour
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.19 `user_activity`
Materialised view. Source of truth for the Friends Ledger feed.

```sql
CREATE MATERIALIZED VIEW user_activity AS
  -- Ticket purchases
  SELECT
    t.user_id,
    'ticket_purchased' AS activity_type,
    t.event_id AS entity_id,
    'event' AS entity_type,
    t.created_at
  FROM tickets t
  WHERE t.status != 'cancelled'

  UNION ALL

  -- Event hosting (published events)
  SELECT
    e.host_id AS user_id,
    'event_hosted' AS activity_type,
    e.id AS entity_id,
    'event' AS entity_type,
    e.created_at
  FROM events e
  WHERE e.status = 'published'

  UNION ALL

  -- Venue check-ins (scanned tickets)
  SELECT
    t.user_id,
    'checked_in' AS activity_type,
    t.event_id AS entity_id,
    'event' AS entity_type,
    t.scanned_at AS created_at
  FROM tickets t
  WHERE t.status = 'scanned' AND t.scanned_at IS NOT NULL;

-- Refresh every 5 minutes via pg_cron
SELECT cron.schedule('refresh-user-activity', '*/5 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY user_activity');
```

---

## 5. Row Level Security (RLS) Policies

**Every table must have RLS enabled.** These are the canonical policies.

### `profiles`
```sql
-- Anyone can view public profiles
CREATE POLICY "Public profiles are viewable by all"
  ON profiles FOR SELECT
  USING (is_private = FALSE OR auth.uid() = id);

-- Private profiles: only mutual friends can view
CREATE POLICY "Private profiles visible to friends only"
  ON profiles FOR SELECT
  USING (
    is_private = FALSE OR
    auth.uid() = id OR
    are_friends(auth.uid(), id)
  );

-- Users can only update their own profile
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### `events`
```sql
-- Public events: all authenticated users
CREATE POLICY "Public events viewable by all"
  ON events FOR SELECT
  USING (
    (visibility = 'public' AND status = 'published') OR
    host_id = auth.uid() OR
    (visibility = 'friends_only' AND are_friends(auth.uid(), host_id)) OR
    (visibility = 'invite_only' AND (
      host_id = auth.uid() OR
      EXISTS (SELECT 1 FROM tickets WHERE event_id = events.id AND user_id = auth.uid())
    ))
  );

-- Only host can insert/update/delete
CREATE POLICY "Host manages own events"
  ON events FOR ALL
  USING (auth.uid() = host_id);
```

### `tickets`
```sql
-- User sees own tickets; host sees all tickets for their events
CREATE POLICY "Ticket visibility"
  ON tickets FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.uid() = purchaser_id OR
    EXISTS (SELECT 1 FROM events WHERE id = tickets.event_id AND host_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM co_hosts WHERE event_id = tickets.event_id AND user_id = auth.uid() AND status = 'accepted')
  );
```

### `friendships`
```sql
-- Users can see friendships they are part of
CREATE POLICY "Friendship visibility"
  ON friendships FOR SELECT
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Anyone can send a friend request
CREATE POLICY "Anyone can request friendship"
  ON friendships FOR INSERT
  WITH CHECK (requester_id = auth.uid());

-- Only the addressee can accept/reject; only participants can block
CREATE POLICY "Addressee manages friendship status"
  ON friendships FOR UPDATE
  USING (addressee_id = auth.uid() OR requester_id = auth.uid());
```

---

## 6. Authentication & Onboarding Flow

### 6.1 The Deep-Link Auth Funnel (< 15 seconds to first event page)

1. User receives WhatsApp message with link: `https://milo.app/event/abc123`
2. On mobile, Capacitor Universal Links (iOS) / App Links (Android) intercepts and opens the Milo app directly.
3. `<ProtectedRoute>` checks `AuthContext`. If unauthenticated → redirects to `/login?redirect=/event/abc123`.
4. Login screen presents: **Phone OTP** (Twilio via Supabase) or **Google OAuth**.
5. On first-time login only: redirects to `/onboarding` before the original destination.
6. On returning login: `AuthContext` populates user state and immediately redirects to the preserved deep-link destination.

### 6.2 Onboarding Flow (First-time users only)

After auth, new users complete a 4-step onboarding wizard before reaching the app:

**Step 1 — Profile Setup**
- Display name (required), username (required, unique, validated real-time), avatar upload (optional, can skip).

**Step 2 — University & City**
- Select their university from a searchable list (seeded with Indian universities).
- Confirm their city (auto-detected via IP, user can change).
- **This is used for friend discovery suggestions** — users from the same university are surfaced as suggested friends.

**Step 3 — Date of Birth**
- Required. Validates user is at least 18. Stored in `profiles.date_of_birth`.
- Used for age-gated events (e.g., 21+ events will be hidden from underage users in all feeds and search results).

**Step 4 — Friend Suggestions & Permissions**
- Displays up to 10 suggested friends from the same university who are already on Milo.
- User can send friend requests inline.
- Requests location permission, notification permission.
- If referred by another user (referral code in deep-link), the `referrals` row is created here.

### 6.3 OTP Rate Limiting

Supabase has built-in OTP rate limiting. Additionally, configure the following in the Supabase dashboard:
- Max OTP requests per phone per hour: **5**
- OTP expiry: **10 minutes**

This prevents Twilio credit draining from bot attacks.

---

## 7. Social Graph — Mutual Friends Model

Milo uses a **mutual friends model**, not a follower model. This is a deliberate product decision.

**Rationale:** The Friends Ledger ("what are your friends doing tonight") only carries emotional weight — FOMO — when it shows people you have a genuine two-way relationship with. A follower model dilutes this with creators, venues, and acquaintances you don't actually go out with.

**Messaging:** Users can add friends freely. Mutual friends are established when both sides have accepted. DMs are not auto-enabled — a separate "allow messages from" setting controls who can message you (everyone / friends only / nobody). This preserves the social openness of adding friends while giving users control over their inbox.

**Venue & host discovery** (asymmetric): Users can "follow" venues and event hosts for updates in their Explore tab. This is a separate one-directional mechanic that only affects the Explore/Discover feed, not the Friends Ledger.

### 7.1 Blocking Cascade
When user A blocks user B, `friendships.status` is set to `'blocked'` and `blocker_id` is set to A.

The following must happen across all surfaces:
- B's events no longer appear in A's feeds, map, or search results
- A's events no longer appear in B's feeds, map, or search results
- B cannot view A's profile
- B cannot purchase tickets to A's events
- Both users are removed from shared event group chats (the Supabase channel subscription is revoked server-side)
- If both have tickets to the same event, neither sees the other on the guest list

---

## 8. Privacy Architecture

### 8.1 The Privacy Matrix

| Content | Strangers | Friends | Public (own setting) |
|---|---|---|---|
| Profile (public account) | ✅ Full view | ✅ Full view | — |
| Profile (private account) | 🔒 Name + avatar only | ✅ Full view | — |
| Rep score | ✅ Always visible | ✅ Always visible | — |
| Attendance (public setting) | ✅ Visible | ✅ Visible | — |
| Attendance (friends setting) | ❌ Hidden | ✅ Visible | — |
| Attendance (private setting) | ❌ Hidden | ❌ Hidden | — |
| Friends list | ✅ Count only | ✅ Full list | — |

### 8.2 Event Visibility Modes

Every event has a `visibility` field. Here is exactly how each mode behaves:

**`public`**
- Appears in Explore tab, Map tab, Discover feed, and full-text search.
- Any authenticated user can view and purchase tickets.
- Event shows up in host's public profile events list.

**`friends_only`**
- Does NOT appear in Explore, Map, or search for non-friends.
- Only users who are mutual friends with the host can see and purchase tickets.
- Host's profile still shows the event exists but locks non-friends out of details.
- Primary use case: house parties, exclusive gatherings.

**`invite_only`**
- Invisible everywhere in the app. No feed, no map, no search.
- Accessible ONLY via direct deep-link: `https://milo.app/event/abc123`.
- Ticket purchase page is accessible to anyone with the link.
- Once a user has a ticket, they can access the event chat and guest list.
- Primary use case: Milo's curated early-access WhatsApp-drop events.

### 8.3 Attendance Privacy Cascade

When a user's `attendance_visibility` is `'private'`:
- Their ticket purchase does NOT fire an activity event to the `user_activity` view.
- They do NOT appear on the event's public-facing attendee count or guest list preview.
- They DO appear on the host's internal Guest List (hosts must always see all confirmed attendees).

When `attendance_visibility` is `'friends'`:
- Activity fires but the `user_activity` query filters to friends only.
- Strangers see the attendee count but not the specific person's name.

### 8.4 Chat Access
Event group chat access is controlled by the tickets table. The Supabase Realtime channel for an event is authenticated:
- To subscribe, the user must have a row in `tickets` with `event_id = :id` and `status != 'cancelled'`.
- Co-hosts with `'scan'` or `'view_guestlist'` permission are also granted access.
- If a user's ticket is `'refunded'` or `'cancelled'`, their channel subscription is revoked immediately.

---

## 9. Event System

### 9.1 Event Types

Milo supports three distinct event types, each with a different creation flow and display logic:

**`standard`** — Default. A host-created event with a start/end time, ticket types, and a location. The primary event type.

**`table_booking`** — A venue-owned event type where users reserve a specific table at a venue for a set time. The booking flow is: select venue → select date/time → select table tier (e.g., "Table for 2", "VIP Booth") → pay. Revenue goes through the same escrow model.

**`music_booking`** — A host-created event where the "ticket" is essentially hiring a musician or DJ for a private event. This is a B2B flow and is a **post-launch feature**. Do not build in v1.

### 9.2 Free Events

Events where `is_free = TRUE` have `ticket_types.price = 0` for all tiers. The booking flow still runs — the user still "books" a ticket (for capacity management, guest list access, and chat access) — but no Razorpay order is created. The ticket is issued immediately by a Supabase Edge Function without payment confirmation.

### 9.3 Event Creation Wizard (5 Steps)

Draft state is persisted to both `localStorage('milo_event_draft')` AND as a `status = 'draft'` row in the `events` table (created on Step 1 completion). This prevents data loss on device switch.

- **Step 1:** Basic info — title, category, event type, description.
- **Step 2:** Date, time, location (map picker via OlaMaps).
- **Step 3:** Ticket types — add at least one. For free events, set price to 0. Add capacity per tier.
- **Step 4:** Visibility — public, friends_only, or invite_only.
- **Step 5:** Review + Publish.

On "Publish": sets `events.status = 'published'`, clears `localStorage`, creates `escrow_ledger` row for this event, redirects to the live Event Page.

### 9.4 Recurring Events (Post-Launch)
Not in v1. Spec to be added in v2. Do not build.

### 9.5 Age Gating

If `events.min_age > 0`:
- Users whose `date_of_birth` indicates they are below `min_age` see the event card with an age-gate lock icon.
- The ticket purchase flow is blocked server-side in the Edge Function.
- The event does NOT disappear from feeds (it's still useful to know it exists, even if you can't go).

---

## 10. Ticket & Seating Architecture

### 10.1 Capacity Model

Capacity is managed at the `ticket_types` level, not the `events` level.

- `events.total_capacity` is a denormalized sum of all `ticket_types.capacity` for display purposes. Updated via trigger when ticket_types are created/edited.
- `ticket_types.tickets_sold` is incremented atomically using `FOR UPDATE SKIP LOCKED` to prevent race conditions when multiple users book simultaneously.
- When `ticket_types.tickets_sold >= ticket_types.capacity`, that tier is marked sold out. Users are offered the waitlist.

### 10.2 Seat Hold / Race Condition Prevention

When a user enters the booking flow:
1. The frontend immediately calls `ticketService.createHold(ticketTypeId, quantity)`.
2. This creates a row in `ticket_holds` with `expires_at = NOW() + 10 minutes` and tentatively increments `tickets_sold` (within a transaction).
3. If the hold cannot be created (capacity already full including active holds), the user is immediately shown the sold-out/waitlist UI.
4. If payment is not completed within 10 minutes, a `pg_cron` job deletes the hold and decrements `tickets_sold`.
5. On successful payment, the hold is converted to a permanent `tickets` row.

**The Postgres query for creating a hold uses `SELECT ... FOR UPDATE SKIP LOCKED`** to prevent two users from grabbing the last ticket simultaneously.

### 10.3 Group Ticket Purchasing

A single purchaser can buy tickets for multiple users in one transaction:
- The booking UI allows "Add another attendee" up to a maximum of 6 per transaction.
- Each attendee is assigned by entering their Milo username or phone number.
- One Razorpay order is created for the total amount.
- On webhook confirmation, the Edge Function creates individual `tickets` rows — one per attendee — each with the correct `user_id` and `purchaser_id`.
- Each attendee receives their own notification and their own scannable QR code.
- If an attendee is not yet on Milo, a placeholder ticket is held by the purchaser until the invitee joins.

### 10.4 Waitlist Flow

When a user tries to book a sold-out tier:
1. They are shown the sold-out state with a "Join Waitlist" CTA.
2. On confirmation, a `waitlist` row is created with their `position`.
3. The position display: "You're #12 on the waitlist."
4. When a ticket becomes available (cancellation or capacity increase):
   - The user at `position = 1` is notified via push notification and in-app notification.
   - Their `waitlist.status` is set to `'notified'` and `notified_at` is stamped.
   - They have **30 minutes** to complete purchase before the spot goes to position 2.
5. Waitlist count is surfaced on the event page: "47 people on waitlist." This is a FOMO asset — display it prominently.

### 10.5 Ticket Display UI Rules

**Simple flat event (one ticket type):**
- Show a single "Book Now - ₹X" CTA.
- Show a capacity progress bar: "182 / 200 spots filled."

**Multi-tier event (2+ ticket types):**
- Show each tier as a card: name, price, perks, remaining capacity.
- Sold-out tiers stay visible but greyed out with "Sold Out + Join Waitlist."
- Sort by `ticket_types.sort_order`.

**Free event:**
- Replace "Book Now" CTA with "Reserve Spot — Free."

---

## 11. Escrow & Payout Architecture

### 11.1 Philosophy

All ticket revenue is held in Razorpay Escrow (Razorpay Marketplace/Route model) — not in Milo's operating bank account. Milo is the marketplace intermediary. This is both a legal requirement (RBI regulations on holding third-party funds) and a fraud prevention mechanism.

**The payout is split into two tranches:**
- **Pre-event tranche: 50% of host's cut** — released based on rep tier, before the event.
- **Post-event tranche: 50% of host's cut** — released 48 hours after event end IF the 66% scan threshold is met.

This applies uniformly to all hosts regardless of rep tier. Rep tier only affects the *timing* of the pre-event tranche release.

### 11.2 The Payout Table

| Rep Tier | Pre-Event Release (50%) Timing | Post-Event Release (50%) Trigger |
|---|---|---|
| Bronze (0–500) | 3 days before event start | ≥66% scan rate AND 48hrs after end_time |
| Silver (501–2000) | 7 days before event start | ≥66% scan rate AND 48hrs after end_time |
| Gold (2000+) | 14 days before event start | ≥66% scan rate AND 48hrs after end_time |

The pre-event release timing is only triggered if the event has at least **20% of its total capacity sold** at the time. This prevents releasing money for events with almost no confirmed attendees.

### 11.3 The Full Payment Flow

**Booking (ticket purchase):**
1. User selects ticket tier. `ticket_holds` row is created.
2. Frontend calls `paymentService.createOrder(eventId, ticketTypeId, quantity, promoCodes)`.
3. Edge Function `razorpay-webhook` creates a Razorpay Order via the API.
4. Frontend opens Razorpay checkout (native sheet on mobile via Capacitor plugin).
5. User completes payment.

**Webhook confirmation:**
1. Razorpay fires POST to `supabase/functions/razorpay-webhook`.
2. Edge Function validates Razorpay signature (HMAC-SHA256 with `RAZORPAY_WEBHOOK_SECRET`).
3. **Idempotency check:** If `tickets` row already exists for this `razorpay_payment_id`, return 200 immediately. This prevents duplicate tickets on webhook retry.
4. Creates `tickets` row(s). Deletes `ticket_holds` row. Increments `escrow_ledger.total_collected`.
5. Fires notification to ticket owner(s).

**Webhook failure handling:**
- Razorpay retries failed webhooks automatically (up to 8 times over 24 hours).
- The Edge Function is idempotent (see step 3 above), so retries are safe.
- If a webhook fails all retries, a Sentry alert fires and the transaction is flagged in `escrow_ledger.status = 'disputed'` for manual review.

**Platform fee calculation:**
- `platform_fee = total_collected * 0.08` (8%)
- `host_total = total_collected - platform_fee`
- `pre_event_released = host_total * 0.50`
- `post_event_released = host_total * 0.50`
- GST (18%) is charged on top of the platform fee. Milo's GSTIN must be configured in the Razorpay dashboard. The invoice to the host reflects: Ticket Revenue - Platform Fee (8%) - GST on platform fee (18% of 8%).

**Pre-event tranche release:**
1. A `pg_cron` job runs daily: `SELECT * FROM events WHERE start_time - INTERVAL 'X days' = CURRENT_DATE AND status = 'published'` (X varies by host rep tier).
2. Checks if `escrow_ledger.pre_event_released = 0` and `tickets_sold >= total_capacity * 0.20`.
3. If conditions met: calls Razorpay Route API to transfer `pre_event_released` amount to host's linked account. Updates `escrow_ledger`.
4. Fires notification to host: "Your pre-event payout of ₹X is on its way."

**Post-event tranche release:**
1. A `pg_cron` job runs hourly checking events where `end_time + 48 hours < NOW()`.
2. Checks `escrow_ledger.scan_threshold_met` (set to TRUE when scan_count >= total_tickets * 0.66 during scanning).
3. If threshold met: releases `post_event_released`. Updates rep score (+100 for successful event).
4. If threshold NOT met after 7 days post-event: releases `post_event_released` anyway but docks rep score (-20). Fires admin alert for review.

**Cancellation clawback:**
- If host cancels an event, `events.status = 'cancelled'`.
- Edge Function fires immediately: cancels all active `tickets`, initiates Razorpay refunds to all buyers from escrow.
- If pre-event tranche was already released to host: Milo attempts reverse transfer via Razorpay Route. If host account is insufficient, the case is flagged as `escrow_ledger.status = 'disputed'` for legal/admin action.
- Host's rep score takes `-50` penalty regardless.
- Rep score drops additional `-50` if cancellation is within 7 days of event start.

### 11.4 Host Payout Prerequisites

Before a host can receive any payout, they must have completed in the Creator Tools settings:
- Linked bank account or UPI ID (verified via Razorpay)
- KYC details (PAN card, required by RBI for marketplace payouts above ₹50,000/year)

If payout details are missing when a release is triggered, the tranche is held and the host is notified to complete their payout setup. Money does not bounce — it stays in escrow until setup is complete.

---

## 12. Content Algorithms

### 12.1 The FOMO Score

**Stored as `events.fomo_score` (FLOAT).** Updated by a materialized view refresh every 5 minutes via `pg_cron`.

**Formula:**
```
fomo_score = (recent_ticket_sales_last_1h * 10)
           + (friends_attending_count * 5)
           + (total_tickets_sold * 2)
           + (waitlist_count * 3)
           - (hours_until_start * 0.5)
           + (host_tier_boost)
           + (is_sponsored ? 999999 : 0)
```

Where `host_tier_boost`:
- Bronze: 0
- Silver: +50
- Gold: +100

`friends_attending_count` is user-specific and cannot be stored statically. It is computed at query time as a subquery joining `tickets` with `friendships`. The stored `fomo_score` excludes the friends component — it is added dynamically per user when the feed is fetched.

**Anti-gaming:** A minimum of 5 distinct ticket purchasers (unique `user_id` values, not sock puppets) is required for `recent_ticket_sales` to count toward the FOMO score.

```sql
-- The materialized view that updates fomo_score
CREATE MATERIALIZED VIEW event_fomo_scores AS
SELECT
  e.id AS event_id,
  (
    (COUNT(t.id) FILTER (WHERE t.created_at > NOW() - INTERVAL '1 hour') * 10) +
    (COUNT(DISTINCT t.user_id) * 2) +
    (COUNT(w.id) * 3) -
    (EXTRACT(EPOCH FROM (e.start_time - NOW())) / 3600 * 0.5) +
    (CASE e_rep.rep_tier WHEN 'gold' THEN 100 WHEN 'silver' THEN 50 ELSE 0 END)
  ) AS base_fomo_score
FROM events e
LEFT JOIN tickets t ON t.event_id = e.id AND t.status = 'active'
LEFT JOIN waitlist w ON w.event_id = e.id AND w.status = 'waiting'
LEFT JOIN profiles e_rep ON e_rep.id = e.host_id
WHERE e.status = 'published' AND e.start_time > NOW()
GROUP BY e.id, e.start_time, e_rep.rep_tier;

SELECT cron.schedule('refresh-fomo', '*/5 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY event_fomo_scores');
```

### 12.2 The Discover Feed (SocialTab)

Ranked by `fomo_score` (base + per-user friend component). Paginated with cursor-based pagination (no page numbers — infinite scroll).

**Query logic:**
```sql
SELECT e.*, ev_fomo.base_fomo_score,
  (ev_fomo.base_fomo_score +
    (SELECT COUNT(*) FROM tickets t
     JOIN friendships f ON (f.requester_id = t.user_id OR f.addressee_id = t.user_id)
     WHERE t.event_id = e.id
     AND (f.requester_id = :current_user OR f.addressee_id = :current_user)
     AND f.status = 'accepted') * 5
  ) AS user_fomo_score
FROM events e
JOIN event_fomo_scores ev_fomo ON ev_fomo.event_id = e.id
WHERE e.status = 'published'
AND e.start_time > NOW()
AND e.visibility = 'public'
AND (e.min_age = 0 OR :user_age >= e.min_age)
AND NOT EXISTS (SELECT 1 FROM friendships WHERE status = 'blocked' AND (
  (requester_id = :current_user AND addressee_id = e.host_id) OR
  (requester_id = e.host_id AND addressee_id = :current_user)
))
ORDER BY user_fomo_score DESC
LIMIT 20;
```

### 12.3 The Friends Ledger (SocialTab → Friends tab)

Strictly chronological. Filters by attendance privacy.

```sql
SELECT ua.*, p.display_name, p.avatar_url, p.username
FROM user_activity ua
JOIN profiles p ON p.id = ua.user_id
WHERE ua.user_id IN (
  SELECT
    CASE WHEN requester_id = :current_user THEN addressee_id ELSE requester_id END
  FROM friendships
  WHERE status = 'accepted'
  AND (requester_id = :current_user OR addressee_id = :current_user)
)
AND (
  p.attendance_visibility = 'public'
  OR (p.attendance_visibility = 'friends' AND are_friends(:current_user, p.id))
)
ORDER BY ua.created_at DESC
LIMIT 30;
```

### 12.4 The "Happening Now" Algorithm

Used in the Feed and Map tab to surface events currently in progress.

```sql
CREATE OR REPLACE FUNCTION get_happening_now(user_lat DOUBLE PRECISION, user_lng DOUBLE PRECISION, radius_km INTEGER DEFAULT 10)
RETURNS SETOF events AS $$
  SELECT e.* FROM events e
  WHERE e.status = 'published'
  AND NOW() BETWEEN e.start_time AND e.end_time
  AND ST_DWithin(
    ST_MakePoint(e.lng, e.lat)::geography,
    ST_MakePoint(user_lng, user_lat)::geography,
    radius_km * 1000
  )
  ORDER BY e.fomo_score DESC;
$$ LANGUAGE sql STABLE;
```

### 12.5 Explore Tab Filters

**Events filter:**
- `date`: Today / Tomorrow / This Weekend (computed against `events.start_time`)
- `category`: Enum values from `events.category`
- `distance`: Uses `ST_DWithin` with user's current lat/lng
- `price`: Free / Paid / range

**Venues filter:**
- `capacity`: ≤50 / 50–200 / 200+
- `price_per_hour`: range slider
- `amenities`: multi-select from amenities array

**Full-text search:**
```sql
-- Events
SELECT * FROM events
WHERE to_tsvector('english', title) @@ plainto_tsquery('english', :query)
AND status = 'published';

-- Venues
SELECT * FROM venues
WHERE to_tsvector('english', name || ' ' || COALESCE(description, '')) @@ plainto_tsquery('english', :query);
```

---

## 13. QR Ticket Workflow

### 13.1 JWT Generation (On-Demand)

**The `qr_payload` is NOT stored in the database.** Storing JWTs in the DB creates an irrevocable security liability. Instead:

1. When the user opens their Ticket screen, `ticketService.generateTicketToken(ticketId)` is called.
2. This hits the Supabase Edge Function `generate-ticket-jwt`.
3. The Edge Function verifies `auth.uid() == tickets.user_id` for this ticket.
4. Checks `tickets.status == 'active'`.
5. If valid: signs a JWT with `TICKET_SIGNING_KEY` (stored only in Edge Function env vars): `{ ticketId, eventId, userId, exp: eventEndTime }`.
6. Returns the JWT to the frontend. It is stored in memory only (React state), never in localStorage.
7. The `<TicketQRCode>` component renders the JWT as a branded Liquid SVG QR code.

The source of truth for ticket validity is always `tickets.status` in the database, not the JWT.

### 13.2 Scanning Flow (Host View)

The Host View is a dedicated route (`/host/:eventId`) accessible only to the event host and accepted co-hosts.

**Scanner Tab:**
1. Opens device camera via `@capacitor-community/barcode-scanner`.
2. Continuous scan mode — does not stop after one scan.
3. On QR code detection: decodes JWT, validates signature locally.
4. Calls `ticketService.validateTicket(ticketId)`.
5. Edge Function checks: (a) JWT signature valid, (b) `tickets.status == 'active'`, (c) `tickets.event_id == :current_event`.
6. If valid: sets `tickets.status = 'scanned'`, stamps `scanned_at`, increments `escrow_ledger.scan_count`.
7. If `scan_count >= total_tickets * 0.66`, sets `escrow_ledger.scan_threshold_met = TRUE`.
8. UI flashes GREEN with attendee name and avatar. Audio confirmation beep via Web Audio API.
9. If already scanned: flashes YELLOW with "Already Admitted" + original scan time.
10. If invalid: flashes RED with reason.

**Guest List Tab:**
- Real-time list of all ticket holders via Supabase Realtime subscription.
- Shows: avatar, name, ticket tier, status (active/scanned/cancelled).
- Manual check-in button (for when guest's phone is dead).
- Export as CSV button (for hosts with `'export_guestlist'` co-host permission, always available to event host).

### 13.3 Offline QR Rendering

If network is unavailable when user opens Tickets tab:
- Workbox service worker intercepts the JWT generation request.
- Falls back to the last valid JWT cached in IndexedDB for this ticket (cached for 24 hours).
- Displays a subtle "Offline — cached ticket" indicator.
- The cached JWT is still cryptographically valid for scanning (validated by signature, not network call).

---

## 14. Notification System

### 14.1 Trigger Events

| Event | Notification Type | Channel |
|---|---|---|
| Friend request received | `friend_request` | Push + In-app |
| Friend request accepted | `friend_accepted` | Push + In-app |
| Friend buys ticket to same event | `friend_attending` | Push + In-app |
| Ticket purchase confirmed | `ticket_confirmed` | Push + In-app |
| Event starts in 2 hours | `event_reminder` | Push + In-app |
| Event cancelled | `event_cancelled` | Push + In-app |
| Waitlist spot available | `waitlist_available` | Push + In-app |
| Escrow released | `escrow_released` | Push + In-app |
| New review received | `new_review` | In-app only |
| Co-host invite received | `co_host_invite` | Push + In-app |
| Rep score milestone | `rep_score_change` | In-app only |

### 14.2 Delivery Architecture

1. Triggering event occurs (e.g., ticket purchase webhook confirmed).
2. Edge Function creates row in `notifications` table.
3. A Supabase Database Webhook on `notifications INSERT` triggers the `send-push` Edge Function.
4. `send-push` fetches all `device_tokens` for the target `user_id`.
5. Sends FCM payload (Android) or APNs payload (iOS) via the respective APIs.
6. FCM/APNs handles delivery. Failures are logged to Sentry.

### 14.3 User Preferences

Users can toggle notification types in Settings → Discovery & Experience → Live Settings. Preferences are stored as a JSONB column on `profiles.notification_prefs`. The `send-push` Edge Function checks these preferences before sending.

---

## 15. Maps Architecture

### 15.1 Map Tab Rendering

- OlaMaps Web SDK renders the base map.
- Events are fetched using `ST_DWithin` with the user's current GPS location and their configured discovery radius (default 10km, configurable in Settings).
- **Clustering:** Use `supercluster` npm library to cluster markers at zoom levels below 13. Each cluster shows the count of events inside. Tapping a cluster zooms in, not opens a sheet.
- At zoom ≥ 13, individual event markers are shown. Tapping opens a bottom sheet preview of the event card.
- "Happening Now" events use a distinct pulsing marker animation (CSS keyframes).

### 15.2 Open Graph Metadata for Sharing

Every event page at `https://milo.app/event/:id` must server-render Open Graph meta tags for WhatsApp/Instagram unfurling. This is handled by a Supabase Edge Function acting as a thin SSR layer:

```html
<meta property="og:title" content="[Event Name] — Milo" />
<meta property="og:description" content="[X] friends going · [Date] · [Venue]" />
<meta property="og:image" content="[events.cover_url]" />
<meta property="og:url" content="https://milo.app/event/[id]" />
```

WhatsApp reads these tags on link paste and renders a rich preview card. This is critical for the campus WhatsApp growth strategy.

---

## 16. Gamification Engine

### 16.1 Rep Score Rules

| Action | Points | Condition |
|---|---|---|
| Event hosted successfully | +100 | ≥66% scan rate AND ≥5 unique attendees |
| Every 5 verified attendees | +10 | Counted at event end |
| 5-star review received | +5 | Reviewer must have scanned ticket |
| Event cancelled (>7 days before) | -50 | Any cancellation |
| Event cancelled (<7 days before) | -100 | Emergency cancellation |
| Post-event scan rate < 66% | -20 | Held 7 days, then deducted |

**Anti-gaming rules:**
- Rep points are only awarded after `escrow_ledger.scan_threshold_met = TRUE`.
- The 5-unique-attendees minimum prevents single-user sock-puppet rep farming.
- Rep score can never go below 0.
- Reviews that trigger rep points must come from accounts older than 7 days.

### 16.2 Tiers

| Tier | Score Range | Benefits |
|---|---|---|
| Bronze | 0–500 | Standard user. Pre-event payout 3 days before. |
| Silver | 501–2000 | Trusted host badge. Pre-event payout 7 days before. Bypasses manual verification requirement. |
| Gold / "Party Planner" | 2000+ | Gold badge. Pre-event payout 14 days before. Events get +100 FOMO score boost. Access to advanced analytics (post-launch). |

### 16.3 Referral Mechanic

- User shares a referral link with their unique code.
- Link format: `https://milo.app/join?ref=USERNAME`
- When a new user signs up via this link during onboarding, a `referrals` row is created with `status = 'pending'`.
- A `pg_cron` job checks daily: when `referred_id` completes their first ticket purchase (has ≥1 ticket with `status != 'cancelled'`), the referral is marked `'confirmed'`.
- When a `referrer_id` accumulates 3 confirmed referrals, `profiles.vip_badge = TRUE` is set and they receive a push notification.

---

## 17. Trust & Safety

### 17.1 Content Moderation Flow

1. User taps "Report" on any entity (event, profile, venue, message).
2. Presented with reason options from `reports.reason` enum.
3. A `reports` row is created.
4. Admin dashboard surfaces open reports ranked by severity and volume.
5. Admin can: warn user, suspend account, cancel event + trigger refunds, delete venue listing.
6. Admin action is logged in `reports.resolved_by` and `reports.resolved_at`.

### 17.2 Fraud Prevention

- Razorpay escrow ensures no host can run away with ticket money before delivering the event.
- Pre-event payout is only 50% maximum — host always has skin in the game.
- Rep score anti-gaming rules (see 16.1) prevent score manipulation.
- New accounts (< 7 days old) cannot host paid events. They can only host free events.

---

## 18. Admin Dashboard

**Stack:** Separate internal web app. React + Supabase, authenticated via Supabase service role. NOT part of the main Milo app codebase. Lives in `/admin` subdirectory or separate repo.

**Features required for launch:**
- **Verification queue:** Review host/venue student ID submissions. Approve/reject with one click. Approved → sets `profiles.is_verified = TRUE`.
- **Reports queue:** All open reports. Filter by entity type and reason. Action buttons: warn, suspend, delete.
- **Escrow overview:** All `escrow_ledger` rows with status. Manually trigger releases if `pg_cron` fails.
- **Event management:** View all published events. Force-cancel with full refund trigger.
- **User management:** View, suspend, unsuspend accounts. View rep history.

**Sprint allocation:** Minhaj builds admin dashboard in Sprint 3 alongside the payment work. It must be live before any real money flows.

---

## 19. Legal & Compliance

### 19.1 DPDP Act (Digital Personal Data Protection Act, 2023)

Milo collects: phone number, email (optional), date of birth, GPS location, payment information. Under DPDP:

**Consent:** Explicit, informed consent must be captured at onboarding for: location access, notification access, data processing. Each consent is time-stamped and stored.

**Account deletion:** User-initiated via Settings → Support → Delete Account.
- `profiles.account_status` is set to `'deleted'`.
- PII is nulled out: `username`, `display_name`, `phone`, `avatar_url`, `date_of_birth` → NULL.
- `tickets` rows are anonymized (`user_id` replaced with a static `DELETED_USER_UUID`) — retained for financial record-keeping (7-year requirement).
- All other rows referencing the user are deleted via `ON DELETE CASCADE`.
- Razorpay customer records are retained per RBI/tax requirements but flagged as deleted.
- Full deletion is completed within 30 days of request.

**Data export:** User can request a data export via Settings. A Supabase Edge Function assembles their profile, tickets, reviews, and activity into a JSON file and emails it to their registered address within 72 hours.

### 19.2 Refund Policy

- Event cancelled by host: Full automatic refund to all buyers within 5–7 business days via Razorpay.
- User-initiated refund (before event): Allowed up to 48 hours before event start. 90% refunded (10% processing fee retained). After 48-hour cutoff: no refund.
- Event held but user couldn't attend: No refund. Ticket shows as `active` (not scanned).
- These terms must be displayed on the ticket purchase confirmation screen and in ToS.

### 19.3 GST Configuration

- Milo's 8% platform fee is subject to 18% GST.
- Effective platform fee visible to host: 8% + 1.44% GST = 9.44% effective deduction.
- Milo's GSTIN must be configured in Razorpay dashboard.
- GST invoice auto-generated by Razorpay per settlement.

---

## 20. Cold Start & Empty State Strategy

### 20.1 New User with 0 Friends

When the Friends Ledger is empty (user has no mutual friends yet):
- Do NOT show a blank screen.
- Show a "Discover People You Know" prompt with friend suggestions (from same university).
- Below the prompt, fill the feed with curated "Staff Picks" — events manually selected by Milo admin, tagged `is_staff_pick BOOLEAN` on the events table.
- Staff picks are removed from this fallback slot once the user has ≥3 mutual friends.

### 20.2 New City / No Nearby Events

If there are no events within the user's discovery radius:
- Show the closest upcoming events outside their radius with a "A bit further but worth it" label.
- Prompt to expand discovery radius in settings.
- Never show a completely empty state.

### 20.3 Offline State

If the app launches with no network:
- Tickets tab: fully functional from IndexedDB cache.
- Feed / Explore / Map: shows a "You're offline" banner but renders the last cached feed data (React Query's stale-while-revalidate).
- Event creation wizard: blocks submission with "You need a connection to publish" — but preserves draft state.

---

## 21. Observability & Analytics

### 21.1 Error Monitoring (Sentry)

- Sentry SDK integrated in the React app (`@sentry/react`) and all Supabase Edge Functions (`@sentry/deno`).
- Alerts configured for: Edge Function crashes, payment webhook failures, QR generation failures, any 5xx from Supabase.
- Source maps uploaded to Sentry on every Vercel deployment.

### 21.2 Product Analytics (PostHog)

**Critical events to track from Day 1:**

| Event Name | Properties |
|---|---|
| `deep_link_opened` | `source: 'whatsapp'|'qr_poster'`, `event_id` |
| `signup_completed` | `method: 'otp'|'google'`, `referrer_id` |
| `onboarding_completed` | `university`, `city`, `friends_added_count` |
| `event_viewed` | `event_id`, `source: 'feed'|'explore'|'map'|'deep_link'` |
| `ticket_purchase_initiated` | `event_id`, `ticket_type_id`, `price` |
| `ticket_purchase_completed` | `event_id`, `ticket_type_id`, `price`, `is_group` |
| `friend_request_sent` | — |
| `event_created` | `category`, `visibility`, `is_free` |

**Primary conversion funnel to monitor:**
`deep_link_opened` → `signup_completed` → `onboarding_completed` → `ticket_purchase_completed`

### 21.3 App Version Forcing

On app launch, a Supabase Edge Function returns the `minimum_required_version` for iOS and Android. If the installed Capacitor app version is below this, the app renders a full-screen "Update Required" modal that blocks usage and links to the App Store / Play Store.

This allows forced migration away from breaking schema changes.

---

## 22. Deep Link Architecture

### 22.1 URL Structure

```
https://milo.app/event/:id        → Event page
https://milo.app/u/:username      → User profile
https://milo.app/venue/:id        → Venue page
https://milo.app/join?ref=:code   → Referral onboarding
```

### 22.2 Mobile Configuration

**iOS — Universal Links:**
- `apple-app-site-association` file served at `https://milo.app/.well-known/apple-app-site-association`.
- Configured in Xcode under Associated Domains: `applinks:milo.app`.
- Configured in `capacitor.config.ts` under iOS settings.

**Android — App Links:**
- `assetlinks.json` served at `https://milo.app/.well-known/assetlinks.json`.
- Configured in `AndroidManifest.xml` with `android:autoVerify="true"`.

**Fallback:** If the app is not installed, the universal link falls back to the mobile web version which shows an "Open in App" banner. This is handled by a thin server-side redirect function.

---

## 23. State Machines & Core App Flows

### 23.1 Navigational Architecture (5 Tabs)

```
Bottom Nav
├── 1. Feed (SocialTab)
│     ├── Discover — FOMO-ranked algorithm feed
│     └── Friends — Chronological friends activity ledger
├── 2. Explore (ExploreTab)
│     ├── Events — Searchable + filterable event listings
│     └── Venues — Searchable + filterable venue listings
├── 3. Map (MapTab) — Geospatial event discovery
├── 4. Tickets (TicketsTab) — Digital QR ticket wallet (offline-capable)
└── 5. Profile (ProfileTab) — Rep score, badges, settings
```

### 23.2 Event Creation Wizard State Machine

```
IDLE
  → [User taps Create Event]
STEP_1_BASICS (autosaves to localStorage + DB draft)
  → [Next]
STEP_2_LOCATION
  → [Next]
STEP_3_TICKETS
  → [Next]
STEP_4_VISIBILITY
  → [Next]
STEP_5_REVIEW
  → [Publish]
PUBLISHING (loading state)
  → [Success] → EVENT_LIVE (redirect to event page, clear localStorage)
  → [Error]   → STEP_5_REVIEW (show error toast, do not clear draft)
```

---

## 24. Development & Contribution Architecture

### 24.1 Testing Strategy

**Unit Tests (Vitest):** Required for all pure functions in `src/lib/utils.ts` and all service layer functions. Priority test cases:
- Rep score calculation edge cases (negative floor at 0, tier boundary conditions)
- Platform fee split (8% + GST, rounding to paise)
- FOMO score formula
- Escrow payout trigger conditions (66% threshold, timing per tier)
- Promo code validation (expired, usage limit, event-specific)

**E2E Tests (Playwright):** The critical revenue path MUST have coverage:
```
Launch App → Phone OTP Login → View Event (deep link) → Select Ticket Tier →
Complete Razorpay Payment → View QR Ticket → Open Host Scanner → Scan QR → GREEN state
```

If this E2E breaks, revenue stops. It runs on every PR to `main`.

### 24.2 Git & CI/CD

- **Deployment:** Vercel. Push to `main` → auto-deploys to production. Open PRs → Vercel Preview URLs.
- **Branch naming:** `feat/feature-name`, `fix/bug-description`, `chore/task-name`
- **Commit messages:** Semantic — `feat(tickets): add group booking flow`, `fix(auth): resolve OTP redirect loop`
- **PR requirement:** All PRs must pass Vitest unit tests and Playwright E2E smoke test before merge.
- **Schema changes:** All DB changes must be a SQL migration file in `supabase/migrations/`. Migrations run automatically via Supabase CLI in CI.

### 24.3 Edge Function Deployment

All Supabase Edge Functions are in `supabase/functions/`. Deploy via:
```bash
supabase functions deploy generate-ticket-jwt
supabase functions deploy razorpay-webhook
supabase functions deploy release-escrow
supabase functions deploy compress-image
```

Set secrets via:
```bash
supabase secrets set TICKET_SIGNING_KEY=...
supabase secrets set RAZORPAY_KEY_ID=...
supabase secrets set RAZORPAY_KEY_SECRET=...
supabase secrets set RAZORPAY_WEBHOOK_SECRET=...
supabase secrets set FCM_SERVER_KEY=...
supabase secrets set SENTRY_DSN=...
```

---

## 25. Sprint Timelines (Target: End of May Launch)

### Sprint 1 — Foundation & Auth (Weeks 1–2)

**Minhaj:**
- Fix email/password signup bugs.
- Configure Twilio OTP via Supabase.
- Implement all RLS policies from Section 5.
- Set up OTP rate limiting (5/hr per phone).

**Rohit:**
- Apply all schema migrations from Section 4 in order.
- Implement `are_friends()` helper function.
- Set up `pg_trgm` GIN indexes for full-text search.
- Implement `user_activity` materialized view + pg_cron refresh.
- Implement `get_happening_now()` SQL function.

**Shashank (UI):**
- Redesign Login/Signup views to Midnight Navy styling.
- Implement full 4-step onboarding wizard flow.
- Integrate TanStack React Query from Day 1 — remove all `useEffect` fetching.

### Sprint 2 — Social Graph, Profiles & Events (Weeks 3–4)

**Minhaj:**
- Build `friendships` mutual friends logic (request, accept, block cascade).
- Implement private account access controls per privacy matrix.
- Build referral tracking logic and VIP badge auto-assign trigger.
- Set up `device_tokens` table and push notification delivery via FCM/APNs.

**Rohit:**
- Build FOMO score materialized view and pg_cron job.
- Implement Discover feed query with user-specific friend component.
- Implement Friends Ledger query with attendance privacy filtering.
- Build Event Creation flow (all 5 steps) with DB draft persistence.

**Shashank (UI):**
- Build Public Profile screens (rep score, tier badge, mutual friends count, events list).
- Build Friends Ledger UI with activity cards.
- Build Discover feed with FOMO score-ranked cards.
- Build ExploreTab with events + venues + search + filters.

### Sprint 3 — Payments, Tickets & Admin (Weeks 5–6)

**Rohit:**
- Implement full Razorpay marketplace integration.
- Build `razorpay-webhook` Edge Function with idempotency.
- Build `release-escrow` Edge Function (pre-event and post-event tranche logic with pg_cron).
- Build `generate-ticket-jwt` Edge Function (on-demand, no DB storage).
- Implement `ticket_holds` with 10-minute expiry via pg_cron.
- Implement group ticket purchasing flow.
- Write Playwright E2E test for full booking → scan flow.

**Minhaj:**
- Build admin dashboard (verification queue, reports queue, escrow overview).
- Implement account deletion flow (DPDP compliant).
- Implement `compress-image` Edge Function for Supabase Storage uploads.
- Configure Universal Links (iOS) and App Links (Android) for deep linking.

**Shashank (UI):**
- Build Ticket tier selection UI (cards, sold-out state, waitlist CTA).
- Build Razorpay checkout integration (native Capacitor sheet).
- Build Tickets tab with Liquid SVG QR code display.
- Build Host View (Scanner tab + Guest List tab).
- Build OG meta tag SSR layer for event pages.

### Sprint 4 — Polish, Mobile & Launch Checks (Weeks 7–8)

**All:**
- Full E2E testing on real iOS and Android devices.
- Test Supabase Realtime chat subscriptions in staging.
- Test IndexedDB offline ticket caching at a real venue (basement test).
- Sentry integration and alert configuration.
- PostHog integration with all critical events from Section 21.2.
- App version forcing implementation.
- OlaMaps clustering implementation.
- Map Open Graph metadata SSR.

**Anadi/Gayatri (Marketing):**
- Finalize App Store screenshots and store descriptions.
- Draft Privacy Policy (DPDP compliant) and Terms of Use (including refund policy).
- Prepare WhatsApp intern materials and QR poster assets.

**Ayan:**
- Final project review against this document.
- Compile iOS IPA and push to TestFlight.
- Compile Android AAB and push to Play Store internal testing.

---

## 26. Running the App Locally

```bash
npm install
npm run dev          # Dev server at http://localhost:5173
npm run build        # Production build
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright E2E tests (requires dev server running)
```

### Environment Variables (`.env`)
```
VITE_SUPABASE_URL=https://jquckoniyjkxuafntdlt.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_OLA_MAPS_API_KEY=<your-ola-maps-key>
VITE_POSTHOG_KEY=<your-posthog-key>
VITE_SENTRY_DSN=<your-sentry-dsn>
VITE_RAZORPAY_KEY_ID=<your-razorpay-key-id>
VITE_APP_VERSION=1.0.0
VITE_MIN_REQUIRED_VERSION_IOS=1.0.0
VITE_MIN_REQUIRED_VERSION_ANDROID=1.0.0
```

**⚠️ Never commit `.env` to git. The Supabase URL above is the project URL (safe to expose). The anon key is safe to expose (RLS protects the DB). The `service_role` key must NEVER appear in frontend code or this file.**

### Capacitor Mobile Commands
```bash
npx cap sync
npx cap open ios        # Opens Xcode
npx cap open android    # Opens Android Studio
```

---

## 27. Settings Architecture

```
ACCOUNT
│
├── 👤 PROFILE
│     ├── Profile & Appearance
│     │     ├── Profile Photo (Supabase Storage upload)
│     │     ├── Display Name
│     │     ├── Username
│     │     ├── Bio
│     │     ├── Profile Background Theme
│     │     └── Theme: Light / Dark / Auto
│     │
│     ├── Personal Details
│     │     ├── Contact Info (phone, email)
│     │     └── Date of Birth
│     │
│     ├── Milo Verified (shows verification status / apply CTA)
│     │
│     └── Attendance Visibility
│           ├── Public
│           ├── Friends Only (default)
│           └── Private
│
├── 🎟️ MANAGE
│     ├── Bookings Hub
│     │     ├── Table Bookings
│     │     ├── Music Bookings          ← post-launch placeholder (hidden in v1)
│     │     └── Event Tickets
│     │
│     ├── Payments & Transactions
│     │     ├── Payment Methods (Razorpay-managed)
│     │     └── Transaction History
│     │
│     ├── Your Reviews
│     │
│     └── Reminders
│           └── Event Reminders (toggleable per-event)
│
└── ⚙️ SETTINGS
      │
      ├── 🔐 Security
      │     ├── Change Password
      │     ├── Two-Factor Authentication
      │     ├── Verification Selfie (for host verification submission)
      │     ├── Device Permissions (location, notifications, camera)
      │     └── Blocked Accounts
      │
      ├── 📊 Activity Controls
      │     ├── Who Can Message Me (everyone / friends only / nobody)
      │     ├── Likes Visibility
      │     ├── Comments (on / off)
      │     └── Tags (allow / review / off)
      │
      ├── 📍 Discovery & Experience
      │     ├── Map Settings
      │     │     ├── Discovery Radius (slider, 1–50km)
      │     │     ├── Event Category Filters
      │     │     └── Nearby Alerts (on/off)
      │     │
      │     ├── Feed Settings
      │     │     ├── Nearby Priority (on/off)
      │     │     ├── Mute Categories (multi-select)
      │     │     └── Autoplay Media (on/off)
      │     │
      │     ├── Notification Settings
      │     │     ├── Friend Activity (on/off)
      │     │     ├── Event Reminders (on/off)
      │     │     ├── Ticket Updates (on/off) [cannot disable]
      │     │     └── Waitlist Alerts (on/off)
      │     │
      │     ├── Live Settings
      │     │     ├── Live Notifications (on/off)
      │     │     ├── Viewer Requests
      │     │     └── Low Data Mode
      │     │
      │     └── Chat Settings
      │           ├── Who Can Message Me
      │           ├── Read Receipts
      │           ├── Typing Indicators
      │           └── Media Auto-Download
      │
      ├── ⭐ Creator Tools
      │     ├── Payout Setup
      │     │     ├── Linked Bank Account / UPI
      │     │     └── Tax KYC Details (PAN)
      │     │
      │     ├── Event Defaults
      │     │     ├── Default Visibility
      │     │     ├── Default Category
      │     │     ├── Co-host Permissions (default permission set when adding a co-host)
      │     │     └── Approval Required (for invite-only)
      │     │
      │     └── Rep Score
      │           ├── Rep Score Visibility (public/private)
      │           ├── Feedback Preferences
      │           └── Rep Notifications
      │
      └── 🛟 Support & Legal
            ├── Help Center
            ├── Chat With Us
            ├── FAQs
            ├── Privacy Policy (DPDP compliant)
            ├── Terms of Use (includes refund policy)
            ├── Request Data Export (DPDP right)
            ├── Delete Account (DPDP right)
            └── App Updates (shows current version, min required)
```

---

## 28. Complete Gap Checklist (For Audit Use)

Every item below was identified as a gap in the original document and has been addressed in this version. Use this as a launch readiness checklist.

| # | Gap | Section Addressed |
|---|---|---|
| 1 | Mutual friends model (not followers) | §7 |
| 2 | Privacy matrix (profile, event, attendance) | §8 |
| 3 | Event visibility modes (public/friends/invite-only) | §8.2 |
| 4 | Attendance privacy cascade | §8.3 |
| 5 | Chat access privacy rules | §8.4 |
| 6 | Blocking cascade across all surfaces | §7.1 |
| 7 | Ticket tiers (ticket_types table) | §4.6, §10 |
| 8 | Per-tier capacity tracking | §10.1 |
| 9 | Seat hold / race condition prevention | §10.2 |
| 10 | Waitlist system | §4.9, §10.4 |
| 11 | Group ticket purchasing | §10.3 |
| 12 | Free events flow | §9.2 |
| 13 | Age gating enforcement | §9.5 |
| 14 | Escrow & payout architecture (50/50 split) | §11 |
| 15 | Rep-tier-based payout timing | §11.2 |
| 16 | 66% scan threshold for post-event release | §11.2 |
| 17 | Webhook idempotency & failure handling | §11.3 |
| 18 | Cancellation clawback flow | §11.3 |
| 19 | GST on platform fees | §11.3, §19.3 |
| 20 | Host payout prerequisites (KYC) | §11.4 |
| 21 | FOMO score implementation (materialized view) | §12.1 |
| 22 | user_activity view defined | §4.19 |
| 23 | Happening Now algorithm | §12.4 |
| 24 | Friends Ledger query defined | §12.3 |
| 25 | venues table | §4.4 |
| 26 | friendships table (replacing follows) | §4.3 |
| 27 | ticket_holds table | §4.7 |
| 28 | waitlist table | §4.9 |
| 29 | co_hosts table | §4.10 |
| 30 | reviews table | §4.11 |
| 31 | referrals table | §4.12 |
| 32 | promo_codes table | §4.13 |
| 33 | boosts table | §4.14 |
| 34 | reports table | §4.15 |
| 35 | notifications table | §4.16 |
| 36 | escrow_ledger table | §4.17 |
| 37 | device_tokens table | §4.2 |
| 38 | supabase.ts god file → service layer | §3 |
| 39 | React Query from Sprint 1 | §2, §24 |
| 40 | JWT generated on-demand (not stored in DB) | §13.1 |
| 41 | Rep score anti-gaming | §16.1 |
| 42 | categories defined as ENUM in events | §4.5 |
| 43 | OTP rate limiting | §6.3 |
| 44 | Deep link architecture (Universal/App Links) | §22 |
| 45 | Open Graph metadata for WhatsApp sharing | §15.2 |
| 46 | Media storage strategy (Supabase Storage + WebP) | §2 |
| 47 | Map clustering (supercluster) | §15.1 |
| 48 | Admin dashboard spec | §18 |
| 49 | Co-host permission levels | §4.10 |
| 50 | Guest list export | §13.2 |
| 51 | Event cancellation flow | §11.3 |
| 52 | DPDP compliance (consent, deletion, export) | §19.1 |
| 53 | Refund policy SLA | §19.2 |
| 54 | Product analytics (PostHog) | §21.2 |
| 55 | Error monitoring (Sentry) | §21.1 |
| 56 | App version forcing | §21.3 |
| 57 | Cold start / empty state strategy | §20 |
| 58 | Offline state behaviour | §20.3 |
| 59 | Friend discovery / suggestions | §6.2 |
| 60 | Onboarding flow | §6.2 |
| 61 | Referral mechanic schema + trigger | §4.12, §16.3 |
| 62 | Promo codes | §4.13 |
| 63 | Notification trigger map | §14.1 |
| 64 | Push notification delivery architecture | §14.2 |
| 65 | Full-text search indexing | §2, §12.5 |
| 66 | Recurring events (deferred, not v1) | §9.4 |
| 67 | Music bookings (deferred, not v1) | §9.1 |
| 68 | Movie reminders (removed — out of scope) | Removed |
| 69 | `is_staff_pick` column on events (cold-start fallback) | §4.5, §20.1 |
| 70 | `venue_follows` table (asymmetric venue/host follow) | §4.16 |
| 71 | Live Settings in Settings (notifications, viewer requests, low data mode) | §27 |
| 72 | Co-host Permissions default in Creator Tools Event Defaults | §27 |
| 73 | Music Bookings + Event Reminders nodes in Manage settings | §27 |

---

## 29. Progress Matrix — Codebase Audit (as of March 2026)

> **Legend:** ✅ Done · 🟡 Partial/Mocked · ❌ Not Started · ⚠️ Done Differently
>
> This is the single source of truth on what has actually been built vs what is specced in this document. Update after every sprint.

### 29.0 March 21 OLED Overhaul

This audit reflects the state of the codebase after the significant UI overhaul on March 21, focusing on high-fidelity OLED-style components and interactions across the application.

---

### 29.1 Architecture & Infrastructure

| Feature | Spec | Status | Notes |
|---|---|---|---|
| Vite + React 18 + TypeScript | §2 | ✅ Done | Fully set up |
| TailwindCSS | §2 | ✅ Done | Used across all components |
| Supabase client init (`supabase.ts`) | §3 | ✅ Done | Client-only, no query logic |
| Service layer (`src/lib/services/`) | §3 | ✅ Done | 7 files: `eventService`, `ticketService`, `profileService`, `socialService`, `chatService`, `notificationService`, `index.ts` |
| `src/hooks/` directory (React Query hooks) | §3 | ✅ Done | Directory exists. Hooks like `useEventSearch`, `useVenueSearch`, `useMyProfile` are active. |
| `src/lib/utils.ts` for pure helpers | §3 | ❌ Not Started | No central utils file yet. |
| `supabase/migrations/` versioned SQL files | §3 | ❌ Not Started | DB managed manually in Supabase Studio. Zero migration files |
| TanStack React Query | §2 | 🟡 Partial | `QueryClientProvider` in `main.tsx`. `useQuery` used in `App.tsx` only. All other components still use raw `useEffect` |
| OlaMaps Web SDK | §15 | ✅ Done | `MapTab.tsx` + location search in `CreateEventWizard.tsx` |
| Capacitor 7 | §2 | 🟡 Partial | `@capacitor/app` + `@capacitor/browser` installed. Native plugins (barcode scanner, push, Face ID) NOT wired |
| Sentry error monitoring | §21.1 | ❌ Not Started | — |
| PostHog analytics | §21.2 | ❌ Not Started | — |
| Firebase Cloud Messaging | §14.2 | ❌ Not Started | — |
| Workbox / PWA / IndexedDB | §20.3 | ❌ Not Started | — |
| App version forcing | §21.3 | ❌ Not Started | — |
| Razorpay integration | §11.3 | ❌ Not Started | **Ticket booking is entirely mocked** in `TicketBookingDialog.tsx` |
| Edge Function: `generate-ticket-jwt` | §13.1 | ❌ Not Started | — |
| Edge Function: `razorpay-webhook` | §11.3 | ❌ Not Started | — |
| Edge Function: `release-escrow` | §11.3 | ❌ Not Started | — |
| Edge Function: `compress-image` | §2 | ❌ Not Started | — |

---

### 29.2 Database Schema

| Table | Spec | Status | Notes |
|---|---|---|---|
| `profiles` | §4.1 | ✅ Done | Fully aligned with `display_name`. Rep tiers and scores integrated into UI. |
| `device_tokens` | §4.2 | ❌ Not Started | Not created |
| `friendships` | §4.3 | ❌ Not Started | **Critical gap.** App still has a `follows` table (old asymmetric follower model). This is the next major structural push. |
| `venues` | §4.4 | 🟡 Partial | Exists. Using real DB search hooks. |
| `events` | §4.5 | ✅ Done | Schema aligned. Categories matched to DB enum. FOMO score/ranking not yet algorithmic. |
| `ticket_types` | §4.6 | ❌ Not Started | No ticket tiers. Events have a single flat price |
| `ticket_holds` | §4.7 | ❌ Not Started | No race-condition protection |
| `tickets` | §4.8 | ⚠️ Done Differently | `DbTicket` exists but has `qr_code` column (stored JWT — **security anti-pattern per §13.1**), `quantity`, `total_price`. Missing `ticket_type_id`, `purchaser_id`, `scanned_at`, `scanned_by` |
| `waitlist` | §4.9 | ❌ Not Started | — |
| `co_hosts` | §4.10 | ❌ Not Started | — |
| `reviews` | §4.11 | ❌ Not Started | — |
| `referrals` | §4.12 | ❌ Not Started | — |
| `promo_codes` | §4.13 | ❌ Not Started | — |
| `boosts` | §4.14 | ❌ Not Started | — |
| `reports` | §4.15 | ❌ Not Started | — |
| `venue_follows` | §4.16 | ❌ Not Started | — |
| `notifications` | §4.17 | ✅ Done | Exists. `notificationService.ts` reads/writes to it |
| `escrow_ledger` | §4.18 | ❌ Not Started | — |
| `venue_bookings` | §4.19 | 🟡 Partial | `DbVenueBooking` exists + `VenueBookingDialog.tsx` writes to it. Missing `event_id` FK |
| `user_activity` materialized view | §4.20 | ❌ Not Started | Not created. Friend feed falls back to direct `tickets + events` JOIN queries |

---

### 29.3 Row Level Security (RLS)

| Area | Spec | Status | Notes |
|---|---|---|---|
| All RLS policies | §5 | ❌ Not Started | Policies documented in §5 but **not applied in production**. No migration files exist. The Supabase dashboard may have some manually-added policies — these are untracked and unversioned |

---

### 29.4 Authentication & Onboarding

| Feature | Spec | Status | Notes |
|---|---|---|---|
| Phone OTP login | §6.1 | ✅ Done | `LoginPage.tsx` |
| Google OAuth login | §6.1 | ✅ Done | `LoginPage.tsx` |
| Deep-link redirect preservation | §6.1 | 🟡 Partial | Capacitor installed. `?redirect=` param logic not fully implemented |
| Onboarding wizard (4 steps) | §6.2 | ❌ Not Started | **Does not exist.** New users land directly in app after signup |
| University & city selection | §6.2 | ❌ Not Started | — |
| Date of birth capture | §6.2 | ❌ Not Started | — |
| Friend suggestions on onboarding | §6.2 | ❌ Not Started | — |
| Referral code capture at signup | §6.2 | ❌ Not Started | — |
| OTP rate limiting (5/hr config) | §6.3 | 🟡 Partial | Supabase built-in throttling active. Custom 5/hr config not confirmed |

---

### 29.5 Social Graph

| Feature | Spec | Status | Notes |
|---|---|---|---|
| Mutual friends model (`friendships` table) | §7 | ❌ Not Started | **Largest schema gap.** Still on old `follows` table. `socialService.ts` uses `follows`, not `friendships`. All friend queries are wrong model |
| Friend request / accept / reject UI | §7 | ❌ Not Started | — |
| Blocking cascade (all surfaces) | §7.1 | ❌ Not Started | — |
| Venue/host asymmetric follow | §7 | ❌ Not Started | — |

---

### 29.6 UI — 5 Tabs

| Feature | Spec | Status | Notes |
|---|---|---|---|
| Bottom nav (5 tabs) | §23.1 | ✅ Done | `BottomNav.tsx` — Premium floating glass dock. |
| Feed tab (`Discover` + `Friends`) | §23.1 | ✅ Done | `SocialTab.tsx` — High-fidelity OLED pulse feed. |
| Explore tab (Events + Venues) | §23.1 | ✅ Done | `ExploreTab.tsx` — Premium cards with real DB search hooks. |
| Map tab | §23.1 | ✅ Done | `MapTab.tsx` — Category-colored glows + OLED search. |
| Tickets tab | §23.1 | 🟡 Partial | Functional, but needs final OLED style parity with Explore/Social. |
| Profile tab | §23.1 | ✅ Done | `ProfileTab.tsx` — Premium OLED layout with Rep/Tier support. |

---

### 29.7 Feed Algorithms

| Feature | Spec | Status | Notes |
|---|---|---|---|
| FOMO score materialized view + `pg_cron` | §12.1 | ❌ Not Started | — |
| Discover feed ranked by `fomo_score` | §12.2 | ⚠️ Done Differently | `SocialTab.tsx` live tab shows events by date, not fomo_score. No algorithmic ranking |
| Friends Ledger (`user_activity` view) | §12.3 | ⚠️ Done Differently | `getFriendActivity()` queries `tickets` + `events` directly using old `follows` table — not the `user_activity` materialized view or `friendships` model |
| `get_happening_now()` SQL function | §12.4 | ❌ Not Started | — |
| Explore filters (date, category, PostGIS distance) | §12.5 | 🟡 Partial | Filter UI exists but distance uses client-side lat/lng comparison, not `ST_DWithin` |
| Full-text search with `pg_trgm` GIN indexes | §12.5 | ❌ Not Started | Search is client-side filter on fetched data |
| Age gating in feeds | §9.5 | ❌ Not Started | — |
| Blocked user filtering from feeds | §7.1 | ❌ Not Started | — |
| Sponsored event injection | §12.1 | ❌ Not Started | — |

---

### 29.8 Event Creation

| Feature | Spec | Status | Notes |
|---|---|---|---|
| 5-step creation wizard | §9.3 | ⚠️ Done Differently | **Built as 3 steps** (Vibe, Location, Details). Missing: dedicated ticket-type step, visibility selector step, review step |
| Draft saved to DB on Step 1 | §9.3 | ⚠️ Done Differently | Only `localStorage` — no `status='draft'` row written to the events table |
| Event visibility selector | §8.2 | ❌ Not Started | All events default to public |
| `escrow_ledger` row on publish | §9.3 | ❌ Not Started | — |
| `ticket_types` creation in wizard | §9.3 | ❌ Not Started | — |
| Age gate field (`min_age`) | §9.5 | ❌ Not Started | — |
| Event co-host assignment | §4.10 | ❌ Not Started | — |
| Open Graph SSR for sharing | §15.2 | ❌ Not Started | — |

---

### 29.9 Ticketing & Payments

| Feature | Spec | Status | Notes |
|---|---|---|---|
| Multi-tier `ticket_types` | §10.1 | ❌ Not Started | Single flat price per event |
| Seat hold / `ticket_holds` table | §10.2 | ❌ Not Started | — |
| Group ticket purchasing (up to 6) | §10.3 | ❌ Not Started | — |
| Waitlist system | §10.4 | ❌ Not Started | — |
| Razorpay order creation | §11.3 | ❌ Not Started | **Booking is entirely mocked** |
| Platform fee (8%) + GST (18% on fee) | §11.3 | ❌ Not Started | — |
| Escrow 50/50 pre/post-event split | §11.1 | ❌ Not Started | — |
| Webhook idempotency | §11.3 | ❌ Not Started | — |
| Cancellation clawback + refund trigger | §11.3 | ❌ Not Started | — |
| Host KYC prerequisites | §11.4 | ❌ Not Started | — |

---

### 29.10 QR Tickets

| Feature | Spec | Status | Notes |
|---|---|---|---|
| JWT generated on-demand (Edge Function) | §13.1 | ❌ Not Started | — |
| QR payload NOT stored in DB | §13.1 | ⚠️ Done Differently | `DbTicket` has a `qr_code TEXT` column — **explicitly forbidden in §13.1**. Must be removed |
| Liquid SVG QR code display | §13.1 | 🟡 Partial | QR display UI exists but uses static/mocked value, not live JWT |
| Host scanner route + UI | §13.2 | ❌ Not Started | — |
| Capacitor Barcode Scanner | §13.2 | ❌ Not Started | — |
| Guest list with real-time + CSV export | §13.2 | ❌ Not Started | — |
| Offline QR via IndexedDB | §13.3 | ❌ Not Started | — |

---

### 29.11 Chat & Messaging

| Feature | Spec | Status | Notes |
|---|---|---|---|
| Event group chat (real-time) | §8.4 | ✅ Done | `ChatScreen.tsx` + Supabase Realtime |
| Chat access enforced by ticket RLS | §8.4 | ❌ Not Started | **No access control.** Anyone with a chatId can subscribe |
| Direct Messages | §7 | ✅ Done | `DirectMessageScreen.tsx` + full DM flow |
| Chat list (DMs + groups, unread counts) | — | ✅ Done | `ChatListSheet.tsx` |

---

### 29.12 Notifications

| Feature | Spec | Status | Notes |
|---|---|---|---|
| In-app notifications UI | §14 | ✅ Done | `NotificationsSheet.tsx` with real-time subscription + unread badge |
| Push notifications (FCM/APNs) | §14.2 | ❌ Not Started | — |
| `device_tokens` table | §4.2 | ❌ Not Started | — |
| Notification preferences persisted to DB | §14.3 | 🟡 Partial | Toggle UI in `SettingsSheet` but not saved to `profiles.notification_prefs` |

---

### 29.13 Profile & Gamification

| Feature | Spec | Status | Notes |
|---|---|---|---|
| Profile view (avatar, name, rep score display) | §16.2 | ✅ Done | `ProfileTab.tsx` |
| Edit profile (name, username, bio, avatar, banner) | §27 | ✅ Done | `EditProfileSheet.tsx` + Supabase Storage upload |
| Rep score tiers (Bronze/Silver/Gold) | §16.2 | 🟡 Partial | Tier display is UI-only; not computed from real `rep_score` triggers |
| Rep score computation DB triggers | §16.1 | ❌ Not Started | — |
| Referral mechanic + VIP badge trigger | §16.3 | ❌ Not Started | — |
| Verified badge submission flow | §6.6 | 🟡 Partial | UI references `is_verified` but no submission flow |

---

### 29.14 Settings

| Feature | Spec | Status | Notes |
|---|---|---|---|
| Settings sheet (all top-level sections) | §27 | ✅ Done | `SettingsSheet.tsx` — Rebuilt as premium multi-view glass modal. |
| Theme toggle (Light/Dark/Auto) | §27 | ✅ Done | `ThemeContext.tsx` |
| Attendance visibility + private account toggles | §27 | 🟡 Partial | UI exists but not persisted to `profiles` columns |
| Change password | §27 | ✅ Done | Via Supabase `updateUser` |
| Account deletion | §19.1 | 🟡 Partial | Delete UI exists but full DPDP PII nullification not implemented |
| Payout setup (bank/UPI + KYC) | §27 | 🟡 Partial | UI fields present, not connected to Razorpay KYC API |
| Data export request | §19.1 | ❌ Not Started | — |

---

### 29.15 Admin Dashboard & Legal

| Feature | Spec | Status | Notes |
|---|---|---|---|
| Admin dashboard (separate app) | §18 | ❌ Not Started | Does not exist |
| Universal Links / App Links config | §22.2 | 🟡 Partial | Capacitor installed. `apple-app-site-association` not deployed |
| DPDP consent capture screens | §19.1 | ❌ Not Started | — |
| Privacy Policy / Terms of Use pages | §19 | ❌ Not Started | Placeholder links only |
| GST invoice generation | §19.3 | ❌ Not Started | — |

---

### 29.16 Sprint Progress Summary

| Sprint | Spec Target | Status |
|---|---|---|
| **Sprint 1** — Foundation & Auth | Auth, RLS, schema migrations, onboarding wizard | 🟡 Auth ✅, everything else ❌ |
| **Sprint 2** — Social & Events | Friendships model, FOMO feed, full event wizard | 🟡 UI shells built, data layer on wrong schema |
| **Sprint 3** — Payments & Tickets | Razorpay, JWT QR, host scanner, admin dashboard | ❌ Not started |
| **Sprint 4** — Polish & Mobile | E2E tests, Sentry, PostHog, TestFlight | ❌ Not started |

---

> **Last audited:** March 21, 2026. Updated after the massive high-fidelity OLED UI overhaul.
