-- Simple Database Fix for Pokemon Battle Royale
-- Run this in your Supabase SQL Editor

-- 1. Delete all existing rows
DELETE FROM public.pokemon_votes;

-- 2. Reset the sequence (if using BIGSERIAL)
ALTER SEQUENCE pokemon_votes_id_seq RESTART WITH 1;

-- 3. Insert a single clean row
INSERT INTO public.pokemon_votes (id, pokemon1_votes, pokemon2_votes, updated_at) 
VALUES (1, 0, 0, NOW());

-- 4. Verify the result
SELECT * FROM public.pokemon_votes;

-- 5. Test an update to make sure real-time works
UPDATE public.pokemon_votes 
SET pokemon1_votes = 1, updated_at = NOW() 
WHERE id = 1;

-- 6. Show final result
SELECT * FROM public.pokemon_votes; 