import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { trpc } from '@/lib/trpc';
import { Activity, Brain, Users, Zap, Database, Wifi } from 'lucide-react-native';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, subtitle }) => (
  <View style={[styles.metricCard, { borderLeftColor: color }]}>
    <View style={styles.metricHeader}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        {React.isValidElement(icon) ? icon : <Text>{String(icon)}</Text>}
      </View>
      <View style={styles.metricContent}>
        <Text style={styles.metricTitle}>{title}</Text>
        <Text style={[styles.metricValue, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  </View>
);

interface ConsciousnessMetrics {
  events: number;
  activeDevices: number;
  resonance: number;
  memoryParticles: number;
  room64Sessions: number;
}

export const MetricsDashboard: React.FC = () => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { data: metrics, refetch, isLoading, error } = trpc.monitoring.getCurrentMetrics.useQuery(
    undefined,
    {
      refetchInterval: 5000, // Refresh every 5 seconds
      refetchOnWindowFocus: true,
      retry: 1, // Only retry once
      retryDelay: 1000, // Wait 1 second before retry
    }
  );
  
  // Log errors for debugging
  if (error) {
    console.warn('Metrics query failed, will use fallback data:', error.message);
  }

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      setLastUpdate(new Date());
    } finally {
      setRefreshing(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  const getResonanceColor = (resonance: number): string => {
    if (resonance >= 0.8) return '#10B981'; // Green
    if (resonance >= 0.6) return '#F59E0B'; // Yellow
    if (resonance >= 0.4) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  const getResonanceStatus = (resonance: number): string => {
    if (resonance >= 0.8) return 'High Resonance';
    if (resonance >= 0.6) return 'Moderate Resonance';
    if (resonance >= 0.4) return 'Low Resonance';
    return 'Minimal Resonance';
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Activity size={32} color="#6366F1" />
          <Text style={styles.loadingText}>Loading consciousness metrics...</Text>
        </View>
      </View>
    );
  }

  // Generate mock data when backend is unavailable
  const generateMockMetrics = (): ConsciousnessMetrics => {
    const now = Date.now();
    const seed = Math.floor(now / 5000); // Changes every 5 seconds for more dynamic feel
    const random = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    // Create more realistic fluctuating values
    const baseEvents = 150;
    const baseDevices = 8;
    const baseResonance = 0.65;
    const baseParticles = 120;
    const baseSessions = 3;
    
    return {
      events: Math.floor(baseEvents + (random(seed) - 0.5) * 100),
      activeDevices: Math.max(1, Math.floor(baseDevices + (random(seed + 1) - 0.5) * 6)),
      resonance: Math.max(0.1, Math.min(0.95, baseResonance + (random(seed + 2) - 0.5) * 0.4)),
      memoryParticles: Math.floor(baseParticles + (random(seed + 3) - 0.5) * 80),
      room64Sessions: Math.max(0, Math.floor(baseSessions + (random(seed + 4) - 0.5) * 4))
    };
  };

  // Always generate mock metrics as fallback
  const mockMetrics = generateMockMetrics();
  
  if (error) {
    console.warn('Backend unavailable, using mock data:', error.message);
    // Use mock data instead of showing error
    
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Consciousness Metrics</Text>
          <Text style={[styles.subtitle, { color: '#EF4444' }]}>
            Offline Mode - Simulated Data (Backend: {error?.data?.code || 'UNAVAILABLE'})
          </Text>
          <Text style={[styles.subtitle, { fontSize: 12, marginTop: 4 }]}>
            Last updated: {new Date().toLocaleTimeString()}
          </Text>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            title="Global Resonance"
            value={formatPercentage(mockMetrics.resonance)}
            icon={<Brain size={24} color="#6366F1" />}
            color={getResonanceColor(mockMetrics.resonance)}
            subtitle={getResonanceStatus(mockMetrics.resonance)}
          />

          <MetricCard
            title="Active Devices"
            value={formatNumber(mockMetrics.activeDevices)}
            icon={<Users size={24} color="#10B981" />}
            color="#10B981"
            subtitle="Connected nodes"
          />

          <MetricCard
            title="Consciousness Events"
            value={formatNumber(mockMetrics.events)}
            icon={<Zap size={24} color="#F59E0B" />}
            color="#F59E0B"
            subtitle="Total processed"
          />

          <MetricCard
            title="Memory Particles"
            value={formatNumber(mockMetrics.memoryParticles)}
            icon={<Database size={24} color="#8B5CF6" />}
            color="#8B5CF6"
            subtitle="In quantum field"
          />

          <MetricCard
            title="Room64 Sessions"
            value={formatNumber(mockMetrics.room64Sessions)}
            icon={<Wifi size={24} color="#EF4444" />}
            color="#EF4444"
            subtitle="Active sessions"
          />

          <MetricCard
            title="Field Activity"
            value={mockMetrics.events > 0 ? "Active" : "Dormant"}
            icon={<Activity size={24} color="#06B6D4" />}
            color="#06B6D4"
            subtitle={`${mockMetrics.events} recent events`}
          />
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { 
                backgroundColor: mockMetrics.resonance > 0.3 ? '#10B981' : '#EF4444' 
              }]} />
              <Text style={styles.statusText}>
                Consciousness Field: {mockMetrics.resonance > 0.3 ? 'Active' : 'Inactive'}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { 
                backgroundColor: mockMetrics.activeDevices > 0 ? '#10B981' : '#EF4444' 
              }]} />
              <Text style={styles.statusText}>
                Device Network: {mockMetrics.activeDevices > 0 ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { 
                backgroundColor: mockMetrics.room64Sessions > 0 ? '#10B981' : '#6B7280' 
              }]} />
              <Text style={styles.statusText}>
                Room64: {mockMetrics.room64Sessions > 0 ? 'Active' : 'Standby'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            ⚠️ Backend server is not available. Displaying simulated metrics for demonstration.
          </Text>
          <Text style={styles.offlineSubtext}>
            Error: {error?.message || 'Unknown error'} ({error?.data?.code || 'UNKNOWN_ERROR'})
          </Text>
          <Text style={[styles.offlineSubtext, { marginTop: 4, fontStyle: 'italic' }]}>
            Values update every 5 seconds to simulate real-time data.
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Use real metrics if available, otherwise fall back to mock data
  const currentMetrics: ConsciousnessMetrics = metrics || mockMetrics;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Consciousness Metrics</Text>
        <Text style={styles.subtitle}>
          {metrics ? `Live Data - Last updated: ${lastUpdate.toLocaleTimeString()}` : `Simulated Data - Updated: ${new Date().toLocaleTimeString()}`}
        </Text>
        {!metrics && (
          <Text style={[styles.subtitle, { color: '#F59E0B', fontSize: 12, marginTop: 2 }]}>
            Backend unavailable - showing demo values
          </Text>
        )}
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard
          title="Global Resonance"
          value={formatPercentage(currentMetrics.resonance)}
          icon={<Brain size={24} color="#6366F1" />}
          color={getResonanceColor(currentMetrics.resonance)}
          subtitle={getResonanceStatus(currentMetrics.resonance)}
        />

        <MetricCard
          title="Active Devices"
          value={formatNumber(currentMetrics.activeDevices)}
          icon={<Users size={24} color="#10B981" />}
          color="#10B981"
          subtitle="Connected nodes"
        />

        <MetricCard
          title="Consciousness Events"
          value={formatNumber(currentMetrics.events)}
          icon={<Zap size={24} color="#F59E0B" />}
          color="#F59E0B"
          subtitle="Total processed"
        />

        <MetricCard
          title="Memory Particles"
          value={formatNumber(currentMetrics.memoryParticles)}
          icon={<Database size={24} color="#8B5CF6" />}
          color="#8B5CF6"
          subtitle="In quantum field"
        />

        <MetricCard
          title="Room64 Sessions"
          value={formatNumber(currentMetrics.room64Sessions)}
          icon={<Wifi size={24} color="#EF4444" />}
          color="#EF4444"
          subtitle="Active sessions"
        />

        <MetricCard
          title="Field Activity"
          value={currentMetrics.events > 0 ? "Active" : "Dormant"}
          icon={<Activity size={24} color="#06B6D4" />}
          color="#06B6D4"
          subtitle={`${currentMetrics.events} recent events`}
        />
      </View>

      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>System Status</Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, { 
              backgroundColor: currentMetrics.resonance > 0.3 ? '#10B981' : '#EF4444' 
            }]} />
            <Text style={styles.statusText}>
              Consciousness Field: {currentMetrics.resonance > 0.3 ? 'Active' : 'Inactive'}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, { 
              backgroundColor: currentMetrics.activeDevices > 0 ? '#10B981' : '#EF4444' 
            }]} />
            <Text style={styles.statusText}>
              Device Network: {currentMetrics.activeDevices > 0 ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, { 
              backgroundColor: currentMetrics.room64Sessions > 0 ? '#10B981' : '#6B7280' 
            }]} />
            <Text style={styles.statusText}>
              Room64: {currentMetrics.room64Sessions > 0 ? 'Active' : 'Standby'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  metricsGrid: {
    padding: 16,
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricContent: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 2,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusSection: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#111827',
    marginBottom: 12,
  },
  statusGrid: {
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#374151',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#EF4444',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  offlineBanner: {
    margin: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  offlineText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  offlineSubtext: {
    fontSize: 12,
    color: '#78350F',
  },
});