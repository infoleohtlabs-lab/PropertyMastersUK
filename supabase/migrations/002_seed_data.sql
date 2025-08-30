-- PropertyMasters UK Database Seed Data
-- This migration populates the database with sample data for testing and demonstration
-- Note: Users will be created through Supabase Auth, so we'll create properties without specific agents initially

-- Create some sample agent UUIDs for reference (these would be real auth.users IDs in production)
-- For demo purposes, we'll use NULL for agent_id or create properties without agents

-- Insert sample properties (without agent assignments for now)
INSERT INTO public.properties (id, title, description, property_type, status, price, bedrooms, bathrooms, square_feet, square_meters, address, city, county, postcode, latitude, longitude, location, featured, energy_rating, council_tax_band, tenure) VALUES
-- London Properties
('650e8400-e29b-41d4-a716-446655440001', 'Stunning Victorian Terrace in Clapham', 'Beautiful 4-bedroom Victorian house with period features, modern kitchen, and private garden. Located in the heart of Clapham with excellent transport links.', 'house', 'available', 850000.00, 4, 2, 1800, 167, '45 Clapham Common South Side', 'London', 'Greater London', 'SW4 9BL', 51.4618, -0.1378, ST_SetSRID(ST_MakePoint(-0.1378, 51.4618), 4326), true, 'C', 'F', 'freehold'),
('650e8400-e29b-41d4-a716-446655440002', 'Modern Apartment in Canary Wharf', 'Luxury 2-bedroom apartment with stunning river views, concierge service, and gym facilities. Perfect for professionals working in the financial district.', 'apartment', 'available', 650000.00, 2, 2, 950, 88, '25 Hertsmere Road', 'London', 'Greater London', 'E14 4AE', 51.5074, -0.0278, ST_SetSRID(ST_MakePoint(-0.0278, 51.5074), 4326), true, 'B', 'G', 'leasehold'),
('650e8400-e29b-41d4-a716-446655440003', 'Charming Cottage in Hampstead', 'Delightful 3-bedroom cottage with original features, cozy fireplace, and beautiful garden. Quiet location near Hampstead Heath.', 'house', 'available', 1200000.00, 3, 2, 1400, 130, '12 Flask Walk', 'London', 'Greater London', 'NW3 1HE', 51.5558, -0.1778, ST_SetSRID(ST_MakePoint(-0.1778, 51.5558), 4326), false, 'D', 'H', 'freehold'),
-- Manchester Properties
('650e8400-e29b-41d4-a716-446655440004', 'Contemporary Loft in Northern Quarter', 'Stylish 1-bedroom loft conversion in the trendy Northern Quarter. Exposed brick walls, high ceilings, and modern amenities.', 'apartment', 'available', 185000.00, 1, 1, 650, 60, '78 Oldham Street', 'Manchester', 'Greater Manchester', 'M1 1LN', 53.4839, -2.2374, ST_SetSRID(ST_MakePoint(-2.2374, 53.4839), 4326), false, 'C', 'D', 'leasehold'),
('650e8400-e29b-41d4-a716-446655440005', 'Family Home in Didsbury', 'Spacious 4-bedroom family home with large garden, driveway, and close to excellent schools. Perfect for growing families.', 'house', 'available', 425000.00, 4, 3, 2200, 204, '156 Barlow Moor Road', 'Manchester', 'Greater Manchester', 'M20 2AF', 53.4242, -2.2394, ST_SetSRID(ST_MakePoint(-2.2394, 53.4242), 4326), true, 'C', 'E', 'freehold'),
-- Birmingham Properties
('650e8400-e29b-41d4-a716-446655440006', 'Penthouse in Jewellery Quarter', 'Luxury 3-bedroom penthouse with panoramic city views, roof terrace, and premium finishes throughout.', 'apartment', 'available', 395000.00, 3, 2, 1300, 121, '88 Newhall Street', 'Birmingham', 'West Midlands', 'B3 1LH', 52.4862, -1.9015, ST_SetSRID(ST_MakePoint(-1.9015, 52.4862), 4326), true, 'B', 'F', 'leasehold'),
-- Commercial Properties
('650e8400-e29b-41d4-a716-446655440007', 'Prime Retail Space in Oxford Street', 'Excellent retail opportunity in the heart of London''s premier shopping district. High footfall location with excellent visibility.', 'commercial', 'available', 2500000.00, 0, 2, 3500, 325, '234 Oxford Street', 'London', 'Greater London', 'W1C 1DE', 51.5154, -0.1447, ST_SetSRID(ST_MakePoint(-0.1447, 51.5154), 4326), false, 'E', 'A', 'freehold'),
('650e8400-e29b-41d4-a716-446655440008', 'Modern Office Building in Leeds', 'Contemporary office building with flexible floor plates, parking, and excellent transport connections. Suitable for various business types.', 'commercial', 'available', 1800000.00, 0, 8, 15000, 1394, '45 Wellington Street', 'Leeds', 'West Yorkshire', 'LS1 2EE', 53.7997, -1.5492, ST_SetSRID(ST_MakePoint(-1.5492, 53.7997), 4326), false, 'C', 'A', 'freehold'),
-- Sold/Rented Properties
('650e8400-e29b-41d4-a716-446655440009', 'Riverside Apartment in Greenwich', 'Beautiful 2-bedroom apartment with river views and balcony. Recently sold to a lovely young couple.', 'apartment', 'sold', 475000.00, 2, 1, 850, 79, '67 Creek Road', 'London', 'Greater London', 'SE8 3BU', 51.4826, 0.0077, ST_SetSRID(ST_MakePoint(0.0077, 51.4826), 4326), false, 'C', 'E', 'leasehold'),
('650e8400-e29b-41d4-a716-446655440010', 'Student Accommodation in Nottingham', 'Purpose-built student accommodation with 5 bedrooms, communal areas, and close to university campus.', 'house', 'rented', 1800.00, 5, 3, 1600, 149, '23 University Boulevard', 'Nottingham', 'Nottinghamshire', 'NG7 2RD', 52.9408, -1.1760, ST_SetSRID(ST_MakePoint(-1.1760, 52.9408), 4326), false, 'D', 'C', 'freehold');

