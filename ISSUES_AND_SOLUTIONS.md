# Events App - Pending Issues & Solutions

## Last Updated: December 29, 2025

---

## 🎨 UI/UX Issues

### 1. Login Screen - Bland & Cursor Following Pointless on Mobile
**Current State:** 
- Eye-following card effect exists but useless on Android (no cursor)
- Design looks bland and lacks premium feel
- Missing vibrant colors and engaging visuals

**Proposed Solutions:**
- **Option A (Gyroscope):** Replace cursor-following with device gyroscope for tilt-based parallax effect on mobile
- **Option B (Touch-based):** Make card follow touch position when user drags finger
- **Option C (Animated Background):** Remove interactive card, add animated gradient orbs/particles that move autonomously
- **Recommended:** Combine animated background with subtle gyroscope parallax for premium feel
- Add gradient text, glowing inputs, and floating particle effects
- Use pink/purple/amber gradient scheme matching app theme

---

### 2. Create Event Wizard - Weird Positioning & Layout
**Current State:**
- Sheet appears awkwardly positioned (left side, under screen)
- Content doesn't feel centered or premium
- Step indicators and form fields look cramped

**Proposed Solutions:**
- Make wizard a full-screen modal instead of bottom sheet
- Center all content with proper padding
- Add step progress bar at top with animated transitions
- Use card-based layout for each form section
- Add subtle glassmorphism to form containers
- Animate transitions between steps with Framer Motion

---

### 3. Social Tab - Missing Accents & Toggle Not Visible
**Current State:**
- Friends/Live toggle buttons lack clear active state
- Missing pink accent colors throughout
- Cards don't have the premium glow effect

**Proposed Solutions:**
- Add solid pink background to active toggle button (not just border)
- Add pink gradient glow behind active button
- Make inactive button more muted (zinc-700)
- Add pink accent to "View →" buttons
- Add subtle pink border/glow to event cards on hover
- Pink accent on like/comment icons when active

---

### 4. Event Detail Modal (Friends View) - Completely Broken
**Current State:**
- Modal appears outside app area
- Content floating weirdly, not contained
- No proper backdrop or container

**Proposed Solutions:**
- Use proper Dialog/Sheet component with portal rendering
- Add dark backdrop overlay (bg-black/80)
- Center modal with proper max-width and padding
- Add glassmorphic container with rounded corners
- Ensure modal is scrollable within viewport
- Add smooth entry/exit animations

---

### 5. Ticket Booking Dialog (Live Events) - Mumbled Background
**Current State:**
- Background content too visible through modal
- Elements overlapping and confusing
- Lacks clear visual hierarchy

**Proposed Solutions:**
- Add stronger backdrop blur (backdrop-blur-xl)
- Use solid dark background with opacity (bg-zinc-900/95)
- Clear separation between modal and background
- Add pink gradient accents to match Social tab theme
- Prominent "Book Now" button with gradient
- Clean card layout for ticket selection

---

### 6. Venues Tab - Missing Accents & Weird Filters
**Current State:**
- Filter pills look odd and inconsistent
- Missing amber accent colors
- "Book Now" buttons lack punch

**Proposed Solutions:**
- Redesign filter pills with icons + text, horizontal scroll
- Active filter has amber background, inactive is outline only
- Add amber glow to active filter
- "Book Now" buttons get amber gradient
- Rating badges get amber/gold styling
- Add subtle amber border to venue cards

---

### 7. Venue Booking Dialog - Glass Mumble Jumble
**Current State:**
- Too much transparency causing visual chaos
- Background bleeding through
- Form elements hard to distinguish

**Proposed Solutions:**
- Use solid dark container (bg-zinc-900/98)
- Reduce glassmorphism, add more opacity
- Clear sections with dividers
- Amber accent for primary actions
- Duration selector as clear pill buttons
- Prominent total and booking button at bottom

---

