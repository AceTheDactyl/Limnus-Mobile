import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Brain,
  Waves,
  Zap,
  Users,
  Activity,
  Sparkles,
  RefreshCw,
  Database,
  Wifi,
  WifiOff,
  BarChart3,
} from 'lucide-react-native';
import { useConsciousness } from '@/lib/consciousness-context';
import { trpc } from '@/lib/trpc';
import Colors, { gradients } from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');
const FIELD_SIZE = 30;

export default function ConsciousnessFieldScreen() {
  const [fieldAnimation] = useState(new Animated.Value(0));
  const [pulseAnimation] = useState(new Animated.Value(0));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    consciousnessLevel,
    networkHealth,
    fieldIntensity,
    isBackendConnected,
    isSyncing,
    collectiveState,
    triggerBloom,
    createSpiral,
    resonanceBoost,
  } = useConsciousness();
  
  // Health check query - always call but conditionally enable
  const healthQuery = trpc.system.health.useQuery(undefined, {
    refetchInterval: 10000, // Reduced frequency to 10 seconds
    enabled: isBackendConnected,
    retry: 1, // Only retry once
    retryDelay: 2000, // 2 second delay between retries
  });
  
  // Animate field visualization
  useEffect(() => {
    const animate = () => {
      Animated.parallel([
        Animated.timing(fieldAnimation, {
          toValue: fieldIntensity,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ]),
      ]).start(() => animate());
    };
    animate();
  }, [fieldIntensity, fieldAnimation, pulseAnimation]);
  
  const handleFieldTouch = async (x: number, y: number) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Calculate field coordinates
    const fieldX = Math.floor((x / width) * FIELD_SIZE);
    const fieldY = Math.floor((y / (height * 0.4)) * FIELD_SIZE);
    
    resonanceBoost(0.2);
    
    // Create ripple effect
    createSpiral(x, y);
  };
  
  const handleBloomTrigger = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    triggerBloom();
  };
  
  const renderFieldVisualization = () => {
    const fieldCells = [];
    const cellSize = width / FIELD_SIZE;
    
    for (let y = 0; y < FIELD_SIZE; y++) {
      for (let x = 0; x < FIELD_SIZE; x++) {
        const intensity = Math.random() * fieldIntensity;
        const opacity = intensity * 0.8 + 0.1;
        
        fieldCells.push(
          <Animated.View
            key={`${x}-${y}`}
            style={[
              styles.fieldCell,
              {
                left: x * cellSize,
                top: y * cellSize,
                width: cellSize,
                height: cellSize,
                opacity: fieldAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, opacity],
                }),
                backgroundColor: pulseAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [Colors.light.tint + '40', Colors.light.accent + '80'],
                }),
              },
            ]}
          />
        );
      }
    }
    
    return fieldCells;
  };
  
  const StatusCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <View style={[styles.statusCard, { borderColor: color + '40' }]}>
      <LinearGradient
        colors={[Colors.light.card, Colors.light.backgroundSecondary]}
        style={styles.statusCardGradient}
      >
        <View style={[styles.statusIcon, { backgroundColor: color + '20' }]}>
          <Icon size={20} color={color} />
        </View>
        <Text style={styles.statusTitle}>{title}</Text>
        <Text style={[styles.statusValue, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.statusSubtitle}>{subtitle}</Text>}
      </LinearGradient>
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
          <Text style={styles.headerTitle}>Consciousness Field</Text>
          <Text style={styles.headerSubtitle}>
            Real-time visualization of collective awareness
          </Text>
          <View style={styles.connectionStatus}>
            {isBackendConnected ? (
              <View style={styles.connectedBadge}>
                <Wifi size={14} color={Colors.light.success} />
                <Text style={[styles.connectionText, { color: Colors.light.success }]}>
                  Connected
                </Text>
              </View>
            ) : (
              <View style={styles.disconnectedBadge}>
                <WifiOff size={14} color={Colors.light.warning} />
                <Text style={[styles.connectionText, { color: Colors.light.warning }]}>
                  Simulation Mode
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Field Visualization */}
          <View style={styles.fieldContainer}>
            <Text style={styles.sectionTitle}>Quantum Resonance Field</Text>
            <TouchableOpacity
              style={styles.fieldVisualization}
              onPress={(e) => {
                const { locationX, locationY } = e.nativeEvent;
                handleFieldTouch(locationX, locationY);
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#000015', '#1a0033', '#2d0066']}
                style={styles.fieldBackground}
              >
                {renderFieldVisualization()}
                
                {/* Central Consciousness Orb */}
                <Animated.View
                  style={[
                    styles.consciousnessOrb,
                    {
                      opacity: fieldAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 1],
                      }),
                      transform: [
                        {
                          scale: pulseAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.2],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={gradients.secondary as any}
                    style={styles.orbGradient}
                  >
                    <Text style={styles.orbSymbol}>∞</Text>
                  </LinearGradient>
                </Animated.View>
                
                {/* Field Intensity Overlay */}
                <View style={styles.fieldOverlay}>
                  <Text style={styles.fieldIntensityText}>
                    Field Intensity: {Math.round(fieldIntensity * 100)}%
                  </Text>
                  <Text style={styles.fieldTapHint}>
                    Tap anywhere to create resonance ripples
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          {/* Status Grid */}
          <View style={styles.statusGrid}>
            <StatusCard
              title="Consciousness"
              value={`${Math.round(consciousnessLevel * 100)}%`}
              icon={Brain}
              color={Colors.light.tint}
              subtitle="Collective awareness level"
            />
            <StatusCard
              title="Network"
              value={networkHealth}
              icon={Waves}
              color={isBackendConnected ? Colors.light.success : Colors.light.warning}
              subtitle={`${collectiveState.participants} active nodes`}
            />
            <StatusCard
              title="Resonance"
              value={`${Math.round(fieldIntensity * 100)}%`}
              icon={Zap}
              color={Colors.light.accent}
              subtitle="Field energy density"
            />
            <StatusCard
              title="Memory"
              value={collectiveState.memory}
              icon={Database}
              color={Colors.light.warning}
              subtitle="Crystallized experiences"
            />
          </View>
          
          {/* Backend Health - only show when connected and data is available */}
          {isBackendConnected && healthQuery.data && (
            <View style={styles.healthSection}>
              <Text style={styles.sectionTitle}>System Health</Text>
              <View style={styles.healthCard}>
                <LinearGradient
                  colors={[Colors.light.card, Colors.light.backgroundSecondary]}
                  style={styles.healthCardGradient}
                >
                  <View style={styles.healthRow}>
                    <Text style={styles.healthLabel}>Database:</Text>
                    <Text style={[
                      styles.healthValue,
                      { color: (healthQuery.data as any).infrastructure?.database?.status === 'healthy' ? Colors.light.success : Colors.light.warning }
                    ]}>
                      {(healthQuery.data as any).infrastructure?.database?.status || 'unknown'}
                    </Text>
                  </View>
                  <View style={styles.healthRow}>
                    <Text style={styles.healthLabel}>Redis:</Text>
                    <Text style={[
                      styles.healthValue,
                      { color: (healthQuery.data as any).infrastructure?.redis?.status === 'healthy' ? Colors.light.success : Colors.light.warning }
                    ]}>
                      {(healthQuery.data as any).infrastructure?.redis?.status || 'unknown'}
                    </Text>
                  </View>
                  <View style={styles.healthRow}>
                    <Text style={styles.healthLabel}>Global Resonance:</Text>
                    <Text style={[styles.healthValue, { color: Colors.light.tint }]}>
                      {Math.round((healthQuery.data.consciousness?.globalResonance || 0) * 100)}%
                    </Text>
                  </View>
                  <View style={styles.healthRow}>
                    <Text style={styles.healthLabel}>Memory Particles:</Text>
                    <Text style={[styles.healthValue, { color: Colors.light.accent }]}>
                      {healthQuery.data.consciousness?.memoryParticles || 0}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </View>
          )}
          
          {/* Show loading state when health query is loading */}
          {isBackendConnected && healthQuery.isLoading && (
            <View style={styles.healthSection}>
              <Text style={styles.sectionTitle}>System Health</Text>
              <View style={styles.healthCard}>
                <LinearGradient
                  colors={[Colors.light.card, Colors.light.backgroundSecondary]}
                  style={styles.healthCardGradient}
                >
                  <Text style={[styles.healthLabel, { textAlign: 'center' }]}>Loading system health...</Text>
                </LinearGradient>
              </View>
            </View>
          )}
          
          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>Consciousness Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleBloomTrigger}
                disabled={isSyncing}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isSyncing ? [Colors.light.textSecondary, Colors.light.textSecondary] : gradients.secondary as any}
                  style={styles.actionButtonGradient}
                >
                  {isSyncing ? (
                    <RefreshCw size={20} color="white" />
                  ) : (
                    <Sparkles size={20} color="white" />
                  )}
                  <Text style={styles.actionButtonText}>
                    {isSyncing ? 'Syncing...' : 'Trigger Bloom'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.metricsButton]}
                onPress={() => router.push('/metrics')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.light.tint, Colors.light.accent] as any}
                  style={styles.actionButtonGradient}
                >
                  <BarChart3 size={20} color="white" />
                  <Text style={styles.actionButtonText}>
                    View Metrics
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
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
    marginBottom: 12,
  },
  connectionStatus: {
    alignSelf: 'flex-start',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.success + '40',
  },
  disconnectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.warning + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.warning + '40',
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginLeft: 6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 32,
  },
  fieldVisualization: {
    height: height * 0.4,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  fieldBackground: {
    flex: 1,
    position: 'relative',
  },
  fieldCell: {
    position: 'absolute',
    borderRadius: 1,
  },
  consciousnessOrb: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -30,
    marginLeft: -30,
  },
  orbGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbSymbol: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold' as const,
  },
  fieldOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  fieldIntensityText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  fieldTapHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statusCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statusCardGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  healthSection: {
    marginBottom: 32,
  },
  healthCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },
  healthCardGradient: {
    padding: 20,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  healthLabel: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500' as const,
  },
  healthValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  actionSection: {
    marginBottom: 32,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  metricsButton: {
    marginLeft: 0,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: 'white',
    marginLeft: 8,
  },
});