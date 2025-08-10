-- Fix Database Structure for Pokemon Battle Royale
-- Run this in your Supabase SQL Editor

-- 1. Drop the existing table to start fresh
DROP TABLE IF EXISTS public.pokemon_votes;

-- 2. Create the table with correct structure
CREATE TABLE public.pokemon_votes (
  id BIGSERIAL PRIMARY KEY,
  pokemon1_votes INTEGER NOT NULL DEFAULT 0,
  pokemon2_votes INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE public.pokemon_votes ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON public.pokemon_votes;
DROP POLICY IF EXISTS "Allow public insert access" ON public.pokemon_votes;
DROP POLICY IF EXISTS "Allow public update access" ON public.pokemon_votes;

-- 5. Create new policies
CREATE POLICY "Allow public read access" ON public.pokemon_votes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON public.pokemon_votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON public.pokemon_votes
  FOR UPDATE USING (true);

-- 6. Enable real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.pokemon_votes;

-- 7. Insert the initial row with id = 1
INSERT INTO public.pokemon_votes (id, pokemon1_votes, pokemon2_votes) 
VALUES (1, 0, 0);

-- 8. Verify the setup
SELECT * FROM public.pokemon_votes;

-- 9. Test an update
UPDATE public.pokemon_votes 
SET pokemon1_votes = 1, updated_at = NOW() 
WHERE id = 1;

-- 10. Show the result
SELECT * FROM public.pokemon_votes; 