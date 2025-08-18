import api from './api';

export interface SearchRequest {
  query: string;
  profileId: number;
  preferences?: SearchPreferences;
}

export interface SearchPreferences {
  preferredSources?: string[];
  contentTypes?: string[];
  language?: string;
  dateFrom?: string;
  dateTo?: string;
  minRelevanceScore?: number;
  maxResults?: number;
  preferredSearchEngines?: string[];
  excludedDomains?: string[];
  academicOnly?: boolean;
  recentContentDays?: number;
  sortOrder?: 'relevance' | 'date' | 'title';
  // New stylistic preferences consumed by backend LLM prompt
  tone?: 'professional' | 'friendly' | 'playful' | 'academic' | 'concise' | 'formal';
  audience?: 'general' | 'beginner' | 'intermediate' | 'expert' | 'executive';
}

export interface SearchSource {
  title: string;
  url: string;
  description: string;
  type: string;
  relevanceScore: number;
  publicationDate?: string;
  author?: string;
}

export interface SearchResponse {
  query: string;
  aiOverview: string;
  primarySources: SearchSource[];
  supportingResearch: SearchSource[];
  additionalSources: SearchSource[];
  confidenceScore: number;
  keyPoints: string[];
  timestamp: string;
  totalSources: number;
}

export interface SearchHistoryEntry {
  query: string;
  timestamp: string;
  resultCount: number;
  confidenceScore: number;
  hasFeedback: boolean;
  feedbackRating?: string;
}

export interface SearchHistoryResponse {
  profileId: number;
  searches: SearchHistoryEntry[];
  totalCount: number;
  filters: SearchFilters;
}

export interface SearchFilters {
  startDate?: string;
  endDate?: string;
  query?: string;
}

export interface SearchFeedbackRequest {
  query: string;
  profileId: number;
  rating: string;
  comments?: string;
  wasHelpful: boolean;
  suggestions?: string;
}

// Search Service
export const searchService = {
  // Perform AI-powered search
  async performSearch(request: SearchRequest): Promise<SearchResponse> {
    try {
      const response = await api.post('/search', request);
      return response.data;
    } catch (error) {
      console.error('Error performing search:', error);
      throw error;
    }
  },

  // Get search history for a profile
  async getSearchHistory(
    profileId: number,
    startDate?: string,
    endDate?: string,
    query?: string
  ): Promise<SearchHistoryResponse> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (query) params.query = query;

      const response = await api.get(`/search/history/${profileId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting search history:', error);
      throw error;
    }
  },

  // Submit search feedback
  async submitFeedback(request: SearchFeedbackRequest): Promise<void> {
    try {
      await api.post('/search/feedback', request);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  // Clear all search history for a profile
  async clearSearchHistory(profileId: number): Promise<void> {
    try {
      await api.delete(`/search/history/${profileId}`);
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw error;
    }
  },

  // Partial clear search history by date range
  async partialClearSearchHistory(
    profileId: number,
    startDate: string,
    endDate: string
  ): Promise<void> {
    try {
      await api.delete(`/search/history/${profileId}/partial`, {
        params: { startDate, endDate }
      });
    } catch (error) {
      console.error('Error partially clearing search history:', error);
      throw error;
    }
  },

  // Get default search preferences
  async getDefaultPreferences(): Promise<SearchPreferences> {
    try {
      const response = await api.get('/search/preferences/default');
      return response.data;
    } catch (error) {
      console.error('Error getting default preferences:', error);
      throw error;
    }
  },

  // Get academic search preferences
  async getAcademicPreferences(): Promise<SearchPreferences> {
    try {
      const response = await api.get('/search/preferences/academic');
      return response.data;
    } catch (error) {
      console.error('Error getting academic preferences:', error);
      throw error;
    }
  },

  // Get news search preferences
  async getNewsPreferences(): Promise<SearchPreferences> {
    try {
      const response = await api.get('/search/preferences/news');
      return response.data;
    } catch (error) {
      console.error('Error getting news preferences:', error);
      throw error;
    }
  },

  // Get technical search preferences
  async getTechnicalPreferences(): Promise<SearchPreferences> {
    try {
      const response = await api.get('/search/preferences/technical');
      return response.data;
    } catch (error) {
      console.error('Error getting technical preferences:', error);
      throw error;
    }
  },

  // Create custom search preferences
  async createCustomPreferences(preferences: SearchPreferences): Promise<SearchPreferences> {
    try {
      const response = await api.post('/search/preferences/custom', preferences);
      return response.data;
    } catch (error) {
      console.error('Error creating custom preferences:', error);
      throw error;
    }
  },

  // Get available content types
  async getAvailableContentTypes(): Promise<string[]> {
    try {
      const response = await api.get('/search/preferences/content-types');
      return response.data;
    } catch (error) {
      console.error('Error getting content types:', error);
      throw error;
    }
  },

  // Get available sort options
  async getAvailableSortOptions(): Promise<string[]> {
    try {
      const response = await api.get('/search/preferences/sort-options');
      return response.data;
    } catch (error) {
      console.error('Error getting sort options:', error);
      throw error;
    }
  }
};
