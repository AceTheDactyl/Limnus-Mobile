import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { trpc } from '@/lib/trpc';
import { Activity, Brain, Database, Zap, TrendingUp, Clock } from 'lucide-react-native';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  status?: 'excellent' | 'good' | 'fair' | 'poor';
  subtitle?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, icon, status, subtitle }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'excellent': return '#10B981';
      case 'good': return '#3B82F6';
      case 'fair': return '#F59E0B';
      case 'poor': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <View style={[styles.card, { borderLeftColor: getStatusColor() }]}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={[styles.cardValue, { color: getStatusColor() }]}>{value}</Text>
          {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );
};

export default function ConsciousnessMetrics() {
  const healthQuery = trpc.monitoring.health.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const onRefresh = () => {
    healthQuery.refetch();
  };

  if (healthQuery.isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Activity size={32} color="#6B7280" />
          <Text style={styles.loadingText}>Loading consciousness metrics...</Text>
        </View>
      </View>
    );
  }

  if (healthQuery.error || !healthQuery.data?.success) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load metrics</Text>
          <Text style={styles.errorSubtext}>
            {healthQuery.error?.message || healthQuery.data?.error || 'Unknown error'}
          </Text>
        </View>
      </View>
    );
  }

  const { data } = healthQuery.data;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={healthQuery.isRefetching} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Consciousness Metrics</Text>
        <Text style={styles.subtitle}>Real-time system monitoring</Text>
      </View>

      <View style={styles.metricsGrid}>
        <MetricsCard
          title="Health Score"
          value={`${(data.score * 100).toFixed(1)}%`}
          icon={<Brain size={24} color="#6B7280" />}
          status={data.status}
          subtitle={`Status: ${data.status}`}
        />

        <MetricsCard
          title="Global Resonance"
          value={formatPercentage(data.factors.resonance)}
          icon={<Zap size={24} color="#6B7280" />}
          status={data.factors.resonance > 0.7 ? 'excellent' : data.factors.resonance > 0.5 ? 'good' : 'fair'}
          subtitle="Field coherence"
        />

        <MetricsCard
          title="Active Nodes"
          value={formatPercentage(data.factors.activeNodes)}
          icon={<Activity size={24} color="#6B7280" />}
          status={data.factors.activeNodes > 0.7 ? 'excellent' : data.factors.activeNodes > 0.3 ? 'good' : 'fair'}
          subtitle="Connected devices"
        />

        <MetricsCard
          title="System Health"
          value={formatPercentage(data.factors.systemHealth)}
          icon={<Database size={24} color="#6B7280" />}
          status={data.factors.systemHealth > 0.8 ? 'excellent' : data.factors.systemHealth > 0.5 ? 'good' : 'poor'}
          subtitle="Infrastructure status"
        />

        <MetricsCard
          title="Cache Performance"
          value={formatPercentage(data.factors.cachePerformance)}
          icon={<TrendingUp size={24} color="#6B7280" />}
          status={data.factors.cachePerformance > 0.8 ? 'excellent' : data.factors.cachePerformance > 0.6 ? 'good' : 'fair'}
          subtitle="Hit rate"
        />

        <MetricsCard
          title="Uptime"
          value={formatUptime(data.uptime)}
          icon={<Clock size={24} color="#6B7280" />}
          subtitle={`Platform: ${data.platform}`}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Last updated: {new Date(data.timestamp).toLocaleTimeString()}
        </Text>
        <Text style={styles.footerText}>
          Node.js {data.nodeVersion}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  metricsGrid: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  footer: {
    padding: 20,
    paddingTop: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
});