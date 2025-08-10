-- Debug and Clean Database Script
-- Run this in your Supabase SQL Editor to see what's happening

-- 1. Check all current battles
SELECT 
  id,
  pokemon1_id,
  pokemon1_name,
  pokemon1_votes,
  pokemon2_id,
  pokemon2_name,
  pokemon2_votes,
  battle_started_at,
  updated_at
FROM pokemon_votes
ORDER BY id;

-- 2. Count total rows
SELECT COUNT(*) as total_battles FROM pokemon_votes;

-- 3. Find duplicate battles (same Pokémon pair)
SELECT 
  pokemon1_id,
  pokemon2_id,
  COUNT(*) as duplicate_count
FROM pokemon_votes
GROUP BY pokemon1_id, pokemon2_id
HAVING COUNT(*) > 1;

-- 4. Find battles with Bulbasaur (ID 1) vs Pikachu (ID 25)
SELECT * FROM pokemon_votes 
WHERE (pokemon1_id = 1 AND pokemon2_id = 25) 
   OR (pokemon1_id = 25 AND pokemon2_id = 1);

-- 5. Clean up duplicate rows (keep the oldest one for each battle)
-- WARNING: This will delete duplicate rows!
DELETE FROM pokemon_votes 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM pokemon_votes 
  GROUP BY pokemon1_id, pokemon2_id
);

-- 6. Check result after cleanup
SELECT 
  id,
  pokemon1_id,
  pokemon1_name,
  pokemon1_votes,
  pokemon2_id,
  pokemon2_name,
  pokemon2_votes,
  battle_started_at
FROM pokemon_votes
ORDER BY id; 