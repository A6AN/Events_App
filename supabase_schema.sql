-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a table for events
create table events (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  date timestamp with time zone not null,
  location_name text not null,
  latitude double precision not null,
  longitude double precision not null,
  price double precision default 0,
  capacity integer,
  image_url text,
  host_id uuid references profiles(id) not null,
  category text,
  mood text
);

-- Set up RLS for events
alter table events enable row level security;

create policy "Events are viewable by everyone."
  on events for select
  using ( true );

create policy "Authenticated users can create events."
  on events for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can update their own events."
  on events for update
  using ( auth.uid() = host_id );

-- Set up Storage for event images
insert into storage.buckets (id, name)
values ('event-images', 'event-images');

create policy "Event images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'event-images' );

create policy "Authenticated users can upload event images."
  on storage.objects for insert
  with check ( bucket_id = 'event-images' and auth.role() = 'authenticated' );