-- Insert property images
INSERT INTO public.property_images (property_id, image_url, alt_text, is_primary, display_order) VALUES
-- Clapham Victorian Terrace
('650e8400-e29b-41d4-a716-446655440001', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Victorian%20terrace%20house%20exterior%20Clapham%20London%20red%20brick%20period%20features&image_size=landscape_16_9', 'Victorian terrace house exterior in Clapham', true, 1),
('650e8400-e29b-41d4-a716-446655440001', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Victorian%20house%20living%20room%20period%20features%20fireplace%20high%20ceilings&image_size=landscape_16_9', 'Spacious living room with period features', false, 2),
('650e8400-e29b-41d4-a716-446655440001', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Modern%20kitchen%20Victorian%20house%20white%20cabinets%20marble%20countertops&image_size=landscape_16_9', 'Modern fitted kitchen', false, 3),
-- Canary Wharf Apartment
('650e8400-e29b-41d4-a716-446655440002', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Modern%20apartment%20building%20Canary%20Wharf%20London%20glass%20facade%20river%20views&image_size=landscape_16_9', 'Modern apartment building in Canary Wharf', true, 1),
('650e8400-e29b-41d4-a716-446655440002', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Luxury%20apartment%20living%20room%20floor%20to%20ceiling%20windows%20river%20view&image_size=landscape_16_9', 'Living room with stunning river views', false, 2),
-- Hampstead Cottage
('650e8400-e29b-41d4-a716-446655440003', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Charming%20cottage%20Hampstead%20London%20ivy%20covered%20traditional%20English&image_size=landscape_16_9', 'Charming cottage exterior in Hampstead', true, 1),
-- Manchester Loft
('650e8400-e29b-41d4-a716-446655440004', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Industrial%20loft%20apartment%20exposed%20brick%20high%20ceilings%20modern%20furniture&image_size=landscape_16_9', 'Contemporary loft with exposed brick walls', true, 1),
-- Didsbury Family Home
('650e8400-e29b-41d4-a716-446655440005', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Family%20house%20exterior%20Didsbury%20Manchester%20driveway%20garden%20suburban&image_size=landscape_16_9', 'Spacious family home with driveway', true, 1),
-- Birmingham Penthouse
('650e8400-e29b-41d4-a716-446655440006', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Luxury%20penthouse%20Birmingham%20city%20views%20roof%20terrace%20modern&image_size=landscape_16_9', 'Penthouse with panoramic city views', true, 1);

-- Insert property features
INSERT INTO public.property_features (property_id, feature_name, feature_value) VALUES
-- Clapham Victorian Terrace
('650e8400-e29b-41d4-a716-446655440001', 'Garden', 'Private rear garden'),
('650e8400-e29b-41d4-a716-446655440001', 'Parking', 'On-street parking'),
('650e8400-e29b-41d4-a716-446655440001', 'Period Features', 'Original fireplaces and cornicing'),
('650e8400-e29b-41d4-a716-446655440001', 'Transport', 'Clapham Common tube 5 mins walk'),
-- Canary Wharf Apartment
('650e8400-e29b-41d4-a716-446655440002', 'Concierge', '24-hour concierge service'),
('650e8400-e29b-41d4-a716-446655440002', 'Gym', 'Residents gym and spa'),
('650e8400-e29b-41d4-a716-446655440002', 'Balcony', 'Private balcony with river views'),
('650e8400-e29b-41d4-a716-446655440002', 'Transport', 'Canary Wharf station 2 mins walk'),
-- Hampstead Cottage
('650e8400-e29b-41d4-a716-446655440003', 'Garden', 'Beautiful mature garden'),
('650e8400-e29b-41d4-a716-446655440003', 'Fireplace', 'Working fireplace in living room'),
('650e8400-e29b-41d4-a716-446655440003', 'Location', 'Near Hampstead Heath'),
-- Manchester Loft
('650e8400-e29b-41d4-a716-446655440004', 'Style', 'Exposed brick walls'),
('650e8400-e29b-41d4-a716-446655440004', 'Ceilings', 'High ceilings'),
('650e8400-e29b-41d4-a716-446655440004', 'Location', 'Heart of Northern Quarter'),
-- Didsbury Family Home
('650e8400-e29b-41d4-a716-446655440005', 'Garden', 'Large rear garden'),
('650e8400-e29b-41d4-a716-446655440005', 'Parking', 'Driveway for 2 cars'),
('650e8400-e29b-41d4-a716-446655440005', 'Schools', 'Close to excellent schools'),
-- Birmingham Penthouse
('650e8400-e29b-41d4-a716-446655440006', 'Terrace', 'Private roof terrace'),
('650e8400-e29b-41d4-a716-446655440006', 'Views', 'Panoramic city views'),
('650e8400-e29b-41d4-a716-446655440006', 'Finishes', 'Premium finishes throughout');

-- Insert sample inquiries (without user_id references for now)
-- Note: In a real application, these would be linked to authenticated users
INSERT INTO public.inquiries (property_id, name, email, phone, message, inquiry_type, status) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'John Smith', 'john.smith@email.com', '+44 20 7946 1234', 'I am very interested in viewing this beautiful Victorian house. Could we arrange a viewing for this weekend?', 'viewing', 'pending'),
('650e8400-e29b-41d4-a716-446655440002', 'Mary Jones', 'mary.jones@email.com', '+44 161 496 5678', 'This apartment looks perfect for my needs. I would like to know more about the service charges and lease details.', 'purchase', 'responded'),
('650e8400-e29b-41d4-a716-446655440003', 'David Taylor', 'david.taylor@email.com', '+44 121 496 9012', 'Lovely cottage! Is there any flexibility on the asking price? I am a cash buyer.', 'purchase', 'pending'),
('650e8400-e29b-41d4-a716-446655440005', 'Lisa Anderson', 'lisa.anderson@email.com', '+44 113 496 3456', 'Perfect family home! When would be the earliest we could move in if we proceed with an offer?', 'general', 'pending'),
('650e8400-e29b-41d4-a716-446655440006', 'Robert Thomas', 'robert.thomas@email.com', '+44 20 7946 7890', 'Interested in the penthouse. Could you provide more details about the building amenities and parking?', 'general', 'responded');

-- Insert sample viewings (without user_id and agent_id references for now)
-- Note: In a real application, these would be linked to authenticated users and agents
INSERT INTO public.viewings (property_id, viewing_date, duration_minutes, status, notes) VALUES
('650e8400-e29b-41d4-a716-446655440001', '2024-01-20 14:00:00+00', 45, 'scheduled', 'Client specifically interested in the garden and period features'),
('650e8400-e29b-41d4-a716-446655440002', '2024-01-18 11:30:00+00', 30, 'completed', 'Very positive viewing, client loved the river views'),
('650e8400-e29b-41d4-a716-446655440003', '2024-01-22 16:00:00+00', 60, 'scheduled', 'Extended viewing requested to see the property in evening light'),
('650e8400-e29b-41d4-a716-446655440005', '2024-01-19 10:00:00+00', 45, 'completed', 'Family viewing with children, very interested in local schools'),
('650e8400-e29b-41d4-a716-446655440006', '2024-01-21 13:00:00+00', 30, 'scheduled', 'Second viewing requested after initial interest');

-- Insert sample favorites (commented out since we need authenticated users)
-- Note: Favorites will be created when users sign up and start using the application
-- INSERT INTO public.favorites (user_id, property_id) VALUES
-- ('user_id_1', '650e8400-e29b-41d4-a716-446655440001'),
-- ('user_id_1', '650e8400-e29b-41d4-a716-446655440003');

-- Insert sample saved searches (commented out since we need authenticated users)
-- Note: Saved searches will be created when users sign up and start using the application
-- INSERT INTO public.saved_searches (user_id, name, search_criteria, email_alerts) VALUES
-- ('user_id_1', 'London Houses Under £1M', '{"location": "London", "property_type": "house", "max_price": 1000000, "min_bedrooms": 3}', true),
-- ('user_id_2', 'Manchester Apartments', '{"location": "Manchester", "property_type": "apartment", "max_price": 300000, "min_bedrooms": 2}', false);

-- Update statistics for better performance
ANALYZE public.properties;
ANALYZE public.property_images;
ANALYZE public.property_features;
ANALYZE public.inquiries;
ANALYZE public.viewings;
-- Note: favorites and saved_searches tables will be analyzed once they have data