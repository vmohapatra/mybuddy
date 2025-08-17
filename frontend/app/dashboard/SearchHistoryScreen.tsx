import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';

interface SearchEntry {
  id: string;
  query: string;
  timestamp: Date;
  clickedResults: string[];
  feedback: 'upvote' | 'downvote' | 'neutral';
}

interface SearchHistoryScreenProps {
  profile: any;
  onBack: () => void;
  onUpdateProfile: (updatedProfile: any) => void;
}

type TabType = 'search' | 'longTerm' | 'shortTerm' | 'llmContext' | 'reset';

export default function SearchHistoryScreen({ profile, onBack, onUpdateProfile }: SearchHistoryScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [filteredHistory, setFilteredHistory] = useState<SearchEntry[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [resetStartDate, setResetStartDate] = useState('');
  const [resetEndDate, setResetEndDate] = useState('');
  const [selectedMemoryTypes, setSelectedMemoryTypes] = useState<string[]>([]);

  const memoryTypes = [
    { key: 'search', label: 'Search History', icon: '🔍', description: 'All search queries and results' },
    { key: 'shortTerm', label: 'Short-term Memory', icon: '🧠', description: 'Recent conversations and context' },
    { key: 'longTerm', label: 'Long-term Memory', icon: '💾', description: 'Persistent learning and preferences' }
  ];

  useEffect(() => {
    filterHistory();
  }, [profile.searchHistory, startDate, endDate, searchQuery]);

  const filterHistory = () => {
    let filtered = [...profile.searchHistory];

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(entry => entry.timestamp >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(entry => entry.timestamp <= end);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(entry => 
        entry.query.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setFilteredHistory(filtered);
  };

  const handleDeleteEntry = (entryId: string) => {
    if (confirm('Are you sure you want to delete this search entry?')) {
      const updatedProfile = {
        ...profile,
        searchHistory: profile.searchHistory.filter((entry: SearchEntry) => entry.id !== entryId)
      };
      onUpdateProfile(updatedProfile);
      alert('Search entry deleted successfully!');
    }
  };

  const handleDeleteDateRange = () => {
    if (!startDate && !endDate) {
      alert('Error: Please select at least one date to delete entries.');
      return;
    }

    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const entriesToDelete = profile.searchHistory.filter((entry: SearchEntry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= start && entryDate <= end;
    });

    if (entriesToDelete.length === 0) {
      alert('No Entries: No search entries found in the selected date range.');
      return;
    }

    if (confirm(`Are you sure you want to delete ${entriesToDelete.length} search entries from ${startDate || 'beginning'} to ${endDate || 'now'}?`)) {
      const updatedProfile = {
        ...profile,
        searchHistory: profile.searchHistory.filter((entry: SearchEntry) => {
          const entryDate = new Date(entry.timestamp);
          return !(entryDate >= start && entryDate <= end);
        })
      };
      onUpdateProfile(updatedProfile);
      alert(`Success: Deleted ${entriesToDelete.length} search entries!`);
      setStartDate('');
      setEndDate('');
    }
  };

  const handleClearAllHistory = () => {
    if (confirm('Are you sure you want to delete ALL search history? This action cannot be undone.')) {
      const updatedProfile = {
        ...profile,
        searchHistory: []
      };
      onUpdateProfile(updatedProfile);
      alert('Success: All search history cleared!');
    }
  };

  const handleDeleteMemoryItem = (memoryType: 'shortTerm' | 'longTerm', index: number) => {
    if (confirm(`Are you sure you want to delete this ${memoryType} memory item?`)) {
      const updatedProfile = { ...profile };
      updatedProfile[`${memoryType}Memory`] = profile[`${memoryType}Memory`].filter((_: any, i: number) => i !== index);
      onUpdateProfile(updatedProfile);
      alert(`${memoryType} memory item deleted successfully!`);
    }
  };

  const handleClearMemoryType = (memoryType: 'shortTerm' | 'longTerm') => {
    if (confirm(`Are you sure you want to clear all ${memoryType} memory?`)) {
      const updatedProfile = { ...profile };
      updatedProfile[`${memoryType}Memory`] = [];
      onUpdateProfile(updatedProfile);
      alert(`All ${memoryType} memory cleared!`);
    }
  };

  // Reset Learning Functions
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

    if (!resetStartDate && !resetEndDate) {
      alert('Error: Please select at least one date for partial reset.');
      return;
    }

    const start = resetStartDate ? new Date(resetStartDate) : new Date(0);
    const end = resetEndDate ? new Date(resetEndDate) : new Date();
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
      setResetStartDate('');
      setResetEndDate('');
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
      }
      
      onUpdateProfile(updatedProfile);
      alert(`${typeInfo?.label} has been completely reset!`);
    }
  };

  const handleResetAll = () => {
    const confirmReset = confirm(
      'Reset All Learning\n\nThis will reset ALL memory data to empty. Your LLM context and personality will remain intact.\n\nAre you absolutely sure?'
    );

    if (confirmReset) {
      const updatedProfile = {
        ...profile,
        searchHistory: [],
        shortTermMemory: [],
        longTermMemory: []
        // Note: LLM context is preserved to maintain profile personality
      };
      
      onUpdateProfile(updatedProfile);
      alert('All learning memory has been reset! Your buddy will start fresh but keep their personality.');
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFeedbackIcon = (feedback: string) => {
    switch (feedback) {
      case 'upvote': return '👍';
      case 'downvote': return '👎';
      default: return '➖';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'search':
        return (
          <View style={styles.tabContent}>
            {/* Statistics */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{profile.searchHistory.length}</Text>
                <Text style={styles.statLabel}>Total Searches</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{filteredHistory.length}</Text>
                <Text style={styles.statLabel}>Filtered Results</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {profile.searchHistory.length > 0 
                    ? formatDate(profile.searchHistory[profile.searchHistory.length - 1].timestamp)
                    : 'Never'
                  }
                </Text>
                <Text style={styles.statLabel}>Last Search</Text>
              </View>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
              <Text style={styles.sectionTitle}>Filters & Date Range</Text>
              
              <View style={styles.filterRow}>
                <View style={styles.dateInput}>
                  <Text style={styles.label}>From Date</Text>
                  <TextInput
                    style={styles.input}
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.dateInput}>
                  <Text style={styles.label}>To Date</Text>
                  <TextInput
                    style={styles.input}
                    value={endDate}
                    onChangeText={setEndDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.searchInput}>
                <Text style={styles.label}>Search Query Filter</Text>
                <TextInput
                  style={styles.input}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Filter by search terms..."
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.filterActions}>
                <TouchableOpacity
                  style={[styles.filterButton, styles.primaryButton]}
                  onPress={handleDeleteDateRange}
                >
                  <Text style={styles.buttonText}>Delete Date Range</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.filterButton, styles.dangerButton]}
                  onPress={handleClearAllHistory}
                >
                  <Text style={styles.buttonText}>Clear All History</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Search History List */}
            <View style={styles.historyContainer}>
              <Text style={styles.sectionTitle}>
                Search Entries ({filteredHistory.length})
              </Text>
              
              {filteredHistory.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No search entries found</Text>
                  <Text style={styles.emptySubtext}>
                    {profile.searchHistory.length === 0 
                      ? 'Start searching to build your learning history!'
                      : 'Try adjusting your filters or date range.'
                    }
                  </Text>
                </View>
              ) : (
                filteredHistory.map((entry) => (
                  <View key={entry.id} style={styles.historyCard}>
                    <View style={styles.entryHeader}>
                      <Text style={styles.queryText}>{entry.query}</Text>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteEntry(entry.id)}
                      >
                        <Text style={styles.deleteButtonText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.entryDetails}>
                      <Text style={styles.timestamp}>
                        📅 {formatDate(entry.timestamp)}
                      </Text>
                      <Text style={styles.feedback}>
                        {getFeedbackIcon(entry.feedback)} {entry.feedback}
                      </Text>
                      <Text style={styles.results}>
                        🔗 {entry.clickedResults.length} results clicked
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        );

      case 'longTerm':
        return (
          <View style={styles.tabContent}>
            <View style={styles.memoryHeader}>
              <Text style={styles.sectionTitle}>Long-term Memory</Text>
              <Text style={styles.memoryDescription}>
                Persistent memories and learned patterns that shape your AI responses
              </Text>
              <View style={styles.memoryStats}>
                <Text style={styles.memoryCount}>{profile.longTermMemory.length} items</Text>
                <TouchableOpacity
                  style={[styles.clearButton, styles.dangerButton]}
                  onPress={() => handleClearMemoryType('longTerm')}
                >
                  <Text style={styles.buttonText}>Clear All</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.memoryContainer}>
              {profile.longTermMemory.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No long-term memory items</Text>
                  <Text style={styles.emptySubtext}>
                    Long-term memories will accumulate as you interact with the system
                  </Text>
                </View>
              ) : (
                profile.longTermMemory.map((item: string, index: number) => (
                  <View key={index} style={styles.memoryCard}>
                    <Text style={styles.memoryText}>{item}</Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteMemoryItem('longTerm', index)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>
        );

      case 'shortTerm':
        return (
          <View style={styles.tabContent}>
            <View style={styles.memoryHeader}>
              <Text style={styles.sectionTitle}>Short-term Memory</Text>
              <Text style={styles.memoryDescription}>
                Recent context and temporary information for immediate responses
              </Text>
              <View style={styles.memoryStats}>
                <Text style={styles.memoryCount}>{profile.shortTermMemory.length} items</Text>
                <TouchableOpacity
                  style={[styles.clearButton, styles.dangerButton]}
                  onPress={() => handleClearMemoryType('shortTerm')}
                >
                  <Text style={styles.buttonText}>Clear All</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.memoryContainer}>
              {profile.shortTermMemory.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No short-term memory items</Text>
                  <Text style={styles.emptySubtext}>
                    Short-term memories will be created during active conversations
                  </Text>
                </View>
              ) : (
                profile.shortTermMemory.map((item: string, index: number) => (
                  <View key={index} style={styles.memoryCard}>
                    <Text style={styles.memoryText}>{item}</Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteMemoryItem('shortTerm', index)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>
        );

      case 'llmContext':
        return (
          <View style={styles.tabContent}>
            <View style={styles.contextHeader}>
              <Text style={styles.sectionTitle}>LLM Context & Personality</Text>
              <Text style={styles.contextDescription}>
                Your buddy's personality and behavior settings. These cannot be reset but can be customized.
              </Text>
            </View>

            <View style={styles.contextContainer}>
              <View style={styles.contextCard}>
                <Text style={styles.contextLabel}>Role-based Context:</Text>
                <Text style={styles.contextText}>{profile.llmContext}</Text>
                <Text style={styles.contextNote}>
                  This context is based on your role and cannot be modified
                </Text>
              </View>

              <View style={styles.rulesCard}>
                <Text style={styles.contextLabel}>Customizable Rules & Preferences:</Text>
                <TouchableOpacity
                  style={[styles.editButton, styles.primaryButton]}
                  onPress={() => {
                    alert('Rule editing functionality coming soon! You will be able to modify:\n\n• Preferred tone and style\n• Banned sources and content filters\n• Allowed domains\n• Custom personality traits');
                  }}
                >
                  <Text style={styles.buttonText}>✏️ Edit Rules & Preferences</Text>
                </TouchableOpacity>
                
                <View style={styles.currentRules}>
                  <Text style={styles.ruleText}>Current Tone: {profile.rules.preferredTone}</Text>
                  <Text style={styles.ruleText}>Current Style: {profile.rules.preferredStyle}</Text>
                  <Text style={styles.ruleText}>Banned Sources: {profile.rules.bannedSources.length} items</Text>
                  <Text style={styles.ruleText}>Content Filters: {profile.rules.contentFilters.length} items</Text>
                  <Text style={styles.ruleText}>Allowed Domains: {profile.rules.allowedDomains.join(', ')}</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 'reset':
        return (
          <View style={styles.tabContent}>
            {/* Current Memory Status */}
            <View style={styles.statusContainer}>
              <Text style={styles.sectionTitle}>Current Memory Status</Text>
              <View style={styles.memoryGrid}>
                {memoryTypes.map((type) => (
                  <View key={type.key} style={styles.memoryStatusCard}>
                    <Text style={styles.memoryStatusIcon}>{type.icon}</Text>
                    <Text style={styles.memoryStatusLabel}>{type.label}</Text>
                    <Text style={styles.memoryStatusCount}>{getMemoryStats(type.key)}</Text>
                    <Text style={styles.memoryStatusUnit}>
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
                    value={resetStartDate}
                    onChangeText={setResetStartDate}
                    placeholder="2024-01-01"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.dateInput}>
                  <Text style={styles.label}>To Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    value={resetEndDate}
                    onChangeText={setResetEndDate}
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
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Search History & Learning Progress</Text>
        <Text style={styles.subtitle}>{profile.name}'s Complete Learning Journey</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
            🔍 Search
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'longTerm' && styles.activeTab]}
          onPress={() => setActiveTab('longTerm')}
        >
          <Text style={[styles.tabText, activeTab === 'longTerm' && styles.activeTabText]}>
            🧠 Long-term
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shortTerm' && styles.activeTab]}
          onPress={() => setActiveTab('shortTerm')}
        >
          <Text style={[styles.tabText, activeTab === 'shortTerm' && styles.activeTabText]}>
            💭 Short-term
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'llmContext' && styles.activeTab]}
          onPress={() => setActiveTab('llmContext')}
        >
          <Text style={[styles.tabText, activeTab === 'llmContext' && styles.activeTabText]}>
            🤖 Context
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'reset' && styles.activeTab]}
          onPress={() => setActiveTab('reset')}
        >
          <Text style={[styles.tabText, activeTab === 'reset' && styles.activeTabText]}>
            🗑️ Reset
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {renderTabContent()}
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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  filtersContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
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
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
  },
  searchInput: {
    marginBottom: 16,
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
  filterActions: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  warningButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  historyContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  historyCard: {
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
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  queryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  entryDetails: {
    gap: 6,
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
  },
  feedback: {
    fontSize: 14,
    color: '#666',
  },
  results: {
    fontSize: 14,
    color: '#666',
  },
  memoryHeader: {
    marginBottom: 16,
  },
  memoryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  memoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memoryCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  memoryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memoryText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  contextHeader: {
    marginBottom: 16,
  },
  contextDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  contextContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contextCard: {
    marginBottom: 16,
  },
  contextLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  contextText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  rulesCard: {
    marginBottom: 16,
  },
  ruleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  contextNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  editButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  currentRules: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  partialResetButton: {
    backgroundColor: '#FF9500',
  },
  nuclearResetButton: {
    backgroundColor: '#FF3B30',
  },
  resetButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 12,
  },
  memoryStatusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memoryIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  memoryStatusIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  memoryStatusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  memoryStatusCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  memoryStatusUnit: {
    fontSize: 12,
    color: '#666',
  },
  resetSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
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
  memoryTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 12,
    marginBottom: 16,
  },
  memoryTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
  },
  memoryTypeButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e0f2fe',
  },
  memoryTypeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  memoryTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  memoryTypeLabelSelected: {
    color: '#007AFF',
  },
  individualResetGrid: {
    gap: 12,
  },
  individualResetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resetCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resetCardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  resetCardInfo: {
    flex: 1,
  },
  resetCardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  resetCardDescription: {
    fontSize: 12,
    color: '#666',
  },
  resetCardButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetCardButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
