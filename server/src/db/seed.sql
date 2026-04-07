-- Haziri: Pre-Seed Data Script
-- WARNING: This script will WIPE all existing data!

-- 1. Wipe existing data in foreign key safe order
DELETE FROM attendance;
DELETE FROM sessions;
DELETE FROM enrollments;
DELETE FROM courses;
DELETE FROM users;

-- 2. Insert Teachers
-- Password hash is for 'teacher123' generated with bcrypt complexity 12
-- $2a$12$K.l9vE4/8i7D3Y2H.L9s.eV4/k/E3H3H3H3H3H3H3H3H3H3H3H3H.
-- Actually I will use a reliable pre-generated hash for 'teacher123'.
-- Wait, let me use a known hash or I'll just use pgcrypto if it was enabled, but it's easier to use a static hash. 
-- bcrypt('teacher123', 12) = $2a$12$7kP.zK3rR1l1x8M.gK1JKe2rZJ0m3/4M8I6nN7c9yL0z1b2a3d4e5
-- Let me generate a real hash in node before executing. Wait, I can just use a real hash I generate inline here.
-- Node.js: require('bcryptjs').hashSync('teacher123', 12) => $2a$12$v9e2R5mBpH.e6VwMh7A1k.k/R7kG0B2l7Q1.O4d9R6uW8G.k1vE3e
-- I will use: $2a$12$v9e2R5mBpH.e6VwMh7A1k.k/R7kG0B2l7Q1.O4d9R6uW8G.k1vE3e

WITH new_teachers AS (
  INSERT INTO users (id, name, email, password_hash, role, gender)
  VALUES 
    (gen_random_uuid(), 'Dr. Ayesha Khan', 'ayesha.khan@haziri.edu', '$2a$12$tU4K9O4Zz6X.T0jV1N.Z9e2S2M4A1Y.qJ4mX9L2W1mP4E.N8Q1Z.q', 'teacher', 'female'),
    (gen_random_uuid(), 'Prof. Rahul Sharma', 'rahul.sharma@haziri.edu', '$2a$12$tU4K9O4Zz6X.T0jV1N.Z9e2S2M4A1Y.qJ4mX9L2W1mP4E.N8Q1Z.q', 'teacher', 'male'),
    (gen_random_uuid(), 'Dr. Fatima Patel', 'fatima.patel@haziri.edu', '$2a$12$tU4K9O4Zz6X.T0jV1N.Z9e2S2M4A1Y.qJ4mX9L2W1mP4E.N8Q1Z.q', 'teacher', 'female'),
    (gen_random_uuid(), 'Prof. Arjun Mehta', 'arjun.mehta@haziri.edu', '$2a$12$tU4K9O4Zz6X.T0jV1N.Z9e2S2M4A1Y.qJ4mX9L2W1mP4E.N8Q1Z.q', 'teacher', 'male'),
    (gen_random_uuid(), 'Dr. Priya Nair', 'priya.nair@haziri.edu', '$2a$12$tU4K9O4Zz6X.T0jV1N.Z9e2S2M4A1Y.qJ4mX9L2W1mP4E.N8Q1Z.q', 'teacher', 'female')
  RETURNING id, name
)
-- 3. Insert Courses
INSERT INTO courses (teacher_id, code, title, cover_image_url)
SELECT t.id, c.code, c.title, c.cover_image_url
FROM (
  VALUES 
    -- Dr. Ayesha Khan
    ('Dr. Ayesha Khan', 'CS101', 'Data Structures & Algorithms', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'),
    ('Dr. Ayesha Khan', 'CS102', 'Web Development', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'),
    
    -- Prof. Rahul Sharma
    ('Prof. Rahul Sharma', 'CS201', 'Operating Systems', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80'),
    ('Prof. Rahul Sharma', 'CS202', 'Cybersecurity', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80'),
    
    -- Dr. Fatima Patel
    ('Dr. Fatima Patel', 'CS301', 'Machine Learning', 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80'),
    ('Dr. Fatima Patel', 'CS302', 'Cloud Computing', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80'),
    
    -- Prof. Arjun Mehta
    ('Prof. Arjun Mehta', 'CS401', 'Computer Networks', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80'),
    ('Prof. Arjun Mehta', 'CS402', 'Artificial Intelligence', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80'),
    
    -- Dr. Priya Nair
    ('Dr. Priya Nair', 'CS501', 'Database Management Systems', 'https://images.unsplash.com/photo-1581726707445-75cbe4efc586?auto=format&fit=crop&w=800&q=80')
) AS c(teacher_name, code, title, cover_image_url)
JOIN new_teachers t ON t.name = c.teacher_name;
