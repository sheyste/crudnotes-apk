-- SQL Script to set up Supabase for CRUD Notes App
-- Run this in your Supabase project's SQL Editor

-- Create the notes table
CREATE TABLE notes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies for notes table
-- Users can view their own notes
CREATE POLICY "Users can view their own notes"
ON notes FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own notes
CREATE POLICY "Users can insert their own notes"
ON notes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own notes
CREATE POLICY "Users can update their own notes"
ON notes FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notes
CREATE POLICY "Users can delete their own notes"
ON notes FOR DELETE
USING (auth.uid() = user_id);

-- Note: Storage bucket 'notes-media' must be created manually in Supabase Dashboard:
-- Go to Storage > Buckets > Create bucket > Name: notes-media > Make public
