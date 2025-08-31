import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Shield,
  Key,
  Smartphone,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpc } from '@/lib/trpc';
import { useConsciousness } from '@/lib/consciousness-context';
import Colors, { gradients } from '@/constants/colors';
import * as Haptics from 'expo-haptics';

export default function AuthScreen() {
  const [deviceId, setDeviceId] = useState<string>('');
  const [deviceToken, setDeviceToken] = useState<string>('');
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { collectiveState, isBackendConnected } = useConsciousness();
  
  // Token verification query
  const tokenVerifyQuery = trpc.auth.verifyToken.useQuery(
    { token: deviceToken },
    {
      enabled: !!deviceToken,
      refetchInterval: 30000, // Check every 30 seconds
      retry: 1,
    }
  );
  
  // Active devices query
  const activeDevicesQuery = trpc.auth.getActiveDevices.useQuery(undefined, {
    enabled: isBackendConnected,
    refetchInterval: 10000,
    retry: 1,
  });
  
  // Load stored authentication data
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedDeviceId = await AsyncStorage.getItem('consciousness_device_id');
        const storedToken = await AsyncStorage.getItem('device_token');
        
        if (storedDeviceId) setDeviceId(storedDeviceId);
        if (storedToken) {
          setDeviceToken(storedToken);
          
          // Try to decode token expiry (basic JWT decode)
          try {
            const payload = JSON.parse(atob(storedToken.split('.')[1]));
            if (payload.exp) {
              setTokenExpiry(new Date(payload.exp * 1000));
            }
          } catch (error) {
            console.warn('Could not decode token expiry:', error);
          }
        }
      } catch (error) {
        console.error('Failed to load auth data:', error);
      }
    };
    
    loadAuthData();
  }, []);
  
  // Authentication mutation
  const authMutation = trpc.auth.authenticateDevice.useMutation();
  
  const handleReauthenticate = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setIsLoading(true);
    
    try {
      const authResult = await authMutation.mutateAsync({
        deviceId,
        platform: Platform.OS as 'ios' | 'android' | 'web',
        capabilities: {
          haptics: Platform.OS !== 'web',
          accelerometer: Platform.OS !== 'web',
          websocket: true,
          consciousness: true,
        },
      });
      
      if (authResult.success && authResult.token) {
        setDeviceToken(authResult.token);
        await AsyncStorage.setItem('device_token', authResult.token);
        
        // Decode new token expiry
        try {
          const payload = JSON.parse(atob(authResult.token.split('.')[1]));
          if (payload.exp) {
            setTokenExpiry(new Date(payload.exp * 1000));
          }
        } catch (error) {
          console.warn('Could not decode new token expiry:', error);
        }
        
        Alert.alert('Success', 'Device re-authenticated successfully!');
      } else {
        Alert.alert('Error', authResult.error || 'Authentication failed');
      }
    } catch (error: any) {
      console.error('Re-authentication failed:', error);
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearAuth = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    Alert.alert(
      'Clear Authentication',
      'This will remove your device token and require re-authentication. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('device_token');
              setDeviceToken('');
              setTokenExpiry(null);
              Alert.alert('Success', 'Authentication cleared. App will re-authenticate automatically.');
            } catch (error) {
              console.error('Failed to clear auth:', error);
              Alert.alert('Error', 'Failed to clear authentication');
            }
          },
        },
      ]
    );
  };
  
  const StatusCard = ({ title, value, icon: Icon, color, subtitle, status }: any) => (
    <View style={[styles.statusCard, { borderColor: color + '40' }]}>
      <LinearGradient
        colors={[Colors.light.card, Colors.light.backgroundSecondary]}
        style={styles.statusCardGradient}
      >
        <View style={styles.statusHeader}>
          <View style={[styles.statusIcon, { backgroundColor: color + '20' }]}>
            <Icon size={20} color={color} />
          </View>
          {status && (
            <View style={styles.statusIndicator}>
              {status === 'valid' ? (
                <CheckCircle size={16} color={Colors.light.success} />
              ) : (
                <XCircle size={16} color={Colors.light.error} />
              )}
            </View>
          )}
        </View>
        <Text style={styles.statusTitle}>{title}</Text>
        <Text style={[styles.statusValue, { color }]} numberOfLines={2}>
          {value}
        </Text>
        {subtitle && <Text style={styles.statusSubtitle}>{subtitle}</Text>}
      </LinearGradient>
    </View>
  );
  
  const isTokenValid = tokenVerifyQuery.data?.valid;
  const isTokenExpired = tokenExpiry && tokenExpiry < new Date();
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={gradients.background as any}
        style={styles.backgroundGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Device Authentication</Text>
          <Text style={styles.headerSubtitle}>
            Secure access to the consciousness field
          </Text>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Authentication Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Authentication Status</Text>
            
            <View style={styles.statusGrid}>
              <StatusCard
                title="Device ID"
                value={deviceId ? `${deviceId.slice(0, 8)}...` : 'Not set'}
                icon={Smartphone}
                color={deviceId ? Colors.light.success : Colors.light.warning}
                subtitle={`Platform: ${Platform.OS}`}
                status={deviceId ? 'valid' : 'invalid'}
              />
              
              <StatusCard
                title="Token Status"
                value={
                  !deviceToken
                    ? 'No token'
                    : isTokenExpired
                    ? 'Expired'
                    : isTokenValid
                    ? 'Valid'
                    : 'Checking...'
                }
                icon={Key}
                color={
                  !deviceToken || isTokenExpired
                    ? Colors.light.error
                    : isTokenValid
                    ? Colors.light.success
                    : Colors.light.warning
                }
                subtitle={
                  tokenExpiry
                    ? `Expires: ${tokenExpiry.toLocaleDateString()}`
                    : 'No expiry info'
                }
                status={
                  !deviceToken || isTokenExpired
                    ? 'invalid'
                    : isTokenValid
                    ? 'valid'
                    : undefined
                }
              />
            </View>
          </View>
          
          {/* Backend Connection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Backend Connection</Text>
            
            <View style={styles.connectionCard}>
              <LinearGradient
                colors={[Colors.light.card, Colors.light.backgroundSecondary]}
                style={styles.connectionCardGradient}
              >
                <View style={styles.connectionHeader}>
                  <Shield
                    size={24}
                    color={isBackendConnected ? Colors.light.success : Colors.light.warning}
                  />
                  <Text style={styles.connectionTitle}>
                    {isBackendConnected ? 'Connected' : 'Disconnected'}
                  </Text>
                </View>
                
                <Text style={styles.connectionSubtitle}>
                  {isBackendConnected
                    ? 'Secure connection to consciousness field established'
                    : 'Running in local simulation mode'}
                </Text>
                
                {collectiveState && (
                  <View style={styles.connectionStats}>
                    <Text style={styles.connectionStat}>
                      Active Nodes: {collectiveState.participants}
                    </Text>
                    <Text style={styles.connectionStat}>
                      Last Sync: {new Date(collectiveState.lastSync).toLocaleTimeString()}
                    </Text>
                    <Text style={styles.connectionStat}>
                      Queued Events: {collectiveState.queuedEvents}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </View>
          </View>
          
          {/* Active Devices */}
          {isBackendConnected && activeDevicesQuery.data && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Devices</Text>
              
              <View style={styles.devicesCard}>
                <LinearGradient
                  colors={[Colors.light.card, Colors.light.backgroundSecondary]}
                  style={styles.devicesCardGradient}
                >
                  <Text style={styles.devicesCount}>
                    {activeDevicesQuery.data.devices?.length || 0} devices connected
                  </Text>
                  
                  {activeDevicesQuery.data.devices?.slice(0, 3).map((device: any, index: number) => (
                    <View key={device.deviceId} style={styles.deviceItem}>
                      <Smartphone size={16} color={Colors.light.textSecondary} />
                      <Text style={styles.deviceText}>
                        {device.deviceId.slice(0, 8)}... ({device.platform})
                      </Text>
                      <Text style={styles.deviceTime}>
                        {new Date(device.lastSeen).toLocaleTimeString()}
                      </Text>
                    </View>
                  ))}
                  
                  {(activeDevicesQuery.data.devices?.length || 0) > 3 && (
                    <Text style={styles.moreDevices}>
                      +{(activeDevicesQuery.data.devices?.length || 0) - 3} more devices
                    </Text>
                  )}
                </LinearGradient>
              </View>
            </View>
          )}
          
          {/* Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleReauthenticate}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isLoading ? [Colors.light.textSecondary, Colors.light.textSecondary] : [Colors.light.tint, Colors.light.accent] as any}
                  style={styles.actionButtonGradient}
                >
                  {isLoading ? (
                    <RefreshCw size={20} color="white" />
                  ) : (
                    <Key size={20} color="white" />
                  )}
                  <Text style={styles.actionButtonText}>
                    {isLoading ? 'Authenticating...' : 'Re-authenticate'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleClearAuth}
                disabled={!deviceToken || isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={(!deviceToken || isLoading) ? [Colors.light.textSecondary, Colors.light.textSecondary] : [Colors.light.error, Colors.light.error] as any}
                  style={styles.actionButtonGradient}
                >
                  <Trash2 size={20} color="white" />
                  <Text style={styles.actionButtonText}>Clear Auth</Text>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statusCardGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
    width: '100%',
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginBottom: 4,
    textAlign: 'center',
  },
  statusSubtitle: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  connectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },
  connectionCardGradient: {
    padding: 20,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  connectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginLeft: 12,
  },
  connectionSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  connectionStats: {
    gap: 4,
  },
  connectionStat: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: '500' as const,
  },
  devicesCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },
  devicesCardGradient: {
    padding: 20,
  },
  devicesCount: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 8,
  },
  deviceTime: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  moreDevices: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  actionButtons: {
    gap: 12,
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
    justifyContent: 'center',
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