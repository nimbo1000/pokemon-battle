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
  resetVotes: (pokemon1Id?: number, pokemon2Id?: number) => Promise<VoteUpdate | null>;
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
        resetVotes: supabaseModule.resetVotes,
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
const USER_VOTE_KEY = 'pokemon_battle_user_vote';

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
  pokemon1_name: 'bulbasaur',
  pokemon1_votes: 0,
  pokemon2_id: 25,
  pokemon2_name: 'pikachu',
  pokemon2_votes: 0,
  battle_started_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

// localStorage implementation
const getLocalVotes = (): VoteUpdate => {
  const stored = localStorage.getItem(VOTES_KEY);
  if (!stored) {
    const defaultVotes = getDefaultVotes();
    localStorage.setItem(VOTES_KEY, JSON.stringify(defaultVotes));
    return defaultVotes;
  }
  return JSON.parse(stored);
};

const incrementLocalVote = (pokemon: 'pokemon1' | 'pokemon2'): VoteUpdate => {
  const currentVotes = getLocalVotes();
  const updatedVotes: StoredVotes = {
    id: currentVotes.id,
    pokemon1_id: currentVotes.pokemon1_id,
    pokemon1_name: currentVotes.pokemon1_name,
    pokemon1_votes: pokemon === 'pokemon1' ? currentVotes.pokemon1_votes + 1 : currentVotes.pokemon1_votes,
    pokemon2_id: currentVotes.pokemon2_id,
    pokemon2_name: currentVotes.pokemon2_name,
    pokemon2_votes: pokemon === 'pokemon2' ? currentVotes.pokemon2_votes + 1 : currentVotes.pokemon2_votes,
    battle_started_at: currentVotes.battle_started_at,
    updated_at: new Date().toISOString()
  };
  
  localStorage.setItem(VOTES_KEY, JSON.stringify(updatedVotes));
  
  // Trigger storage event for cross-tab synchronization
  window.dispatchEvent(new StorageEvent('storage', {
    key: VOTES_KEY,
    newValue: JSON.stringify(updatedVotes),
    storageArea: localStorage
  }));
  
  return updatedVotes;
};

const resetLocalVotes = (): VoteUpdate => {
  const resetData = getDefaultVotes();
  localStorage.setItem(VOTES_KEY, JSON.stringify(resetData));
  
  // Clear user vote as well
  localStorage.removeItem(USER_VOTE_KEY);
  
  // Trigger storage event
  window.dispatchEvent(new StorageEvent('storage', {
    key: VOTES_KEY,
    newValue: JSON.stringify(resetData),
    storageArea: localStorage
  }));
  
  return resetData;
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
  const localVotes = getLocalVotes();
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
  const result = incrementLocalVote(pokemon);
  console.log('✅ Vote incremented via localStorage:', result);
  return result;
};

export const resetVotes = async (pokemon1Id?: number, pokemon2Id?: number): Promise<VoteUpdate> => {
  const supabaseFuncs = await getSupabaseFunctions();
  
  if (supabaseFuncs) {
    try {
      const result = await supabaseFuncs.resetVotes(pokemon1Id, pokemon2Id);
      if (result) {
        return result;
      }
    } catch (error) {
      console.error('Supabase resetVotes failed, falling back to localStorage:', error);
    }
  }
  
  return resetLocalVotes();
};

export const getUserVote = (): 'pokemon1' | 'pokemon2' | null => {
  const vote = localStorage.getItem(USER_VOTE_KEY);
  return vote as 'pokemon1' | 'pokemon2' | null;
};

export const setUserVote = (pokemon: 'pokemon1' | 'pokemon2'): void => {
  localStorage.setItem(USER_VOTE_KEY, pokemon);
};

export const clearUserVote = (): void => {
  localStorage.removeItem(USER_VOTE_KEY);
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
          pokemon1_name: votes.pokemon1_name || 'bulbasaur',
          pokemon1_votes: votes.pokemon1_votes || 0,
          pokemon2_id: votes.pokemon2_id || 25,
          pokemon2_name: votes.pokemon2_name || 'pikachu',
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
    if (event.key === VOTES_KEY && event.newValue) {
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
export const checkForDuplicateVote = (): boolean => {
  return getUserVote() !== null;
}; 