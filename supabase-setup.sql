-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/idbazylwzyraeabbocyp/sql)

-- Create table to store dashboard state
CREATE TABLE IF NOT EXISTS dashboard_state (
    id TEXT PRIMARY KEY DEFAULT 'default',
    state JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE dashboard_state ENABLE ROW LEVEL SECURITY;

-- Allow public read/write (since this is a personal dashboard)
CREATE POLICY "Allow public access" ON dashboard_state
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Insert initial row
INSERT INTO dashboard_state (id, state) VALUES ('default', '{}')
ON CONFLICT (id) DO NOTHING;
