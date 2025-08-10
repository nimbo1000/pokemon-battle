import type { VoteUpdate } from '../types/pokemon';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return supabaseUrl && supabaseKey && 
         supabaseUrl !== 'your_supabase_project_url_here' && 
         supabaseKey !== 'your_supabase_anon_key_here';
};

// Dynamically import Supabase functions
let supabaseFunctions: {
  getVotes: (pokemon1Id?: number, pokemon2Id?: number) => Promise<VoteUpdate | null>;
  incrementVote: (pokemon: 'pokemon1' | 'pokemon2', pokemon1Id?: number, pokemon2Id?: number) => Promise<VoteUpdate | null>;
  startNewBattle: (pokemon1: { id: number; name: string }, pokemon2: { id: number; name: string }) => Promise<VoteUpdate | null>;
  subscribeToVotes: (callback: (votes: VoteUpdate) => void, battleId?: number) => { unsubscribe: () => void };
} | null = null;

const getSupabaseFunctions = async () => {
  if (!supabaseFunctions && isSupabaseConfigured()) {
    try {
      console.log('Supabase is configured, loading functions...');
      const supabaseModule = await import('./supabase');
      supabaseFunctions = {
        getVotes: supabaseModule.getVotes,
        incrementVote: supabaseModule.incrementVote,
        startNewBattle: supabaseModule.startNewBattle,
        subscribeToVotes: supabaseModule.subscribeToVotes
      };
      console.log('✅ Using Supabase for real-time voting');
    } catch (error) {
      console.error('❌ Failed to load Supabase functions:', error);
      supabaseFunctions = null;
    }
  } else if (!isSupabaseConfigured()) {
    console.log('ℹ️ Supabase not configured, using localStorage');
  }
  return supabaseFunctions;
};

// Fallback service using localStorage for demo purposes
// This simulates real-time functionality across browser tabs using storage events

const VOTES_KEY = 'pokemon_battle_votes';
const USER_VOTES_KEY = 'pokemon_battle_user_votes'; // Store all user votes per battle

interface StoredVotes {
  id?: number;
  pokemon1_id: number;
  pokemon1_name: string;
  pokemon1_votes: number;
  pokemon2_id: number;
  pokemon2_name: string;
  pokemon2_votes: number;
  battle_started_at: string;
  updated_at: string;
}

