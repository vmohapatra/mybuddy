import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';

interface ResetLearningScreenProps {
  profile: any;
  onBack: () => void;
  onUpdateProfile: (updatedProfile: any) => void;
}

export default function ResetLearningScreen({ profile, onBack, onUpdateProfile }: ResetLearningScreenProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMemoryTypes, setSelectedMemoryTypes] = useState<string[]>([]);

  const memoryTypes = [
    { key: 'search', label: 'Search History', icon: '🔍', description: 'All search queries and results' },
    { key: 'shortTerm', label: 'Short-term Memory', icon: '🧠', description: 'Recent conversations and context' },
    { key: 'longTerm', label: 'Long-term Memory', icon: '💾', description: 'Persistent learning and preferences' },
    { key: 'llmContext', label: 'LLM Context', icon: '🤖', description: 'AI personality and role settings' }
  ];

  const toggleMemoryType = (type: string) => {
    setSelectedMemoryTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handlePartialReset = () => {
    if (selectedMemoryTypes.length === 0) {
      alert('Error: Please select at least one memory type to reset.');
      return;
    }

    if (!startDate && !endDate) {
      alert('Error: Please select at least one date for partial reset.');
      return;
    }

    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    let resetSummary = [];
    const updatedProfile = { ...profile };

    // Reset search history by date range
    if (selectedMemoryTypes.includes('search')) {
      const originalCount = profile.searchHistory.length;
      updatedProfile.searchHistory = profile.searchHistory.filter((entry: any) => {
        const entryDate = new Date(entry.timestamp);
        return !(entryDate >= start && entryDate <= end);
      });
      const deletedCount = originalCount - updatedProfile.searchHistory.length;
      if (deletedCount > 0) {
        resetSummary.push(`Search History: ${deletedCount} entries deleted`);
      }
    }

    // Reset short-term memory by date range
    if (selectedMemoryTypes.includes('shortTerm')) {
      const originalCount = profile.shortTermMemory.length;
      updatedProfile.shortTermMemory = profile.shortTermMemory.filter((entry: any) => {
        // For short-term memory, we'll assume entries have timestamps
        // If not, we'll clear all
        if (entry.timestamp) {
          const entryDate = new Date(entry.timestamp);
          return !(entryDate >= start && entryDate <= end);
        }
        return false; // Clear all if no timestamp
      });
      const deletedCount = originalCount - updatedProfile.shortTermMemory.length;
      if (deletedCount > 0) {
        resetSummary.push(`Short-term Memory: ${deletedCount} items deleted`);
      }
    }

    // Reset long-term memory by date range
    if (selectedMemoryTypes.includes('longTerm')) {
      const originalCount = profile.longTermMemory.length;
      updatedProfile.longTermMemory = profile.longTermMemory.filter((entry: any) => {
        if (entry.timestamp) {
          const entryDate = new Date(entry.timestamp);
          return !(entryDate >= start && entryDate <= end);
        }
        return false;
      });
      const deletedCount = originalCount - updatedProfile.longTermMemory.length;
      if (deletedCount > 0) {
        resetSummary.push(`Long-term Memory: ${deletedCount} items deleted`);
      }
    }

    // Reset LLM context (this is a full reset, not date-based)
    if (selectedMemoryTypes.includes('llmContext')) {
      updatedProfile.llmContext = generateInitialLLMContext(profile.role, profile.name);
      resetSummary.push('LLM Context: Reset to default');
    }

    if (resetSummary.length === 0) {
      alert('No Changes: No data found in the selected date range to reset.');
      return;
    }

    const confirmReset = confirm(
      `Partial Reset Confirmation\n\nAre you sure you want to reset the following?\n\n${resetSummary.join('\n')}\n\nThis action cannot be undone.`
    );

    if (confirmReset) {
      onUpdateProfile(updatedProfile);
      alert(`Partial reset completed!\n\n${resetSummary.join('\n')}`);
      setStartDate('');
      setEndDate('');
      setSelectedMemoryTypes([]);
    }
  };

  const handleFullReset = (memoryType: string) => {
    const typeInfo = memoryTypes.find(t => t.key === memoryType);
    
    const confirmReset = confirm(
      `Reset ${typeInfo?.label}\n\nAre you sure you want to completely reset ${typeInfo?.label.toLowerCase()}? This action cannot be undone.`
    );

    if (confirmReset) {
      const updatedProfile = { ...profile };
      
      switch (memoryType) {
        case 'search':
          updatedProfile.searchHistory = [];
          break;
        case 'shortTerm':
          updatedProfile.shortTermMemory = [];
          break;
        case 'longTerm':
          updatedProfile.longTermMemory = [];
          break;
        case 'llmContext':
          updatedProfile.llmContext = generateInitialLLMContext(profile.role, profile.name);
          break;
      }
      
      onUpdateProfile(updatedProfile);
      alert(`${typeInfo?.label} has been completely reset!`);
    }
  };

  const handleResetAll = () => {
    const confirmReset = confirm(
      'Reset All Learning\n\nThis will reset ALL memory and context to default values. This action cannot be undone.\n\nAre you absolutely sure?'
    );

    if (confirmReset) {
      const updatedProfile = {
        ...profile,
        searchHistory: [],
        shortTermMemory: [],
        longTermMemory: [],
        llmContext: generateInitialLLMContext(profile.role, profile.name)
      };
      
      onUpdateProfile(updatedProfile);
      alert('All learning has been reset! Your buddy will start fresh.');
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

  const getMemoryStats = (type: string) => {
    switch (type) {
      case 'search':
        return profile.searchHistory.length;
      case 'shortTerm':
        return profile.shortTermMemory.length;
      case 'longTerm':
        return profile.longTermMemory.length;
      case 'llmContext':
        return profile.llmContext ? profile.llmContext.length : 0;
      default:
        return 0;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Reset Learning</Text>
        <Text style={styles.subtitle}>Manage {profile.name}'s Memory & Context</Text>
      </View>

      {/* Current Memory Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.sectionTitle}>Current Memory Status</Text>
        <View style={styles.memoryGrid}>
          {memoryTypes.map((type) => (
            <View key={type.key} style={styles.memoryCard}>
              <Text style={styles.memoryIcon}>{type.icon}</Text>
              <Text style={styles.memoryLabel}>{type.label}</Text>
              <Text style={styles.memoryCount}>{getMemoryStats(type.key)}</Text>
              <Text style={styles.memoryUnit}>
                {type.key === 'llmContext' ? 'chars' : 'items'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Partial Reset Section */}
      <View style={styles.resetSection}>
        <Text style={styles.sectionTitle}>Partial Reset by Date Range</Text>
        <Text style={styles.sectionDescription}>
          Reset specific memory types within a date range. Leave dates empty to reset from beginning or until now.
        </Text>
        
        <View style={styles.dateInputs}>
          <View style={styles.dateInput}>
            <Text style={styles.label}>From Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="2024-01-01"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.dateInput}>
            <Text style={styles.label}>To Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="2024-12-31"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <Text style={styles.label}>Select Memory Types to Reset:</Text>
        <View style={styles.memoryTypeGrid}>
          {memoryTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.memoryTypeButton,
                selectedMemoryTypes.includes(type.key) && styles.memoryTypeButtonSelected
              ]}
              onPress={() => toggleMemoryType(type.key)}
            >
              <Text style={styles.memoryTypeIcon}>{type.icon}</Text>
              <Text style={[
                styles.memoryTypeLabel,
                selectedMemoryTypes.includes(type.key) && styles.memoryTypeLabelSelected
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.resetButton, styles.partialResetButton]}
          onPress={handlePartialReset}
        >
          <Text style={styles.buttonText}>Reset Selected Memory Types</Text>
        </TouchableOpacity>
      </View>

      {/* Individual Reset Section */}
      <View style={styles.resetSection}>
        <Text style={styles.sectionTitle}>Individual Memory Reset</Text>
        <Text style={styles.sectionDescription}>
          Reset specific memory types completely. Use with caution as this cannot be undone.
        </Text>
        
        <View style={styles.individualResetGrid}>
          {memoryTypes.map((type) => (
            <View key={type.key} style={styles.individualResetCard}>
              <View style={styles.resetCardHeader}>
                <Text style={styles.resetCardIcon}>{type.icon}</Text>
                <View style={styles.resetCardInfo}>
                  <Text style={styles.resetCardLabel}>{type.label}</Text>
                  <Text style={styles.resetCardDescription}>{type.description}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.resetCardButton, styles.warningButton]}
                onPress={() => handleFullReset(type.key)}
              >
                <Text style={styles.resetCardButtonText}>Reset {type.label}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Nuclear Option */}
      <View style={styles.resetSection}>
        <Text style={styles.sectionTitle}>Nuclear Reset Option</Text>
        <Text style={styles.sectionDescription}>
          This will reset ALL learning and context to default values. Your buddy will start completely fresh.
        </Text>
        
        <TouchableOpacity
          style={[styles.resetButton, styles.nuclearResetButton]}
          onPress={handleResetAll}
        >
          <Text style={styles.buttonText}>🔄 Reset Everything - Start Fresh</Text>
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
  statusContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
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
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  memoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  memoryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    minWidth: '45%',
    flex: 1,
  },
  memoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  memoryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 4,
  },
  memoryCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  memoryUnit: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  resetSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  memoryTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  memoryTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    minWidth: '45%',
  },
  memoryTypeButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  memoryTypeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  memoryTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  memoryTypeLabelSelected: {
    color: '#fff',
  },
  resetButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  partialResetButton: {
    backgroundColor: '#FF9500',
  },
  nuclearResetButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  individualResetGrid: {
    gap: 12,
  },
  individualResetCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  resetCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resetCardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  resetCardInfo: {
    flex: 1,
  },
  resetCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  resetCardDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  resetCardButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  warningButton: {
    backgroundColor: '#FF9500',
  },
  resetCardButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
