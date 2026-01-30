-- ============================================
-- MIGRATION: Add new tables for Events App
-- Run this in Supabase SQL Editor
-- (profiles, events, event-images bucket already exist)
-- ============================================

-- ============================================
-- 1. TICKETS TABLE
-- ============================================
create table if not exists tickets (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default now(),
  event_id uuid references events(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  quantity integer default 1,
  total_price double precision,
  status text default 'confirmed' check (status in ('pending', 'confirmed', 'cancelled')),
  qr_code text,
  unique(event_id, user_id)
);

alter table tickets enable row level security;

create policy "Users can view their own tickets."
  on tickets for select
  using ( auth.uid() = user_id );

create policy "Authenticated users can create tickets."
  on tickets for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can update their own tickets."
  on tickets for update
  using ( auth.uid() = user_id );

-- ============================================
-- 2. VENUES TABLE
-- ============================================
create table if not exists venues (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  location text not null,
  latitude double precision,
  longitude double precision,
  rating double precision default 0,
  image_url text,
  capacity text,
  price_per_hour double precision not null,
  amenities text[],
  category text check (category in ('Banquet Hall', 'Rooftop', 'Restaurant', 'Garden', 'Conference Room')),
  owner_id uuid references profiles(id)
);

alter table venues enable row level security;

create policy "Venues are viewable by everyone."
  on venues for select
  using ( true );

create policy "Authenticated users can create venues."
  on venues for insert
  with check ( auth.role() = 'authenticated' );

create policy "Owners can update their venues."
  on venues for update
  using ( auth.uid() = owner_id );

create policy "Owners can delete their venues."
  on venues for delete
  using ( auth.uid() = owner_id );

-- ============================================
-- 3. VENUE BOOKINGS TABLE
-- ============================================
create table if not exists venue_bookings (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default now(),
  venue_id uuid references venues(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  total_price double precision,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  notes text
);

alter table venue_bookings enable row level security;

create policy "Users can view their own venue bookings."
  on venue_bookings for select
  using ( auth.uid() = user_id );

create policy "Venue owners can view bookings for their venues."
  on venue_bookings for select
  using ( auth.uid() in (select owner_id from venues where id = venue_id) );

create policy "Authenticated users can create venue bookings."
  on venue_bookings for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can update their own venue bookings."
  on venue_bookings for update
  using ( auth.uid() = user_id );

-- ============================================
-- 4. EVENT LIKES TABLE
-- ============================================
create table if not exists event_likes (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(event_id, user_id)
);

alter table event_likes enable row level security;

create policy "Event likes are viewable by everyone."
  on event_likes for select
  using ( true );

create policy "Authenticated users can like events."
  on event_likes for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can unlike (delete) their own likes."
  on event_likes for delete
  using ( auth.uid() = user_id );

-- ============================================
-- 5. EVENT COMMENTS TABLE
-- ============================================
create table if not exists event_comments (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default now()
);

alter table event_comments enable row level security;

create policy "Event comments are viewable by everyone."
  on event_comments for select
  using ( true );

create policy "Authenticated users can create comments."
  on event_comments for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can delete their own comments."
  on event_comments for delete
  using ( auth.uid() = user_id );

-- ============================================
-- 6. FOLLOWS TABLE
-- ============================================
create table if not exists follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references profiles(id) on delete cascade not null,
  following_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(follower_id, following_id)
);

alter table follows enable row level security;

create policy "Follows are viewable by everyone."
  on follows for select
  using ( true );

create policy "Authenticated users can follow."
  on follows for insert
  with check ( auth.role() = 'authenticated' and auth.uid() = follower_id );

create policy "Users can unfollow."
  on follows for delete
  using ( auth.uid() = follower_id );

-- ============================================
-- 7. EVENT CHATS TABLE (Group Chat per Event)
-- ============================================
create table if not exists event_chats (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade not null unique,
  created_at timestamp with time zone default now()
);

alter table event_chats enable row level security;

-- ============================================
-- 8. CHAT MEMBERS TABLE (create before chat_messages due to RLS dependency)
-- ============================================
create table if not exists chat_members (
  id uuid default uuid_generate_v4() primary key,
  chat_id uuid references event_chats(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  joined_at timestamp with time zone default now(),
  last_read_at timestamp with time zone,
  unique(chat_id, user_id)
);

alter table chat_members enable row level security;

create policy "Chat members can view membership."
  on chat_members for select
  using ( auth.uid() = user_id );

create policy "System can add members (via RSVP)."
  on chat_members for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can leave chats."
  on chat_members for delete
  using ( auth.uid() = user_id );

create policy "Users can update their last_read_at."
  on chat_members for update
  using ( auth.uid() = user_id );

-- ============================================
-- 9. CHAT MESSAGES TABLE
-- ============================================
create table if not exists chat_messages (
  id uuid default uuid_generate_v4() primary key,
  chat_id uuid references event_chats(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  message_type text default 'text' check (message_type in ('text', 'image', 'system')),
  created_at timestamp with time zone default now()
);

create index if not exists chat_messages_chat_id_idx on chat_messages(chat_id, created_at desc);

alter table chat_messages enable row level security;

create policy "Chat members can view messages."
  on chat_messages for select
  using ( 
    auth.uid() in (
      select user_id from chat_members where chat_id = chat_messages.chat_id
    )
  );

create policy "Chat members can send messages."
  on chat_messages for insert
  with check ( 
    auth.uid() in (
      select user_id from chat_members where chat_id = chat_messages.chat_id
    )
  );

create policy "Users can delete their own messages."
  on chat_messages for delete
  using ( auth.uid() = user_id );

-- Now add the event_chats RLS policy (after chat_members exists)
create policy "Chat members can view event chats."
  on event_chats for select
  using ( 
    auth.uid() in (
      select user_id from chat_members where chat_id = id
    )
    or auth.uid() in (
      select host_id from events where id = event_id
    )
  );

-- ============================================
-- STORAGE BUCKETS
-- ============================================
insert into storage.buckets (id, name, public)
values ('venue-images', 'venue-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Venue images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'venue-images' );

create policy "Authenticated users can upload venue images."
  on storage.objects for insert
  with check ( bucket_id = 'venue-images' and auth.role() = 'authenticated' );

create policy "Avatars are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Users can upload their own avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- ============================================
-- TRIGGER: Auto-create chat when event is created
-- ============================================
create or replace function create_event_chat()
returns trigger as $$
begin
  insert into event_chats (event_id)
  values (NEW.id);
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_event_created on events;
create trigger on_event_created
  after insert on events
  for each row execute procedure create_event_chat();

-- ============================================
-- TRIGGER: Auto-join chat when RSVP (ticket created)
-- ============================================
create or replace function join_chat_on_rsvp()
returns trigger as $$
declare
  chat_id_var uuid;
begin
  select id into chat_id_var from event_chats where event_id = NEW.event_id;
  
  if chat_id_var is not null then
    insert into chat_members (chat_id, user_id)
    values (chat_id_var, NEW.user_id)
    on conflict (chat_id, user_id) do nothing;
  end if;
  
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_ticket_created on tickets;
create trigger on_ticket_created
  after insert on tickets
  for each row execute procedure join_chat_on_rsvp();
