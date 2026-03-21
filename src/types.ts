// src/types.ts
// Auto-generated from brain.md schema — do not hand-edit individual fields.
// Update this file when migrations are added.

export type RepTier = 'bronze' | 'silver' | 'gold'
export type AccountStatus = 'active' | 'suspended' | 'deleted'
export type AttendanceVisibility = 'public' | 'friends' | 'private'
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked'
export type DevicePlatform = 'ios' | 'android' | 'web'
export type EventVisibility = 'public' | 'friends_only' | 'invite_only'
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'
export type EventType = 'standard' | 'table_booking'
export type EventCategory =
  | 'club' | 'comedy' | 'dj_night' | 'open_mic'
  | 'house_party' | 'networking' | 'sports' | 'other'
export type TicketStatus = 'active' | 'scanned' | 'cancelled' | 'refunded'
export type WaitlistStatus = 'waiting' | 'notified' | 'converted' | 'expired'
export type CoHostStatus = 'pending' | 'accepted' | 'declined'
export type CoHostPermission =
  | 'scan' | 'view_guestlist' | 'edit_event'
  | 'cancel_event' | 'export_guestlist'
export type ReferralStatus = 'pending' | 'confirmed'
export type DiscountType = 'percentage' | 'flat'
export type BoostStatus = 'active' | 'paused' | 'completed'
export type BoostEntityType = 'event' | 'venue'
export type ReportEntityType = 'event' | 'profile' | 'venue' | 'ticket' | 'message'
export type ReportReason =
  | 'fraud' | 'spam' | 'inappropriate_content'
  | 'fake_event' | 'harassment' | 'other'
export type ReportStatus = 'open' | 'under_review' | 'resolved' | 'dismissed'
export type EscrowStatus =
  | 'holding' | 'partially_released' | 'fully_released'
  | 'refunded' | 'disputed'
export type VenueBookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled'
export type NotificationType =
  | 'friend_request' | 'friend_accepted' | 'event_invite'
  | 'ticket_confirmed' | 'event_reminder' | 'event_cancelled'
  | 'friend_attending' | 'waitlist_available' | 'rep_score_change'
  | 'escrow_released' | 'new_review' | 'co_host_invite'
export type ActivityType = 'ticket_purchased' | 'event_hosted' | 'checked_in'

// ─────────────────────────────────────────────
// TABLE TYPES
// ─────────────────────────────────────────────

export interface DbProfile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  date_of_birth: string | null        // ISO date string
  university: string | null
  city: string
  is_private: boolean
  attendance_visibility: AttendanceVisibility
  rep_score: number
  rep_tier: RepTier                   // generated column, read-only
  is_verified: boolean
  vip_badge: boolean
  phone: string | null
  fcm_token: string | null
  account_status: AccountStatus
  notification_prefs: Record<string, boolean>
  created_at: string
  updated_at: string
}

export interface DbFriendship {
  id: string
  requester_id: string
  addressee_id: string
  status: FriendshipStatus
  blocker_id: string | null
  created_at: string
  updated_at: string
}

export interface DbDeviceToken {
  id: string
  user_id: string
  token: string
  platform: DevicePlatform
  created_at: string
  updated_at: string
}

