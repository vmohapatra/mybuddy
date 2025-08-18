import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profileService } from '../../services/profileService';
import { Profile } from '../../types/Profile';

export default function DashboardScreen() {
  const router = useRouter();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  interface SubscriptionUsage {
    currentPlan: string;
    profileCount: number;
    maxProfiles: number;
    deviceCount: number;
    maxDevices: number;
    canCreateProfile: boolean;
    canRegisterDevice: boolean;
    availableFeatures: string[];
  }
  const [subscriptionUsage, setSubscriptionUsage] = useState<SubscriptionUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSelectedProfile();
  }, []);

  const loadSelectedProfile = async () => {
    try {
      const profileId = await AsyncStorage.getItem('selectedProfileId');
      if (!profileId) {
        router.replace('/');
        return;
      }

      const profile = await profileService.getProfileById(parseInt(profileId));
      if (profile) {
        setSelectedProfile(profile);
        // Compute subscription usage locally based on plan and local profiles
        setSubscriptionUsage(computeSubscriptionUsage(profile.subscriptionPlan));
      } else {
        Alert.alert('Error', 'Profile not found');
        router.replace('/');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  const getPlanLimits = (plan: string) => {
    switch (plan) {
      case 'UNLIMITED':
        return { maxProfiles: 9999, maxDevices: 9999, features: ['Search (full)', 'Chat (full)', 'History', 'Reset', 'Manage Roles'] };
      case 'PREMIUM':
        return { maxProfiles: 5, maxDevices: 3, features: ['Search (advanced)', 'Chat (advanced)', 'Full history'] };
      case 'STANDARD_PLUS':
        return { maxProfiles: 3, maxDevices: 3, features: ['Search', 'Chat', 'Partial history'] };
      case 'STANDARD':
        return { maxProfiles: 2, maxDevices: 2, features: ['Search', 'Chat'] };
      case 'FREE':
      default:
        return { maxProfiles: 1, maxDevices: 1, features: ['Search (limited)', 'Chat (limited)'] };
    }
  };

  const computeSubscriptionUsage = (plan: string): SubscriptionUsage => {
    const limits = getPlanLimits(plan);
    let profileCount = 0;
    try {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem('mybuddy-profiles');
        const list = raw ? JSON.parse(raw) : [];
        profileCount = Array.isArray(list) ? list.length : 0;
      }
    } catch (_) {
      profileCount = 0;
    }
    const deviceCount = 1; // Web app counts as one device for now
    return {
      currentPlan: plan || 'FREE',
      profileCount,
      maxProfiles: limits.maxProfiles,
      deviceCount,
      maxDevices: limits.maxDevices,
      canCreateProfile: profileCount < limits.maxProfiles,
      canRegisterDevice: deviceCount < limits.maxDevices,
      availableFeatures: limits.features,
    };
  };

  const handleFeaturePress = (feature: string) => {
    switch (feature) {
      case 'search':
        router.push('/dashboard/SearchScreen');
        break;
      case 'chat':
        router.push('/dashboard/ChatScreen');
        break;
      case 'game':
        router.push('/dashboard/GameScreen');
        break;
      case 'history':
        router.push('/dashboard/HistoryScreen');
        break;
      case 'reset':
        router.push('/dashboard/ResetScreen');
        break;
    }
  };

  const handleBackToProfiles = () => {
    router.replace('/');
  };

  const handleUpgradeSubscription = () => {
    Alert.alert(
      'Upgrade Subscription',
      'Subscription upgrade functionality coming soon!',
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!selectedProfile) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToProfiles}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.buddyName}>{selectedProfile.buddyName}</Text>
        <Text style={styles.buddyPersonality} numberOfLines={2}>
          {selectedProfile.buddyPersonality}
        </Text>
      </View>

      {/* Subscription Status Display */}
      {subscriptionUsage && (
        <View style={styles.subscriptionContainer}>
          <Text style={styles.subscriptionTitle}>Subscription Status</Text>
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>Current Plan:</Text>
              <Text style={styles.subscriptionValue}>{subscriptionUsage.currentPlan}</Text>
            </View>
            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>User Role:</Text>
              <Text style={styles.subscriptionValue}>{selectedProfile.role}</Text>
            </View>
            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>Profiles:</Text>
              <Text style={styles.subscriptionValue}>
                {subscriptionUsage.profileCount} / {subscriptionUsage.maxProfiles}
              </Text>
            </View>
            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>Devices:</Text>
              <Text style={styles.subscriptionValue}>
                {subscriptionUsage.deviceCount} / {subscriptionUsage.maxDevices}
              </Text>
            </View>
            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>Can Create Profile:</Text>
              <Text style={[
                styles.subscriptionValue,
                subscriptionUsage.canCreateProfile ? styles.positive : styles.negative
              ]}>
                {subscriptionUsage.canCreateProfile ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>
          
          {/* Available Features */}
          <View style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>Available Features</Text>
            <View style={styles.featuresList}>
              {subscriptionUsage.availableFeatures.map((feature, index) => (
                <Text key={index} style={styles.featureItem}>• {feature}</Text>
              ))}
            </View>
          </View>
        </View>
      )}

      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>What would you like to do?</Text>
        
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => handleFeaturePress('search')}
        >
          <Text style={styles.featureTitle}>🔍 Search</Text>
          <Text style={styles.featureDescription}>
            Ask {selectedProfile.buddyName} to help you find information
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => handleFeaturePress('chat')}
        >
          <Text style={styles.featureTitle}>💬 Chat</Text>
          <Text style={styles.featureDescription}>
            Have a conversation with {selectedProfile.buddyName}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => handleFeaturePress('game')}
        >
          <Text style={styles.featureTitle}>🎮 Play Games</Text>
          <Text style={styles.featureDescription}>
            Play fun games with {selectedProfile.buddyName}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => handleFeaturePress('history')}
        >
          <Text style={styles.featureTitle}>📚 History</Text>
          <Text style={styles.featureDescription}>
            View your conversation and activity history
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => handleFeaturePress('reset')}
        >
          <Text style={styles.featureTitle}>🔄 Reset</Text>
          <Text style={styles.featureDescription}>
            Reset your buddy's memory and start fresh
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  buddyName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  buddyPersonality: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  featuresContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 100,
  },
  subscriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  subscriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  subscriptionCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subscriptionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  subscriptionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  positive: {
    color: 'green',
  },
  negative: {
    color: 'red',
  },
  featuresCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  featuresList: {
    // No specific styles for list items, they will inherit from featureCard
  },
  featureItem: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 5,
  },
});