// Initialize default votes
const getDefaultVotes = (): StoredVotes => ({
  id: 1,
  pokemon1_id: 1,
  pokemon1_name: 'pokemon-1',
  pokemon1_votes: 0,
  pokemon2_id: 25,
  pokemon2_name: 'pokemon-25',
  pokemon2_votes: 0,
  battle_started_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

// Helper function to create battle key
const getBattleKey = (pokemon1Id: number, pokemon2Id: number): string => {
  // Sort IDs to ensure consistent key regardless of order
  const [id1, id2] = [pokemon1Id, pokemon2Id].sort((a, b) => a - b);
  return `${id1}-${id2}`;
};

// localStorage implementation
const getLocalVotes = (pokemon1Id?: number, pokemon2Id?: number): VoteUpdate => {
  if (!pokemon1Id || !pokemon2Id) {
    // Fallback to default votes if no IDs provided
    const stored = localStorage.getItem(VOTES_KEY);
    if (!stored) {
      const defaultVotes = getDefaultVotes();
      localStorage.setItem(VOTES_KEY, JSON.stringify(defaultVotes));
      return defaultVotes;
    }
    return JSON.parse(stored);
  }

  const battleKey = getBattleKey(pokemon1Id, pokemon2Id);
  const stored = localStorage.getItem(`${VOTES_KEY}_${battleKey}`);
  
  if (!stored) {
    // Create new battle entry
    const newBattle: StoredVotes = {
      id: Date.now(), // Use timestamp as ID for localStorage
      pokemon1_id: pokemon1Id,
      pokemon1_name: `pokemon-${pokemon1Id}`,
      pokemon1_votes: 0,
      pokemon2_id: pokemon2Id,
      pokemon2_name: `pokemon-${pokemon2Id}`,
      pokemon2_votes: 0,
      battle_started_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(`${VOTES_KEY}_${battleKey}`, JSON.stringify(newBattle));
    return newBattle;
  }
  
  return JSON.parse(stored);
};

const incrementLocalVote = (pokemon: 'pokemon1' | 'pokemon2', pokemon1Id: number, pokemon2Id: number): VoteUpdate => {
  const currentVotes = getLocalVotes(pokemon1Id, pokemon2Id);
  const battleKey = getBattleKey(pokemon1Id, pokemon2Id);
  
  const updatedVotes: StoredVotes = {
    ...currentVotes,
    pokemon1_votes: pokemon === 'pokemon1' ? currentVotes.pokemon1_votes + 1 : currentVotes.pokemon1_votes,
    pokemon2_votes: pokemon === 'pokemon2' ? currentVotes.pokemon2_votes + 1 : currentVotes.pokemon2_votes,
    updated_at: new Date().toISOString()
  };
  
  localStorage.setItem(`${VOTES_KEY}_${battleKey}`, JSON.stringify(updatedVotes));
  
  // Trigger storage event for cross-tab synchronization
  window.dispatchEvent(new StorageEvent('storage', {
    key: `${VOTES_KEY}_${battleKey}`,
    newValue: JSON.stringify(updatedVotes),
    storageArea: localStorage
  }));
  
  return updatedVotes;
};



// Unified functions that automatically choose between Supabase and localStorage
export const getVotes = async (pokemon1Id?: number, pokemon2Id?: number): Promise<VoteUpdate> => {
  const supabaseFuncs = await getSupabaseFunctions();
  
  if (supabaseFuncs) {
    try {
      console.log(`📊 Getting votes from Supabase for battle: ${pokemon1Id} vs ${pokemon2Id}...`);
      const result = await supabaseFuncs.getVotes(pokemon1Id, pokemon2Id);
      if (result) {
        console.log('✅ Got votes from Supabase:', result);
        return result;
      }
    } catch (error) {
      console.error('❌ Supabase getVotes failed, falling back to localStorage:', error);
    }
  }
  
  console.log('📊 Getting votes from localStorage...');
  const localVotes = getLocalVotes(pokemon1Id, pokemon2Id);
  console.log('✅ Got votes from localStorage:', localVotes);
  return localVotes;
};

export const incrementVote = async (pokemon: 'pokemon1' | 'pokemon2', pokemon1Id?: number, pokemon2Id?: number): Promise<VoteUpdate> => {
  const supabaseFuncs = await getSupabaseFunctions();
  
  if (supabaseFuncs) {
    try {
      console.log(`🗳️ Incrementing vote for ${pokemon} via Supabase...`);
      const result = await supabaseFuncs.incrementVote(pokemon, pokemon1Id, pokemon2Id);
      if (result) {
        console.log('✅ Vote incremented via Supabase:', result);
        return result;
      }
    } catch (error) {
      console.error('❌ Supabase incrementVote failed, falling back to localStorage:', error);
    }
  }
  
  console.log(`🗳️ Incrementing vote for ${pokemon} via localStorage...`);
  const result = incrementLocalVote(pokemon, pokemon1Id!, pokemon2Id!);
  console.log('✅ Vote incremented via localStorage:', result);
  return result;
};



export const getUserVote = (pokemon1Id?: number, pokemon2Id?: number): 'pokemon1' | 'pokemon2' | null => {
  if (!pokemon1Id || !pokemon2Id) {
    return null;
  }
  
  const battleKey = getBattleKey(pokemon1Id, pokemon2Id);
  const vote = localStorage.getItem(`${USER_VOTES_KEY}_${battleKey}`);
  return vote as 'pokemon1' | 'pokemon2' | null;
};

export const setUserVote = (pokemon: 'pokemon1' | 'pokemon2', pokemon1Id: number, pokemon2Id: number): void => {
  const battleKey = getBattleKey(pokemon1Id, pokemon2Id);
  localStorage.setItem(`${USER_VOTES_KEY}_${battleKey}`, pokemon);
};

export const clearUserVote = (pokemon1Id?: number, pokemon2Id?: number): void => {
  if (!pokemon1Id || !pokemon2Id) {
    // Clear all user votes if no specific battle provided
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(USER_VOTES_KEY)) {
        localStorage.removeItem(key);
      }
    });
    return;
  }
  
  const battleKey = getBattleKey(pokemon1Id, pokemon2Id);
  localStorage.removeItem(`${USER_VOTES_KEY}_${battleKey}`);
};

// Subscribe to real-time vote updates
export const subscribeToVotes = async (callback: (votes: VoteUpdate) => void, battleId?: number): Promise<(() => void) | null> => {
  const supabaseFuncs = await getSupabaseFunctions();
  
  if (supabaseFuncs) {
    try {
      console.log(`🔌 Using Supabase subscription for battle ID: ${battleId || 'all'}...`);
      const subscription = supabaseFuncs.subscribeToVotes((votes: VoteUpdate) => {
        console.log('🔌 Supabase callback received votes:', votes);
        // Ensure we're calling the callback with the correct data structure
        const voteData: VoteUpdate = {
          id: votes.id,
          pokemon1_id: votes.pokemon1_id || 1,
          pokemon1_name: votes.pokemon1_name || 'pokemon-1',
          pokemon1_votes: votes.pokemon1_votes || 0,
          pokemon2_id: votes.pokemon2_id || 25,
          pokemon2_name: votes.pokemon2_name || 'pokemon-25',
          pokemon2_votes: votes.pokemon2_votes || 0,
          battle_started_at: votes.battle_started_at || new Date().toISOString(),
          updated_at: votes.updated_at
        };
        console.log('🔌 Calling main callback with:', voteData);
        callback(voteData);
      }, battleId);
      return () => {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      };
    } catch (error) {
      console.error('❌ Supabase subscription failed, falling back to localStorage:', error);
    }
  }
  
  // Fallback to localStorage storage events
  console.log('🔌 Using localStorage subscription...');
  const handleStorageChange = (event: StorageEvent) => {
    // Listen to all vote-related storage changes
    if (event.key && event.key.startsWith(VOTES_KEY) && event.newValue) {
      const updatedVotes = JSON.parse(event.newValue);
      console.log('📡 Received localStorage update:', updatedVotes);
      callback(updatedVotes);
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  // Return unsubscribe function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

// Additional utility for detecting duplicate votes across tabs
export const checkForDuplicateVote = (pokemon1Id?: number, pokemon2Id?: number): boolean => {
  return getUserVote(pokemon1Id, pokemon2Id) !== null;
}; 