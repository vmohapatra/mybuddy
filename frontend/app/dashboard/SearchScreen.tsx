import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';

interface SearchEntry {
  id: string;
  query: string;
  timestamp: Date;
  clickedResults: string[];
  feedback: 'upvote' | 'downvote' | 'neutral';
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
  rules: {
    bannedSources: string[];
    preferredTone: 'formal' | 'casual' | 'friendly' | 'professional' | 'educational';
    preferredStyle: 'concise' | 'detailed' | 'conversational' | 'technical';
    allowedDomains: string[];
    contentFilters: string[];
  };
  llmContext: string;
  shortTermMemory: string[];
  longTermMemory: string[];
}

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  url: string;
  source: string;
  relevance: number;
  timestamp: Date;
  category: 'primary' | 'supporting' | 'additional';
}

interface SearchSummary {
  summary: string;
  keyPoints: string[];
  primarySources: SearchResult[];
  supportingResearch: SearchResult[];
  additionalSources: SearchResult[];
  confidence: number;
  lastUpdated: Date;
}

interface SearchScreenProps {
  profile: Profile;
  onBack: () => void;
  onUpdateProfile: (profile: Profile) => void;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ profile, onBack, onUpdateProfile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchSummary, setSearchSummary] = useState<SearchSummary | null>(null);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'history' | 'insights'>('search');

  // Mock search results for demonstration
  const generateMockResults = (query: string): SearchResult[] => {
    const mockSources = [
      'wikipedia.org',
      'stackoverflow.com',
      'github.com',
      'medium.com',
      'dev.to',
      'css-tricks.com',
      'mdn.web.dev',
      'reactjs.org'
    ];

    const mockTitles = [
      `${query} - Complete Guide and Tutorial`,
      `How to ${query} in 2024: Best Practices`,
      `${query} Examples and Use Cases`,
      `Understanding ${query}: A Comprehensive Overview`,
      `${query} vs Alternatives: What You Need to Know`,
      `Advanced ${query} Techniques and Tips`,
      `${query} for Beginners: Step-by-Step Guide`,
      `${query} Implementation and Best Practices`
    ];

    return mockTitles.map((title, index) => ({
      id: `result-${Date.now()}-${index}`,
      title,
      snippet: `This is a detailed explanation about ${query}. Learn the fundamentals, advanced concepts, and practical applications. Perfect for developers and learners who want to master ${query}.`,
      url: `https://${mockSources[index % mockSources.length]}/articles/${query.toLowerCase().replace(/\s+/g, '-')}`,
      source: mockSources[index % mockSources.length],
      relevance: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
      category: (index < 2 ? 'primary' : index < 4 ? 'supporting' : 'additional') as 'primary' | 'supporting' | 'additional'
    })).sort((a, b) => b.relevance - a.relevance);
  };

  // Generate AI summary based on search results and profile context
  const generateAISummary = (query: string, results: SearchResult[]): SearchSummary => {
    const primarySources = results.filter(r => r.category === 'primary');
    const supportingResearch = results.filter(r => r.category === 'supporting');
    const additionalSources = results.filter(r => r.category === 'additional');

    // Generate summary based on profile role and style
    let summary = '';
    let keyPoints: string[] = [];

    switch (profile.role) {
      case 'Admin':
        summary = `Based on comprehensive analysis of ${results.length} sources, ${query} represents a multifaceted topic with significant implications for modern development practices. The research indicates strong consensus on core principles while highlighting emerging trends and best practices.`;
        keyPoints = [
          `Core concepts are well-established with ${primarySources.length} authoritative sources`,
          `Supporting research provides ${supportingResearch.length} complementary perspectives`,
          `Additional sources offer ${additionalSources.length} specialized insights`,
          `Overall confidence level: ${Math.round(Math.random() * 20 + 80)}%`
        ];
        break;
      case 'Standard Plus':
        summary = `Analysis of ${results.length} carefully selected sources reveals that ${query} encompasses both fundamental principles and advanced applications. The research demonstrates clear patterns in implementation approaches and identifies key success factors.`;
        keyPoints = [
          `Primary sources (${primarySources.length}) establish foundational knowledge`,
          `Supporting research (${supportingResearch.length}) validates core concepts`,
          `Additional insights (${additionalSources.length}) expand understanding`,
          `Confidence assessment: ${Math.round(Math.random() * 15 + 85)}%`
        ];
        break;
      case 'Standard':
        summary = `Through examination of ${results.length} relevant sources, ${query} emerges as a well-documented subject with practical applications. The research shows consistent patterns and provides actionable guidance for implementation.`;
        keyPoints = [
          `Key sources (${primarySources.length}) provide essential information`,
          `Supporting materials (${supportingResearch.length}) enhance understanding`,
          `Additional resources (${additionalSources.length}) offer deeper insights`,
          `Reliability score: ${Math.round(Math.random() * 20 + 80)}%`
        ];
        break;
      case 'Child':
        summary = `Based on ${results.length} carefully selected sources, ${query} is an exciting topic that can be learned step by step. The research shows fun ways to understand this subject and provides safe, educational content.`;
        keyPoints = [
          `Main sources (${primarySources.length}) explain basic concepts clearly`,
          `Supporting materials (${supportingResearch.length}) provide examples`,
          `Extra resources (${additionalSources.length}) offer more fun facts`,
          `Learning confidence: ${Math.round(Math.random() * 15 + 85)}%`
        ];
        break;
      case 'Guest':
        summary = `Analysis of ${results.length} sources indicates that ${query} is a well-researched topic with established principles. The available information provides a solid foundation for understanding key concepts and applications.`;
        keyPoints = [
          `Primary sources (${primarySources.length}) offer core information`,
          `Supporting research (${supportingResearch.length}) provides context`,
          `Additional sources (${additionalSources.length}) expand coverage`,
          `Information quality: ${Math.round(Math.random() * 20 + 80)}%`
        ];
        break;
      default:
        summary = `Based on ${results.length} sources, ${query} presents a comprehensive topic with multiple perspectives and applications. The research demonstrates both depth and breadth of understanding.`;
        keyPoints = [
          `Primary sources: ${primarySources.length}`,
          `Supporting research: ${supportingResearch.length}`,
          `Additional sources: ${additionalSources.length}`,
          `Overall assessment: Comprehensive coverage`
        ];
    }

    return {
      summary,
      keyPoints,
      primarySources,
      supportingResearch,
      additionalSources,
      confidence: Math.random() * 0.3 + 0.7,
      lastUpdated: new Date()
    };
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Search Error', 'Please enter a search query');
      return;
    }

    setIsSearching(true);
    setSearchSummary(null);
    
    // Simulate search API delay
    setTimeout(() => {
      const results = generateMockResults(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
      
      // Start AI analysis
      setIsAnalyzing(true);
      
      // Simulate AI analysis delay
      setTimeout(() => {
        const summary = generateAISummary(searchQuery, results);
        setSearchSummary(summary);
        setIsAnalyzing(false);
        
        // Add to search history
        const newSearchEntry: SearchEntry = {
          id: Date.now().toString(),
          query: searchQuery.trim(),
          timestamp: new Date(),
          clickedResults: [],
          feedback: 'neutral'
        };

        const updatedProfile = {
          ...profile,
          searchHistory: [newSearchEntry, ...profile.searchHistory]
        };

        onUpdateProfile(updatedProfile);
      }, 3000); // AI analysis takes 3 seconds
    }, 1500); // Search takes 1.5 seconds
  };

  const handleResultClick = (result: SearchResult) => {
    setSelectedResult(result);
    
    // Update search history with clicked result
    const currentSearch = profile.searchHistory[0];
    if (currentSearch && currentSearch.query === searchQuery.trim()) {
      const updatedSearch = {
        ...currentSearch,
        clickedResults: [...currentSearch.clickedResults, result.url]
      };

      const updatedProfile = {
        ...profile,
        searchHistory: [updatedSearch, ...profile.searchHistory.slice(1)]
      };

      onUpdateProfile(updatedProfile);
    }

    // In a real app, this would open the URL or show detailed content
    Alert.alert(
      'Result Clicked',
      `Opening: ${result.title}\n\nURL: ${result.url}\n\nIn a real app, this would navigate to the result or show detailed content.`
    );
  };

  const handleFeedback = (resultId: string, feedback: 'upvote' | 'downvote') => {
    // Update search history with feedback
    const currentSearch = profile.searchHistory[0];
    if (currentSearch && currentSearch.query === searchQuery.trim()) {
      const updatedSearch = {
        ...currentSearch,
        feedback
      };

      const updatedProfile = {
        ...profile,
        searchHistory: [updatedSearch, ...profile.searchHistory.slice(1)]
      };

      onUpdateProfile(updatedProfile);
    }

    Alert.alert('Feedback Recorded', `Thank you for your feedback on this result!`);
  };

  const getProfileSpecificContext = () => {
    switch (profile.role) {
      case 'Admin':
        return 'Search with full system access and comprehensive results';
      case 'Standard Plus':
        return 'Enhanced search with detailed explanations and extended context';
      case 'Standard':
        return 'Personalized search based on your learning preferences';
      case 'Child':
        return 'Child-safe search with educational content and simplified explanations';
      case 'Guest':
        return 'Basic search with essential information';
      default:
        return 'Search with profile-specific customization';
    }
  };

  const renderSearchTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={`Search for anything... (${profile.name}'s personalized search)`}
            placeholderTextColor="#999"
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={isSearching}
          >
            <Text style={styles.searchButtonText}>
              {isSearching ? '🔍' : '🔍'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.filtersButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filtersButtonText}>
            {showFilters ? 'Hide' : 'Show'} Filters
          </Text>
        </TouchableOpacity>

        {showFilters && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filterTitle}>Profile-Specific Rules:</Text>
            <Text style={styles.filterText}>Tone: {profile.rules.preferredTone}</Text>
            <Text style={styles.filterText}>Style: {profile.rules.preferredStyle}</Text>
            <Text style={styles.filterText}>Content Filters: {profile.rules.contentFilters.length}</Text>
            <Text style={styles.filterText}>Allowed Domains: {profile.rules.allowedDomains.length}</Text>
          </View>
        )}
      </View>

      {isSearching && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🔍 Searching...</Text>
          <Text style={styles.loadingSubtext}>Using {profile.name}'s personalized search rules</Text>
        </View>
      )}

      {isAnalyzing && (
        <View style={styles.analyzingContainer}>
          <Text style={styles.analyzingText}>🤖 AI is analyzing search results...</Text>
          <Text style={styles.analyzingSubtext}>This may take a few moments to generate a comprehensive summary</Text>
          <View style={styles.analyzingSpinner}>
            <Text style={styles.spinnerText}>⏳</Text>
          </View>
        </View>
      )}

             {searchSummary && !isAnalyzing && (
         <View style={styles.summaryContainer}>
           <View style={styles.aiOverviewHeader}>
             <Text style={styles.aiOverviewTitle}>🤖 AI Overview</Text>
             <View style={styles.confidenceBadge}>
               <Text style={styles.confidenceBadgeText}>
                 {Math.round(searchSummary.confidence * 100)}% confident
               </Text>
             </View>
           </View>
           
           <Text style={styles.summaryText}>{searchSummary.summary}</Text>
           
           <View style={styles.sourcesSection}>
             <Text style={styles.sourcesSectionTitle}>Sources</Text>
             
             <View style={styles.sourceCategory}>
               <Text style={styles.categoryTitle}>
                 🎯 Primary ({searchSummary.primarySources.length})
               </Text>
               {searchSummary.primarySources.map((source, index) => (
                 <TouchableOpacity
                   key={source.id}
                   style={styles.sourceLink}
                   onPress={() => handleResultClick(source)}
                 >
                   <Text style={styles.sourceLinkText}>{source.title}</Text>
                   <Text style={styles.sourceLinkMeta}>{source.source}</Text>
                 </TouchableOpacity>
               ))}
             </View>

             <View style={styles.sourceCategory}>
               <Text style={styles.categoryTitle}>
                 🔬 Supporting ({searchSummary.supportingResearch.length})
               </Text>
               {searchSummary.supportingResearch.map((source, index) => (
                 <TouchableOpacity
                   key={source.id}
                   style={styles.sourceLink}
                   onPress={() => handleResultClick(source)}
                 >
                   <Text style={styles.sourceLinkText}>{source.title}</Text>
                   <Text style={styles.sourceLinkMeta}>{source.source}</Text>
                 </TouchableOpacity>
               ))}
             </View>

             {searchSummary.additionalSources.length > 0 && (
               <View style={styles.sourceCategory}>
                 <Text style={styles.categoryTitle}>
                   📖 Additional ({searchSummary.additionalSources.length})
                 </Text>
                 {searchSummary.additionalSources.map((source, index) => (
                   <TouchableOpacity
                     key={source.id}
                     style={styles.sourceLink}
                     onPress={() => handleResultClick(source)}
                   >
                     <Text style={styles.sourceLinkText}>{source.title}</Text>
                     <Text style={styles.sourceLinkMeta}>{source.source}</Text>
                   </TouchableOpacity>
                 ))}
               </View>
             )}
           </View>

           <View style={styles.summaryFooter}>
             <Text style={styles.lastUpdatedText}>
               Last updated: {searchSummary.lastUpdated.toLocaleTimeString()}
             </Text>
           </View>
         </View>
       )}

      {searchResults.length > 0 && !isSearching && !isAnalyzing && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsHeader}>
            Found {searchResults.length} results for "{searchQuery}"
          </Text>
          
          {searchResults.map((result) => (
            <View key={result.id} style={styles.resultCard}>
              <TouchableOpacity
                style={styles.resultContent}
                onPress={() => handleResultClick(result)}
              >
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>{result.title}</Text>
                  <View style={[
                    styles.categoryBadge,
                    result.category === 'primary' && styles.primaryBadge,
                    result.category === 'supporting' && styles.supportingBadge,
                    result.category === 'additional' && styles.additionalBadge
                  ]}>
                    <Text style={styles.categoryBadgeText}>
                      {result.category === 'primary' ? '🎯 Primary' : 
                       result.category === 'supporting' ? '🔬 Supporting' : '📖 Additional'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.resultSnippet}>{result.snippet}</Text>
                <View style={styles.resultMeta}>
                  <Text style={styles.resultSource}>{result.source}</Text>
                  <Text style={styles.resultDate}>
                    {result.timestamp.toLocaleDateString()}
                  </Text>
                  <Text style={styles.resultRelevance}>
                    {Math.round(result.relevance * 100)}% relevant
                  </Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={[styles.feedbackButton, styles.upvoteButton]}
                  onPress={() => handleFeedback(result.id, 'upvote')}
                >
                  <Text style={styles.feedbackButtonText}>👍</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.feedbackButton, styles.downvoteButton]}
                  onPress={() => handleFeedback(result.id, 'downvote')}
                >
                  <Text style={styles.feedbackButtonText}>👎</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {searchResults.length === 0 && !isSearching && !isAnalyzing && searchQuery && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
          <Text style={styles.noResultsSubtext}>
            Try adjusting your search terms or check your profile's content filters
          </Text>
        </View>
      )}
    </View>
  );

  const renderHistoryTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Recent Searches</Text>
      
      {profile.searchHistory.length === 0 ? (
        <View style={styles.emptyHistoryContainer}>
          <Text style={styles.emptyHistoryText}>No search history yet</Text>
          <Text style={styles.emptyHistorySubtext}>
            Your searches will appear here to help personalize future results
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.historyList}>
          {profile.searchHistory.slice(0, 10).map((entry) => (
            <View key={entry.id} style={styles.historyItem}>
              <View style={styles.historyContent}>
                <Text style={styles.historyQuery}>{entry.query}</Text>
                <Text style={styles.historyDate}>
                  {entry.timestamp.toLocaleDateString()} at {entry.timestamp.toLocaleTimeString()}
                </Text>
                <Text style={styles.historyStats}>
                  {entry.clickedResults.length} results clicked • Feedback: {entry.feedback}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.repeatSearchButton}
                onPress={() => {
                  setSearchQuery(entry.query);
                  setActiveTab('search');
                }}
              >
                <Text style={styles.repeatSearchButtonText}>🔍</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderInsightsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Search Insights</Text>
      
      <View style={styles.insightsContainer}>
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Search Patterns</Text>
          <Text style={styles.insightText}>
            Total searches: {profile.searchHistory.length}
          </Text>
          <Text style={styles.insightText}>
            Most common topics: {profile.searchHistory.length > 0 ? 'Programming, AI, Development' : 'None yet'}
          </Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Learning Progress</Text>
          <Text style={styles.insightText}>
            Short-term memory: {profile.shortTermMemory.length} items
          </Text>
          <Text style={styles.insightText}>
            Long-term memory: {profile.longTermMemory.length} items
          </Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Profile Context</Text>
          <Text style={styles.insightText}>
            Role: {profile.role}
          </Text>
          <Text style={styles.insightText}>
            Preferred style: {profile.rules.preferredStyle}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔍 Search</Text>
        <Text style={styles.subtitle}>
          {profile.name}'s Personalized Search • {getProfileSpecificContext()}
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <View style={styles.tabButtons}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'search' && styles.activeTabButton]}
            onPress={() => setActiveTab('search')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'search' && styles.activeTabButtonText]}>
              🔍 Search
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'history' && styles.activeTabButton]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'history' && styles.activeTabButtonText]}>
              📚 History
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'insights' && styles.activeTabButton]}
            onPress={() => setActiveTab('insights')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'insights' && styles.activeTabButtonText]}>
              📊 Insights
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'search' && renderSearchTab()}
        {activeTab === 'history' && renderHistoryTab()}
        {activeTab === 'insights' && renderInsightsTab()}
      </View>
    </ScrollView>
  );
};

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
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  tabContainer: {
    flex: 1,
  },
  tabButtons: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
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
  searchInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
    marginRight: 12,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#ccc',
  },
  searchButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  filtersButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filtersButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  filtersContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  analyzingContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyzingText: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 8,
    fontWeight: '600',
  },
  analyzingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  analyzingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerText: {
    fontSize: 20,
  },
  summaryContainer: {
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
  aiOverviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  aiOverviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  confidenceBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confidenceBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'justify',
  },
  sourcesSection: {
    marginBottom: 20,
  },
  sourcesSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sourceCategory: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  sourceLink: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  sourceLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
    textDecorationLine: 'underline',
  },
  sourceLinkMeta: {
    fontSize: 12,
    color: '#666',
  },
  summaryFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#999',
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultContent: {
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  primaryBadge: {
    backgroundColor: '#34C759',
  },
  supportingBadge: {
    backgroundColor: '#007AFF',
  },
  additionalBadge: {
    backgroundColor: '#FF9500',
  },
  categoryBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  resultSnippet: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultSource: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  resultDate: {
    fontSize: 12,
    color: '#999',
  },
  resultRelevance: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  resultActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 12,
  },
  feedbackButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  upvoteButton: {
    backgroundColor: '#34C759',
  },
  downvoteButton: {
    backgroundColor: '#FF3B30',
  },
  feedbackButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyHistoryContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyHistoryText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  historyList: {
    maxHeight: 400,
  },
  historyItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyContent: {
    flex: 1,
  },
  historyQuery: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  historyStats: {
    fontSize: 12,
    color: '#666',
  },
  repeatSearchButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginLeft: 12,
  },
  repeatSearchButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  insightsContainer: {
    gap: 16,
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default SearchScreen;
