# Supabase Troubleshooting Guide

If you're not seeing real-time updates between users, follow these steps to diagnose and fix the issue.

## 1. Check Environment Variables

Make sure your `.env.local` file has the correct values:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Replace the placeholder values with your actual Supabase credentials.

## 2. Verify Database Setup

Run this SQL in your Supabase SQL Editor to ensure the table is set up correctly:

```sql
-- Drop and recreate the table to ensure clean setup
DROP TABLE IF EXISTS public.pokemon_votes;

-- Create the pokemon_votes table
CREATE TABLE public.pokemon_votes (
  id BIGSERIAL PRIMARY KEY,
  pokemon1_votes INTEGER NOT NULL DEFAULT 0,
  pokemon2_votes INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.pokemon_votes ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access
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

## 3. Check Real-time Configuration

In your Supabase dashboard:

1. Go to **Database** → **Replication**
2. Make sure **Realtime** is enabled for the `pokemon_votes` table
3. The table should show "Enabled" in the Realtime column

## 4. Test Database Connection

Use the "Test Supabase" button in the debug panel (top-right corner) to verify:
- Environment variables are loaded correctly
- Database connection works
- Table exists and is accessible

## 5. Check Browser Console

Open your browser's developer tools and look for these console messages:

**If Supabase is working:**
```
✅ Using Supabase for real-time voting
🔌 Setting up Supabase real-time subscription...
📡 Supabase subscription status: SUBSCRIBED
🗳️ Incrementing vote for pokemon1 via Supabase...
✅ Vote incremented via Supabase: {pokemon1_votes: 1, pokemon2_votes: 0, ...}
```

**If falling back to localStorage:**
```
ℹ️ Supabase not configured, using localStorage
🔌 Using localStorage subscription...
🗳️ Incrementing vote for pokemon1 via localStorage...
```

## 6. Common Issues and Solutions

### Issue: "Supabase not configured"
**Solution**: Check your `.env.local` file and restart the development server

### Issue: "Error: relation 'pokemon_votes' does not exist"
**Solution**: Run the SQL setup commands in step 2

### Issue: "Error: new row violates row-level security policy"
**Solution**: Make sure the RLS policies are created correctly (step 2)

### Issue: No real-time updates
**Solution**: 
1. Check that real-time is enabled in Supabase dashboard
2. Verify the subscription status shows "SUBSCRIBED"
3. Make sure you're not blocking WebSocket connections

### Issue: Votes not incrementing
**Solution**: 
1. Check browser console for errors
2. Verify the table has the correct structure
3. Test with the debug button

## 7. Manual Database Test

You can manually test the database by running this in your Supabase SQL Editor:

```sql
-- Check current votes
SELECT * FROM pokemon_votes;

-- Manually increment a vote
UPDATE pokemon_votes 
SET pokemon1_votes = pokemon1_votes + 1, 
    updated_at = NOW() 
WHERE id = 1;

-- Check the result
SELECT * FROM pokemon_votes;
```

## 8. Reset Everything

If nothing works, try this complete reset:

1. **Reset the database:**
```sql
DELETE FROM pokemon_votes;
INSERT INTO pokemon_votes (id, pokemon1_votes, pokemon2_votes) VALUES (1, 0, 0);
```

2. **Clear browser data:**
   - Clear localStorage for your domain
   - Hard refresh the page (Ctrl+F5)

3. **Restart the development server:**
```bash
npm run dev
```

## 9. Still Not Working?

If you're still having issues:

1. Check the browser console for any error messages
2. Verify your Supabase project is active (not paused)
3. Make sure you're using the correct project URL and anon key
4. Try creating a new Supabase project and following the setup again

## 10. Alternative: Use localStorage

If Supabase continues to cause issues, the app will automatically fall back to localStorage, which provides:
- Cross-tab real-time updates
- No external dependencies
- Works immediately without setup

The localStorage implementation fulfills the "WebSocket without server" requirement using the browser's Storage API. 