### 8. Profile Page - Looks Weird
**Current State:**
- Layout feels disjointed
- Stats section not visually balanced
- Posts/Tickets grid lacks polish

**Proposed Solutions:**
- Redesign header with larger avatar, better spacing
- Stats in a horizontal card with violet accents
- Posts/Tickets toggle with clear active state (violet)
- Event cards in cleaner grid with consistent sizing
- Add violet gradient accents throughout
- Floating edit button with violet glow

---

## 💬 Feature: Instant Chat

### Current State:
- No chat functionality exists

### Proposed Implementation:

**Phase 1 - UI Only (Mock Data):**
- Chat button on event cards → opens chat modal
- Chat list showing conversations
- Individual chat view with messages
- Message input with send button
- Typing indicators (mock)

**Phase 2 - Real-time Backend:**
- Supabase Realtime for live messaging
- Tables: `conversations`, `messages`, `participants`
- Presence indicators (online/offline)
- Push notifications (Capacitor plugin)
- Message read receipts

**UI Components Needed:**
1. `ChatListModal` - List of all conversations
2. `ChatView` - Individual conversation
3. `MessageBubble` - Single message component
4. `ChatInput` - Message composer
5. `ChatButton` - Floating button on events

---

## 🔧 Backend Integration

### Current State:
- Supabase configured but minimal integration
- Using mock data throughout

### Proposed Implementation:

**Database Tables Needed:**
```sql
-- Users (extends auth.users)
profiles (id, username, avatar_url, bio, location, rep_score)

-- Events
events (id, creator_id, title, description, type, category, date, time, location, image_url, capacity, is_ticketed, price)

-- Social
event_likes (event_id, user_id)
event_comments (id, event_id, user_id, content, created_at)
follows (follower_id, following_id)

-- Tickets
tickets (id, event_id, user_id, quantity, purchase_date, qr_code)

-- Venues
venues (id, name, type, location, capacity_min, capacity_max, price_per_hour, rating, amenities, images)
venue_bookings (id, venue_id, user_id, date, time, duration, status)

-- Chat
conversations (id, event_id, created_at)
conversation_participants (conversation_id, user_id)
messages (id, conversation_id, sender_id, content, created_at, read_at)
```

**Integration Priority:**
1. Auth (Login/Signup) - Already partially done
2. User Profiles - CRUD operations
3. Events - Create, Read, Like, Comment
4. Tickets - Purchase, View
5. Venues - Browse, Book
6. Chat - Real-time messaging

---

## 📋 Priority Order

### High Priority (UI Fixes):
1. [x] Event Detail Modal - Fixed with portal rendering, centered modal, pink accents
2. [ ] Ticket Booking Dialog - Confusing
3. [ ] Venue Booking Dialog - Confusing
4. [ ] Social Tab Toggle - Poor UX

### Medium Priority (Polish):
5. [ ] Login Screen - Bland but functional
6. [ ] Create Event Wizard - Awkward but works
7. [ ] Venues Tab Filters - Works but ugly
8. [ ] Profile Page - Needs polish

### Lower Priority (Features):
9. [ ] Instant Chat UI
10. [ ] Backend Integration
11. [ ] Gyroscope effects for mobile

---

## 🎯 Next Steps

1. **Start with broken modals** - Fix Event Detail and Booking dialogs first
2. **Add accent colors** - Consistent theming across all tabs
3. **Polish existing UI** - One screen at a time
4. **Add Chat UI** - With mock data initially
5. **Backend integration** - When UI is complete

---

## Notes

- All accent colors should match tab themes:
  - Social: Pink/Rose (#ec4899, #f43f5e)
  - Map/Discover: Emerald (#34d399)
  - Venues: Amber/Gold (#f59e0b, #eab308)
  - Profile: Violet (#8b5cf6)
  - Tickets: Cyan/Blue (#06b6d4, #3b82f6)

- Use Framer Motion for all transitions
- Maintain glassmorphism but with higher opacity for modals
- Test on actual Android device for performance
