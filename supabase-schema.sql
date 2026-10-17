-- Create users table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'team')),
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

-- Enable Row Level Security (optional, for production)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Allow public access for MVP (adjust for production security)
CREATE POLICY "Allow public read access on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert on users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access on locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Allow public insert on locations" ON locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on locations" ON locations FOR UPDATE USING (true);

-- Insert default admin user
INSERT INTO users (name, role) 
VALUES ('Admin', 'admin')
ON CONFLICT DO NOTHING;