export interface DbVenue {
  id: string
  owner_id: string
  name: string
  description: string | null
  address: string | null
  lat: number | null
  lng: number | null
  city: string
  cover_url: string | null
  photo_urls: string[] | null
  capacity: number | null
  price_per_hour: number | null       // INR paise
  amenities: string[] | null
  categories: string[] | null
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DbEvent {
  id: string
  host_id: string
  venue_id: string | null
  title: string
  description: string | null
  cover_url: string | null
  category: EventCategory
  event_type: EventType
  address: string | null
  lat: number | null
  lng: number | null
  city: string
  start_time: string                  // ISO timestamptz
  end_time: string                    // ISO timestamptz
  visibility: EventVisibility
  status: EventStatus
  is_free: boolean
  min_age: number
  is_sponsored: boolean
  is_staff_pick: boolean
  fomo_score: number
  total_capacity: number | null
  created_at: string
  updated_at: string
}

export interface DbTicketType {
  id: string
  event_id: string
  name: string
  description: string | null
  price: number                       // INR paise. 0 = free
  capacity: number | null
  tickets_sold: number
  sale_start: string | null
  sale_end: string | null
  perks: string[] | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface DbTicketHold {
  id: string
  ticket_type_id: string
  user_id: string
  quantity: number
  expires_at: string
  created_at: string
}

export interface DbTicket {
  id: string
  event_id: string
  ticket_type_id: string
  user_id: string
  purchaser_id: string
  razorpay_payment_id: string | null
  status: TicketStatus
  scanned_at: string | null
  scanned_by: string | null
  created_at: string
  updated_at: string
}

export interface DbWaitlist {
  id: string
  event_id: string
  ticket_type_id: string
  user_id: string
  position: number
  notified_at: string | null
  status: WaitlistStatus
  created_at: string
}

export interface DbCoHost {
  id: string
  event_id: string
  user_id: string
  permissions: CoHostPermission[]
  invited_by: string
  status: CoHostStatus
  created_at: string
}

export interface DbReview {
  id: string
  event_id: string
  reviewer_id: string
  host_id: string
  rating: number                      // 1–5
  body: string | null
  created_at: string
}

export interface DbReferral {
  id: string
  referrer_id: string
  referred_id: string
  status: ReferralStatus
  confirmed_at: string | null
  created_at: string
}

export interface DbPromoCode {
  id: string
  code: string
  event_id: string | null
  discount_type: DiscountType
  discount_value: number
  max_uses: number | null
  uses_count: number
  valid_from: string
  valid_until: string | null
  created_by: string | null
  created_at: string
}

export interface DbBoost {
  id: string
  entity_type: BoostEntityType
  entity_id: string
  boosted_by: string
  razorpay_payment_id: string
  budget_inr: number
  starts_at: string
  ends_at: string
  status: BoostStatus
  created_at: string
}

export interface DbReport {
  id: string
  reporter_id: string
  entity_type: ReportEntityType
  entity_id: string
  reason: ReportReason
  body: string | null
  status: ReportStatus
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
}

export interface DbNotification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  entity_type: string | null
  entity_id: string | null
  is_read: boolean
  created_at: string
}

export interface DbEscrowLedger {
  id: string
  event_id: string
  host_id: string
  total_collected: number
  platform_fee: number
  host_total: number
  pre_event_released: number
  pre_event_released_at: string | null
  post_event_released: number
  post_event_released_at: string | null
  scan_count: number
  scan_threshold_met: boolean
  status: EscrowStatus
  created_at: string
  updated_at: string
}

export interface DbVenueBooking {
  id: string
  venue_id: string
  user_id: string
  event_id: string | null
  start_time: string
  end_time: string
  status: VenueBookingStatus
  total_price: number | null
  created_at: string
  updated_at: string
}

// ─────────────────────────────────────────────
// MATERIALIZED VIEW TYPES
// ─────────────────────────────────────────────

export interface UserActivity {
  user_id: string
  activity_type: ActivityType
  entity_id: string
  entity_type: 'event'
  created_at: string
}

export interface EventFomoScore {
  event_id: string
  base_fomo_score: number
}

// ─────────────────────────────────────────────
// COMPOSITE / JOIN TYPES (used in UI)
// ─────────────────────────────────────────────

// Event card in feeds — event + host profile + fomo score + friend count
export interface EventWithMeta extends DbEvent {
  host: Pick<DbProfile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'rep_tier' | 'is_verified'>
  ticket_types: DbTicketType[]
  base_fomo_score: number
  friends_attending_count: number     // computed at query time
  total_tickets_sold: number
  waitlist_count: number
}

// Ticket in wallet — ticket + event + ticket_type
export interface TicketWithMeta extends DbTicket {
  event: Pick<DbEvent, 'id' | 'title' | 'cover_url' | 'start_time' | 'end_time' | 'address' | 'city' | 'category'>
  ticket_type: Pick<DbTicketType, 'id' | 'name' | 'price' | 'perks'>
}

// Friend activity card in Friends Ledger
export interface FriendActivity extends UserActivity {
  profile: Pick<DbProfile, 'id' | 'username' | 'display_name' | 'avatar_url'>
  event: Pick<DbEvent, 'id' | 'title' | 'cover_url' | 'start_time' | 'city'> | null
}

// Friendship with the other user's profile attached
export interface FriendshipWithProfile extends DbFriendship {
  profile: Pick<DbProfile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'rep_tier' | 'university'>
}

// Guest list entry in host scanner view
export interface GuestListEntry extends DbTicket {
  profile: Pick<DbProfile, 'id' | 'username' | 'display_name' | 'avatar_url'>
  ticket_type: Pick<DbTicketType, 'name'>
}

// ─────────────────────────────────────────────
// SERVICE LAYER PARAM TYPES
// ─────────────────────────────────────────────

export interface CreateEventParams {
  title: string
  description?: string
  cover_url?: string
  category: EventCategory
  event_type?: EventType
  address?: string
  lat?: number
  lng?: number
  venue_id?: string
  city: string
  start_time: string
  end_time: string
  visibility: EventVisibility
  is_free: boolean
  min_age?: number
  ticket_types: Omit<DbTicketType, 'id' | 'event_id' | 'tickets_sold' | 'created_at' | 'updated_at'>[]
}

export interface BookTicketParams {
  event_id: string
  ticket_type_id: string
  quantity: number
  attendee_user_ids?: string[]        // for group bookings
  promo_code?: string
}

export interface ValidateTicketParams {
  ticket_id: string
  event_id: string
}

export interface ValidateTicketResult {
  valid: boolean
  status: 'admitted' | 'already_scanned' | 'invalid' | 'wrong_event'
  ticket?: DbTicket
  profile?: Pick<DbProfile, 'id' | 'username' | 'display_name' | 'avatar_url'>
  scanned_at?: string
}
