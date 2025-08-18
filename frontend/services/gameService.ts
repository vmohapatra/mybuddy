import api from './api';

export interface GameStartRequest {
  profileId: number;
  gameType: string;
  difficulty?: string;
  category?: string;
  rounds?: number;
}

export interface GameSubmitRequest {
  gameId: number;
  profileId: number;
  answer?: string;
  score?: number;
  completionTime?: number;
  gameData?: string;
}

export interface GameResponse {
  gameId: number;
  status: string;
  currentQuestion?: string;
  options?: string[];
  currentScore: number;
  currentRound: number;
  totalRounds: number;
  completionTime?: number;
  resultMessage?: string;
  timestamp: string;
}

export interface GameHistoryEntry {
  gameId: number;
  gameType: string;
  score: number;
  completionTime: number;
  timestamp: string;
  difficulty: string;
  category?: string;
  completed: boolean;
}

export interface GameHistoryResponse {
  profileId: number;
  games: GameHistoryEntry[];
  totalGames: number;
  averageScore: number;
  highestScore: number;
  totalPlayTime: number;
}

export interface LeaderboardEntry {
  rank: number;
  profileId: number;
  buddyName: string;
  score: number;
  completionTime: number;
  timestamp: string;
  role: string;
}

export interface GameLeaderboardResponse {
  topPlayers: LeaderboardEntry[];
  totalPlayers: number;
  lastUpdated: string;
  gameType?: string;
  difficulty?: string;
}

// Game Service
export const gameService = {
  // Start a new game
  async startGame(request: GameStartRequest): Promise<GameResponse> {
    try {
      const response = await api.post('/games/start', request);
      return response.data;
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  },

  // Submit game answer/score
  async submitGame(request: GameSubmitRequest): Promise<GameResponse> {
    try {
      const response = await api.post('/games/submit', request);
      return response.data;
    } catch (error) {
      console.error('Error submitting game:', error);
      throw error;
    }
  },

  // Get game history for a profile
  async getGameHistory(profileId: number): Promise<GameHistoryResponse> {
    try {
      const response = await api.get(`/games/history/${profileId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting game history:', error);
      throw error;
    }
  },

  // Get global leaderboard
  async getLeaderboard(): Promise<GameLeaderboardResponse> {
    try {
      const response = await api.get('/games/leaderboard');
      return response.data;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  },

  // Clear game history for a profile
  async clearGameHistory(profileId: number): Promise<void> {
    try {
      await api.delete(`/games/history/${profileId}`);
    } catch (error) {
      console.error('Error clearing game history:', error);
      throw error;
    }
  }
};
