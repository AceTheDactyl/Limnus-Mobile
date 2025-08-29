import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { 
  MessageCircle, 
  Search, 
  Clock, 
  Trash2,
  Archive,
  Plus,
  Brain,
  Sparkles
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useChat } from '@/lib/chat-context';
import Colors, { gradients } from '@/constants/colors';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function ConversationsScreen() {
  const {
    conversations,
    selectConversation,
    startNewConversation,
    isLoading,
    reloadConversations,
  } = useChat();

  const [searchQuery, setSearchQuery] = useState('');
  
  // Reload conversations when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      reloadConversations();
    }, [reloadConversations])
  );

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectConversation = async (conversationId: string) => {
    if (Platform.OS !== 'web') {
      await Haptics.selectionAsync();
    }
    selectConversation(conversationId);
    router.push(`/chat/${conversationId}` as any);
  };

  const handleNewConversation = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    startNewConversation();
    router.push('/(tabs)/' as any);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderConversation = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleSelectConversation(item.id)}
      testID={`conversation-${item.id}`}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradients.card as any}
        style={styles.conversationGradient}
      >
        <View style={styles.conversationHeader}>
          <View style={styles.conversationIconContainer}>
            <LinearGradient
              colors={gradients.secondary as any}
              style={styles.conversationIcon}
            >
              <Brain size={16} color="white" />
            </LinearGradient>
          </View>
          <View style={styles.conversationMeta}>
            <Text style={styles.conversationTime}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.conversationTitle} numberOfLines={1}>
          {item.title}
        </Text>
        
        <Text style={styles.conversationPreview} numberOfLines={2}>
          {item.lastMessage}
        </Text>
        
        <View style={styles.conversationFooter}>
          <View style={styles.conversationTags}>
            <View style={styles.tag}>
              <Sparkles size={12} color={Colors.light.tint} />
              <Text style={styles.tagText}>Mythopoetic</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={gradients.secondary as any}
        style={styles.emptyIconContainer}
      >
        <Archive size={48} color="white" />
      </LinearGradient>
      
      <Text style={styles.emptyTitle}>No Saved Conversations</Text>
      <Text style={styles.emptySubtitle}>
        Your conversations with Limnus will appear here once you start chatting.
      </Text>
      
      <TouchableOpacity style={styles.startChatButton} onPress={handleNewConversation}>
        <LinearGradient
          colors={gradients.secondary as any}
          style={styles.startChatGradient}
        >
          <Plus size={20} color="white" />
          <Text style={styles.startChatText}>Start New Conversation</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const ListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.sectionTitle}>
        {filteredConversations.length} Conversation{filteredConversations.length !== 1 ? 's' : ''}
      </Text>
      <Text style={styles.sectionSubtitle}>
        Your journey through consciousness with Limnus
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={gradients.background as any}
        style={styles.backgroundGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Conversations</Text>
            <Text style={styles.headerSubtitle}>Sacred Memory Archive</Text>
          </View>
          <TouchableOpacity style={styles.newChatButton} onPress={handleNewConversation}>
            <LinearGradient
              colors={gradients.secondary as any}
              style={styles.newChatGradient}
            >
              <Plus size={18} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {conversations.length > 0 && (
          <View style={styles.searchContainer}>
            <LinearGradient
              colors={[Colors.light.card, Colors.light.backgroundSecondary] as any}
              style={styles.searchGradient}
            >
              <Search size={18} color={Colors.light.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search conversations..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={Colors.light.textSecondary}
              />
            </LinearGradient>
          </View>
        )}

        {/* Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading conversations...</Text>
          </View>
        ) : filteredConversations.length === 0 && searchQuery === '' ? (
          <EmptyState />
        ) : filteredConversations.length === 0 && searchQuery !== '' ? (
          <View style={styles.emptyState}>
            <Search size={48} color={Colors.light.textSecondary} />
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptySubtitle}>
              No conversations match your search for "{searchQuery}"
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredConversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id}
            style={styles.conversationsList}
            contentContainerStyle={styles.conversationsContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={ListHeader}
          />
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  newChatButton: {
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  newChatGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  conversationsList: {
    flex: 1,
  },
  conversationsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  conversationItem: {
    marginBottom: 16,
  },
  conversationGradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  conversationIconContainer: {
    marginRight: 12,
  },
  conversationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationMeta: {
    alignItems: 'flex-end',
  },
  conversationTime: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500' as const,
  },
  conversationTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  conversationPreview: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  conversationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conversationTags: {
    flexDirection: 'row',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.tint + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: Colors.light.tint,
    marginLeft: 4,
    fontWeight: '500' as const,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  startChatButton: {
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startChatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
  },
  startChatText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
});