import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import SearchHistoryScreen from './dashboard/SearchHistoryScreen';
import SearchScreen from './dashboard/SearchScreen';

interface SearchEntry {
  id: string;
  query: string;
  timestamp: Date;
  clickedResults: string[];
  feedback: 'upvote' | 'downvote' | 'neutral';
}

interface ProfileRules {
  bannedSources: string[];
  preferredTone: 'formal' | 'casual' | 'friendly' | 'professional' | 'educational';
  preferredStyle: 'concise' | 'detailed' | 'conversational' | 'technical';
  allowedDomains: string[];
  contentFilters: string[];
}

interface Profile {
  id: string;
  email: string;
  name: string;
  pin: string;
  role: 'Admin' | 'Standard Plus' | 'Standard' | 'Child' | 'Guest';
  isAdmin: boolean;
  createdAt: Date;
  searchHistory: SearchEntry[];
  rules: ProfileRules;
  llmContext: string;
  shortTermMemory: string[];
  longTermMemory: string[];
}

const ROLE_DESCRIPTIONS = {
  Admin: 'Full access to create profiles, assign roles, and manage system',
  'Standard Plus': 'Premium user with enhanced LLM responses and extended memory',
  Standard: 'Regular user with personalized LLM responses based on search history',
  Child: 'Child-safe mode with restricted content and simplified responses',
  Guest: 'Limited access with basic LLM responses'
};

const DEFAULT_RULES: ProfileRules = {
  bannedSources: [],
  preferredTone: 'friendly',
  preferredStyle: 'conversational',
  allowedDomains: ['*'],
  contentFilters: []
};

