-- ==============================================================================
-- MIGRATION: 20260821000002_create_avatars_storage_bucket.sql
-- PURPOSE: Create and configure the 'avatars' storage bucket with RLS policies
--          allowing authenticated users to upload and manage their own avatar.
-- ==============================================================================

-- 1. Insert 'avatars' bucket into storage.buckets if it does not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    2097152, -- 2MB maximum file size
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

-- 2. Storage Policies for 'avatars' Bucket (RLS is enabled by default on storage.objects)

-- Allow public read access to avatar images
DROP POLICY IF EXISTS "Public avatars are viewable by everyone" ON storage.objects;
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar into avatars/{user_id}/*
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' AND
    (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own avatar
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' AND
    (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
    bucket_id = 'avatars' AND
    (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own avatar
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' AND
    (auth.uid())::text = (storage.foldername(name))[1]
);
