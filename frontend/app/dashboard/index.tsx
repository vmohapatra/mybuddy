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
import { ProfileService } from '../../services/profileService';
import { Profile } from '../../types/Profile';

export default function DashboardScreen() {
  const router = useRouter();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
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

      const profile = await ProfileService.getProfile(parseInt(profileId));
      if (profile) {
        setSelectedProfile(profile);
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
});
