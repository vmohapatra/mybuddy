import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { searchService, SearchPreferences } from '../services/searchService';

interface SearchPreferencesPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onApplyPreferences: (preferences: SearchPreferences) => void;
  currentPreferences?: SearchPreferences;
}

const SearchPreferencesPanel: React.FC<SearchPreferencesPanelProps> = ({
  isVisible,
  onClose,
  onApplyPreferences,
  currentPreferences,
}) => {
  const [preferences, setPreferences] = useState<SearchPreferences>({
    preferredSources: [],
    contentTypes: [],
    language: 'en',
    dateFrom: '',
    dateTo: '',
    minRelevanceScore: 0.3,
    maxResults: 20,
    preferredSearchEngines: [],
    excludedDomains: [],
    academicOnly: false,
    recentContentDays: undefined,
    sortOrder: 'relevance',
    tone: 'professional',
    audience: 'general',
  });

  const [availableContentTypes, setAvailableContentTypes] = useState<string[]>([]);
  const [availableSortOptions, setAvailableSortOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load available options on component mount
  useEffect(() => {
    loadAvailableOptions();
  }, []);

  // Load current preferences when they change
  useEffect(() => {
    if (currentPreferences) {
      setPreferences(currentPreferences);
    }
  }, [currentPreferences]);

  const loadAvailableOptions = async () => {
    try {
      const [contentTypes, sortOptions] = await Promise.all([
        searchService.getAvailableContentTypes(),
        searchService.getAvailableSortOptions(),
      ]);
      setAvailableContentTypes(contentTypes);
      setAvailableSortOptions(sortOptions);
    } catch (error) {
      console.error('Error loading available options:', error);
    }
  };

  const handleQuickPreset = async (presetType: 'default' | 'academic' | 'news' | 'technical') => {
    try {
      setIsLoading(true);
      let presetPreferences: SearchPreferences;

      switch (presetType) {
        case 'academic':
          presetPreferences = await searchService.getAcademicPreferences();
          break;
        case 'news':
          presetPreferences = await searchService.getNewsPreferences();
          break;
        case 'technical':
          presetPreferences = await searchService.getTechnicalPreferences();
          break;
        default:
          presetPreferences = await searchService.getDefaultPreferences();
      }

      setPreferences(presetPreferences);
      Alert.alert('Preset Applied', `${presetType.charAt(0).toUpperCase() + presetType.slice(1)} preferences have been applied!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to load preset preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreferences = () => {
    onApplyPreferences(preferences);
    onClose();
    Alert.alert('Success', 'Search preferences have been applied!');
  };

  const handleResetToDefault = async () => {
    try {
      const defaultPrefs = await searchService.getDefaultPreferences();
      setPreferences(defaultPrefs);
      Alert.alert('Reset Complete', 'Preferences have been reset to default values');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset preferences');
    }
  };

  const addToList = (list: string[], item: string, setter: (list: string[]) => void) => {
    if (item.trim() && !list.includes(item.trim())) {
      setter([...list, item.trim()]);
    }
  };

  const removeFromList = (list: string[], item: string, setter: (list: string[]) => void) => {
    setter(list.filter(i => i !== item));
  };

  const renderListInput = (
    title: string,
    list: string[],
    placeholder: string,
    onAdd: (item: string) => void,
    onRemove: (item: string) => void
  ) => (
    <View style={styles.listInputContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          onSubmitEditing={(e) => {
            onAdd(e.nativeEvent.text);
          }}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            // For React Native, we'll need to handle this differently
            // This is a simplified version
          }}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tagContainer}>
        {list.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tag}
            onPress={() => onRemove(item)}
          >
            <Text style={styles.tagText}>{item}</Text>
            <Text style={styles.removeTagText}>×</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSlider = (
    title: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onValueChange: (value: number) => void
  ) => (
    <View style={styles.sliderContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sliderRow}>
        <Text style={styles.sliderValue}>{value.toFixed(2)}</Text>
        <TextInput
          style={styles.sliderInput}
          value={value.toString()}
          onChangeText={(text) => {
            const num = parseFloat(text);
            if (!isNaN(num) && num >= min && num <= max) {
              onValueChange(num);
            }
          }}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderDropdown = (
    title: string,
    value: string,
    options: string[],
    onValueChange: (value: string) => void
  ) => (
    <View style={styles.dropdownContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              value === option && styles.selectedOptionButton
            ]}
            onPress={() => onValueChange(option)}
          >
            <Text style={[
              styles.optionButtonText,
              value === option && styles.selectedOptionButtonText
            ]}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSwitch = (
    title: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.switchContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={value ? '#f5dd4b' : '#f4f3f4'}
      />
    </View>
  );

  const renderNumberInput = (
    title: string,
    value: number | undefined,
    placeholder: string,
    min: number,
    max: number,
    onValueChange: (value: number | undefined) => void
  ) => (
    <View style={styles.numberInputContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        value={value?.toString() || ''}
        keyboardType="numeric"
        onChangeText={(text) => {
          const num = parseInt(text);
          if (text === '') {
            onValueChange(undefined);
          } else if (!isNaN(num) && num >= min && num <= max) {
            onValueChange(num);
          }
        }}
      />
    </View>
  );

  const renderDateInput = (
    title: string,
    value: string,
    onValueChange: (value: string) => void
  ) => (
    <View style={styles.dateInputContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TextInput
        style={styles.textInput}
        placeholder="YYYY-MM-DD"
        value={value}
        onChangeText={onValueChange}
      />
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Search Preferences</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Quick Presets */}
          <View style={styles.presetsSection}>
            <Text style={styles.sectionTitle}>Quick Presets</Text>
            <View style={styles.presetButtons}>
              <TouchableOpacity
                style={[styles.presetButton, styles.defaultPreset]}
                onPress={() => handleQuickPreset('default')}
                disabled={isLoading}
              >
                <Text style={styles.presetButtonText}>Default</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.presetButton, styles.academicPreset]}
                onPress={() => handleQuickPreset('academic')}
                disabled={isLoading}
              >
                <Text style={styles.presetButtonText}>Academic</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.presetButton, styles.newsPreset]}
                onPress={() => handleQuickPreset('news')}
                disabled={isLoading}
              >
                <Text style={styles.presetButtonText}>News</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.presetButton, styles.technicalPreset]}
                onPress={() => handleQuickPreset('technical')}
                disabled={isLoading}
              >
                <Text style={styles.presetButtonText}>Technical</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Configuration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Configuration</Text>
            
            {renderListInput(
              'Preferred Search Engines',
              preferences.preferredSearchEngines || [],
              'e.g., google, bing, duckduckgo',
              (item) => setPreferences(prev => ({
                ...prev,
                preferredSearchEngines: [...(prev.preferredSearchEngines || []), item]
              })),
              (item) => setPreferences(prev => ({
                ...prev,
                preferredSearchEngines: (prev.preferredSearchEngines || []).filter(i => i !== item)
              }))
            )}

            {renderDropdown(
              'Language',
              preferences.language || 'en',
              ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
              (value) => setPreferences(prev => ({ ...prev, language: value }))
            )}

            {renderDropdown(
              'Sort Order',
              preferences.sortOrder || 'relevance',
              availableSortOptions,
              (value) => setPreferences(prev => ({ ...prev, sortOrder: value }))
            )}
          
            {renderDropdown(
              'Tone',
              preferences.tone || 'professional',
              ['professional', 'friendly', 'playful', 'academic', 'concise', 'formal'],
              (value) => setPreferences(prev => ({ ...prev, tone: value as any }))
            )}

            {renderDropdown(
              'Audience',
              preferences.audience || 'general',
              ['general', 'beginner', 'intermediate', 'expert', 'executive'],
              (value) => setPreferences(prev => ({ ...prev, audience: value as any }))
            )}
          </View>

          {/* Content Filtering */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content Filtering</Text>
            
            {renderListInput(
              'Content Types',
              preferences.contentTypes || [],
              'e.g., research_paper, news, blog',
              (item) => setPreferences(prev => ({
                ...prev,
                contentTypes: [...(prev.contentTypes || []), item]
              })),
              (item) => setPreferences(prev => ({
                ...prev,
                contentTypes: (prev.contentTypes || []).filter(i => i !== item)
              }))
            )}

            {renderSwitch(
              'Academic Sources Only',
              preferences.academicOnly || false,
              (value) => setPreferences(prev => ({ ...prev, academicOnly: value }))
            )}

            {renderListInput(
              'Preferred Sources',
              preferences.preferredSources || [],
              'e.g., wikipedia.org, arxiv.org',
              (item) => setPreferences(prev => ({
                ...prev,
                preferredSources: [...(prev.preferredSources || []), item]
              })),
              (item) => setPreferences(prev => ({
                ...prev,
                preferredSources: (prev.preferredSources || []).filter(i => i !== item)
              }))
            )}

            {renderListInput(
              'Excluded Domains',
              preferences.excludedDomains || [],
              'e.g., spam-site.com',
              (item) => setPreferences(prev => ({
                ...prev,
                excludedDomains: [...(prev.excludedDomains || []), item]
              })),
              (item) => setPreferences(prev => ({
                ...prev,
                excludedDomains: (prev.excludedDomains || []).filter(i => i !== item)
              }))
            )}
          </View>

          {/* Quality Control */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quality Control</Text>
            
            {renderSlider(
              'Minimum Relevance Score',
              preferences.minRelevanceScore || 0.3,
              0.0,
              1.0,
              0.05,
              (value) => setPreferences(prev => ({ ...prev, minRelevanceScore: value }))
            )}

            {renderNumberInput(
              'Maximum Results',
              preferences.maxResults || 20,
              '20',
              1,
              100,
              (value) => setPreferences(prev => ({ ...prev, maxResults: value || 20 }))
            )}
          </View>

          {/* Time Filtering */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time Filtering</Text>
            
            {renderDateInput(
              'From Date',
              preferences.dateFrom || '',
              (value) => setPreferences(prev => ({ ...prev, dateFrom: value }))
            )}

            {renderDateInput(
              'To Date',
              preferences.dateTo || '',
              (value) => setPreferences(prev => ({ ...prev, dateTo: value }))
            )}

            {renderNumberInput(
              'Recent Content (Days)',
              preferences.recentContentDays,
              'e.g., 30',
              1,
              3650,
              (value) => setPreferences(prev => ({ ...prev, recentContentDays: value }))
            )}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetToDefault}
          >
            <Text style={styles.resetButtonText}>Reset to Default</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyPreferences}
          >
            <Text style={styles.applyButtonText}>Apply Preferences</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6c757d',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  presetsSection: {
    marginBottom: 30,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 15,
  },
  presetButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  defaultPreset: {
    backgroundColor: '#6c757d',
  },
  academicPreset: {
    backgroundColor: '#28a745',
  },
  newsPreset: {
    backgroundColor: '#007bff',
  },
  technicalPreset: {
    backgroundColor: '#fd7e14',
  },
  presetButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 15,
  },
  listInputContainer: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#28a745',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#495057',
    fontSize: 14,
    marginRight: 5,
  },
  removeTagText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    minWidth: 50,
  },
  sliderInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  optionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  selectedOptionButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  optionButtonText: {
    color: '#495057',
    fontSize: 14,
  },
  selectedOptionButtonText: {
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  numberInputContainer: {
    marginBottom: 20,
  },
  dateInputContainer: {
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  resetButton: {
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: '#6c757d',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: '#007bff',
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SearchPreferencesPanel;
