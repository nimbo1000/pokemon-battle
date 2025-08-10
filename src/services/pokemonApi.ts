import type { Pokemon } from '../types/pokemon';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

export const fetchPokemon = async (nameOrId: string | number): Promise<Pokemon> => {
  try {
    const response = await fetch(`${POKEAPI_BASE_URL}/${nameOrId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Pokémon: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Pokémon:', error);
    throw error;
  }
};

export const fetchInitialBattle = async (): Promise<[Pokemon, Pokemon]> => {
  try {
    const [pokemon1, pokemon2] = await Promise.all([
      fetchPokemon(1),  // Bulbasaur
      fetchPokemon(25)  // Pikachu
    ]);
    return [pokemon1, pokemon2];
  } catch (error) {
    console.error('Error fetching initial battle Pokémon:', error);
    throw error;
  }
};

export const fetchRandomPokemon = async (): Promise<Pokemon> => {
  const randomId = Math.floor(Math.random() * 151) + 1; // Gen 1 Pokémon
  return fetchPokemon(randomId);
};

export const fetchRandomBattle = async (): Promise<[Pokemon, Pokemon]> => {
  try {
    // Ensure the two Pokémon are different
    const pokemon1 = await fetchRandomPokemon();
    let pokemon2 = await fetchRandomPokemon();
    
    // Keep fetching pokemon2 until it's different from pokemon1
    let attempts = 0;
    const maxAttempts = 10; // Prevent infinite loops
    
    while (pokemon1.id === pokemon2.id && attempts < maxAttempts) {
      console.log(`🔄 Pokémon ${pokemon1.name} was selected twice, fetching different one...`);
      pokemon2 = await fetchRandomPokemon();
      attempts++;
    }
    
    if (pokemon1.id === pokemon2.id) {
      console.warn(`⚠️ Could not find different Pokémon after ${maxAttempts} attempts, using fallback`);
      // Fallback: use a different Pokémon ID
      const fallbackId = pokemon1.id === 1 ? 25 : 1; // Use Bulbasaur or Pikachu as fallback
      pokemon2 = await fetchPokemon(fallbackId);
    }
    
    console.log(`🎲 Random battle: ${pokemon1.name} vs ${pokemon2.name}`);
    return [pokemon1, pokemon2];
  } catch (error) {
    console.error('Error fetching random battle:', error);
    throw error;
  }
}; 