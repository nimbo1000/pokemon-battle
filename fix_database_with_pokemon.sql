-- Improved Database Schema for Pokemon Battle Royale
-- This version tracks which Pokémon are actually battling

-- 1. Drop the existing table
DROP TABLE IF EXISTS public.pokemon_votes;

-- 2. Create the improved table with Pokémon information
CREATE TABLE public.pokemon_votes (
  id BIGSERIAL PRIMARY KEY,
  pokemon1_id INTEGER NOT NULL,
  pokemon1_name VARCHAR(255) NOT NULL,
  pokemon1_votes INTEGER NOT NULL DEFAULT 0,
  pokemon2_id INTEGER NOT NULL,
  pokemon2_name VARCHAR(255) NOT NULL,
  pokemon2_votes INTEGER NOT NULL DEFAULT 0,
  battle_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE public.pokemon_votes ENABLE ROW LEVEL SECURITY;

-- 4. Create policies to allow public access
CREATE POLICY "Allow public read access" ON public.pokemon_votes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON public.pokemon_votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON public.pokemon_votes
  FOR UPDATE USING (true);

-- 5. Enable real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.pokemon_votes;

-- 6. Insert initial battle (Bulbasaur vs Pikachu)
INSERT INTO public.pokemon_votes (
  id, 
  pokemon1_id, 
  pokemon1_name, 
  pokemon1_votes,
  pokemon2_id, 
  pokemon2_name, 
  pokemon2_votes
) VALUES (
  1, 
  1, 
  'bulbasaur', 
  0,
  25, 
  'pikachu', 
  0
);

-- 7. Verify the setup
SELECT * FROM public.pokemon_votes;

-- 8. Test an update
UPDATE public.pokemon_votes 
SET pokemon1_votes = 1, updated_at = NOW() 
WHERE id = 1;

-- 9. Show final result
SELECT * FROM public.pokemon_votes; 