import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { AlertCircle, CheckCircle, WifiOff, RefreshCw } from 'lucide-react-native';

interface ConnectionStatusProps {
  onDismiss?: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ onDismiss }) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [details, setDetails] = useState<string>('');
  const [isRetrying, setIsRetrying] = useState(false);

  const checkConnection = async () => {
    setStatus('checking');
    setDetails('Checking backend connection...');
    
    try {
      // Get the base URL
      const baseUrl = Platform.OS === 'web' 
        ? (typeof window !== 'undefined' ? window.location.origin : '')
        : process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'https://rork.com';
      
      console.log('🔍 Checking backend at:', baseUrl);
      
      // Test the health endpoint
      const healthUrl = `${baseUrl}/api/health`;
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend health check:', data);
        
        if (data.status === 'ok' || data.status === 'healthy' || data.status === 'fallback') {
          setStatus('connected');
          setDetails(`Connected to ${data.mode || 'backend'} mode`);
        } else {
          setStatus('error');
          setDetails(`Backend status: ${data.status}`);
        }
      } else {
        console.error('❌ Health check failed:', response.status);
        setStatus('disconnected');
        setDetails(`Backend returned status ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Connection error:', error);
      setStatus('disconnected');
      
      // Provide helpful error messages
      if (Platform.OS === 'web') {
        setDetails('Backend not accessible. The Rork backend service may be initializing.');
      } else {
        setDetails('Cannot connect to backend. Check your network connection.');
      }
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await checkConnection();
    setIsRetrying(false);
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds if disconnected
    const interval = setInterval(() => {
      if (status === 'disconnected' || status === 'error') {
        checkConnection();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (status === 'connected' && onDismiss) {
    // Auto-dismiss after 2 seconds when connected
    setTimeout(onDismiss, 2000);
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <ActivityIndicator size="small" color="#666" />;
      case 'connected':
        return <CheckCircle size={20} color="#4CAF50" />;
      case 'disconnected':
        return <WifiOff size={20} color="#FF5252" />;
      case 'error':
        return <AlertCircle size={20} color="#FFA726" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return '#E8F5E9';
      case 'disconnected':
        return '#FFEBEE';
      case 'error':
        return '#FFF3E0';
      default:
        return '#F5F5F5';
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'connected':
        return '#2E7D32';
      case 'disconnected':
        return '#C62828';
      case 'error':
        return '#F57C00';
      default:
        return '#666';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
      <View style={styles.content}>
        <View style={styles.statusRow}>
          {getStatusIcon()}
          <Text style={[styles.statusText, { color: getTextColor() }]}>
            {status === 'checking' ? 'Checking connection...' :
             status === 'connected' ? 'Backend Connected' :
             status === 'disconnected' ? 'Backend Disconnected' :
             'Connection Issue'}
          </Text>
        </View>
        <Text style={[styles.detailsText, { color: getTextColor() }]}>
          {details}
        </Text>
        {(status === 'disconnected' || status === 'error') && (
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color={getTextColor()} />
            ) : (
              <>
                <RefreshCw size={16} color={getTextColor()} />
                <Text style={[styles.retryText, { color: getTextColor() }]}>
                  Retry Connection
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
      {onDismiss && status === 'connected' && (
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissText}>✓</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsText: {
    fontSize: 14,
    opacity: 0.8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignSelf: 'flex-start',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dismissButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
});