import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfileService } from '../../services/profileService';

export default function CreateProfileScreen() {
  const router = useRouter();
  const [buddyName, setBuddyName] = useState('');
  const [buddyPersonality, setBuddyPersonality] = useState('');
  const [buddyRules, setBuddyRules] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateProfile = async () => {
    if (!buddyName.trim() || !buddyPersonality.trim()) {
      Alert.alert('Error', 'Please fill in buddy name and personality');
      return;
    }

    setLoading(true);
    try {
      const email = await AsyncStorage.getItem('userEmail') || 'user@example.com';
      const deviceId = await AsyncStorage.getItem('deviceId') || 'device-123';
      
      const profile = await ProfileService.createProfile({
        email,
        deviceId,
        buddyName: buddyName.trim(),
        buddyPersonality: buddyPersonality.trim(),
        buddyRules: buddyRules.trim() || undefined,
      });

      await AsyncStorage.setItem('selectedProfileId', profile.id.toString());
      Alert.alert('Success', 'Buddy profile created successfully!');
      router.replace('/dashboard');
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create New Buddy</Text>
        <Text style={styles.subtitle}>Let's create your AI companion</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Buddy Name</Text>
          <TextInput
            style={styles.input}
            value={buddyName}
            onChangeText={setBuddyName}
            placeholder="e.g., Alex, Sam, or Luna"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Personality</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={buddyPersonality}
            onChangeText={setBuddyPersonality}
            placeholder="Describe your buddy's personality, interests, and how they should behave..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Special Rules (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={buddyRules}
            onChangeText={setBuddyRules}
            placeholder="Any specific rules or preferences for your buddy..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreateProfile}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating...' : 'Create Buddy'}
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
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
