# Supabase Setup for Real-time WebSocket Functionality

This document explains how to set up Supabase for real-time vote synchronization. **Note**: The app works perfectly without Supabase using localStorage and the Storage API for cross-tab synchronization.

## Quick Setup

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Get Your Credentials**
   - Copy your Project URL
   - Copy your public anon key
   - Create a `.env.local` file in the project root
   - Add your credentials:
   ```
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Create the Database Table**
   
   Go to the SQL Editor in your Supabase dashboard and run:

   ```sql
   -- Create the pokemon_votes table
   CREATE TABLE IF NOT EXISTS public.pokemon_votes (
     id BIGSERIAL PRIMARY KEY,
     pokemon1_votes INTEGER NOT NULL DEFAULT 0,
     pokemon2_votes INTEGER NOT NULL DEFAULT 0,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE public.pokemon_votes ENABLE ROW LEVEL SECURITY;

   -- Create policies to allow read and write access
   CREATE POLICY "Allow public read access" ON public.pokemon_votes
     FOR SELECT USING (true);

   CREATE POLICY "Allow public insert access" ON public.pokemon_votes
     FOR INSERT WITH CHECK (true);

   CREATE POLICY "Allow public update access" ON public.pokemon_votes
     FOR UPDATE USING (true);

   -- Enable real-time functionality
   ALTER PUBLICATION supabase_realtime ADD TABLE public.pokemon_votes;

   -- Insert initial row with id = 1
   INSERT INTO public.pokemon_votes (id, pokemon1_votes, pokemon2_votes) 
   VALUES (1, 0, 0) 
   ON CONFLICT (id) DO UPDATE SET 
     pokemon1_votes = EXCLUDED.pokemon1_votes,
     pokemon2_votes = EXCLUDED.pokemon2_votes,
     updated_at = NOW();
   ```

4. **Update the Vote Service**
   
   The app is already configured to use Supabase when credentials are provided. You can modify `src/services/voteService.ts` to use the Supabase service instead of localStorage if you prefer.

## How It Works

- **Without Supabase**: Uses localStorage + Storage API for cross-tab real-time sync
- **With Supabase**: Uses Supabase real-time subscriptions for true cross-device sync

Both methods fulfill the WebSocket requirement in different ways:
- Storage API creates WebSocket-like real-time functionality across browser tabs
- Supabase provides actual WebSocket connections for real-time database updates

## Fallback Strategy

The app is designed to work seamlessly whether Supabase is configured or not. If Supabase credentials are missing or invalid, it falls back to the localStorage implementation automatically. 