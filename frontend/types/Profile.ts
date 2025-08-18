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

export interface ProfileResponse {
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

export interface ProfileListResponse {
  profiles: ProfileResponse[];
}
