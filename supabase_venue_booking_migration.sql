-- Venue Bookings Table
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

-- RLS for Venue Bookings
alter table venue_bookings enable row level security;

create policy "Users can view own bookings"
  on venue_bookings for select
  using (auth.uid() = user_id);

create policy "Users can create bookings"
  on venue_bookings for insert
  with check (auth.uid() = user_id);
