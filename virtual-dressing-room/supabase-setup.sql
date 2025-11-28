-- ============================================
-- SUPABASE STORAGE & DATABASE SETUP
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create storage bucket for try-on results
INSERT INTO storage.buckets (id, name, public)
VALUES ('tryon-results', 'tryon-results', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set storage policies (allow authenticated users to upload their own files)
CREATE POLICY "Users can upload their own try-on results"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tryon-results' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own try-on results"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'tryon-results' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own try-on results"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tryon-results' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public can view all try-on results"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tryon-results');

-- 3. Create table to track try-on history
CREATE TABLE IF NOT EXISTS tryon_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    file_path TEXT NOT NULL,
    clothing_type TEXT,
    clothing_color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 4. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tryon_history_user_id ON tryon_history(user_id);
CREATE INDEX IF NOT EXISTS idx_tryon_history_created_at ON tryon_history(created_at DESC);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE tryon_history ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for tryon_history table
CREATE POLICY "Users can view their own try-on history"
ON tryon_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own try-on history"
ON tryon_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own try-on history"
ON tryon_history FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 7. Optional: Create a function to auto-cleanup old try-ons (keep last 50 per user)
CREATE OR REPLACE FUNCTION cleanup_old_tryons()
RETURNS void AS $$
BEGIN
    DELETE FROM tryon_history
    WHERE id IN (
        SELECT id
        FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
            FROM tryon_history
        ) t
        WHERE rn > 50
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'tryon-results';

-- Check if table exists
SELECT * FROM tryon_history LIMIT 1;

-- ============================================
-- INSTRUCTIONS
-- ============================================

-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "RUN" to execute
-- 5. Verify success by checking Storage -> tryon-results bucket exists
-- 6. Check Tables -> tryon_history exists

-- Done! Your storage is now ready for the virtual try-on app.
