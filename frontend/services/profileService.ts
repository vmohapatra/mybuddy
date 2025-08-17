import apiClient from './api';
import { Profile, CreateProfileRequest, ProfileListResponse } from '../types/Profile';

export class ProfileService {
  static async createProfile(request: CreateProfileRequest): Promise<Profile> {
    try {
      return await apiClient.post<Profile>('/api/profiles', request);
    } catch (error) {
      console.log('Backend not available, creating mock profile');
      // Return a mock profile for now
      return {
        id: Date.now(),
        email: request.email,
        deviceId: request.deviceId,
        buddyName: request.buddyName,
        buddyPersonality: request.buddyPersonality,
        buddyRules: request.buddyRules,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  }

  static async getProfiles(email: string, deviceId: string): Promise<ProfileListResponse> {
    try {
      return await apiClient.get<ProfileListResponse>('/api/profiles', {
        email,
        deviceId,
      });
    } catch (error) {
      console.log('Backend not available, returning empty profiles');
      // Return empty profiles when backend is not available
      return {
        profiles: [],
        total: 0,
      };
    }
  }

  static async getProfile(id: number): Promise<Profile> {
    try {
      return await apiClient.get<Profile>(`/api/profiles/${id}`);
    } catch (error) {
      console.log('Backend not available, returning mock profile');
      // Return a mock profile for now
      return {
        id,
        email: 'user@example.com',
        deviceId: 'device-123',
        buddyName: 'Mock Buddy',
        buddyPersonality: 'A friendly AI companion',
        buddyRules: 'Be helpful and supportive',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  }

  static async deleteProfile(id: number): Promise<void> {
    try {
      await apiClient.delete<void>(`/api/profiles/${id}`);
    } catch (error) {
      console.log('Backend not available, mock delete successful');
      // Mock successful deletion when backend is not available
    }
  }
}
