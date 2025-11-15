# CRUD Notes App

A React Native (Expo) mobile application that demonstrates full CRUD functionality with user authentication using Supabase.

## Features

- User Authentication (Sign Up / Sign In) via Supabase Auth
- Create, Read, Update, Delete notes
- Media Upload (images and videos) via Supabase Storage
- Cross-platform (Android/iOS)

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- Expo CLI: `npm install -g @expo/cli`
- Supabase account

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd crudnotes-apk
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure Supabase:

   a. Create a new project at [Supabase](https://supabase.com)

   b. Go to Settings > API and copy your project URL and anon key.

   c. In `config.js`, replace the placeholders with your Supabase URL and anon key:
      ```javascript
      export const SUPABASE_URL = 'https://your-project-ref.supabase.co';
      export const SUPABASE_ANON_KEY = 'your-anon-key-here';
      ```

   d. In Supabase Dashboard:

      - Create a new table `notes` with the following columns:
        - `id`: int8, primary key, auto-increment
        - `title`: text
        - `content`: text
        - `media`: jsonb (nullable)
        - `user_id`: uuid, references auth.users(id)
        - `created_at`: timestamptz, default now()

      - Enable Row Level Security (RLS) on the notes table.

      - Add a policy for Select/Insert/Update/Delete where user_id = auth.uid().

      - Create a storage bucket called `notes-media` and make it public.

### Running the App

1. Start the Expo development server:
   ```
   npx expo start
   ```

2. Follow the on-screen instructions to run on your device or emulator.

### Building APK

1. Install EAS CLI:
   ```
   npm install -g eas-cli
   eas login
   ```

2. Configure EAS Build:
   ```
   eas build:configure
   ```

3. Build Android APK:
   ```
   eas build -p android --profile preview
   ```

## Database Schema

### Notes Table

```sql
CREATE TABLE notes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notes"
ON notes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
ON notes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
ON notes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
ON notes FOR DELETE
USING (auth.uid() = user_id);
```

### Storage

- Bucket: `notes-media` (public access)

## Notes

- Media files are uploaded to Supabase Storage.
- Notes are user-specific via RLS.
- Sign up requires email confirmation unless disabled in project settings.
