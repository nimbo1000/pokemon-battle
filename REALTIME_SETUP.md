# Supabase Real-time Setup Guide

If you're not seeing real-time updates, follow these steps to ensure real-time is properly configured.

## 1. Enable Real-time in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Replication**
3. Find the `pokemon_votes` table
4. Make sure the **Realtime** toggle is **ON**
5. The table should show "Enabled" in the Realtime column

## 2. Verify Database Publication

Run this SQL in your Supabase SQL Editor to ensure real-time is properly configured:

```sql
-- Check if real-time is enabled for the table
SELECT 
  schemaname,
  tablename,
  attname,
  atttypid::regtype
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename = 'pokemon_votes';

-- If no results, add the table to real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.pokemon_votes;

-- Verify the table is now included
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename = 'pokemon_votes';
```

## 3. Test Real-time Manually

Run this SQL to test if real-time is working:

```sql
-- First, check current votes
SELECT * FROM pokemon_votes;

-- Update votes to trigger real-time event
UPDATE pokemon_votes 
SET pokemon1_votes = pokemon1_votes + 1, 
    updated_at = NOW() 
WHERE id = 1;

-- Check the result
SELECT * FROM pokemon_votes;
```

## 4. Browser Console Debugging

Open your browser's developer tools and look for these messages:

**Expected Real-time Messages:**
```
🔌 Setting up Supabase real-time subscription...
📡 Supabase subscription status: SUBSCRIBED
✅ Real-time subscription is active!
📡 Received real-time update: {eventType: "UPDATE", ...}
📡 Calling callback with new data: {id: 1, pokemon1_votes: 2, ...}
🔄 Received real-time vote update: {pokemon1_votes: 2, pokemon2_votes: 0, ...}
🔄 Updated battle state with new votes: {pokemon1: 2, pokemon2: 0}
```

**If Real-time is NOT working:**
```
📡 Supabase subscription status: CHANNEL_ERROR
❌ Real-time subscription failed!
```

## 5. Common Real-time Issues

### Issue: "CHANNEL_ERROR" status
**Solutions:**
1. Check if real-time is enabled in Supabase dashboard
2. Verify your project is not paused
3. Check if you have any firewall/network restrictions blocking WebSocket connections
4. Try refreshing the page

### Issue: No real-time events received
**Solutions:**
1. Verify the table is added to the `supabase_realtime` publication
2. Check that RLS policies allow the operations
3. Ensure you're updating the correct row (id = 1)

### Issue: Real-time works but updates are delayed
**Solutions:**
1. Check your network connection
2. Verify Supabase project is in a region close to you
3. Check if there are any browser extensions blocking WebSocket connections

## 6. Alternative Testing

Use the debug panel buttons to test:

1. **"Test DB"** - Verifies database connection and basic operations
2. **"Test Real-time"** - Tests real-time subscription specifically

## 7. Network/Firewall Issues

If you're behind a corporate firewall or have network restrictions:

1. **Check WebSocket connections**: Real-time uses WebSocket connections to `wss://your-project.supabase.co`
2. **Allow WebSocket traffic**: Make sure your network allows WebSocket connections
3. **Check browser extensions**: Some ad blockers or privacy extensions can block WebSocket connections

## 8. Fallback to localStorage

If real-time continues to not work, the app will automatically fall back to localStorage, which provides:
- Cross-tab real-time updates using the Storage API
- No external dependencies
- Works immediately without setup

## 9. Manual Verification

To manually verify real-time is working:

1. Open the app in two different browser tabs
2. Vote in one tab
3. Watch the other tab - it should update automatically within 1-2 seconds
4. Check the browser console for real-time messages

## 10. Still Not Working?

If real-time is still not working after following all steps:

1. **Create a new Supabase project** and try again
2. **Check Supabase status page** for any service issues
3. **Contact Supabase support** if the issue persists
4. **Use localStorage fallback** - it works reliably and fulfills the requirements 