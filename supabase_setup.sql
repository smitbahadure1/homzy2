-- 1. Create the 'listings' table
create table public.listings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  location text not null,
  price integer not null,
  image_url text not null,
  category text,
  rating numeric,
  beds integer,
  baths integer,
  sqft integer,
  description text
);

-- 2. Enable Row Level Security (RLS)
alter table public.listings enable row level security;

-- 3. Create a policy to allow public read access
create policy "Allow public read access"
on public.listings for select
to anon
using (true);

-- 4. Insert sample data (Mock Data from App)
insert into public.listings (title, location, price, image_url, category, rating, beds, baths, sqft)
values
('Luxury Villa with Infinity Pool', 'Lonavala, Maharashtra', 15500, 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800', 'Luxury', 4.9, 4, 3, 3200),
('Cozy Wooden Cabin in Woods', 'Coorg, Karnataka', 4800, 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800', 'Mountain', 4.7, 2, 1, 1200),
('Beachfront Bungalow with View', 'Goa, India', 9200, 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800', 'Beach', 4.8, 3, 2, 1800),
('Modern Apartment in City', 'Udaipur, Rajasthan', 6500, 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800', 'City', 4.5, 2, 2, 1100),
('Rustic Stone Cottage', 'Manali, Himachal Pradesh', 3500, 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=800', 'Mountain', 4.6, 1, 1, 600),
('Spacious Family Home', 'Pondicherry, India', 7800, 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=800', 'City', 4.4, 3, 2, 2100),
('Secluded Treehouse Retreat', 'Munnar, Kerala', 5400, 'https://images.pexels.com/photos/209296/pexels-photo-209296.jpeg?auto=compress&cs=tinysrgb&w=800', 'Camping', 4.9, 1, 1, 400),
('Heritage Haveli Stay', 'Jaipur, Rajasthan', 18500, 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800', 'Luxury', 4.8, 5, 4, 4500),
('Mountain View Chalet', 'Shimla, Himachal Pradesh', 6200, 'https://images.pexels.com/photos/209315/pexels-photo-209315.jpeg?auto=compress&cs=tinysrgb&w=800', 'Mountain', 4.5, 2, 2, 1400),
('Riverside Camping Spot', 'Rishikesh, Uttarakhand', 2500, 'https://images.pexels.com/photos/277667/pexels-photo-277667.jpeg?auto=compress&cs=tinysrgb&w=800', 'Camping', 4.3, 1, 0, 0);
