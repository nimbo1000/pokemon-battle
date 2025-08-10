export interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  weight: number;
  height: number;
  base_experience: number;
}

export interface BattleState {
  pokemon1: Pokemon | null;
  pokemon2: Pokemon | null;
  votes: {
    pokemon1: number;
    pokemon2: number;
  };
  hasVoted: boolean;
  userVote: 'pokemon1' | 'pokemon2' | null;
  loading: boolean;
  error: string | null;
}

export interface VoteUpdate {
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