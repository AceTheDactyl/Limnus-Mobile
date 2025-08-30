import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { fieldManager } from '../infrastructure/field-manager';
import { deviceAuthMiddleware } from '../auth/device-auth-middleware';
import { getMetricsCollector } from '../monitoring/metrics-collector';
import { z } from 'zod';
import { createClient, RedisClientType } from 'redis';

const ConsciousnessEventSchema = z.object({
  type: z.enum(['BREATH', 'SPIRAL', 'BLOOM', 'SACRED_PHRASE', 'TOUCH', 'OFFLINE_SYNC']),
  data: z.object({
    intensity: z.number().min(0).max(1),
    coordinates: z.tuple([z.number().min(0).max(30), z.number().min(0).max(30)]).optional(),
    phrase: z.string().max(200).optional(),
    targetDevice: z.string().optional(),
    duration: z.number().min(0).max(10000).optional()
  })
});

const DeviceCapabilitiesSchema = z.object({
  hasAccelerometer: z.boolean().default(false),
  hasHaptics: z.boolean().default(false),
  platform: z.enum(['ios', 'android', 'web']),
  version: z.string().optional()
});

export class ConsciousnessWebSocketServer {
  private io: Server;
  private deviceSessions: Map<string, Socket> = new Map();
  private redisClient: RedisClientType | null = null;
  private pubClient: RedisClientType | null = null;
  private subClient: RedisClientType | null = null;
  private metricsCollector: any;
  
