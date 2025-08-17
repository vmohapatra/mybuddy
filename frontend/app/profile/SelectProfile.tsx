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

export default function SelectProfileScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail') || 'user@example.com';
      const deviceId = await AsyncStorage.getItem('deviceId') || 'device-123';
      
      const response = await ProfileService.getProfiles(email, deviceId);
      setProfiles(response.profiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
      Alert.alert('Error', 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSelect = async (profile: Profile) => {
    try {
      await AsyncStorage.setItem('selectedProfileId', profile.id.toString());
      router.replace('/dashboard');
    } catch (error) {
      console.error('Error selecting profile:', error);
      Alert.alert('Error', 'Failed to select profile');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleCreateNew = () => {
    router.push('/profile/CreateProfile');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading profiles...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Profile</Text>
        <Text style={styles.subtitle}>Choose an existing buddy profile</Text>
      </View>

      {profiles.length > 0 ? (
        <View style={styles.profilesContainer}>
          <Text style={styles.sectionTitle}>Your Buddies:</Text>
          {profiles.map((profile) => (
            <TouchableOpacity
              key={profile.id}
              style={styles.profileCard}
              onPress={() => handleProfileSelect(profile)}
            >
              <Text style={styles.buddyName}>{profile.buddyName}</Text>
              <Text style={styles.buddyPersonality} numberOfLines={2}>
                {profile.buddyPersonality}
              </Text>
              <Text style={styles.selectText}>Tap to select</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.noProfilesContainer}>
          <Text style={styles.noProfilesText}>
            No existing profiles found.
          </Text>
          <Text style={styles.noProfilesSubtext}>
            Create your first buddy profile to get started!
          </Text>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleCreateNew}
        >
          <Text style={styles.buttonText}>Create New Profile</Text>
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
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  profilesContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  profileCard: {
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
  buddyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  buddyPersonality: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  selectText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'right',
  },
  noProfilesContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  noProfilesText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  noProfilesSubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 100,
  },
});
