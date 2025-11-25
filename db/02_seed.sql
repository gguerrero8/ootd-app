-- ========== USERS ==========
insert into users (email, password_hash, display_name)
values 
('testuser@example.com', 'hashed-password-placeholder', 'Test User');


-- ========== CLOTHING ITEMS ==========
insert into clothing_items (user_id, name, category, color, season)
select user_id, name, category, color, season
from (
  values
    ('White T-Shirt', 'top', 'white', 'summer'),
    ('Blue Jeans', 'pants', 'blue', 'fall'),
    ('Black Sneakers', 'shoes', 'black', 'all-season')
) as v(name, category, color, season),
lateral (select user_id from users limit 1) u;


-- ========== TAGS ==========
insert into tags (name, type)
values
('casual', 'aesthetic'),
('formal', 'aesthetic'),
('summer', 'season'),
('black', 'color'),
('concert', 'event');


-- ========== OUTFIT ==========
insert into outfits (user_id, name, rating, is_favorite)
select user_id, 'Casual Summer Fit', 5, true
from users limit 1;


-- ========== OUTFIT ↔ ITEMS ==========
insert into outfit_clothing_items (outfit_id, item_id, position)
select o.outfit_id, i.item_id, pos
from outfits o
join (
  select item_id, row_number() over () as pos
  from clothing_items
  limit 2
) i on true;


-- ========== COLLECTIONS ==========
insert into collections (user_id, name, description)
select user_id, 'Summer Trip Looks', 'Outfits packed for Hawaii trip'
from users limit 1;


-- ========== COLLECTION ↔ OUTFITS ==========
insert into collection_outfits (collection_id, outfit_id, sort_order)
select c.collection_id, o.outfit_id, 1
from collections c
cross join outfits o
limit 1;


-- ========== ITEM TAGS ==========
insert into item_tags (item_id, tag_id)
select i.item_id, t.tag_id
from clothing_items i
cross join tags t
where t.name in ('summer', 'casual')
limit 2;


-- ========== OUTFIT TAGS ==========
insert into outfit_tags (outfit_id, tag_id)
select o.outfit_id, t.tag_id
from outfits o
join tags t on t.name in ('casual', 'summer');


-- ========== WEAR EVENTS ==========
insert into outfit_wear_events (outfit_id, date_worn, event_type, city_name, weather_summary, comfort_notes)
select outfit_id, '2025-06-10', 'brunch', 'San Diego, CA', '72°F, sunny', 'Very comfortable'
from outfits
limit 1;


-- ========== POSTS ==========
insert into posts (outfit_id, user_id, caption, is_visible)
select o.outfit_id, u.user_id, 'Loving this summer fit!', true
from outfits o
cross join users u
limit 1;


-- ========== REACTIONS ==========
insert into reactions (post_id, user_id, reaction_type)
select p.post_id, u.user_id, 'like'
from posts p
cross join users u
limit 1;
