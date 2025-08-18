import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import ReactMarkdown from 'react-markdown';
import { searchService, SearchResponse, SearchSource, SearchPreferences } from '../../services/searchService';
import { Profile } from '../../services/profileService';
import SearchPreferencesPanel from '../../components/SearchPreferencesPanel';

interface SearchScreenProps {
  profile: Profile;
  onBack: () => void;
  onUpdateProfile: (profile: Profile) => void;
}

// Extended Profile interface to include search preferences
interface ExtendedProfile extends Profile {
  searchPreferences?: SearchPreferences;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ profile, onBack, onUpdateProfile }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'history'>('results');
  const [showPreferences, setShowPreferences] = useState(false);
  const [currentPreferences, setCurrentPreferences] = useState<SearchPreferences | undefined>();
  
  // Get current search feedback
  const currentSearchFeedback = searchResults ?
    profile.searchHistory.find((entry: any) => entry.query === query.trim())?.overallFeedback || 'neutral'
    : 'neutral';

  const handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert('Error', 'Please enter a search query');
      return;
    }
    setIsLoading(true);
    try {
      const results = await searchService.performSearch({
        query: query.trim(),
        profileId: profile.id,
        preferences: currentPreferences, // Include current preferences
      });
      setSearchResults(results);
      // Save search to profile history
      const searchEntry = {
        id: Date.now().toString(),
        query: query.trim(),
        timestamp: new Date(),
        clickedResults: [],
        feedback: 'neutral' as const
      };
      const updatedProfile = {
        ...profile,
        searchHistory: [searchEntry, ...profile.searchHistory]
      };
      onUpdateProfile(updatedProfile); // This line saves the history
    } catch (error) {
      Alert.alert('Search Error', 'Failed to perform search.');
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSourceFeedback = (sourceUrl: string, feedback: 'upvote' | 'downvote') => {
    // Update source feedback in search history
    if (searchResults) {
      const currentSearch = profile.searchHistory.find((entry: any) =>
        entry.query === query.trim()
      );
      if (currentSearch) {
        const updatedSearch = {
          ...currentSearch,
          sourceFeedback: {
            ...currentSearch.sourceFeedback,
            [sourceUrl]: feedback
          }
        };
        const updatedProfile = {
          ...profile,
          searchHistory: profile.searchHistory.map((entry: any) =>
            entry.query === query.trim() ? updatedSearch : entry
          )
        };
        onUpdateProfile(updatedProfile);
      }
    }
  };

  const handleOverallFeedback = (feedback: 'upvote' | 'downvote') => {
    // Update overall search feedback
    if (searchResults) {
      const currentSearch = profile.searchHistory.find((entry: any) =>
        entry.query === query.trim()
      );
      if (currentSearch) {
        const updatedSearch = {
          ...currentSearch,
          overallFeedback: feedback
        };
        const updatedProfile = {
          ...profile,
          searchHistory: profile.searchHistory.map((entry: any) =>
            entry.query === query.trim() ? updatedSearch : entry
          )
        };
        onUpdateProfile(updatedProfile);
      }
    }
  };

  const handleApplyPreferences = (preferences: SearchPreferences) => {
    setCurrentPreferences(preferences);
    // Optionally save preferences to user profile
    const updatedProfile = {
      ...profile,
      searchPreferences: preferences
    };
    onUpdateProfile(updatedProfile);
  };

  const renderSearchSource = (source: SearchSource, index: number) => {
    const isClicked = profile.searchHistory.find((entry: any) =>
      entry.query === query.trim()
    )?.clickedResults?.includes(source.url);
    
    const sourceFeedback = profile.searchHistory.find((entry: any) =>
      entry.query === query.trim()
    )?.sourceFeedback?.[source.url] || 'neutral';

    return (
      <View key={index} style={[styles.sourceCard, isClicked && styles.sourceCardClicked]}>
        <Text style={styles.sourceTitle}>{source.title}</Text>
        <TouchableOpacity
          style={styles.sourceUrlContainer}
          onPress={() => {
            // Track source click in search history
            if (searchResults) {
              const currentSearch = profile.searchHistory.find((entry: any) =>
                entry.query === query.trim()
              );
              if (currentSearch) {
                const updatedSearch = {
                  ...currentSearch,
                  clickedResults: [...currentSearch.clickedResults, source.url]
                };
                const updatedProfile = {
                  ...profile,
                  searchHistory: profile.searchHistory.map((entry: any) =>
                    entry.query === query.trim() ? updatedSearch : entry
                  )
                };
                onUpdateProfile(updatedProfile);
              }
              // Open URL in new tab/window
              if (typeof window !== 'undefined') {
                window.open(source.url, '_blank');
              }
            }
          }}
        >
          <Text style={styles.sourceUrl}>🔗 {source.url}</Text>
        </TouchableOpacity>
        <View style={styles.sourceDescriptionContainer}>
          <ReactMarkdown style={styles.markdownText}>
            {source.description}
          </ReactMarkdown>
        </View>
        <View style={styles.sourceMeta}>
          <Text style={styles.sourceType}>{source.type}</Text>
          <Text style={styles.sourceScore}>
            Score: {(() => {
              const score = source.relevanceScore;
              if (score == null || isNaN(score) || score < 0 || score > 1) {
                return 'N/A';
              }
              return `${(score * 100).toFixed(0)}%`;
            })()}
          </Text>
        </View>
        {/* Source Feedback Buttons */}
        <View style={styles.feedbackContainer}>
          <TouchableOpacity
            style={[styles.feedbackButton, sourceFeedback === 'upvote' && styles.feedbackButtonActive]}
            onPress={() => handleSourceFeedback(source.url, 'upvote')}
          >
            <Text style={styles.feedbackButtonText}>👍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.feedbackButton, sourceFeedback === 'downvote' && styles.feedbackButtonActive]}
            onPress={() => handleSourceFeedback(source.url, 'downvote')}
          >
            <Text style={styles.feedbackButtonText}>👎</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAIOverview = () => (
    <View style={styles.overviewSection}>
      <Text style={styles.sectionTitle}>AI Overview</Text>
      <View style={styles.aiOverviewContainer}>
        <ReactMarkdown style={styles.markdownText}>
          {searchResults?.aiOverview || 'No AI overview available.'}
        </ReactMarkdown>
      </View>
      <View style={styles.confidenceSection}>
        <Text style={styles.confidenceLabel}>Confidence Score:</Text>
        <Text style={styles.confidenceScore}>
          {(() => {
            const score = searchResults?.confidenceScore;
            if (score == null || isNaN(score) || score < 0 || score > 1) {
              return 'N/A';
            }
            return `${(score * 100).toFixed(0)}%`;
          })()}
        </Text>
      </View>
      <View style={styles.keyPointsSection}>
        <Text style={styles.keyPointsTitle}>Key Points:</Text>
        {searchResults?.keyPoints.map((point, index) => (
          <View key={index} style={styles.keyPointContainer}>
            <ReactMarkdown style={styles.markdownText}>
              {point}
            </ReactMarkdown>
          </View>
        ))}
      </View>
      {/* Overall Search Feedback */}
      {searchResults && (
        <View style={styles.overallFeedbackContainer}>
          <Text style={styles.overallFeedbackTitle}>Overall Search Feedback:</Text>
          <View style={styles.feedbackButtonsRow}>
            <TouchableOpacity
              style={[styles.feedbackButton, currentSearchFeedback === 'upvote' && styles.feedbackButtonActive]}
              onPress={() => handleOverallFeedback('upvote')}
            >
              <Text style={styles.feedbackButtonText}>👍 Helpful</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.feedbackButton, currentSearchFeedback === 'downvote' && styles.feedbackButtonActive]}
              onPress={() => handleOverallFeedback('downvote')}
            >
              <Text style={styles.feedbackButtonText}>👎 Not Helpful</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderSources = () => (
    <View style={styles.sourcesSection}>
      <Text style={styles.sectionTitle}>Sources ({searchResults?.totalSources || 0})</Text>
      
      {/* Primary Sources */}
      {searchResults?.primarySources && searchResults.primarySources.length > 0 && (
        <View style={styles.sourceCategory}>
          <Text style={styles.sourceCategoryTitle}>Primary Sources</Text>
          {searchResults.primarySources.map((source, index) => renderSearchSource(source, index))}
        </View>
      )}

      {/* Supporting Research */}
      {searchResults?.supportingResearch && searchResults.supportingResearch.length > 0 && (
        <View style={styles.sourceCategory}>
          <Text style={styles.sourceCategoryTitle}>Supporting Research</Text>
          {searchResults.supportingResearch.map((source, index) => renderSearchSource(source, index + 10))}
        </View>
      )}

      {/* Additional Sources */}
      {searchResults?.additionalSources && searchResults.additionalSources.length > 0 && (
        <View style={styles.sourceCategory}>
          <Text style={styles.sourceCategoryTitle}>Additional Sources</Text>
          {searchResults.additionalSources.map((source, index) => renderSearchSource(source, index + 20))}
        </View>
      )}
    </View>
  );

  const renderSearchHistory = () => (
    <View style={styles.historySection}>
      <Text style={styles.sectionTitle}>Recent Searches</Text>
      {profile.searchHistory.length === 0 ? (
        <Text style={styles.historyText}>
          No search history yet. Your searches will appear here.
        </Text>
      ) : (
        profile.searchHistory.slice(0, 10).map((entry, index) => (
          <View key={entry.id} style={styles.historyItem}>
            <View style={styles.historyContent}>
              <Text style={styles.historyQuery}>{entry.query}</Text>
              <Text style={styles.historyDate}>
                {entry.timestamp instanceof Date
                  ? entry.timestamp.toLocaleDateString() + ' at ' + entry.timestamp.toLocaleTimeString()
                  : new Date(entry.timestamp).toLocaleDateString() + ' at ' + new Date(entry.timestamp).toLocaleTimeString()}
              </Text>
            </View>
            <Text style={styles.historyStats}>
              {entry.clickedResults.length} results clicked • Feedback: {entry.feedback}
            </Text>
            {entry.overallFeedback && entry.overallFeedback !== 'neutral' && (
              <Text style={styles.historyFeedback}>
                Overall: {entry.overallFeedback === 'upvote' ? '👍 Very Helpful' : '👎 Not Helpful'}
              </Text>
            )}
          </View>
        ))
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Search with {profile.name}</Text>
        <Text style={styles.subtitle}>Ask me anything and I'll find the best answers for you!</Text>
        
        {/* Preferences Button */}
        <TouchableOpacity 
          style={styles.preferencesButton} 
          onPress={() => setShowPreferences(true)}
        >
          <Text style={styles.preferencesButtonText}>⚙️ Search Filters</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="What would you like to search for?"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Current Preferences Display */}
        {currentPreferences && (
          <View style={styles.currentPreferencesDisplay}>
            <Text style={styles.preferencesLabel}>Active Filters:</Text>
            <View style={styles.preferencesTags}>
              {currentPreferences.contentTypes?.map((type, index) => (
                <Text key={index} style={styles.preferenceTag}>📄 {type}</Text>
              ))}
              {currentPreferences.academicOnly && (
                <Text style={styles.preferenceTag}>🎓 Academic</Text>
              )}
              {currentPreferences.minRelevanceScore && currentPreferences.minRelevanceScore > 0.3 && (
                <Text style={styles.preferenceTag}>⭐ {(currentPreferences.minRelevanceScore * 100).toFixed(0)}%+</Text>
              )}
              {currentPreferences.recentContentDays && (
                <Text style={styles.preferenceTag}>📅 Last {currentPreferences.recentContentDays} days</Text>
              )}
              <TouchableOpacity 
                style={styles.clearPreferencesButton}
                onPress={() => setCurrentPreferences(undefined)}
              >
                <Text style={styles.clearPreferencesText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'results' && styles.activeTab]}
          onPress={() => setActiveTab('results')}
        >
          <Text style={[styles.tabText, activeTab === 'results' && styles.activeTabText]}>
            Search Results
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            Search History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'results' && (
          <>
            {renderAIOverview()}
            <View style={styles.sectionDivider} />
            {renderSources()}
          </>
        )}
        {activeTab === 'history' && renderSearchHistory()}
      </View>

      {/* Search Preferences Panel */}
      <SearchPreferencesPanel
        isVisible={showPreferences}
        onClose={() => setShowPreferences(false)}
        onApplyPreferences={handleApplyPreferences}
        currentPreferences={currentPreferences}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  currentPreferencesDisplay: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  preferencesLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  preferencesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  preferenceTag: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    fontSize: 12,
    color: '#333',
  },
  clearPreferencesButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  clearPreferencesText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  loadingSection: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  resultsSection: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    padding: 20,
  },
  overviewSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  overviewText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
  },
  confidenceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  confidenceLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  confidenceScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  keyPointsSection: {
    marginBottom: 20,
  },
  keyPointsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  keyPoint: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    paddingLeft: 10,
  },
  keyPointContainer: {
    marginBottom: 10,
  },
  sourcesSection: {
    marginBottom: 20,
  },
  sourceCategory: {
    marginBottom: 20,
  },
  sourceCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sourceCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sourceCardClicked: {
    borderLeftColor: '#28a745', // Green for clicked
    borderLeftWidth: 4,
  },
  sourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  sourceUrlContainer: {
    marginBottom: 8,
  },
  sourceUrl: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  sourceDescriptionContainer: {
    marginBottom: 10,
  },
  sourceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  sourceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceType: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sourceScore: {
    fontSize: 12,
    color: '#666',
  },
  clickedIndicator: {
    fontSize: 12,
    color: '#28a745', // Green color for clicked indicator
    fontWeight: '500',
  },
  historySection: {
    marginBottom: 20,
  },
  historyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  historyContent: {
    flex: 1,
    marginRight: 10,
  },
  historyQuery: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  historyDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  historyStats: {
    fontSize: 12,
    color: '#666',
  },
  historyFeedback: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  repeatSearchButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  repeatSearchButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  feedbackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  feedbackButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  feedbackButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  feedbackButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  overallFeedbackContainer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  overallFeedbackTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  feedbackButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  preferencesButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  preferencesButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  markdownText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  aiOverviewContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
});

export default SearchScreen;
