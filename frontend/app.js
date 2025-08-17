import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';

function WelcomeScreen() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [buddyName, setBuddyName] = useState('');
  const [buddyPersonality, setBuddyPersonality] = useState('');
  const [buddyRules, setBuddyRules] = useState('');

  const handleCreateProfile = () => {
    setShowCreateForm(true);
  };

  const handleSubmitProfile = () => {
    if (!buddyName.trim() || !buddyPersonality.trim()) {
      Alert.alert('Error', 'Please fill in buddy name and personality');
      return;
    }

    Alert.alert(
      'Success!', 
      `Buddy "${buddyName}" created successfully!\n\nPersonality: ${buddyPersonality}\nRules: ${buddyRules || 'None'}`,
      [
        { text: 'OK', onPress: () => {
          setShowCreateForm(false);
          setBuddyName('');
          setBuddyPersonality('');
          setBuddyRules('');
        }}
      ]
    );
  };

  const handleBack = () => {
    setShowCreateForm(false);
    setBuddyName('');
    setBuddyPersonality('');
    setBuddyRules('');
  };

  const handleSelectProfile = () => {
    Alert.alert('Select Profile', 'Profile selection functionality coming soon!');
  };

  if (showCreateForm) {
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
            style={styles.button}
            onPress={handleSubmitProfile}
          >
            <Text style={styles.buttonText}>Create Buddy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MyBuddy</Text>
        <Text style={styles.subtitle}>Which buddy should we proceed with?</Text>
      </View>

      <View style={styles.noProfilesContainer}>
        <Text style={styles.noProfilesText}>
          No buddies found. Let's create your first buddy!
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleCreateProfile}
        >
          <Text style={styles.buttonText}>Create New Buddy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleSelectProfile}
        >
          <Text style={styles.secondaryButtonText}>Select Different Buddy</Text>
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
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
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
    lineHeight: 26,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<WelcomeScreen />);
