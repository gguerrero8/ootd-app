-- ========== USERS ==========
create table users (
  user_id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  display_name text,
  created_at timestamp default now()
);

-- ========== CLOTHING ITEMS ==========
create table clothing_items (
  item_id uuid primary key default gen_random_uuid(),
  user_id uuid references users(user_id) on delete cascade,
  name text,
  category text,          -- e.g., "top", "pants", "shoes"
  color text,
  season text,            -- e.g., "summer", "fall"
  is_archived boolean default false
);

-- ========== OUTFITS ==========
create table outfits (
  outfit_id uuid primary key default gen_random_uuid(),
  user_id uuid references users(user_id) on delete cascade,
  name text,
  rating int,
  is_favorite boolean default false,
  created_at timestamp default now(),
  last_worn_at timestamp
);

-- ========== COLLECTIONS ==========
create table collections (
  collection_id uuid primary key default gen_random_uuid(),
  user_id uuid references users(user_id) on delete cascade,
  name text,
  description text,
  created_at timestamp default now(),
  is_archived boolean default false
);

-- ========== TAGS ==========
create table tags (
  tag_id uuid primary key default gen_random_uuid(),
  name text unique not null,
  type text,                   -- e.g., "color", "season", "event", "aesthetic"
  created_at timestamp default now()
);

-- ========== WEAR HISTORY ==========
create table outfit_wear_events (
  wear_event_id uuid primary key default gen_random_uuid(),
  outfit_id uuid references outfits(outfit_id) on delete cascade,
  date_worn date,
  event_type text,             -- e.g., "class", "client meeting"
  city_name text,              -- city-level location only
  weather_summary text,        -- e.g., "72°F, sunny"
  comfort_notes text
);

-- ========== POSTS ==========
create table posts (
  post_id uuid primary key default gen_random_uuid(),
  outfit_id uuid references outfits(outfit_id) on delete cascade,
  user_id uuid references users(user_id) on delete cascade,
  caption text,
  is_visible boolean,
  created_at timestamp default now()
);

-- ========== REACTIONS ==========
create table reactions (
  reaction_id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(post_id) on delete cascade,
  user_id uuid references users(user_id) on delete cascade,
  reaction_type text,   -- "like", "save", "repost"
  created_at timestamp default now()
);

-- ========== JOIN TABLES ==========

-- Outfit ↔ Items
create table outfit_clothing_items (
  outfit_item_id uuid primary key default gen_random_uuid(),
  outfit_id uuid references outfits(outfit_id) on delete cascade,
  item_id uuid references clothing_items(item_id) on delete cascade,
  position int
);

-- Collection ↔ Outfits
create table collection_outfits (
  collection_outfit_id uuid primary key default gen_random_uuid(),
  collection_id uuid references collections(collection_id) on delete cascade,
  outfit_id uuid references outfits(outfit_id) on delete cascade,
  sort_order int
);

-- Item ↔ Tags
create table item_tags (
  item_tag_id uuid primary key default gen_random_uuid(),
  item_id uuid references clothing_items(item_id) on delete cascade,
  tag_id uuid references tags(tag_id) on delete cascade,
  created_at timestamp default now()
);

-- Outfit ↔ Tags
create table outfit_tags (
  outfit_tag_id uuid primary key default gen_random_uuid(),
  outfit_id uuid references outfits(outfit_id) on delete cascade,
  tag_id uuid references tags(tag_id) on delete cascade,
  created_at timestamp default now()
);
