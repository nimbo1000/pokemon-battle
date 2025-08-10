import { createClient } from '@supabase/supabase-js';
import type { VoteUpdate } from '../types/pokemon';

// For demo purposes - in a real app, these would be environment variables
// You can replace these with your actual Supabase project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database operations for vote tracking
export const getVotes = async (pokemon1Id?: number, pokemon2Id?: number): Promise<VoteUpdate | null> => {
  try {
    // If we have specific Pokémon IDs, find the matching battle
    if (pokemon1Id && pokemon2Id) {
      console.log(`Looking for battle: ${pokemon1Id} vs ${pokemon2Id}`);
      
      // Try to find existing battle with either Pokémon order
      const { data, error } = await supabase
        .from('pokemon_votes')
        .select('*')
        .eq('pokemon1_id', pokemon1Id)
        .eq('pokemon2_id', pokemon2Id)
        .single();
      
      // If not found, try the reverse order
      if (error && error.code === 'PGRST116') {
        console.log('Trying reverse order...');
        const { data: reverseData, error: reverseError } = await supabase
          .from('pokemon_votes')
          .select('*')
          .eq('pokemon1_id', pokemon2Id)
          .eq('pokemon2_id', pokemon1Id)
          .single();
        
        if (reverseError && reverseError.code !== 'PGRST116') {
          console.error('Error fetching reverse battle:', reverseError);
          return null;
        }
        
        if (reverseData) {
          console.log('Found existing battle (reverse order):', reverseData);
          return reverseData as VoteUpdate;
        }
      } else if (error && error.code !== 'PGRST116') {
        console.error('Error fetching specific battle votes:', error);
        return null;
      }
      
      if (data) {
        console.log('Found existing battle:', data);
        return data as VoteUpdate;
      }
      
      // Battle doesn't exist, create it
      console.log('Battle not found, creating new battle...');
      const { data: insertData, error: insertError } = await supabase
        .from('pokemon_votes')
        .insert({ 
          pokemon1_id: pokemon1Id,
          pokemon1_name: pokemon1Id === 1 ? 'bulbasaur' : `pokemon-${pokemon1Id}`,
          pokemon1_votes: 0, 
          pokemon2_id: pokemon2Id,
          pokemon2_name: pokemon2Id === 25 ? 'pikachu' : `pokemon-${pokemon2Id}`,
          pokemon2_votes: 0 
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating new battle:', insertError);
        return null;
      }
      
      console.log('Created new battle:', insertData);
      return insertData as VoteUpdate;
    }
    
    // Fallback: get the most recent battle (for initial load)
    const { data: allData, error: selectError } = await supabase
      .from('pokemon_votes')
      .select('*')
      .order('battle_started_at', { ascending: false })
      .limit(1)
      .single();
    
    if (selectError) {
      if (selectError.code === 'PGRST116') {
        // No battles exist, create initial Bulbasaur vs Pikachu
        console.log('No battles found, creating initial Bulbasaur vs Pikachu...');
        const { data: insertData, error: insertError } = await supabase
          .from('pokemon_votes')
          .insert({ 
            pokemon1_id: 1,
            pokemon1_name: 'bulbasaur',
            pokemon1_votes: 0, 
            pokemon2_id: 25,
            pokemon2_name: 'pikachu',
            pokemon2_votes: 0 
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('Error creating initial battle:', insertError);
          return null;
        }
        
        return insertData as VoteUpdate;
      }
      
      console.error('Error fetching most recent battle:', selectError);
      return null;
    }
    
    return allData as VoteUpdate;
  } catch (error) {
    console.error('Error in getVotes:', error);
    return null;
  }
};

export const incrementVote = async (pokemon: 'pokemon1' | 'pokemon2', pokemon1Id?: number, pokemon2Id?: number): Promise<VoteUpdate | null> => {
  try {
    console.log(`🗳️ Incrementing vote for ${pokemon} via Supabase...`);
    
    // Get votes for the specific battle
    const currentVotes = await getVotes(pokemon1Id, pokemon2Id);
    if (!currentVotes) {
      console.log('📊 No existing votes found for this battle, initializing...');
      // Initialize if no votes exist for this battle
      const initialVotes = {
        pokemon1_id: pokemon1Id || 1,
        pokemon1_name: pokemon1Id === 1 ? 'bulbasaur' : `pokemon-${pokemon1Id}`,
        pokemon1_votes: pokemon === 'pokemon1' ? 1 : 0,
        pokemon2_id: pokemon2Id || 25,
        pokemon2_name: pokemon2Id === 25 ? 'pikachu' : `pokemon-${pokemon2Id}`,
        pokemon2_votes: pokemon === 'pokemon2' ? 1 : 0,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('pokemon_votes')
        .insert(initialVotes)
        .select()
        .single();
        
      if (error) {
        console.error('❌ Error initializing votes:', error);
        return null;
      }
      
      console.log('✅ Initialized votes for new battle:', data);
      return data as VoteUpdate;
    }
    
    // Update existing votes for this battle
    const updatedVotes = {
      pokemon1_votes: pokemon === 'pokemon1' ? currentVotes.pokemon1_votes + 1 : currentVotes.pokemon1_votes,
      pokemon2_votes: pokemon === 'pokemon2' ? currentVotes.pokemon2_votes + 1 : currentVotes.pokemon2_votes,
      updated_at: new Date().toISOString()
    };
    
    console.log('📊 Current votes for battle:', currentVotes);
    console.log('📊 Updated votes:', updatedVotes);
    
    const { data, error } = await supabase
      .from('pokemon_votes')
      .update(updatedVotes)
      .eq('id', currentVotes.id) // Use the actual battle ID
      .select()
      .single();
      
    if (error) {
      console.error('❌ Error updating votes:', error);
      return null;
    }
    
    console.log('✅ Successfully updated votes for battle:', data);
    return data as VoteUpdate;
  } catch (error) {
    console.error('Error in incrementVote:', error);
    return null;
  }
};

export const resetVotes = async (pokemon1Id?: number, pokemon2Id?: number): Promise<VoteUpdate | null> => {
  try {
    // If we have specific Pokémon IDs, reset that battle
    if (pokemon1Id && pokemon2Id) {
      const existingBattle = await getVotes(pokemon1Id, pokemon2Id);
      if (existingBattle) {
        const { data, error } = await supabase
          .from('pokemon_votes')
          .update({
            pokemon1_votes: 0,
            pokemon2_votes: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingBattle.id)
          .select()
          .single();
          
        if (error) {
          console.error('Error resetting specific battle votes:', error);
          return null;
        }
        
        return data as VoteUpdate;
      }
    }
    
    // Fallback: reset the most recent battle
    const { data: allData, error: selectError } = await supabase
      .from('pokemon_votes')
      .select('*')
      .order('battle_started_at', { ascending: false })
      .limit(1)
      .single();
    
    if (selectError) {
      console.error('Error finding battle to reset:', selectError);
      return null;
    }
    
    const { data, error } = await supabase
      .from('pokemon_votes')
      .update({
        pokemon1_votes: 0,
        pokemon2_votes: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', allData.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error resetting votes:', error);
      return null;
    }
    
    return data as VoteUpdate;
  } catch (error) {
    console.error('Error in resetVotes:', error);
    return null;
  }
};

export const startNewBattle = async (pokemon1: { id: number; name: string }, pokemon2: { id: number; name: string }): Promise<VoteUpdate | null> => {
  try {
    console.log(`Starting new battle: ${pokemon1.name} vs ${pokemon2.name}`);
    
    // First check if this battle already exists
    const existingBattle = await getVotes(pokemon1.id, pokemon2.id);
    if (existingBattle) {
      console.log('Battle already exists, resetting votes:', existingBattle);
      // Reset votes for existing battle
      const { data, error } = await supabase
        .from('pokemon_votes')
        .update({
          pokemon1_votes: 0,
          pokemon2_votes: 0,
          battle_started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingBattle.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error resetting existing battle:', error);
        return null;
      }
      
      console.log('Existing battle reset successfully:', data);
      return data as VoteUpdate;
    }
    
    // Create new battle (let the database auto-generate the ID)
    const newBattleData = {
      pokemon1_id: pokemon1.id,
      pokemon1_name: pokemon1.name,
      pokemon1_votes: 0,
      pokemon2_id: pokemon2.id,
      pokemon2_name: pokemon2.name,
      pokemon2_votes: 0,
      battle_started_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('pokemon_votes')
      .insert(newBattleData)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating new battle:', error);
      return null;
    }
    
    console.log('New battle created successfully:', data);
    return data as VoteUpdate;
  } catch (error) {
    console.error('Error in startNewBattle:', error);
    return null;
  }
};

// Subscribe to real-time vote updates
export const subscribeToVotes = (callback: (votes: VoteUpdate) => void, battleId?: number) => {
  console.log(`🔌 Setting up Supabase real-time subscription for battle ID: ${battleId || 'all'}`);
  
  let filter = 'id=eq.1'; // Default to first battle
  if (battleId) {
    filter = `id=eq.${battleId}`;
  }
  
  const subscription = supabase
    .channel('pokemon_votes_channel')
    .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pokemon_votes',
          filter: filter // Listen to changes on the specific battle
        }, 
        (payload) => {
          console.log('📡 Received real-time update:', payload);
          if (payload.new) {
            console.log('📡 Calling callback with new data:', payload.new);
            callback(payload.new as VoteUpdate);
          }
        }
    )
    .subscribe((status) => {
      console.log('📡 Supabase subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Real-time subscription is active!');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Real-time subscription failed!');
      }
    });
    
  // Return unsubscribe function
  return {
    unsubscribe: () => {
      console.log('🔌 Unsubscribing from Supabase real-time...');
      subscription.unsubscribe();
    }
  };
}; 