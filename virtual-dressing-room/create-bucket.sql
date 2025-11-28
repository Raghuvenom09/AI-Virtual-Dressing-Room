-- Quick Storage Bucket Setup
-- Copy and run this in Supabase SQL Editor

-- 1. Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('tryon-results', 'tryon-results', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set storage policies
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tryon-results');

CREATE POLICY "Allow authenticated users to read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'tryon-results');

CREATE POLICY "Allow public to read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tryon-results');

CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tryon-results' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Verify
SELECT * FROM storage.buckets WHERE id = 'tryon-results';
