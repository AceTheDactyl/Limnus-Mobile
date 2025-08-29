import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bookmark,
  MessageCircle,
  Clock,
  Trash2,
  Search,
  Filter,
  Star,
  Archive,
} from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors, { gradients } from '@/constants/colors';
import { trpc } from '@/lib/trpc';

interface SavedConversation {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  messageCount: number;
  isStarred: boolean;
  tags: string[];
}

const SAVED_CONVERSATIONS_KEY = 'saved_conversations';

export default function SavedConversationsScreen() {
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'starred' | 'recent'>('all');
  
  // Load saved conversations from AsyncStorage
  const loadSavedConversations = async () => {
    try {
      const saved = await AsyncStorage.getItem(SAVED_CONVERSATIONS_KEY);
      if (saved) {
        const conversations = JSON.parse(saved) as SavedConversation[];
        setSavedConversations(conversations.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      }
    } catch (error) {
      console.error('Error loading saved conversations:', error);
    }
  };
  
  // Save conversations to AsyncStorage
  const saveSavedConversations = async (conversations: SavedConversation[]) => {
    try {
      await AsyncStorage.setItem(SAVED_CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  };
  
  useEffect(() => {
    loadSavedConversations();
  }, []);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadSavedConversations();
    setRefreshing(false);
  };
  
  const toggleStar = async (conversationId: string) => {
    const updated = savedConversations.map(conv => 
      conv.id === conversationId 
        ? { ...conv, isStarred: !conv.isStarred }
        : conv
    );
    setSavedConversations(updated);
    await saveSavedConversations(updated);
  };
  
  const deleteConversation = async (conversationId: string) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this saved conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = savedConversations.filter(conv => conv.id !== conversationId);
            setSavedConversations(updated);
            await saveSavedConversations(updated);
          },
        },
      ]
    );
  };
  
  const openConversation = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };
  
  const getFilteredConversations = () => {
    switch (filter) {
      case 'starred':
        return savedConversations.filter(conv => conv.isStarred);
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return savedConversations.filter(conv => 
          new Date(conv.timestamp) > oneWeekAgo
        );
      default:
        return savedConversations;
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  const FilterButton = ({ 
    type, 
    label, 
    icon: Icon 
  }: { 
    type: 'all' | 'starred' | 'recent'; 
    label: string; 
    icon: any; 
  }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === type && styles.filterButtonActive
      ]}
      onPress={() => setFilter(type)}
      activeOpacity={0.7}
    >
      <Icon 
        size={16} 
        color={filter === type ? Colors.light.accent : Colors.light.textSecondary} 
      />
      <Text style={[
        styles.filterButtonText,
        filter === type && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  const ConversationCard = ({ conversation }: { conversation: SavedConversation }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() => openConversation(conversation.id)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[Colors.light.card, Colors.light.backgroundSecondary]}
        style={styles.conversationCardGradient}
      >
        <View style={styles.conversationHeader}>
          <View style={styles.conversationTitleRow}>
            <MessageCircle size={18} color={Colors.light.tint} />
            <Text style={styles.conversationTitle} numberOfLines={1}>
              {conversation.title}
            </Text>
          </View>
          <View style={styles.conversationActions}>
            <TouchableOpacity
              onPress={() => toggleStar(conversation.id)}
              style={styles.actionButton}
            >
              <Star 
                size={16} 
                color={conversation.isStarred ? Colors.light.warning : Colors.light.textSecondary}
                fill={conversation.isStarred ? Colors.light.warning : 'transparent'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteConversation(conversation.id)}
              style={styles.actionButton}
            >
              <Trash2 size={16} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.conversationPreview} numberOfLines={2}>
          {conversation.preview}
        </Text>
        
        <View style={styles.conversationFooter}>
          <View style={styles.conversationMeta}>
            <Clock size={12} color={Colors.light.textSecondary} />
            <Text style={styles.conversationTimestamp}>
              {formatTimestamp(conversation.timestamp)}
            </Text>
            <Text style={styles.conversationMessageCount}>
              {conversation.messageCount} messages
            </Text>
          </View>
          
          {conversation.tags.length > 0 && (
            <View style={styles.conversationTags}>
              {conversation.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {conversation.tags.length > 2 && (
                <Text style={styles.moreTagsText}>+{conversation.tags.length - 2}</Text>
              )}
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
  
  const filteredConversations = getFilteredConversations();
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={gradients.background as any}
        style={styles.backgroundGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Saved Conversations</Text>
          <Text style={styles.headerSubtitle}>
            {savedConversations.length} conversations saved
          </Text>
        </View>
        
        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            <FilterButton type="all" label="All" icon={Archive} />
            <FilterButton type="starred" label="Starred" icon={Star} />
            <FilterButton type="recent" label="Recent" icon={Clock} />
          </ScrollView>
        </View>
        
        {/* Conversations List */}
        <ScrollView 
          style={styles.conversationsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.light.tint}
            />
          }
        >
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <ConversationCard key={conversation.id} conversation={conversation} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={[Colors.light.card, Colors.light.backgroundSecondary]}
                style={styles.emptyStateGradient}
              >
                <Bookmark size={48} color={Colors.light.textSecondary} />
                <Text style={styles.emptyStateTitle}>
                  {filter === 'all' ? 'No Saved Conversations' : 
                   filter === 'starred' ? 'No Starred Conversations' : 
                   'No Recent Conversations'}
                </Text>
                <Text style={styles.emptyStateSubtitle}>
                  {filter === 'all' 
                    ? 'Start a conversation and save it to see it here'
                    : filter === 'starred'
                    ? 'Star conversations to quickly find them later'
                    : 'Conversations from the last 7 days will appear here'
                  }
                </Text>
              </LinearGradient>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  filtersContainer: {
    paddingBottom: 20,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.accent + '20',
    borderColor: Colors.light.accent + '40',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.light.textSecondary,
    marginLeft: 6,
  },
  filterButtonTextActive: {
    color: Colors.light.accent,
    fontWeight: '600' as const,
  },
  conversationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  conversationCard: {
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },
  conversationCardGradient: {
    padding: 16,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  conversationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginLeft: 8,
    flex: 1,
  },
  conversationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  conversationPreview: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  conversationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  conversationTimestamp: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: 4,
  },
  conversationMessageCount: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: 12,
  },
  conversationTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.light.tint + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 10,
    color: Colors.light.tint,
    fontWeight: '500' as const,
  },
  moreTagsText: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    fontWeight: '500' as const,
  },
  emptyState: {
    marginTop: 60,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },
  emptyStateGradient: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});