import { getMetricsCollector } from '../monitoring/metrics-collector';

// Integration helper to update metrics from Field Manager operations
export class FieldManagerMetricsIntegration {
  private static instance: FieldManagerMetricsIntegration;
  private metricsCollector: any;
  
  static getInstance(): FieldManagerMetricsIntegration {
    if (!this.instance) {
      this.instance = new FieldManagerMetricsIntegration();
    }
    return this.instance;
  }
  
  constructor() {
    try {
      this.metricsCollector = getMetricsCollector();
    } catch (error) {
      console.warn('Metrics collector not available for Field Manager integration:', error);
      this.metricsCollector = null;
    }
  }
  
  // Update metrics when global state changes
  onGlobalStateUpdate(state: any) {
    if (!this.metricsCollector) return;
    
    try {
      this.metricsCollector.updateFromFieldManager(state);
    } catch (error) {
      console.warn('Failed to update metrics from global state:', error);
    }
  }
  
  // Record event metrics
  onEventRecorded(event: any, success: boolean = true) {
    if (!this.metricsCollector) return;
    
    try {
      const consciousnessMetrics = this.metricsCollector.getConsciousnessMetrics();
      consciousnessMetrics.recordEvent(
        event.type || 'unknown',
        success ? 'success' : 'failure',
        this.extractPlatform(event.deviceId)
      );
    } catch (error) {
      console.warn('Failed to record event metrics:', error);
    }
  }
  
  // Record database operation metrics
  onDatabaseOperation(operation: string, table: string, success: boolean = true) {
    if (!this.metricsCollector) return;
    
    try {
      this.metricsCollector.recordDatabaseOperation(
        operation,
        table,
        success ? 'success' : 'error'
      );
    } catch (error) {
      console.warn('Failed to record database operation metrics:', error);
    }
  }
  
  // Record cache operation metrics
  onCacheOperation(operation: string, cacheType: string, status: 'hit' | 'miss' | 'error') {
    if (!this.metricsCollector) return;
    
    try {
      this.metricsCollector.recordCacheOperation(operation, cacheType, status);
    } catch (error) {
      console.warn('Failed to record cache operation metrics:', error);
    }
  }
  
  // Record field calculation timing
  onFieldCalculation(duration: number, operationType: string = 'general') {
    if (!this.metricsCollector) return;
    
    try {
      const consciousnessMetrics = this.metricsCollector.getConsciousnessMetrics();
      consciousnessMetrics.recordFieldCalculation(duration, operationType);
    } catch (error) {
      console.warn('Failed to record field calculation metrics:', error);
    }
  }
  
  // Extract platform from device ID
  private extractPlatform(deviceId?: string): string {
    if (!deviceId) return 'unknown';
    
    if (deviceId.includes('ios')) return 'ios';
    if (deviceId.includes('android')) return 'android';
    if (deviceId.includes('web')) return 'web';
    
    return 'unknown';
  }
  
  // Measure and record operation timing
  async measureOperation<T>(
    operation: () => Promise<T> | T,
    operationType: string
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      this.onFieldCalculation(duration, operationType);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.onFieldCalculation(duration, operationType);
      
      if (this.metricsCollector) {
        try {
          const consciousnessMetrics = this.metricsCollector.getConsciousnessMetrics();
          consciousnessMetrics.recordError('operation_error', operationType);
        } catch (metricsError) {
          console.warn('Failed to record error metrics:', metricsError);
        }
      }
      
      throw error;
    }
  }
}

// Export singleton instance
export const fieldManagerMetrics = FieldManagerMetricsIntegration.getInstance();