function WelcomeScreen() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState<string | null>(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [showProfileManagement, setShowProfileManagement] = useState(false);
  const [showPinVerification, setShowPinVerification] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [email, setEmail] = useState('');
  const [buddyName, setBuddyName] = useState('');
  const [pin, setPin] = useState('');
  const [selectedRole, setSelectedRole] = useState<'Admin' | 'Standard Plus' | 'Standard' | 'Child' | 'Guest'>('Standard');
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
                const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'search' | 'searchHistory' | 'resetLearning'>('dashboard');

  // Helper functions
  const getRoleSpecificRules = (role: string): Partial<ProfileRules> => {
    switch (role) {
      case 'Admin':
        return {
          preferredTone: 'professional',
          preferredStyle: 'detailed',
          allowedDomains: ['*'],
          contentFilters: []
        };
      case 'Standard Plus':
        return {
          preferredTone: 'friendly',
          preferredStyle: 'detailed',
          allowedDomains: ['*'],
          contentFilters: []
        };
      case 'Child':
        return {
          preferredTone: 'educational',
          preferredStyle: 'detailed',
          contentFilters: ['adult', 'violence', 'inappropriate'],
          allowedDomains: ['*.edu', '*.org', 'wikipedia.org', 'khanacademy.org']
        };
      case 'Guest':
        return {
          preferredTone: 'formal',
          preferredStyle: 'concise',
          allowedDomains: ['*']
        };
      case 'Standard':
        return {
          preferredTone: 'friendly',
          preferredStyle: 'conversational',
          allowedDomains: ['*']
        };
      default:
        return {};
    }
  };

  const safeFormatDate = (dateValue: any): string => {
    try {
      if (!dateValue) return 'Never';
      
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const generateInitialLLMContext = (role: string, name: string): string => {
    switch (role) {
      case 'Admin':
        return `You are ${name}, the system administrator. You have full access to manage profiles, assign roles, and oversee the entire system. You can create new profiles and assign roles like Standard Plus, Standard, Child, or Guest.`;
      case 'Standard Plus':
        return `You are ${name}, a premium user with enhanced LLM responses and extended memory capabilities. Your responses are more detailed and you have access to advanced features.`;
      case 'Standard':
        return `You are ${name}, a standard user. You have access to personalized AI responses based on your search history and preferences. Your responses will adapt and improve over time as you interact with the system.`;
      case 'Child':
        return `You are ${name}, a child user. You are in child-safe mode with age-appropriate content filtering. Your responses are simplified, educational, and safe for young users.`;
      case 'Guest':
        return `You are ${name}, a guest user. You have limited access to basic AI responses. Your interactions are logged but not personalized.`;
      default:
        return `You are ${name}, a user of the MyBuddy system.`;
    }
  };

  // System integrity check - ensure there's always at least one admin
  const ensureAdminExists = () => {
    const adminProfiles = profiles.filter(p => p.isAdmin);
    if (adminProfiles.length === 0) {
      if (profiles.length > 0) {
        const firstProfile = profiles[0];
        const updatedProfile = {
          ...firstProfile,
          role: 'Admin' as const,
          isAdmin: true,
          rules: { ...firstProfile.rules, ...getRoleSpecificRules('Admin') },
          llmContext: generateInitialLLMContext('Admin', firstProfile.name)
        };
        
        const updatedProfiles = profiles.map(p => p.id === firstProfile.id ? updatedProfile : p);
        localStorage.setItem('mybuddy-profiles', JSON.stringify(updatedProfiles));
        setProfiles(updatedProfiles);
        
        if (activeProfile && activeProfile.id === firstProfile.id) {
          setActiveProfile(updatedProfile);
          localStorage.setItem('mybuddy-active-profile', JSON.stringify(updatedProfile));
        }
        
        alert(`Emergency: No admin profile found. ${firstProfile.name} has been automatically promoted to Admin role to maintain system integrity.`);
      }
    }
  };

  // Load profiles from localStorage on component mount
  useEffect(() => {
    const savedProfiles = localStorage.getItem('mybuddy-profiles');
    if (savedProfiles) {
      try {
        const parsedProfiles = JSON.parse(savedProfiles);
        const hydratedProfiles = parsedProfiles.map((p: any) => ({
          ...p,
          createdAt: p.createdAt ? (() => {
            try {
              const date = new Date(p.createdAt);
              return !isNaN(date.getTime()) ? date : new Date();
            } catch {
              return new Date();
            }
          })() : new Date(),
          searchHistory: (p.searchHistory || []).map((entry: any) => ({
            ...entry,
            timestamp: (() => {
              try {
                if (entry.timestamp) {
                  const date = new Date(entry.timestamp);
                  return !isNaN(date.getTime()) ? date : new Date();
                }
                return new Date();
              } catch {
                return new Date();
              }
            })()
          })),
          rules: { ...DEFAULT_RULES, ...(p.rules || {}) },
          llmContext: p.llmContext || generateInitialLLMContext(p.role, p.name),
          shortTermMemory: p.shortTermMemory || [],
          longTermMemory: p.longTermMemory || []
        }));
        setProfiles(hydratedProfiles);
        ensureAdminExists();
      } catch (error) {
        console.error('Error loading profiles:', error);
      }
    }

    const savedActiveProfile = localStorage.getItem('mybuddy-active-profile');
    if (savedActiveProfile) {
      try {
        const parsedActiveProfile = JSON.parse(savedActiveProfile);
        if (parsedActiveProfile.createdAt) {
          try {
            const date = new Date(parsedActiveProfile.createdAt);
            parsedActiveProfile.createdAt = !isNaN(date.getTime()) ? date : new Date();
          } catch {
            parsedActiveProfile.createdAt = new Date();
          }
        }
        
        if (parsedActiveProfile.searchHistory) {
          parsedActiveProfile.searchHistory = parsedActiveProfile.searchHistory.map((entry: any) => ({
            ...entry,
            timestamp: (() => {
              try {
                if (entry.timestamp) {
                  const date = new Date(entry.timestamp);
                  return !isNaN(date.getTime()) ? date : new Date();
                }
                return new Date();
              } catch {
                return new Date();
              }
            })()
          }));
        }
        
        setActiveProfile(parsedActiveProfile);
      } catch (error) {
        console.error('Error loading active profile:', error);
      }
    }
  }, []);

  // Event handlers
  const handleCreateProfile = () => {
    setShowCreateForm(true);
  };

  const handleSubmitProfile = () => {
    if (!email.trim() || !buddyName.trim() || !pin.trim()) {
      alert('Please fill in email, buddy name, and 4-digit PIN');
      return;
    }

    if (pin.length !== 4) {
      alert('PIN must be exactly 4 digits');
      return;
    }

    const existingProfile = profiles.find(profile => profile.email.toLowerCase() === email.toLowerCase());
    if (existingProfile) {
      alert(`A profile already exists for email: ${email}`);
      return;
    }

    const isFirstProfile = profiles.length === 0;
    const isAdmin = isFirstProfile;
    const role = isAdmin ? 'Admin' : selectedRole;

    const newProfile: Profile = {
      id: Date.now().toString(),
      email: email.trim(),
      name: buddyName.trim(),
      pin: pin.trim(),
      role: role,
      isAdmin: isAdmin,
      createdAt: new Date(),
      searchHistory: [],
      rules: { ...DEFAULT_RULES, ...getRoleSpecificRules(role) },
      llmContext: generateInitialLLMContext(role, buddyName.trim()),
      shortTermMemory: [],
      longTermMemory: []
    };

    const updatedProfiles = [...profiles, newProfile];
    localStorage.setItem('mybuddy-profiles', JSON.stringify(updatedProfiles));
    setProfiles(updatedProfiles);

    const roleText = isAdmin ? 'Admin' : role;
    alert(`Buddy "${buddyName}" created successfully for ${email}!\n\nRole: ${roleText}${isAdmin ? ' (First profile is automatically admin)' : ''}\n\nMemory system initialized with role-specific rules and context.`);
    
    setShowCreateForm(false);
    setEmail('');
    setBuddyName('');
    setPin('');
    setSelectedRole('Standard');
  };

  const handleBack = () => {
    setShowCreateForm(false);
    setShowProfileDetails(null);
    setShowProfileSelector(false);
    setShowProfileManagement(false);
    setEmail('');
    setBuddyName('');
    setPin('');
    setSelectedRole('Standard');
  };

  const handleSelectProfile = () => {
    if (profiles.length === 0) {
      alert('No profiles found. Please create a profile first.');
      return;
    }
    setShowProfileSelector(true);
  };

  const handleSwitchToProfile = (profileId: string) => {
    setShowProfileSelector(false);
    setShowPinVerification(profileId);
    setPinInput('');
  };

  const handlePinVerification = () => {
    if (!showPinVerification) return;
    
    const profile = profiles.find(p => p.id === showPinVerification);
    if (!profile) return;

    if (pinInput === profile.pin) {
      setActiveProfile(profile);
      localStorage.setItem('mybuddy-active-profile', JSON.stringify(profile));
      setShowPinVerification(null);
      setPinInput('');
    } else {
      alert('Incorrect PIN. Please try again.');
      setPinInput('');
    }
  };

  const handleForgotPin = () => {
    if (!showPinVerification) return;
    
    const profile = profiles.find(p => p.id === showPinVerification);
    if (!profile) return;

    alert(`PIN Reset for ${profile.name}:\n\nYour PIN is: ${profile.pin}\n\nIn a production app, this would be sent to: ${profile.email}`);
  };

  const handleBackToMain = () => {
    setActiveProfile(null);
    setCurrentScreen('dashboard');
    setShowProfileManagement(false);
    setShowProfileDetails(null);
    setShowProfileSelector(false);
    localStorage.removeItem('mybuddy-active-profile');
  };

  const handleUpdateProfile = (updatedProfile: Profile) => {
    const updatedProfiles = profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p);
    localStorage.setItem('mybuddy-profiles', JSON.stringify(updatedProfiles));
    setProfiles(updatedProfiles);
    setActiveProfile(updatedProfile);
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const handleDeleteProfile = (profileId: string) => {
    const profileToDelete = profiles.find(p => p.id === profileId);
    if (!profileToDelete) return;

    if (profileToDelete.isAdmin) {
      const adminCount = profiles.filter(p => p.isAdmin).length;
      if (adminCount <= 1) {
        alert('Cannot delete the last admin profile. The system requires at least one admin to manage all profiles and rules.');
        return;
      }
    }

    if (confirm(`Are you sure you want to delete ${profileToDelete.name}'s profile? This action cannot be undone.`)) {
      const updatedProfiles = profiles.filter(p => p.id !== profileId);
      localStorage.setItem('mybuddy-profiles', JSON.stringify(updatedProfiles));
      setProfiles(updatedProfiles);
      
      if (activeProfile && activeProfile.id === profileId) {
        setActiveProfile(null);
        setCurrentScreen('dashboard');
        localStorage.removeItem('mybuddy-active-profile');
      }
      
      alert('Profile deleted successfully!');
    }
  };

  const handleRoleChange = (role: 'Admin' | 'Standard Plus' | 'Standard' | 'Child' | 'Guest') => {
    setSelectedRole(role);
  };

  const handleProfileDetails = (profileId: string) => {
    console.log('handleProfileDetails called with profileId:', profileId);
    const newValue = showProfileDetails === profileId ? null : profileId;
    setShowProfileDetails(newValue);
  };

  const handleResetMemory = (profileId: string, memoryType: 'search' | 'shortTerm' | 'longTerm' | 'all') => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    let message = '';
    const updatedProfile = { ...profile };

    switch (memoryType) {
      case 'search':
        updatedProfile.searchHistory = [];
        message = 'Search history cleared';
        break;
      case 'shortTerm':
        updatedProfile.shortTermMemory = [];
        message = 'Short-term memory cleared';
        break;
      case 'longTerm':
        updatedProfile.longTermMemory = [];
        message = 'Long-term memory cleared';
        break;
      case 'all':
        updatedProfile.searchHistory = [];
        updatedProfile.shortTermMemory = [];
        updatedProfile.longTermMemory = [];
        message = 'All memory data cleared (personality preserved)';
        break;
    }

    const updatedProfiles = profiles.map(p => p.id === profileId ? updatedProfile : p);
    localStorage.setItem('mybuddy-profiles', JSON.stringify(updatedProfiles));
    setProfiles(updatedProfiles);
    
    if (activeProfile && activeProfile.id === profileId) {
      setActiveProfile(updatedProfile);
      localStorage.setItem('mybuddy-active-profile', JSON.stringify(updatedProfile));
    }
    
    alert(`${message} for ${profile.name}!`);
  };

  const handleAddSearchEntry = (profileId: string) => {
    const query = prompt('Enter search query:');
    if (!query) return;

    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    const newEntry: SearchEntry = {
      id: Date.now().toString(),
      query: query,
      timestamp: new Date(),
      clickedResults: [],
      feedback: 'neutral'
    };

    const updatedProfile = {
      ...profile,
      searchHistory: [...profile.searchHistory, newEntry]
    };

    const updatedProfiles = profiles.map(p => p.id === profileId ? updatedProfile : p);
    localStorage.setItem('mybuddy-profiles', JSON.stringify(updatedProfiles));
    setProfiles(updatedProfiles);
    
    if (activeProfile && activeProfile.id === profileId) {
      setActiveProfile(updatedProfile);
      localStorage.setItem('mybuddy-active-profile', JSON.stringify(updatedProfile));
    }
    
    alert(`Search entry added for ${profile.name}: "${query}"`);
  };

  const handleAddSampleData = () => {
    if (!activeProfile) return;
    
    const sampleQueries = [
      'How to learn React Native?',
      'Best practices for TypeScript',
      'Spring Boot Kotlin tutorial',
      'Monorepo architecture benefits',
      'AI and machine learning basics'
    ];
    
    const sampleEntries: SearchEntry[] = sampleQueries.map((query, index) => ({
      id: `sample-${Date.now()}-${index}`,
      query,
      timestamp: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)),
      clickedResults: [`Sample result ${index + 1}`],
      feedback: ['upvote', 'downvote', 'neutral'][Math.floor(Math.random() * 3)] as 'upvote' | 'downvote' | 'neutral'
    }));
    
    const sampleShortTerm = [
      'User prefers detailed explanations',
      'Recent conversation about programming'
    ];
    
    const sampleLongTerm = [
      'User is a developer',
      'Interested in AI and ML'
    ];
    
    const updatedProfile = {
      ...activeProfile,
      searchHistory: [...activeProfile.searchHistory, ...sampleEntries],
      shortTermMemory: [...activeProfile.shortTermMemory, ...sampleShortTerm],
      longTermMemory: [...activeProfile.longTermMemory, ...sampleLongTerm]
    };
    
    const updatedProfiles = profiles.map(p => p.id === activeProfile.id ? updatedProfile : p);
    setProfiles(updatedProfiles);
    setActiveProfile(updatedProfile);
    localStorage.setItem('mybuddy-profiles', JSON.stringify(updatedProfiles));
    localStorage.setItem('mybuddy-active-profile', JSON.stringify(updatedProfile));
    
    alert(`Added sample data for ${activeProfile.name}! Check the History and Reset Learning screens.`);
  };

  const handlePromoteToAdmin = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    if (profile.isAdmin) {
      alert('This profile is already an admin.');
      return;
    }

    if (confirm(`Are you sure you want to promote ${profile.name} to Admin role?\n\nThis will give them full system access and management capabilities.`)) {
      const updatedProfile = {
        ...profile,
        role: 'Admin' as const,
        isAdmin: true,
        rules: { ...profile.rules, ...getRoleSpecificRules('Admin') },
        llmContext: generateInitialLLMContext('Admin', profile.name)
      };

      const updatedProfiles = profiles.map(p => p.id === profileId ? updatedProfile : p);
      localStorage.setItem('mybuddy-profiles', JSON.stringify(updatedProfiles));
      setProfiles(updatedProfiles);
      
      if (activeProfile && activeProfile.id === profileId) {
        setActiveProfile(updatedProfile);
        localStorage.setItem('mybuddy-active-profile', JSON.stringify(updatedProfile));
      }
      
      alert(`${profile.name} has been promoted to Admin role!`);
    }
  };

  // Render different screens based on currentScreen state
  if (showCreateForm) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create New Buddy</Text>
          <Text style={styles.subtitle}>
            {profiles.length === 0 
              ? 'First profile will be automatically assigned as Admin' 
              : 'Admin can create profiles and assign roles for LLM personalization'
            }
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@example.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Buddy Name *</Text>
            <TextInput
              style={styles.input}
              value={buddyName}
              onChangeText={setBuddyName}
              placeholder="e.g., Alex, Sam, or Luna"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>4-Digit PIN *</Text>
            <Text style={styles.pinDescription}>
              Create a 4-digit PIN to secure your profile. You'll need this to access your profile.
            </Text>
            <TextInput
              style={styles.input}
              value={pin}
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9]/g, '');
                if (numericText.length <= 4) {
                  setPin(numericText);
                }
              }}
              placeholder="1234"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry={true}
            />
          </View>

          {profiles.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Role Assignment *</Text>
              <Text style={styles.roleDescription}>
                {ROLE_DESCRIPTIONS[selectedRole]}
              </Text>
              <View style={styles.roleButtons}>
                {(['Admin', 'Standard Plus', 'Standard', 'Child', 'Guest'] as const).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      selectedRole === role && styles.roleButtonSelected
                    ]}
                    onPress={() => handleRoleChange(role)}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      selectedRole === role && styles.roleButtonTextSelected
                    ]}>
                      {role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSubmitProfile}
          >
            <Text style={styles.buttonText}>Create Buddy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Check for PIN verification screen
  if (showPinVerification) {
    const profile = profiles.find(p => p.id === showPinVerification);
    if (!profile) {
      setShowPinVerification(null);
      return null;
    }
    
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setShowPinVerification(null)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>PIN Verification</Text>
          <Text style={styles.subtitle}>Enter your 4-digit PIN to access {profile.name}'s profile</Text>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>4-Digit PIN</Text>
            <Text style={styles.pinDescription}>
              Enter the PIN you created for {profile.name}'s profile
            </Text>
            <TextInput
              style={styles.input}
              value={pinInput}
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9]/g, '');
                if (numericText.length <= 4) {
                  setPinInput(numericText);
                }
              }}
              placeholder="1234"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry={true}
              autoFocus={true}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handlePinVerification}
          >
            <Text style={styles.buttonText}>Access Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleForgotPin}
          >
            <Text style={styles.secondaryButtonText}>Forgot PIN?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Check for Profile Details
  if (showProfileDetails) {
    const profile = profiles.find(p => p.id === showProfileDetails);
    if (!profile) {
      return null;
    }

    const handleBackFromDetails = () => {
      setShowProfileDetails(null);
      setShowProfileManagement(true);
    };

    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackFromDetails}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{profile.name}'s Profile</Text>
          <Text style={styles.subtitle}>Memory Management & Settings</Text>
        </View>

        <View style={styles.profileDetailsContainer}>
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <Text style={styles.detailText}>Email: {profile.email}</Text>
            <Text style={styles.detailText}>Role: {profile.role} {profile.isAdmin && '[ADMIN]'}</Text>
            <Text style={styles.detailText}>Created: {safeFormatDate(profile.createdAt)}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Memory Statistics</Text>
            <Text style={styles.detailText}>Search History: {profile.searchHistory.length} entries</Text>
            <Text style={styles.detailText}>Short-term Memory: {profile.shortTermMemory.length} items</Text>
            <Text style={styles.detailText}>Long-term Memory: {profile.longTermMemory.length} items</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Rules & Preferences</Text>
            <Text style={styles.detailText}>Tone: {profile.rules.preferredTone}</Text>
            <Text style={styles.detailText}>Style: {profile.rules.preferredStyle}</Text>
            <Text style={styles.detailText}>Banned Sources: {profile.rules.bannedSources.length}</Text>
            <Text style={styles.detailText}>Content Filters: {profile.rules.contentFilters.length}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Memory Management</Text>
            <View style={styles.memoryButtons}>
              <TouchableOpacity
                style={[styles.memoryButton, styles.warningButton]}
                onPress={() => handleResetMemory(profile.id, 'search')}
              >
                <Text style={styles.memoryButtonText}>Clear Search History</Text>
              </TouchableOpacity>
               
              <TouchableOpacity
                style={[styles.memoryButton, styles.warningButton]}
                onPress={() => handleResetMemory(profile.id, 'shortTerm')}
              >
                <Text style={styles.memoryButtonText}>Clear Short-term Memory</Text>
              </TouchableOpacity>
               
              <TouchableOpacity
                style={[styles.memoryButton, styles.warningButton]}
                onPress={() => handleResetMemory(profile.id, 'longTerm')}
              >
                <Text style={styles.memoryButtonText}>Clear Long-term Memory</Text>
              </TouchableOpacity>
               
              <TouchableOpacity
                style={[styles.memoryButton, styles.dangerButton]}
                onPress={() => {
                  if (confirm('This will reset ALL memory and context to default. Are you sure?')) {
                    handleResetMemory(profile.id, 'all');
                  }
                }}
              >
                <Text style={styles.memoryButtonText}>Reset All Memory</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Add Test Data</Text>
            <TouchableOpacity
              style={[styles.memoryButton, styles.primaryButton]}
              onPress={() => handleAddSearchEntry(profile.id)}
            >
              <Text style={styles.memoryButtonText}>Add Search Entry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Check for Profile Management
  if (showProfileManagement) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => setShowProfileManagement(false)}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Profile Management</Text>
          <Text style={styles.subtitle}>Admin-only: Manage all profiles and system settings</Text>
        </View>

        <View style={styles.profileManagementContainer}>
          {profiles.filter(p => p.isAdmin).length === 1 && (
            <View style={styles.adminWarning}>
              <Text style={styles.adminWarningText}>⚠️ System Alert: Only one admin profile exists</Text>
              <Text style={styles.adminWarningSubtext}>
                The system requires at least one admin to manage all profiles. Consider creating additional admin profiles for redundancy.
              </Text>
            </View>
          )}

          <Text style={styles.profilesSubtitle}>All Profiles:</Text>
          {profiles.map((profile) => (
            <View key={profile.id} style={styles.profileCard}>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {profile.name} {profile.isAdmin && <Text style={styles.adminBadge}>[ADMIN]</Text>}
                </Text>
                <Text style={styles.profileEmail}>{profile.email}</Text>
                <Text style={styles.profileRole}>Role: {profile.role}</Text>
                <Text style={styles.profileContext}>
                  LLM Context: {profile.llmContext || 'Not set'}
                </Text>
                <Text style={styles.profileMemory}>
                  Memory: {profile.searchHistory.length} searches, {profile.shortTermMemory.length} short-term, {profile.longTermMemory.length} long-term
                </Text>
              </View>
              <View style={styles.profileActions}>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => {
                    setShowProfileDetails(profile.id);
                    setShowProfileManagement(false);
                  }}
                >
                  <Text style={styles.detailsButtonText}>Details</Text>
                </TouchableOpacity>
                {!profile.isAdmin && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteProfile(profile.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          <View style={styles.systemActions}>
            <Text style={styles.sectionTitle}>System Actions</Text>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleCreateProfile}
            >
              <Text style={styles.buttonText}>➕ Create New Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={() => {
                if (confirm(`⚠️ DANGER: This will delete ALL profiles including admin profiles!\n\nThis action cannot be undone and will completely reset the system.\n\nAre you absolutely sure you want to continue?`)) {
                  if (confirm(`FINAL WARNING: You are about to delete ${profiles.length} profile(s) including ${profiles.filter(p => p.isAdmin).length} admin profile(s).\n\nThis will:\n• Remove all user data\n• Clear all search history\n• Reset all memory and learning\n• Return to initial setup\n\nType "DELETE ALL" to confirm:`)) {
                    const userInput = prompt('Type "DELETE ALL" to confirm deletion of all profiles:');
                    if (userInput === 'DELETE ALL') {
                      localStorage.removeItem('mybuddy-profiles');
                      localStorage.removeItem('mybuddy-active-profile');
                      
                      setProfiles([]);
                      setActiveProfile(null);
                      setCurrentScreen('dashboard');
                      setShowProfileManagement(false);
                      setShowProfileDetails(null);
                      setShowProfileSelector(false);
                      setShowPinVerification(null);
                      
                      alert('All profiles have been deleted. The system has been reset to initial state.');
                    } else {
                      alert('Deletion cancelled. No profiles were deleted.');
                    }
                  }
                }
              }}
            >
              <Text style={styles.buttonText}>🗑️ Delete All Profiles</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

                // Check for search screen first (before dashboard)
              if (currentScreen === 'search' && activeProfile) {
                return (
                  <SearchScreen
                    profile={activeProfile}
                    onBack={handleBackToDashboard}
                    onUpdateProfile={handleUpdateProfile}
                  />
                );
              }

              // Check for search history screen
              if (currentScreen === 'searchHistory' && activeProfile) {
                return (
                  <SearchHistoryScreen
                    profile={activeProfile}
                    onBack={handleBackToDashboard}
                    onUpdateProfile={handleUpdateProfile}
                  />
                );
              }

              // Check for activeProfile to render dashboard
              if (activeProfile) {
                return (
                  <ScrollView style={styles.container}>
                    <View style={styles.header}>
                      <TouchableOpacity style={styles.backButton} onPress={handleBackToMain}>
                        <Text style={styles.backButtonText}>← Back to Main</Text>
                      </TouchableOpacity>
                      <Text style={styles.title}>Hi {activeProfile.name}! 👋</Text>
                      <Text style={styles.subtitle}>What would you like to do today?</Text>
                    </View>

                    <View style={styles.dashboardContainer}>
                      <View style={styles.dashboardSection}>
                        <Text style={styles.sectionTitle}>Quick Stats</Text>
                        <View style={styles.statsGrid}>
                          <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{activeProfile.searchHistory.length}</Text>
                            <Text style={styles.statLabel}>Searches</Text>
                          </View>
                          <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{activeProfile.shortTermMemory.length}</Text>
                            <Text style={styles.statLabel}>Short-term</Text>
                          </View>
                          <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{activeProfile.longTermMemory.length}</Text>
                            <Text style={styles.statLabel}>Long-term</Text>
                          </View>
                          <View style={styles.statCard}>
                            <Text style={styles.statNumber}>
                              {activeProfile.searchHistory.length > 0 
                                ? safeFormatDate(activeProfile.searchHistory[activeProfile.searchHistory.length - 1].timestamp)
                                : 'Never'
                              }
                            </Text>
                            <Text style={styles.statLabel}>Last Activity</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.dashboardSection}>
                        <Text style={styles.sectionTitle}>What would you like to do?</Text>
                        <View style={styles.dashboardButtons}>
                          <TouchableOpacity
                            style={[styles.dashboardButton, styles.primaryButton]}
                            onPress={() => {
                              setCurrentScreen('search');
                            }}
                          >
                            <Text style={styles.dashboardButtonText}>🔍 Search</Text>
                            <Text style={styles.dashboardButtonSubtext}>Perplexity-style search with profile rules</Text>
                          </TouchableOpacity>
                           
                          <TouchableOpacity
                            style={[styles.dashboardButton, styles.secondaryButton]}
                            onPress={() => {
                              alert(`💬 Chat functionality coming soon for ${activeProfile.name}!\n\nThis will open a conversational interface with profile-specific LLM context and memory.`);
                            }}
                          >
                            <Text style={[styles.dashboardButtonText, { color: '#007AFF' }]}>💬 Chat</Text>
                            <Text style={[styles.dashboardButtonSubtext, styles.secondaryButtonSubtext]}>Conversational AI with profile context</Text>
                          </TouchableOpacity>
                            
                          <TouchableOpacity
                            style={[styles.dashboardButton, styles.secondaryButton]}
                            onPress={() => {
                              alert(`🎮 Game functionality coming soon for ${activeProfile.name}!\n\nThis will open a mini-game or fun interaction.`);
                            }}
                          >
                            <Text style={[styles.dashboardButtonText, { color: '#007AFF' }]}>🎮 Play Game</Text>
                            <Text style={[styles.dashboardButtonSubtext, styles.secondaryButtonSubtext]}>Mini-game or fun interaction</Text>
                          </TouchableOpacity>
                           
                          <TouchableOpacity
                            style={[styles.dashboardButton, styles.secondaryButton]}
                            onPress={() => {
                              setCurrentScreen('searchHistory');
                            }}
                          >
                            <Text style={[styles.dashboardButtonText, { color: '#007AFF' }]}>🗂 View History</Text>
                            <Text style={[styles.dashboardButtonSubtext, styles.secondaryButtonSubtext]}>Search history and learning progress</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.dashboardSection}>
                        <Text style={styles.sectionTitle}>Profile Information</Text>
                        <View style={styles.profileInfoCard}>
                          <Text style={styles.profileInfoText}>
                            <Text style={styles.profileInfoLabel}>Role:</Text> {activeProfile.role} {activeProfile.isAdmin && <Text style={styles.adminBadge}>[ADMIN]</Text>}
                          </Text>
                          <Text style={styles.profileInfoText}>
                            <Text style={styles.profileInfoLabel}>Email:</Text> {activeProfile.email}
                          </Text>
                          <Text style={styles.profileInfoText}>
                            <Text style={styles.profileInfoLabel}>Created:</Text> {safeFormatDate(activeProfile.createdAt)}
                          </Text>
                          <Text style={styles.profileInfoText}>
                            <Text style={styles.profileInfoLabel}>LLM Context:</Text> {activeProfile.llmContext || 'Not set'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.dashboardSection}>
                        <Text style={styles.sectionTitle}>Profile Management</Text>
                        <View style={styles.dashboardButtons}>
                          <TouchableOpacity
                            style={[styles.dashboardButton, styles.infoButton]}
                            onPress={() => handleProfileDetails(activeProfile.id)}
                          >
                            <Text style={styles.dashboardButtonText}>⚙️ Settings & Details</Text>
                            <Text style={styles.dashboardButtonSubtext}>View and manage profile settings</Text>
                          </TouchableOpacity>
                           
                          {activeProfile.isAdmin && (
                            <TouchableOpacity
                              style={[styles.dashboardButton, styles.adminButton]}
                              onPress={() => {
                                setShowProfileManagement(true);
                              }}
                            >
                              <Text style={styles.dashboardButtonText}>🔧 Manage Profiles</Text>
                              <Text style={styles.dashboardButtonSubtext}>Manage all profiles and system rules</Text>
                            </TouchableOpacity>
                          )}
                           
                          <TouchableOpacity
                            style={[styles.dashboardButton, styles.infoButton]}
                            onPress={handleAddSampleData}
                          >
                            <Text style={styles.dashboardButtonText}>📊 Add Sample Data</Text>
                            <Text style={styles.dashboardButtonSubtext}>Add test data for History & Reset screens</Text>
                          </TouchableOpacity>
                           
                          <TouchableOpacity
                            style={[styles.dashboardButton, styles.dangerButton]}
                            onPress={() => {
                              if (confirm('This will reset ALL memory data but preserve your buddy\'s personality. Are you sure?')) {
                                handleResetMemory(activeProfile.id, 'all');
                              }
                            }}
                          >
                            <Text style={styles.dashboardButtonText}>🔄 Reset All Memory</Text>
                            <Text style={styles.dashboardButtonSubtext}>Clear all learning but keep personality</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </ScrollView>
                );
              }

  // Check for profile selector
  if (showProfileSelector) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => setShowProfileSelector(false)}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Select Profile</Text>
          <Text style={styles.subtitle}>Choose which buddy to switch to</Text>
        </View>

        <View style={styles.profileSelectorContainer}>
          {profiles.map((profile) => (
            <TouchableOpacity
              key={profile.id}
              style={styles.profileSelectorCard}
              onPress={() => handleSwitchToProfile(profile.id)}
            >
              <View style={styles.profileSelectorInfo}>
                <Text style={styles.profileSelectorName}>
                  {profile.name} {profile.isAdmin && <Text style={styles.adminBadge}>[ADMIN]</Text>}
                </Text>
                <Text style={styles.profileSelectorEmail}>{profile.email}</Text>
                <Text style={styles.profileSelectorRole}>Role: {profile.role}</Text>
                <Text style={styles.profileSelectorContext}>
                  {profile.llmContext || 'No context set'}
                </Text>
                <Text style={styles.profileSelectorMemory}>
                  Memory: {profile.searchHistory.length} searches, {profile.shortTermMemory.length} short-term, {profile.longTermMemory.length} long-term
                </Text>
              </View>
              <View style={styles.profileSelectorActions}>
                <TouchableOpacity
                  style={[styles.switchButton, styles.primaryButton]}
                  onPress={() => handleSwitchToProfile(profile.id)}
                >
                  <Text style={styles.switchButtonText}>Switch To</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => {
                    setShowProfileSelector(false);
                    handleProfileDetails(profile.id);
                  }}
                >
                  <Text style={styles.detailsButtonText}>Details</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }

  

  // Main welcome screen
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MyBuddy</Text>
        <Text style={styles.subtitle}>Role-Based LLM Personalization System</Text>
      </View>

      {profiles.length === 0 ? (
        <View style={styles.noProfilesContainer}>
          <Text style={styles.noProfilesText}>
            No profiles found. Let's create your first buddy (Admin)!
          </Text>
          <Text style={styles.noProfilesSubtext}>
            The first profile automatically becomes Admin and can create additional profiles with specific roles for personalized LLM responses.
          </Text>
        </View>
      ) : (
        <View style={styles.profilesContainer}>
          <Text style={styles.profilesTitle}>Welcome Screen</Text>
          
          {profiles.some(p => p.isAdmin) && profiles.filter(p => p.isAdmin).length === 1 && (
            <View style={styles.adminWarning}>
              <Text style={styles.adminWarningText}>⚠️ System Alert: Only one admin profile exists</Text>
              <Text style={styles.adminWarningSubtext}>
                The system requires at least one admin to manage all profiles. Consider creating additional admin profiles for redundancy.
              </Text>
            </View>
          )}
          
          <View style={styles.profileSummary}>
            <Text style={styles.profileSummaryText}>
              {profiles.length} profile{profiles.length !== 1 ? 's' : ''} configured
            </Text>
            <Text style={styles.profileSummarySubtext}>
              {profiles.filter(p => p.isAdmin).length} admin{profiles.filter(p => p.isAdmin).length !== 1 ? 's' : ''} • {profiles.filter(p => !p.isAdmin).length} user{profiles.filter(p => !p.isAdmin).length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.actionsContainer}>
        {profiles.length === 0 ? (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleCreateProfile}
          >
            <Text style={styles.buttonText}>Create New Buddy</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleSelectProfile}
            >
              <Text style={styles.buttonText}>Access Existing Profile</Text>
            </TouchableOpacity>
            
            {profiles.some(p => p.isAdmin) && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleCreateProfile}
              >
                <Text style={styles.secondaryButtonText}>Create New Profile</Text>
              </TouchableOpacity>
            )}
          </>
        )}
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
    marginBottom: 15,
  },
  noProfilesSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  profilesContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  profilesTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  profilesSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  adminBadge: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  profileRole: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
    marginBottom: 8,
  },
  profileContext: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  profileMemory: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  profileActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  detailsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  profileDetailsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  detailSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  memoryButtons: {
    gap: 12,
  },
  memoryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  warningButton: {
    backgroundColor: '#FF9500',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  memoryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  pinDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  roleButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  roleButtonTextSelected: {
    color: '#fff',
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
  secondaryButtonSubtext: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  profileSelectorContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileSelectorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileSelectorInfo: {
    flex: 1,
    marginBottom: 12,
  },
  profileSelectorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  profileSelectorEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  profileSelectorRole: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
    marginBottom: 8,
  },
  profileSelectorContext: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  profileSelectorMemory: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  profileSelectorActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  switchButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dashboardContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  dashboardSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dashboardButtons: {
    gap: 12,
  },
  dashboardButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  dashboardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileInfoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  profileInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  profileInfoLabel: {
    fontWeight: '600',
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    minWidth: '45%',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  dashboardButtonSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  infoButton: {
    backgroundColor: '#5AC8FA',
  },
  adminButton: {
    backgroundColor: '#007AFF',
  },
  adminWarning: {
    backgroundColor: '#FFE082',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  adminWarningText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  adminWarningSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  profileSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  profileSummaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  profileSummarySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  profileManagementContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  systemActions: {
    marginTop: 20,
  },
});

// Mount the component to the DOM
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<WelcomeScreen />);
}
