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

export const fetchBulbasaurAndPikachu = async (): Promise<[Pokemon, Pokemon]> => {
  try {
    const [bulbasaur, pikachu] = await Promise.all([
      fetchPokemon('bulbasaur'),
      fetchPokemon('pikachu')
    ]);
    return [bulbasaur, pikachu];
  } catch (error) {
    console.error('Error fetching battle Pokémon:', error);
    throw error;
  }
};

// For bonus feature: fetch random Pokémon
export const fetchRandomPokemon = async (): Promise<Pokemon> => {
  const randomId = Math.floor(Math.random() * 151) + 1; // Gen 1 Pokémon
  return fetchPokemon(randomId);
};

export const fetchRandomBattle = async (): Promise<[Pokemon, Pokemon]> => {
  try {
    const [pokemon1, pokemon2] = await Promise.all([
      fetchRandomPokemon(),
      fetchRandomPokemon()
    ]);
    return [pokemon1, pokemon2];
  } catch (error) {
    console.error('Error fetching random battle:', error);
    throw error;
  }
}; 