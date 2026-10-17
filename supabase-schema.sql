-- Create users table with authentication
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'team')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create locations table
CREATE TABLE locations (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Create index on locations for faster queries
CREATE INDEX idx_locations_user_id ON locations(user_id);
CREATE INDEX idx_locations_updated_at ON locations(updated_at);

-- Create index on users for auth queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Allow public read access on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert on users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on users" ON users FOR UPDATE USING (true);

-- Policies for locations table
CREATE POLICY "Allow public read access on locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Allow public insert on locations" ON locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on locations" ON locations FOR UPDATE USING (true);

-- Insert default admin user (password: admin123 - change in production)
INSERT INTO users (name, email, password, role, status) 
VALUES ('Admin', 'admin@trackteam.com', 'admin123', 'admin', 'approved')
ON CONFLICT (email) DO NOTHING;
