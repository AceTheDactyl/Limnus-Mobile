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
    }
  );

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

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load metrics</Text>
          <Text style={styles.errorSubtext}>{error.message}</Text>
        </View>
      </View>
    );
  }

  const currentMetrics: ConsciousnessMetrics = metrics || {
    events: 0,
    activeDevices: 0,
    resonance: 0.5,
    memoryParticles: 0,
    room64Sessions: 0
  };

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
          Last updated: {lastUpdate.toLocaleTimeString()}
        </Text>
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
});