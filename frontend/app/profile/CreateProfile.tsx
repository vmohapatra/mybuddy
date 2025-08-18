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
import { profileService } from '../../services/profileService';

// Role and subscription plan options
const USER_ROLES = [
  { value: 'STANDARD', label: 'Standard', description: 'Regular user with basic features' },
  { value: 'STANDARD_PLUS', label: 'Standard Plus', description: 'Enhanced features and extended memory' },
  { value: 'PREMIUM', label: 'Premium', description: 'Advanced features and full access' },
  { value: 'UNLIMITED', label: 'Unlimited', description: 'Complete access to all features' }
];

const SUBSCRIPTION_PLANS = [
  { value: 'FREE', label: 'Free', description: 'Basic features, 1 profile, 1 device' },
  { value: 'STANDARD', label: 'Standard', description: '2 profiles, 2 devices, $9.99/month' },
  { value: 'STANDARD_PLUS', label: 'Standard Plus', description: '3 profiles, 3 devices, $19.99/month' },
  { value: 'PREMIUM', label: 'Premium', description: '5 profiles, 3 devices, $39.99/month' },
  { value: 'UNLIMITED', label: 'Unlimited', description: 'Unlimited profiles & devices, $99.99/month' }
];

export default function CreateProfileScreen() {
  const router = useRouter();
  const [buddyName, setBuddyName] = useState('');
  const [buddyPersonality, setBuddyPersonality] = useState('');
  const [buddyRules, setBuddyRules] = useState('');
  const [selectedRole, setSelectedRole] = useState('STANDARD');
  const [selectedPlan, setSelectedPlan] = useState('FREE');
  const [loading, setLoading] = useState(false);

  // Debug logging
  console.log('🔍 CreateProfileScreen: Component rendered');
  console.log('🔍 CreateProfileScreen: USER_ROLES length:', USER_ROLES.length);
  console.log('🔍 CreateProfileScreen: SUBSCRIPTION_PLANS length:', SUBSCRIPTION_PLANS.length);
  console.log('🔍 CreateProfileScreen: Current state:', {
    buddyName,
    buddyPersonality,
    buddyRules,
    selectedRole,
    selectedPlan,
    loading
  });

  const handleCreateProfile = async () => {
    console.log('🔍 CreateProfileScreen: handleCreateProfile called');
    if (!buddyName.trim() || !buddyPersonality.trim()) {
      console.log('🔍 CreateProfileScreen: Validation failed - missing required fields');
      Alert.alert('Error', 'Please fill in buddy name and personality');
      return;
    }

    setLoading(true);
    try {
      const email = await AsyncStorage.getItem('userEmail') || 'user@example.com';
      const deviceId = await AsyncStorage.getItem('deviceId') || 'device-123';
      
      console.log('🔍 CreateProfileScreen: Creating profile with data:', {
        email,
        deviceId,
        buddyName: buddyName.trim(),
        buddyPersonality: buddyPersonality.trim(),
        buddyRules: buddyRules.trim() || undefined,
        role: selectedRole,
        subscriptionPlan: selectedPlan
      });

      const profile = await profileService.createProfile({
        email,
        deviceId,
        buddyName: buddyName.trim(),
        buddyPersonality: buddyPersonality.trim(),
        buddyRules: buddyRules.trim() || undefined,
        role: selectedRole,
        subscriptionPlan: selectedPlan
      });

      await AsyncStorage.setItem('selectedProfileId', profile.id.toString());
      Alert.alert('Success', 'Buddy profile created successfully!');
      router.replace('/dashboard');
    } catch (error) {
      console.error('🔍 CreateProfileScreen: Error creating profile:', error);
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    console.log('🔍 CreateProfileScreen: handleBack called');
    router.back();
  };

  const renderRoleOption = (role: any) => {
    console.log('🔍 CreateProfileScreen: Rendering role option:', role);
    return (
      <TouchableOpacity
        key={role.value}
        style={[
          styles.optionCard,
          selectedRole === role.value && styles.selectedOption
        ]}
        onPress={() => {
          console.log('🔍 CreateProfileScreen: Role selected:', role.value);
          setSelectedRole(role.value);
        }}
      >
        <Text style={[
          styles.optionTitle,
          selectedRole === role.value && styles.selectedOptionText
        ]}>
          {role.label}
        </Text>
        <Text style={[
          styles.optionDescription,
          selectedRole === role.value && styles.selectedOptionText
        ]}>
          {role.description}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPlanOption = (plan: any) => {
    console.log('🔍 CreateProfileScreen: Rendering plan option:', plan);
    return (
      <TouchableOpacity
        key={plan.value}
        style={[
          styles.optionCard,
          selectedPlan === plan.value && styles.selectedOption
        ]}
        onPress={() => {
          console.log('🔍 CreateProfileScreen: Plan selected:', plan.value);
          setSelectedPlan(plan.value);
        }}
      >
        <Text style={[
          styles.optionTitle,
          selectedPlan === plan.value && styles.selectedOptionText
        ]}>
          {plan.label}
        </Text>
        <Text style={[
          styles.optionDescription,
          selectedPlan === plan.value && styles.selectedOptionText
        ]}>
          {plan.description}
        </Text>
      </TouchableOpacity>
    );
  };

  console.log('🔍 CreateProfileScreen: About to render JSX');

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
      bounces={true}
    >
      {console.log('🔍 CreateProfileScreen: Rendering header')}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create New Buddy</Text>
        <Text style={styles.subtitle}>Let's create your AI companion</Text>
      </View>

      {console.log('🔍 CreateProfileScreen: Rendering form container')}
      <View style={styles.formContainer}>
        {console.log('🔍 CreateProfileScreen: Rendering Buddy Name field')}
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

        {console.log('🔍 CreateProfileScreen: Rendering Personality field')}
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

        {console.log('🔍 CreateProfileScreen: Rendering Special Rules field')}
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

        {console.log('🔍 CreateProfileScreen: Rendering User Role section')}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>User Role</Text>
          <Text style={styles.helperText}>
            Choose the role that best fits your needs. First profile on device becomes Admin automatically.
          </Text>
          <View style={styles.optionsContainer}>
            {console.log('🔍 CreateProfileScreen: Mapping USER_ROLES:', USER_ROLES)}
            {USER_ROLES.map(renderRoleOption)}
          </View>
        </View>

        {console.log('🔍 CreateProfileScreen: Rendering Subscription Plan section')}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Subscription Plan</Text>
          <Text style={styles.helperText}>
            Select a plan that matches your usage requirements.
          </Text>
          <View style={styles.optionsContainer}>
            {console.log('🔍 CreateProfileScreen: Mapping SUBSCRIPTION_PLANS:', SUBSCRIPTION_PLANS)}
            {SUBSCRIPTION_PLANS.map(renderPlanOption)}
          </View>
        </View>

        {console.log('🔍 CreateProfileScreen: Rendering Create Buddy button')}
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
      {console.log('🔍 CreateProfileScreen: JSX render complete')}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
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
  helperText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionCard: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  selectedOptionText: {
    color: '#fff',
  },
});
