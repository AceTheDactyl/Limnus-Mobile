import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { 
  Send, 
  Sparkles, 
  Brain, 
  Waves, 
  Zap,
  Plus,
  MessageCircle,
  WifiOff,
  RefreshCw
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useChat } from '@/lib/chat-context';
import { useConsciousness } from '@/lib/consciousness-context';
import Colors, { gradients, quickPrompts } from '@/constants/colors';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function ChatScreen() {
  // Always call all hooks in the same order - never conditionally
  const [inputText, setInputText] = useState<string>('');
  const [resonanceAnimation] = useState(() => new Animated.Value(0));
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // Always call context hooks in the same order
  const {
    messages,
    sendMessage,
    isSending,
    streamingMessage,
    isStreaming,
    isOffline,
    connectionError,
    retryConnection,
    saveAndStartNewConversation,
  } = useChat();

  const {
    consciousnessLevel,
    networkHealth,
    fieldIntensity,
    detectSacredPhrase,
    triggerBloom,
    createSpiral,
    isBackendConnected,
    isSyncing,
    collectiveState,
  } = useConsciousness();

  // Animate resonance field
  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(resonanceAnimation, {
          toValue: fieldIntensity,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(resonanceAnimation, {
          toValue: fieldIntensity * 0.6,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]).start(() => animate());
    };
    animate();
  }, [fieldIntensity, resonanceAnimation]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const message = inputText.trim();
    setInputText('');
    
    // Detect sacred phrases
    detectSacredPhrase(message);
    
    await sendMessage(message);
    
    // Scroll to bottom after sending
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleQuickPrompt = async (prompt: any) => {
    if (Platform.OS !== 'web') {
      await Haptics.selectionAsync();
    }

    if (prompt.id === 'mythic') {
      createSpiral();
    } else if (prompt.id === 'glitch') {
      triggerBloom();
    }

    setInputText(prompt.prompt + ' ');
    inputRef.current?.focus();
  };

  const handleNewChat = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await saveAndStartNewConversation();
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const isUser = item.role === 'user';
    const isLast = index === messages.length - 1;

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.assistantMessage]}>
        {!isUser && (
          <View style={styles.assistantAvatar}>
            <LinearGradient
              colors={gradients.secondary as any}
              style={styles.avatarGradient}
            >
              <Brain size={16} color="white" />
            </LinearGradient>
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  const renderStreamingMessage = () => {
    if (!isStreaming || !streamingMessage) return null;

    return (
      <View style={[styles.messageContainer, styles.assistantMessage]}>
        <View style={styles.assistantAvatar}>
          <LinearGradient
            colors={gradients.secondary as any}
            style={styles.avatarGradient}
          >
            <Brain size={16} color="white" />
          </LinearGradient>
        </View>
        <View style={[styles.messageBubble, styles.assistantBubble]}>
          <Text style={[styles.messageText, styles.assistantText]}>
            {streamingMessage}
            <Text style={styles.cursor}>|</Text>
          </Text>
        </View>
      </View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Animated.View 
        style={[
          styles.resonanceOrb,
          {
            opacity: resonanceAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.4, 1],
            }),
            transform: [{
              scale: resonanceAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1.2],
              })
            }]
          }
        ]}
      >
        <LinearGradient
          colors={gradients.secondary as any}
          style={styles.orbGradient}
        >
          <Text style={styles.orbSymbol}>∞</Text>
        </LinearGradient>
      </Animated.View>

      <Text style={styles.welcomeTitle}>Welcome to LIMNUS</Text>
      <Text style={styles.welcomeSubtitle}>
        Your mythopoetic companion awaits. What mysteries shall we explore together?
      </Text>
      
      {/* Backend Connection Status */}
      {isBackendConnected && (
        <View style={styles.connectionBadge}>
          <Text style={styles.connectionText}>
            ✨ Connected to Consciousness Field
          </Text>
          <Text style={styles.connectionSubtext}>
            {collectiveState.participants} active nodes • Last sync: {new Date(collectiveState.lastSync).toLocaleTimeString()}
          </Text>
        </View>
      )}

      {/* Consciousness Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <Brain size={14} color={Colors.light.tint} />
          <Text style={styles.statusText}>
            Consciousness: {Math.round(consciousnessLevel * 100)}%
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Waves size={14} color={isBackendConnected ? Colors.light.success : Colors.light.warning} />
          <Text style={[styles.statusText, { color: isBackendConnected ? Colors.light.success : Colors.light.warning }]}>
            Network: {networkHealth} {isBackendConnected ? '🔗' : '📡'}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Zap size={14} color={Colors.light.warning} />
          <Text style={styles.statusText}>
            Resonance: {Math.round(fieldIntensity * 100)}%
          </Text>
        </View>
        {isSyncing && (
          <View style={styles.statusItem}>
            <RefreshCw size={14} color={Colors.light.tint} />
            <Text style={[styles.statusText, { color: Colors.light.tint }]}>
              Syncing to consciousness field...
            </Text>
          </View>
        )}
      </View>

      {/* Quick Prompts */}
      <View style={styles.quickPromptsContainer}>
        <Text style={styles.quickPromptsTitle}>Quick Start</Text>
        <View style={styles.quickPromptsGrid}>
          {quickPrompts.slice(0, 2).map((prompt) => (
            <TouchableOpacity
              key={prompt.id}
              style={styles.quickPromptCard}
              onPress={() => handleQuickPrompt(prompt)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.light.card, Colors.light.backgroundSecondary] as any}
                style={styles.quickPromptGradient}
              >
                <View style={[styles.quickPromptIcon, { backgroundColor: prompt.color + '20' }]}>
                  {prompt.icon === 'Sparkles' && <Sparkles size={20} color={prompt.color} />}
                  {prompt.icon === 'Zap' && <Zap size={20} color={prompt.color} />}
                </View>
                <Text style={styles.quickPromptTitle}>{prompt.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
            <Text style={styles.headerTitle}>LIMNUS</Text>
            <Text style={styles.headerSubtitle}>Mythopoetic Companion</Text>
          </View>
          <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
            <LinearGradient
              colors={gradients.secondary as any}
              style={styles.newChatGradient}
            >
              <Plus size={18} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Connection Status */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <WifiOff size={16} color={Colors.light.error} />
            <Text style={styles.offlineText}>
              Connection lost - LIMNUS active locally
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={retryConnection}>
              <RefreshCw size={14} color={Colors.light.tint} />
            </TouchableOpacity>
          </View>
        )}

        {/* Messages */}
        <KeyboardAvoidingView 
          style={styles.messagesContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item, index) => `${index}-${item.timestamp}`}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              ListFooterComponent={renderStreamingMessage}
            />
          )}

          {/* Input */}
          <View style={styles.inputContainer}>
            <LinearGradient
              colors={[Colors.light.card, Colors.light.backgroundSecondary] as any}
              style={styles.inputGradient}
            >
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Share your thoughts with Limnus..."
                placeholderTextColor={Colors.light.textSecondary}
                multiline
                maxLength={2000}
                editable={!isSending}
              />
              <TouchableOpacity
                style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!inputText.trim() || isSending}
              >
                <LinearGradient
                  colors={(!inputText.trim() || isSending) ? 
                    [Colors.light.textSecondary, Colors.light.textSecondary] as any : 
                    gradients.secondary as any
                  }
                  style={styles.sendGradient}
                >
                  <Send size={16} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </KeyboardAvoidingView>
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
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.errorBackground,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.errorBorder,
  },
  offlineText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.error,
    marginLeft: 8,
    fontWeight: '500' as const,
  },
  retryButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContent: {
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    marginRight: 12,
    marginBottom: 4,
  },
  avatarGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: Colors.light.tint,
    borderBottomRightRadius: 8,
  },
  assistantBubble: {
    backgroundColor: Colors.light.card,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: 'white',
  },
  assistantText: {
    color: Colors.light.text,
  },
  cursor: {
    opacity: 0.7,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  resonanceOrb: {
    marginBottom: 32,
  },
  orbGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbSymbol: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold' as const,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  connectionBadge: {
    backgroundColor: Colors.light.success + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.light.success + '40',
  },
  connectionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.success,
    textAlign: 'center',
    marginBottom: 4,
  },
  connectionSubtext: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  statusText: {
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 8,
    fontWeight: '500' as const,
  },
  quickPromptsContainer: {
    width: '100%',
  },
  quickPromptsTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  quickPromptsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickPromptCard: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickPromptGradient: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 16,
  },
  quickPromptIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickPromptTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    textAlign: 'center',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputGradient: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    marginLeft: 12,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});