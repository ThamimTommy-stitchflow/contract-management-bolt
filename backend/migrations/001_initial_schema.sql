-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for app categories
CREATE TYPE app_category AS ENUM (
    'Identity & Access Management',
    'HR & People',
    'Finance & Operations',
    'Development & DevOps',
    'Productivity & Collaboration',
    'Sales & Marketing',
    'Analytics & Customer Success',
    'Security & Compliance',
    'Support & Service',
    'Asset & Resource Management',
    'CSV Uploads'
);

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create apps table
CREATE TABLE IF NOT EXISTS apps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category app_category NOT NULL,
    is_predefined BOOLEAN NOT NULL DEFAULT true,
    api_supported BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(name)
);

-- Create company_apps table for many-to-many relationship
CREATE TABLE IF NOT EXISTS company_apps (
    company_id UUID NOT NULL,
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (company_id, app_id)
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apps_updated_at
    BEFORE UPDATE ON apps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_apps ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone."
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile."
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Apps policies
CREATE POLICY "Apps are viewable by everyone."
    ON apps FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert apps."
    ON apps FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can update apps."
    ON apps FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Company apps policies
CREATE POLICY "Company apps are viewable by everyone."
    ON company_apps FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage company apps."
    ON company_apps FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Insert initial admin user (replace with your admin email)
-- Note: Run this after creating the user through Supabase Auth
-- INSERT INTO profiles (id, email, role)
-- VALUES ('your-admin-user-id', 'admin@example.com', 'admin');
