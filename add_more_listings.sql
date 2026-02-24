-- ============================================================
-- HOMZY - Rich listing data for all categories
-- Run this AFTER supabase_tables.sql
-- Uses ON CONFLICT DO NOTHING so re-runs skip duplicates.
-- ============================================================

-- Update existing listings that have NULL host data only
UPDATE public.listings SET host_name = 'Rohan', host_image = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100', is_superhost = true WHERE host_name IS NULL;

-- Beach Properties
INSERT INTO public.listings (title, location, price, image_url, category, rating, beds, baths, sqft, description, host_name, host_image, is_superhost, max_guests, amenities)
VALUES
('Oceanfront Luxury Villa', 'Goa, India', 12500, 'https://images.pexels.com/photos/2476632/pexels-photo-2476632.jpeg?auto=compress&cs=tinysrgb&w=800', 'Beach', 4.9, 4, 3, 3200, 'Wake up to panoramic ocean views in this contemporary beachfront villa. Features infinity pool, private beach access, and sun deck.', 'Sarah', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100', true, 8, ARRAY['wifi', 'pool', 'beach_access', 'parking', 'ac', 'kitchen', 'gym']),

('Beachside Cottage', 'Pondicherry, India', 4800, 'https://images.pexels.com/photos/1835718/pexels-photo-1835718.jpeg?auto=compress&cs=tinysrgb&w=800', 'Beach', 4.6, 2, 1, 900, 'A charming coastal cottage steps from the French Quarter beaches. Perfect for a peaceful seaside retreat with morning yoga.', 'Priya', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100', false, 4, ARRAY['wifi', 'beach_access', 'kitchen', 'ac']),

('Tropical Beach House', 'Kovalam, Kerala', 7800, 'https://images.pexels.com/photos/2506990/pexels-photo-2506990.jpeg?auto=compress&cs=tinysrgb&w=800', 'Beach', 4.7, 3, 2, 1800, 'An airy beach house with lush tropical gardens, hammocks, and sweeping views of the Arabian Sea. The perfect southern escape.', 'Maya', 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100', true, 6, ARRAY['wifi', 'beach_access', 'parking', 'kitchen', 'ac', 'garden']),

('Seaside Penthouse', 'Mumbai, India', 18000, 'https://images.pexels.com/photos/3288102/pexels-photo-3288102.jpeg?auto=compress&cs=tinysrgb&w=800', 'Beach', 4.8, 3, 3, 2800, 'Ultra-luxury penthouse on Marine Drive. Floor-to-ceiling windows showcase the Queen''s Necklace. Access to private pool and rooftop lounge.', 'Arjun', 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100', true, 6, ARRAY['wifi', 'pool', 'gym', 'parking', 'ac', 'smart_lock', 'concierge'])
ON CONFLICT (title, location) DO NOTHING;

-- Mountain Properties
INSERT INTO public.listings (title, location, price, image_url, category, rating, beds, baths, sqft, description, host_name, host_image, is_superhost, max_guests, amenities)
VALUES
('Alpine Log Cabin', 'Manali, Himachal Pradesh', 5500, 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=800', 'Mountain', 4.8, 2, 1, 1100, 'A cozy log cabin nestled in pine forests with a wood-burning fireplace, hot tub on the deck, and pristine mountain views.', 'David', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100', true, 4, ARRAY['wifi', 'fireplace', 'hot_tub', 'parking', 'heating', 'kitchen']),

('Himalayan Retreat', 'Shimla, Himachal Pradesh', 6800, 'https://images.pexels.com/photos/2581922/pexels-photo-2581922.jpeg?auto=compress&cs=tinysrgb&w=800', 'Mountain', 4.7, 3, 2, 1600, 'A heritage colonial bungalow overlooking the Shimla valley. Features antique furnishings, a manicured garden, and personal butler service.', 'Rohan', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100', true, 6, ARRAY['wifi', 'garden', 'parking', 'heating', 'kitchen', 'workspace']),

('Treehouse in the Clouds', 'Munnar, Kerala', 8200, 'https://images.pexels.com/photos/3555615/pexels-photo-3555615.jpeg?auto=compress&cs=tinysrgb&w=800', 'Mountain', 4.9, 1, 1, 500, 'Sleep among the treetops in this magical treehouse surrounded by tea plantations. Includes guided nature walks and farm-to-table breakfast.', 'Priya', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100', false, 2, ARRAY['wifi', 'kitchen', 'garden', 'heating']),

('Snow Peak Lodge', 'Leh, Ladakh', 9500, 'https://images.pexels.com/photos/2086917/pexels-photo-2086917.jpeg?auto=compress&cs=tinysrgb&w=800', 'Mountain', 4.6, 4, 2, 2200, 'An expedition-style lodge at high altitude with panoramic views of snow-capped peaks. Perfect base for trekking and stargazing adventures.', 'Arjun', 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100', true, 8, ARRAY['wifi', 'heating', 'parking', 'kitchen', 'gym'])
ON CONFLICT (title, location) DO NOTHING;

-- City Properties
INSERT INTO public.listings (title, location, price, image_url, category, rating, beds, baths, sqft, description, host_name, host_image, is_superhost, max_guests, amenities)
VALUES
('Designer Loft', 'Bangalore, Karnataka', 7500, 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800', 'City', 4.7, 2, 2, 1500, 'A stunning architect-designed loft in Indiranagar with exposed brick, smart home features, and a rooftop terrace overlooking the city.', 'Sarah', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100', true, 4, ARRAY['wifi', 'smart_lock', 'workspace', 'ac', 'kitchen', 'gym']),

('Heritage Haveli Suite', 'Jaipur, Rajasthan', 6200, 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=800', 'City', 4.8, 2, 1, 1200, 'Stay in a restored 18th-century haveli with hand-painted murals, jharokha windows, and a courtyard. Experience royal Rajasthani hospitality.', 'Maya', 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100', true, 4, ARRAY['wifi', 'ac', 'parking', 'kitchen', 'garden', 'concierge']),

('Skyline Apartment', 'Delhi NCR, India', 9800, 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=800', 'City', 4.5, 3, 2, 2000, 'A sleek high-rise apartment in Gurugram with floor-to-ceiling views, modern amenities, and access to infinity pool and co-working space.', 'David', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100', false, 5, ARRAY['wifi', 'pool', 'gym', 'parking', 'ac', 'workspace', 'smart_lock']),

('Art Deco Flat', 'Kolkata, West Bengal', 4500, 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?auto=compress&cs=tinysrgb&w=800', 'City', 4.4, 2, 1, 1100, 'A beautifully restored Art Deco flat in the heart of Park Street. Walk to museums, cafés, and the iconic Victoria Memorial.', 'Rohan', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100', false, 3, ARRAY['wifi', 'ac', 'kitchen'])
ON CONFLICT (title, location) DO NOTHING;

-- Camping Properties
INSERT INTO public.listings (title, location, price, image_url, category, rating, beds, baths, sqft, description, host_name, host_image, is_superhost, max_guests, amenities)
VALUES
('Luxury Glamping Tent', 'Rishikesh, Uttarakhand', 4200, 'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=800', 'Camping', 4.7, 1, 1, 350, 'Glamping by the Ganges with king-size bed, private bathroom, and bonfire under the stars. Adventures include rafting, yoga, and bungee jumping.', 'Rohan', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100', true, 2, ARRAY['wifi', 'kitchen', 'parking']),

('Riverside Camp', 'Coorg, Karnataka', 3500, 'https://images.pexels.com/photos/2666598/pexels-photo-2666598.jpeg?auto=compress&cs=tinysrgb&w=800', 'Camping', 4.6, 1, 1, 280, 'A safari-style tent beside a rushing river in coffee country. Wake to bird calls, explore waterfalls, and enjoy campfire dinners.', 'Maya', 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100', false, 2, ARRAY['parking', 'kitchen']),

('Desert Safari Camp', 'Jaisalmer, Rajasthan', 5600, 'https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?auto=compress&cs=tinysrgb&w=800', 'Camping', 4.9, 2, 1, 600, 'A luxury desert camp with Swiss tents, camel rides, cultural performances, and surreal Thar Desert sunsets. An unforgettable experience.', 'Arjun', 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100', true, 4, ARRAY['wifi', 'parking', 'kitchen', 'ac']),

('Forest Dome Stay', 'Wayanad, Kerala', 6800, 'https://images.pexels.com/photos/2440024/pexels-photo-2440024.jpeg?auto=compress&cs=tinysrgb&w=800', 'Camping', 4.8, 1, 1, 400, 'A geodesic dome in the middle of a spice forest. Enjoy panoramic forest views through the transparent ceiling, and spot rare wildlife.', 'Priya', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100', true, 2, ARRAY['wifi', 'kitchen', 'garden'])
ON CONFLICT (title, location) DO NOTHING;

-- Luxury Properties
INSERT INTO public.listings (title, location, price, image_url, category, rating, beds, baths, sqft, description, host_name, host_image, is_superhost, max_guests, amenities)
VALUES
('Royal Palace Suite', 'Udaipur, Rajasthan', 25000, 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800', 'Luxury', 5.0, 5, 4, 5000, 'A palatial lakeside suite with private butler, antique furnishings, and views of Lake Pichola. Experience Mewar royalty at its finest.', 'Arjun', 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100', true, 10, ARRAY['wifi', 'pool', 'gym', 'parking', 'ac', 'concierge', 'spa', 'smart_lock']),

('Modern Minimalist Villa', 'Alibaug, Maharashtra', 15000, 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=800', 'Luxury', 4.8, 4, 3, 3500, 'A striking minimalist villa with private infinity pool, outdoor cinema, and direct beach access. Perfect for a luxurious weekend escape from Mumbai.', 'Sarah', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100', true, 8, ARRAY['wifi', 'pool', 'beach_access', 'parking', 'ac', 'kitchen', 'smart_lock', 'cinema']),

('Sky Villa with Helipad', 'Hyderabad, Telangana', 35000, 'https://images.pexels.com/photos/2869215/pexels-photo-2869215.jpeg?auto=compress&cs=tinysrgb&w=800', 'Luxury', 4.9, 6, 5, 6500, 'The ultimate in luxury living — a top-floor sky villa with private helipad, wine cellar, home theater, and 360° city views.', 'David', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100', true, 12, ARRAY['wifi', 'pool', 'gym', 'parking', 'ac', 'concierge', 'spa', 'smart_lock', 'cinema', 'helipad']),

('Cliffside Infinity Retreat', 'Mahabaleshwar, Maharashtra', 11000, 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800', 'Luxury', 4.7, 3, 2, 2400, 'Perched on a cliff with an infinity pool seemingly merging with the valley below. This luxury retreat offers spa services, chef on call, and nature trails.', 'Maya', 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100', true, 6, ARRAY['wifi', 'pool', 'spa', 'parking', 'ac', 'kitchen', 'garden'])
ON CONFLICT (title, location) DO NOTHING;

-- ============================================================
-- DONE! 20 new diverse listings added across all categories.
-- ============================================================