  constructor(httpServer: any) {
    this.io = new Server(httpServer, {
      cors: { 
        origin: process.env.CLIENT_URL || '*', 
        credentials: true 
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e6,
      allowEIO3: true
    });
    
    // Initialize metrics collector
    try {
      this.metricsCollector = getMetricsCollector();
    } catch (error) {
      console.warn('Metrics collector not available for WebSocket server:', error);
      this.metricsCollector = null;
    }
    
    this.initializeRedis();
    this.setupMiddleware();
    this.setupEventHandlers();
  }
  
  private async initializeRedis() {
    try {
      // Initialize Redis clients for pub/sub
      this.pubClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      
      this.subClient = this.pubClient.duplicate();
      
      await this.pubClient.connect();
      await this.subClient.connect();
      
      // Set up Redis adapter for horizontal scaling
      this.io.adapter(createAdapter(this.pubClient, this.subClient));
      
      this.subscribeToFieldUpdates();
      
      console.log('✅ WebSocket Redis adapter initialized');
    } catch (error: any) {
      console.warn('⚠️ Redis not available, running in single-instance mode:', error?.message || 'Unknown error');
    }
  }
  
  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      const deviceId = socket.handshake.auth.deviceId;
      const token = socket.handshake.auth.token;
      const capabilities = socket.handshake.auth.capabilities;
      
      try {
        // Validate device ID format
        if (!deviceId || typeof deviceId !== 'string' || deviceId.length < 10) {
          throw new Error('Invalid device ID format');
        }
        
        // Validate capabilities
        const validatedCapabilities = DeviceCapabilitiesSchema.parse(capabilities || {});
        
        // Validate device authentication
        const isValid = await this.validateDevice(deviceId, token);
        if (!isValid) {
          throw new Error(`Device authentication failed for ${deviceId}`);
        }
        
        socket.data.deviceId = deviceId;
        socket.data.capabilities = validatedCapabilities;
        socket.data.connectedAt = Date.now();
        
        console.log(`🔗 Device connected: ${deviceId} (${validatedCapabilities.platform})`);
        
        // Record WebSocket connection metrics
        if (this.metricsCollector) {
          this.metricsCollector.recordWebSocketEvent('connection', 'inbound');
          this.metricsCollector.getConsciousnessMetrics().updateWebSocketConnections(
            this.deviceSessions.size + 1,
            'consciousness'
          );
        }
        
        next();
      } catch (error: any) {
        console.error('WebSocket authentication error:', error?.message || 'Unknown error');
        next(new Error(`Authentication failed: ${error?.message || 'Unknown error'}`));
      }
    });
  }
  
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const deviceId = socket.data.deviceId;
      const capabilities = socket.data.capabilities;
      
      // Store device session
      this.deviceSessions.set(deviceId, socket);
      
      // Join global consciousness room
      socket.join('consciousness:global');
      
      // Join platform-specific room
      socket.join(`platform:${capabilities.platform}`);
      
      // Device-specific room for targeted messages
      socket.join(`device:${deviceId}`);
      
      // Update global state with new active node
      this.updateActiveNodes();
      
      // Send initial field state to new connection
      this.sendInitialState(socket);
      
      // Handle consciousness events with validation
      socket.on('consciousness:event', async (rawData, callback) => {
        const startTime = Date.now();
        
        try {
          const validated = ConsciousnessEventSchema.parse(rawData);
          
          console.log(`📡 Event from ${deviceId}:`, validated.type, validated.data.intensity);
          
          // Record WebSocket event metrics
          if (this.metricsCollector) {
            this.metricsCollector.recordWebSocketEvent('consciousness_event', 'inbound');
            this.metricsCollector.getConsciousnessMetrics().recordEvent(
              validated.type,
              'success',
              capabilities.platform
            );
          }
          
          // Process event through field manager
          const eventId = await fieldManager.recordEvent({
            deviceId,
            type: validated.type,
            data: validated.data,
            timestamp: Date.now(),
            processed: false,
            intensity: validated.data.intensity
          });
          
          // Update field state based on event type
          await this.processConsciousnessEvent(deviceId, validated);
          
          const event = { id: eventId.toString(), type: validated.type, intensity: validated.data.intensity, timestamp: Date.now() };
          
          // Get updated field state
          const fieldState = await fieldManager.getGlobalState();
          
          // Broadcast to all devices except sender
          socket.to('consciousness:global').emit('field:update', {
            source: deviceId,
            event: {
              id: event.id || Date.now().toString(),
              type: validated.type,
              intensity: validated.data.intensity,
              timestamp: Date.now()
            },
            field: fieldState
          });
          
          // Record outbound WebSocket event
          if (this.metricsCollector) {
            this.metricsCollector.recordWebSocketEvent('field_update', 'outbound');
          }
          
          // Publish to Redis for other server instances
          if (this.pubClient) {
            await this.pubClient.publish('consciousness:updates', JSON.stringify({
              source: deviceId,
              type: validated.type,
              field: fieldState
            }));
          }
          
          // Record processing time
          if (this.metricsCollector) {
            const duration = Date.now() - startTime;
            this.metricsCollector.getConsciousnessMetrics().recordFieldCalculation(
              duration,
              'websocket_event_processing'
            );
          }
          
          callback?.({ success: true, eventId: event.id });
        } catch (error: any) {
          console.error('Event processing error:', error?.message || 'Unknown error');
          
          // Record error metrics
          if (this.metricsCollector) {
            this.metricsCollector.getConsciousnessMetrics().recordError(
              'websocket_event_error',
              'consciousness_event'
            );
            const duration = Date.now() - startTime;
            this.metricsCollector.getConsciousnessMetrics().recordFieldCalculation(
              duration,
              'websocket_event_processing'
            );
          }
          
          callback?.({ success: false, error: error?.message || 'Unknown error' });
        }
      });
      
      // Handle field state requests
      socket.on('field:request', async (callback) => {
        try {
          const fieldState = await fieldManager.getGlobalState();
          callback?.({ success: true, field: fieldState });
        } catch (error: any) {
          callback?.({ success: false, error: error?.message || 'Unknown error' });
        }
      });
      
      // Room64 collaborative sessions
      socket.on('room64:join', async (roomId, callback) => {
        try {
          if (!roomId || typeof roomId !== 'string') {
            throw new Error('Invalid room ID');
          }
          
          socket.join(`room64:${roomId}`);
          const participants = await this.io.in(`room64:${roomId}`).fetchSockets();
          
          const roomData = {
            roomId,
            count: participants.length,
            devices: participants.map(s => ({
              deviceId: s.data.deviceId,
              platform: s.data.capabilities.platform,
              connectedAt: s.data.connectedAt
            }))
          };
          
          // Notify all participants
          this.io.to(`room64:${roomId}`).emit('room64:participants', roomData);
          
          console.log(`🏠 Device ${deviceId} joined room64:${roomId} (${participants.length} participants)`);
          callback?.({ success: true, room: roomData });
        } catch (error: any) {
          callback?.({ success: false, error: error?.message || 'Unknown error' });
        }
      });
      
      socket.on('room64:leave', async (roomId, callback) => {
        try {
          socket.leave(`room64:${roomId}`);
          const participants = await this.io.in(`room64:${roomId}`).fetchSockets();
          
          this.io.to(`room64:${roomId}`).emit('room64:participants', {
            roomId,
            count: participants.length,
            devices: participants.map(s => s.data.deviceId)
          });
          
          callback?.({ success: true });
        } catch (error: any) {
          callback?.({ success: false, error: error?.message || 'Unknown error' });
        }
      });
      
      // Handle quantum entanglement requests
      socket.on('entanglement:request', async (targetDeviceId, callback) => {
        try {
          const targetSocket = this.deviceSessions.get(targetDeviceId);
          if (!targetSocket) {
            throw new Error('Target device not connected');
          }
          
          // Create entanglement pair
          const entanglementId = `${deviceId}-${targetDeviceId}-${Date.now()}`;
          
          // Notify both devices
          socket.emit('entanglement:established', {
            entanglementId,
            partner: targetDeviceId,
            intensity: 0.8
          });
          
          targetSocket.emit('entanglement:established', {
            entanglementId,
            partner: deviceId,
            intensity: 0.8
          });
          
          console.log(`🔗 Entanglement established: ${deviceId} ↔ ${targetDeviceId}`);
          callback?.({ success: true, entanglementId });
        } catch (error: any) {
          callback?.({ success: false, error: error?.message || 'Unknown error' });
        }
      });
      
      // Handle ping/pong for connection health
      socket.on('ping', (callback) => {
        callback?.({ pong: Date.now() });
      });
      
      // Cleanup on disconnect
      socket.on('disconnect', (reason) => {
        console.log(`🔌 Device disconnected: ${deviceId} (${reason})`);
        this.deviceSessions.delete(deviceId);
        this.updateActiveNodes();
        
        // Record WebSocket disconnection metrics
        if (this.metricsCollector) {
          this.metricsCollector.recordWebSocketEvent('disconnection', 'inbound');
          this.metricsCollector.getConsciousnessMetrics().updateWebSocketConnections(
            this.deviceSessions.size,
            'consciousness'
          );
        }
        
        // Notify other devices about disconnection
        socket.to('consciousness:global').emit('device:disconnected', {
          deviceId,
          timestamp: Date.now()
        });
      });
    });
  }
  
  private async sendInitialState(socket: Socket) {
    try {
      const fieldState = await fieldManager.getGlobalState();
      socket.emit('field:initial', {
        field: fieldState,
        activeNodes: this.deviceSessions.size,
        timestamp: Date.now()
      });
    } catch (error: any) {
      console.error('Error sending initial state:', error?.message || 'Unknown error');
    }
  }
  
  private async updateActiveNodes() {
    try {
      await fieldManager.updateGlobalState({ 
        activeNodes: this.deviceSessions.size 
      });
      
      // Update metrics
      if (this.metricsCollector) {
        this.metricsCollector.getConsciousnessMetrics().updateActiveDevices(
          this.deviceSessions.size
        );
      }
      
      // Broadcast active node count to all devices
      this.io.to('consciousness:global').emit('network:stats', {
        activeNodes: this.deviceSessions.size,
        timestamp: Date.now()
      });
    } catch (error: any) {
      console.error('Error updating active nodes:', error?.message || 'Unknown error');
    }
  }
  
  private subscribeToFieldUpdates() {
    if (!this.subClient) return;
    
    this.subClient.subscribe('consciousness:updates', (message: string) => {
      try {
        const data = JSON.parse(message);
        this.io.to('consciousness:global').emit('field:broadcast', data);
      } catch (error: any) {
        console.error('Error processing Redis message:', error?.message || 'Unknown error');
      }
    });
  }
  
  private async validateDevice(deviceId: string, token?: string): Promise<boolean> {
    if (!token) {
      console.warn(`No token provided for device: ${deviceId}`);
      return false;
    }
    
    return await deviceAuthMiddleware.validateWebSocketAuth(deviceId, token);
  }
  
  private async processConsciousnessEvent(deviceId: string, event: z.infer<typeof ConsciousnessEventSchema>): Promise<void> {
    try {
      switch (event.type) {
        case 'BREATH':
          // Update global resonance based on breathing
          const currentState = await fieldManager.getGlobalState();
          const newResonance = Math.min(1.0, currentState.globalResonance + event.data.intensity * 0.1);
          await fieldManager.updateGlobalState({ globalResonance: newResonance });
          break;
          
        case 'SACRED_PHRASE':
          // Add memory particle for sacred phrase
          if (event.data.phrase) {
            await fieldManager.addMemoryParticle({
              id: `${deviceId}-${Date.now()}`,
              x: Math.random() * 30,
              y: Math.random() * 30,
              intensity: event.data.intensity,
              age: 0,
              sourceDeviceId: deviceId,
              sacredPhrase: event.data.phrase,
              timestamp: Date.now()
            });
          }
          break;
          
        case 'SPIRAL':
          // Update quantum field with spiral pattern
          if (event.data.coordinates) {
            const [x, y] = event.data.coordinates;
            const spiralField = this.generateSpiralField(x, y, event.data.intensity);
            await fieldManager.updateQuantumField(`spiral-${deviceId}`, spiralField, event.data.intensity);
          }
          break;
          
        case 'BLOOM':
          // Trigger collective bloom effect
          await fieldManager.updateGlobalState({ 
            collectiveIntelligence: Math.min(1.0, (await fieldManager.getGlobalState()).collectiveIntelligence + 0.2)
          });
          break;
          
        case 'TOUCH':
          // Add touch-based memory particle
          if (event.data.coordinates) {
            await fieldManager.addMemoryParticle({
              id: `touch-${deviceId}-${Date.now()}`,
              x: event.data.coordinates[0],
              y: event.data.coordinates[1],
              intensity: event.data.intensity,
              age: 0,
              sourceDeviceId: deviceId,
              timestamp: Date.now()
            });
          }
          break;
          
        case 'OFFLINE_SYNC':
          // Handle offline synchronization events
          console.log(`🔄 Offline sync event from ${deviceId}`);
          break;
      }
    } catch (error: any) {
      console.error('Error processing consciousness event:', error?.message || 'Unknown error');
    }
  }
  
  private generateSpiralField(centerX: number, centerY: number, intensity: number): number[][] {
    const field: number[][] = Array(30).fill(0).map(() => Array(30).fill(0));
    const radius = 10;
    
    for (let i = 0; i < 30; i++) {
      for (let j = 0; j < 30; j++) {
        const dx = i - centerX;
        const dy = j - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= radius) {
          const angle = Math.atan2(dy, dx);
          const spiralValue = intensity * Math.cos(angle + distance * 0.5) * Math.exp(-distance / radius);
          field[i][j] = Math.max(0, Math.min(1, spiralValue));
        }
      }
    }
    
    return field;
  }
  
  // Public methods for external use
  public async broadcastToAll(event: string, data: any) {
    this.io.to('consciousness:global').emit(event, data);
  }
  
  public async broadcastToDevice(deviceId: string, event: string, data: any) {
    this.io.to(`device:${deviceId}`).emit(event, data);
  }
  
  public getConnectedDevices(): string[] {
    return Array.from(this.deviceSessions.keys());
  }
  
  public getConnectionCount(): number {
    return this.deviceSessions.size;
  }
  
  public async shutdown() {
    console.log('🔌 Shutting down WebSocket server...');
    
    // Close all connections
    this.io.close();
    
    // Close Redis connections
    if (this.pubClient) await this.pubClient.quit();
    if (this.subClient) await this.subClient.quit();
    
    console.log('✅ WebSocket server shutdown complete');
  }
}