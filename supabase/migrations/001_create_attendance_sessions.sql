-- Create attendance_sessions table for cross-device session sharing
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_code VARCHAR(6) NOT NULL UNIQUE,
    subject_id VARCHAR(255) NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    period INTEGER NOT NULL,
    otp VARCHAR(6),
    otp_expiry BIGINT,
    teacher_location JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on session_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_code ON attendance_sessions(session_code);

-- Create index on active status
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_active ON attendance_sessions(active);

-- Enable RLS (Row Level Security)
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for demo purposes)
-- In production, you should restrict this to authenticated users
CREATE POLICY "Allow all operations" ON attendance_sessions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at
CREATE TRIGGER update_attendance_sessions_updated_at
    BEFORE UPDATE ON attendance_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
