-- Quick Database Setup for NewsHub CMS
-- Run this in Supabase SQL Editor

-- 1. First, let's check if tables already exist and create them if not
DO $$ 
BEGIN
    -- Create users table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        -- Enable extensions
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
        -- Create enums if they don't exist
        DO $enum$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
                CREATE TYPE user_role AS ENUM ('admin', 'editor', 'author', 'subscriber');
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'article_status') THEN
                CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived', 'scheduled');
            END IF;
        END $enum$;
        
        -- Create users table
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL DEFAULT 'temp_password',
            full_name VARCHAR(255) NOT NULL,
            username VARCHAR(50) UNIQUE NOT NULL,
            role user_role DEFAULT 'subscriber',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
    
    -- Create articles table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'articles') THEN
        CREATE TABLE articles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            content TEXT,
            excerpt TEXT,
            author_id UUID REFERENCES users(id) ON DELETE SET NULL,
            status article_status DEFAULT 'draft',
            views INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            published_at TIMESTAMPTZ
        );
    END IF;
END $$;

-- 2. Create a test admin user if it doesn't exist
INSERT INTO users (email, full_name, username, role, password_hash)
VALUES (
    'admin@ai-reviewed.com',
    'Admin User',
    'admin',
    'admin',
    '$2a$10$XQq2o2Y2XJ5W3e4dYQ4Mzu8K7Fh3Gy8X5X6X5X5X5X5X5X5X5X5X5' -- This is a placeholder
)
ON CONFLICT (email) DO NOTHING;

-- 3. Create some test articles
INSERT INTO articles (title, slug, content, excerpt, author_id, status, published_at)
SELECT 
    'Welcome to NewsHub CMS',
    'welcome-to-newshub-cms',
    'This is your first article in NewsHub CMS. The platform is now fully set up and ready to use!',
    'Get started with NewsHub CMS',
    (SELECT id FROM users WHERE email = 'admin@ai-reviewed.com'),
    'published',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'welcome-to-newshub-cms');

-- 4. Grant permissions for anonymous access (for Supabase)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 5. Create a simple RLS policy for public read access
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow public to read published articles
CREATE POLICY "Public can read published articles" ON articles
    FOR SELECT USING (status = 'published');

-- Allow authenticated users to manage their own articles
CREATE POLICY "Users can manage own articles" ON articles
    FOR ALL USING (auth.uid()::text = author_id::text);

-- 6. Create a simple function to check database connectivity
CREATE OR REPLACE FUNCTION check_database_connection()
RETURNS json AS $$
BEGIN
    RETURN json_build_object(
        'status', 'connected',
        'timestamp', NOW(),
        'user_count', (SELECT COUNT(*) FROM users),
        'article_count', (SELECT COUNT(*) FROM articles)
    );
END;
$$ LANGUAGE plpgsql;

-- Test the connection
SELECT check_database_connection();