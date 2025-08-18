import api from './api';

export interface Profile {
  id: number;
  email: string;
  deviceId: string;
  buddyName: string;
  buddyPersonality: string;
  buddyRules?: string;
  role: string;
  subscriptionPlan: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileRequest {
  email: string;
  deviceId: string;
  buddyName: string;
  buddyPersonality: string;
  buddyRules?: string;
  role?: string;
  subscriptionPlan?: string;
}

export interface UpdateProfileRequest {
  buddyName?: string;
  buddyPersonality?: string;
  buddyRules?: string;
  email?: string;
  role?: string;
}

export interface PinUpdateRequest {
  currentPin?: string;
  newPin: string;
  email: string;
}

export interface PinResetRequest {
  email: string;
  profileId: number;
}

// Profile Service
export const profileService = {
  // Create a new profile
  async createProfile(request: CreateProfileRequest): Promise<Profile> {
    try {
      const response = await api.post('/profiles', request);
      return response.data;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },

  // Get profile by ID
  async getProfileById(id: number): Promise<Profile> {
    try {
      const response = await api.get(`/profiles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  },

  // Note: Additional profile API methods removed (frontend-only now)
};
