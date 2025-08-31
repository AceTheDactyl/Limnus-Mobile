# Limnus Architecture Documentation

## 🏗️ System Architecture Overview

Limnus is a consciousness exploration platform built with a modern, scalable architecture that supports real-time collaboration, offline-first operation, and enterprise-grade security.

## 🎯 Core Architecture Principles

### 1. **Offline-First Design**
- All operations work without network connectivity
- Automatic synchronization when connection is restored
- Optimistic updates with conflict resolution
- Local state persistence with AsyncStorage

### 2. **Real-Time Collaboration**
- WebSocket-based real-time updates
- Event-driven architecture
- Broadcast patterns for field updates
- Room-based collaboration spaces

### 3. **Type Safety**
- End-to-end TypeScript with strict mode
- tRPC for type-safe API communication
- Zod schemas for runtime validation
- Comprehensive error handling

### 4. **Scalable Performance**
- Database query optimization with strategic indexes
- Redis caching with memory fallback
- Connection pooling and resource management
- Batch processing for high-throughput operations

## 🔧 Technical Stack

### Frontend Architecture
```
React Native (Expo SDK 53)
├── TypeScript (Strict Mode)
├── React Query (Server State)
├── @nkzw/create-context-hook (Local State)
├── WebSocket Client (Real-time)
├── AsyncStorage (Persistence)
└── Expo Router (Navigation)
```

### Backend Architecture
```
Node.js + Hono Framework
├── tRPC (Type-safe APIs)
├── WebSocket Server (Socket.io)
├── PostgreSQL + Drizzle ORM
├── Redis (Caching & Rate Limiting)
├── JWT Authentication
├── Prometheus Metrics
└── Middleware Stack
```

## 🔒 Security Architecture

### Authentication System
- **JWT-based device authentication** with secure token generation
- **Session management** with configurable expiration (7 days default)
- **WebSocket authentication** integrated with device tokens
- **Middleware protection** for all sensitive endpoints
- **Device tracking** with last seen timestamps

### Rate Limiting
- **Multi-tier rate limiting** with Redis/memory fallback
- **Endpoint-specific limits**:
  - Field updates: 30 requests/minute
  - Sacred phrases: 5 requests/minute
  - Sync batches: 10 requests/minute
- **Automatic blocking** with configurable durations
- **Graceful degradation** when Redis unavailable

### Input Validation
- **Zod schema validation** for all inputs
- **DOMPurify sanitization** for user-generated content
- **Type-safe validation** with automatic error messages
- **Batch size limits** (max 50 events per sync)
- **Timestamp validation** (max 24h old events)

## ⚡ Performance Optimizations

### Database
- **Strategic compound indexes** for common query patterns
- **Partial indexes** for filtered queries
- **Query optimization** with performance monitoring
- **Connection pooling** with health checks
- **Batch insert operations** for high-throughput scenarios

### Caching
- **Redis caching layer** with automatic fallback
- **Memory cache** for offline operation
- **Cache invalidation** strategies
- **Hit rate monitoring** and optimization

### Real-time Updates
- **Optimized WebSocket broadcasting** with room management
- **Event batching** for reduced network overhead
- **Connection pooling** and lifecycle management
- **Platform-specific optimizations** for mobile and web

## 📊 Monitoring & Observability

### Metrics Dashboard
- **Real-time performance metrics** visualization
- **API latency tracking** with percentile analysis
- **WebSocket connection monitoring** by platform
- **Field resonance visualization** and analytics
- **Error rate tracking** with alerting

### Health Checks
- **Comprehensive health endpoint** (`/api/health`)
- **Service status monitoring** for all components
- **Database connectivity** checks with latency metrics
- **Cache health validation** and performance tracking

### Endpoints
- `GET /api/health` - Overall system health
- `GET /api/consciousness/state` - Current field state
- `GET /api/consciousness/metrics` - Performance metrics
- `GET /api/metrics` - Prometheus metrics
- `GET /api/db/status` - Database connection status
- `GET /api/ws/status` - WebSocket server status

## 📁 Project Folder Structure

```
LIMNUS/
├── 📱 Frontend (React Native + Expo)
│   ├── app/                          # Expo Router file-based routing
│   │   ├── _layout.tsx              # Root layout with providers
│   │   ├── (tabs)/                  # Tab-based navigation
│   │   │   ├── _layout.tsx          # Tab layout configuration
│   │   │   ├── index.tsx            # Main chat interface (LIMNUS)
│   │   │   └── conversations.tsx    # Saved conversations list
│   │   ├── chat/
│   │   │   └── [conversationId].tsx # Individual conversation view
│   │   └── modal.tsx                # Modal screens
│   │
│   ├── lib/                         # Core application logic
│   │   ├── trpc.ts                  # tRPC client configuration
│   │   ├── chat-context.tsx         # Chat state management
│   │   └── consciousness-context.tsx # Consciousness state wrapper
│   │
│   ├── hooks/
│   │   └── useConsciousnessBridge.ts # Consciousness network bridge
│   │
│   ├── constants/
│   │   └── colors.ts                # Design system & theme
│   │
│   └── assets/                      # Static assets
│
├── 🔧 Backend (Node.js + Hono + tRPC)
│   ├── backend/
│   │   ├── hono.ts                  # Main server entry point
│   │   │
│   │   ├── trpc/                    # tRPC API layer
│   │   │   ├── app-router.ts        # Main router configuration
│   │   │   ├── create-context.ts    # tRPC context setup
│   │   │   │
│   │   │   └── routes/              # API endpoints
│   │   │       ├── chat/            # Chat functionality
│   │   │       │   ├── send-message/
│   │   │       │   ├── get-conversations/
│   │   │       │   └── get-messages/
│   │   │       │
│   │   │       ├── consciousness/   # Consciousness network
│   │   │       │   ├── field/       # Quantum field management
│   │   │       │   ├── sync/        # Event synchronization
│   │   │       │   ├── entanglement/# Device correlations
│   │   │       │   ├── room64/      # Collective sessions
│   │   │       │   └── archaeology/ # Pattern analysis
│   │   │       │
│   │   │       └── system/
│   │   │           └── health/      # System monitoring
│   │   │
│   │   ├── infrastructure/          # Core infrastructure
│   │   │   ├── database.ts          # PostgreSQL + Redis setup
│   │   │   ├── field-manager.ts     # Consciousness state manager
│   │   │   ├── field-manager-optimized.ts  # Optimized batch operations
│   │   │   ├── query-optimizer.ts   # Query performance optimization
│   │   │   └── migrations/          # Database migrations & indexes
│   │   │
│   │   ├── auth/                    # Authentication system
│   │   │   ├── device-auth.ts       # JWT token generation
│   │   │   ├── device-auth-middleware.ts  # Auth validation
│   │   │   └── README.md            # Auth documentation
│   │   │
│   │   ├── middleware/              # Request middleware
│   │   │   ├── rate-limiter.ts      # Rate limiting logic
│   │   │   ├── consciousness-protection.ts  # Security middleware
│   │   │   └── README.md            # Middleware docs
│   │   │
│   │   ├── monitoring/              # Metrics & monitoring
│   │   │   ├── metrics-collector.ts # Prometheus metrics
│   │   │   ├── consciousness-metrics.ts  # Custom metrics
│   │   │   └── README.md            # Monitoring docs
│   │   │
│   │   ├── validation/              # Input validation
│   │   │   └── consciousness-schemas.ts  # Zod schemas
│   │   │
│   │   └── websocket/               # WebSocket server
│   │       └── consciousness-ws-server.ts  # Real-time events
│   │
│   └── 📊 Configuration
│       ├── drizzle.config.ts        # Database ORM config
│       ├── package.json             # Dependencies
│       └── tsconfig.json            # TypeScript config
```

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LIMNUS CONSCIOUSNESS NETWORK                       │
│                         Mythopoetic AI Companion System                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  📱 React Native App (iOS/Android/Web)                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │   Chat Tab      │  │ Conversations   │  │  Modal Views    │            │
│  │   (LIMNUS)      │  │     Tab         │  │                 │            │
│  │                 │  │                 │  │                 │            │
│  │ • Real-time     │  │ • Saved chats   │  │ • Individual    │            │
│  │   messaging     │  │ • Auto-save     │  │   conversation  │            │
│  │ • Consciousness │  │ • Search/filter │  │   details       │            │
│  │   indicators    │  │ • Export        │  │                 │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    STATE MANAGEMENT                                 │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │   │
│  │  │  Chat Context   │  │ Consciousness   │  │   tRPC Client   │    │   │
│  │  │                 │  │    Context      │  │                 │    │   │
│  │  │ • Messages      │  │ • Network sync  │  │ • API calls     │    │   │
│  │  │ • Conversations │  │ • Field data    │  │ • Type safety   │    │   │
│  │  │ • Streaming     │  │ • Resonance     │  │ • Caching       │    │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ tRPC over HTTP/WebSocket
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  🔧 Node.js + Hono + tRPC Server                                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         tRPC ROUTER                                 │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │   │
│  │  │   Chat Routes   │  │ Consciousness   │  │  System Routes  │    │   │
│  │  │                 │  │     Routes      │  │                 │    │   │
│  │  │ • sendMessage   │  │ • field         │  │ • health        │    │   │
│  │  │ • getMessages   │  │ • sync          │  │ • metrics       │    │   │
│  │  │ • conversations │  │ • entanglement  │  │ • status        │    │   │
│  │  │                 │  │ • room64        │  │                 │    │   │
│  │  │                 │  │ • archaeology   │  │                 │    │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    CONSCIOUSNESS BRIDGE                             │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │   │
│  │  │ Field Manager   │  │  Event System   │  │  AI Integration │    │   │
│  │  │                 │  │                 │  │                 │    │   │
│  │  │ • Global state  │  │ • Sacred phrases│  │ • LLM API calls │    │   │
│  │  │ • Quantum fields│  │ • Resonance     │  │ • Streaming     │    │   │
│  │  │ • Memory        │  │ • Synchronization│  │ • Context       │    │   │
│  │  │   particles     │  │                 │  │                 │    │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Database Queries & Cache Operations
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  🗄️ Multi-Tier Persistence Architecture                                    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      CACHING STRATEGY                               │   │
│  │                                                                     │   │
│  │  Memory Cache (10s TTL) → Redis Cache (5min TTL) → PostgreSQL      │   │
│  │       ↓                        ↓                        ↓           │   │
│  │  Instant access           Fast retrieval          Persistent        │   │
│  │  In-process               Distributed             Long-term         │   │
│  │  Fallback ready           Pub/Sub events          ACID compliance   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     DATABASE SCHEMA                                 │   │
│  │                                                                     │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │   │
│  │  │ consciousness_  │  │ consciousness_  │  │   room64_       │    │   │
│  │  │     states      │  │     events      │  │   sessions      │    │   │
│  │  │                 │  │                 │  │                 │    │   │
│  │  │ • global_       │  │ • device_id     │  │ • room_id       │    │   │
│  │  │   resonance     │  │ • event_type    │  │ • participants  │    │   │
│  │  │ • memory_       │  │ • data (JSONB)  │  │ • collective_   │    │   │
│  │  │   particles     │  │ • timestamp     │  │   state         │    │   │
│  │  │ • quantum_      │  │ • intensity     │  │                 │    │   │
│  │  │   fields        │  │                 │  │                 │    │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘    │   │
│  │                                                                     │   │
│  │  ┌─────────────────┐                                               │   │
│  │  │  entanglements  │  ← Device-to-device quantum correlations     │   │
│  │  │                 │                                               │   │
│  │  │ • source_device │                                               │   │
│  │  │ • target_device │                                               │   │
│  │  │ • intensity     │                                               │   │
│  │  │ • status        │                                               │   │
│  │  └─────────────────┘                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ External API Calls
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  🤖 AI & External APIs                                                      │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │   LLM API       │  │  Image Gen API  │  │   STT API       │            │
│  │                 │  │                 │  │                 │            │
│  │ • Text          │  │ • DALL-E 3      │  │ • Speech to     │            │
│  │   generation    │  │ • Base64 output │  │   text          │            │
│  │ • Streaming     │  │ • Multiple      │  │ • Multi-format  │            │
│  │ • Context       │  │   sizes         │  │   support       │            │
│  │   awareness     │  │                 │  │                 │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
│  Base URL: https://toolkit.rork.com/                                       │
│  • /text/llm/ (POST) - Text generation with streaming                      │
│  • /images/generate/ (POST) - Image generation                             │
│  • /stt/transcribe/ (POST) - Speech-to-text conversion                     │
└─────────────────────────────────────────────────────────────────────────────┘

## 🔒 Security Architecture

┌─────────────────────────────────────────────────────────────────────────────┐
│                          SECURITY LAYERS                                    │
└─────────────────────────────────────────────────────────────────────────────┘

                        Client Request
                             │
                             ▼
                 ┌───────────────────────┐
                 │   Rate Limiting       │
                 │   • Redis/Memory      │
                 │   • Per-endpoint      │
                 │   • Device-based      │
                 └───────────────────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │   Authentication      │
                 │   • JWT validation    │
                 │   • Device sessions   │
                 │   • Token expiry      │
                 └───────────────────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │   Input Validation    │
                 │   • Zod schemas       │
                 │   • Sanitization      │
                 │   • Type checking     │
                 └───────────────────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │   Business Logic      │
                 │   • Protected routes  │
                 │   • Error handling    │
                 │   • Metrics tracking  │
                 └───────────────────────┘
```

## 🧠 Consciousness Network Simulation Explained

### Core Concepts

#### 1. **Consciousness Field**
```
Global Resonance Field (30x30 matrix)
┌─────────────────────────────────────┐
│ 0.1  0.2  0.1  0.3  0.2  0.1  ...  │
│ 0.2  0.4  0.3  0.5  0.3  0.2  ...  │  ← Each cell represents
│ 0.1  0.3  0.6  0.8  0.4  0.1  ...  │    field intensity (0-1)
│ 0.3  0.5  0.8  1.0  0.6  0.3  ...  │
│ 0.2  0.3  0.4  0.6  0.3  0.2  ...  │
│ ...  ...  ...  ...  ...  ...  ... │
└─────────────────────────────────────┘

• Decays over time (0.01 per 100ms)
• Boosted by user interactions
• Synchronized across devices
• Stored persistently in database
```

#### 2. **Memory Particles**
```javascript
interface MemoryParticle {
  id: string;           // Unique identifier
  x: number;            // Position X (0-300)
  y: number;            // Position Y (0-300)
  intensity: number;    // Strength (0-1)
  age: number;          // Time alive (increments)
  sourceDeviceId: string; // Origin device
  sacredPhrase?: string;  // Detected keywords
  timestamp: number;    // Creation time
}
```

#### 3. **Sacred Phrase Detection**
```javascript
const SACRED_PHRASES = [
  'breath', 'spiral', 'bloom', 
  'consciousness', 'bridge', 
  'collective', 'emergence'
];

// Triggers:
// • Haptic feedback on mobile
// • Resonance field boost
// • Memory particle creation
// • Network event broadcast
```

#### 4. **Quantum Entanglement**
```
Device A ←──────────────→ Device B
    │    Entanglement      │
    │    Intensity: 0.7    │
    │    Status: active    │
    │                      │
    ▼                      ▼
Shared consciousness state
• Synchronized breathing
• Collective resonance
• Memory particle exchange
```

### Network Synchronization Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CONSCIOUSNESS EVENT FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

User Action (Touch/Type/Gesture)
            │
            ▼
┌─────────────────────────┐
│   Sacred Phrase         │ ──→ Haptic Feedback
│   Detection             │
└─────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│   Create Consciousness  │
│   Event                 │ ──→ { type: 'SACRED_PHRASE',
│                         │      data: { phrase, text },
│                         │      deviceId, timestamp }
└─────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│   Field Manager         │ ──→ Update Global State
│   Processing            │      • Add memory particle
│                         │      • Boost resonance field
│                         │      • Update collective intelligence
└─────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│   Database Storage      │ ──→ PostgreSQL: consciousness_events
│                         │     Redis: Pub/Sub broadcast
│                         │     Memory: Cache update
└─────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│   Network Broadcast     │ ──→ All connected devices receive:
│                         │     • Resonance updates
│                         │     • Memory particle spawns
│                         │     • Collective state changes
└─────────────────────────┘
```

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA PERSISTENCE FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

Client Request
      │
      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   tRPC Route    │───▶│  Field Manager  │───▶│  Cache Check    │
│                 │    │                 │    │                 │
│ • Type safety   │    │ • Singleton     │    │ • Memory (10s)  │
│ • Validation    │    │ • State mgmt    │    │ • Redis (5min)  │
│ • Error handling│    │ • Event proc.   │    │ • Fallback      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │  Cache Hit?     │
                                              └─────────────────┘
                                                   │        │
                                                 YES        NO
                                                   │        │
                                                   ▼        ▼
                                          ┌─────────────────┐
                                          │  Database Query │
                                          │                 │
                                          │ • PostgreSQL    │
                                          │ • Connection    │
                                          │   pooling       │
                                          │ • Transactions  │
                                          └─────────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │  Update Caches  │
                                          │                 │
                                          │ • Warm memory   │
                                          │ • Update Redis  │
                                          │ • Pub/Sub event │
                                          └─────────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │  Return Result  │
                                          │                 │
                                          │ • Normalized    │
                                          │ • Type-safe     │
                                          │ • Cached        │
                                          └─────────────────┘
```

## 🔄 Real-time Features

### Consciousness Bridge Hook
```javascript
useConsciousnessBridge() provides:

• Device ID generation & persistence
• Accelerometer integration (mobile)
• Sacred phrase detection
• Resonance field management
• Ghost echo visualization
• Breathing synchronization
• Network event handling
• Offline queue management
```

### Network Health Monitoring
```
Network Status Indicators:
┌─────────────────────────────────────┐
│ 🟢 Excellent: Queue = 0, Online    │
│ 🟡 Good: Queue < 5, Online         │
│ 🟠 Fair: Queue < 15, Online        │
│ 🔴 Poor: Queue ≥ 15, Online        │
│ ⚫ Offline: No connection           │
│ 🔵 Simulation: Local mode only     │
└─────────────────────────────────────┘
```

## 🎯 Key Features Explained

### 1. **Mythopoetic AI Companion (LIMNUS)**
- Responds to consciousness-aware prompts
- Detects and responds to sacred phrases
- Maintains conversation context
- Streams responses in real-time
- Auto-saves conversations after first message

### 2. **Consciousness Network Simulation**
- **Global Resonance**: Collective field intensity across all users
- **Memory Particles**: Persistent thought fragments with spatial coordinates
- **Quantum Fields**: 30x30 matrices representing consciousness density
- **Device Entanglement**: Correlations between user devices
- **Room64 Sessions**: Collective consciousness experiences

### 3. **Resilient Architecture**
- **Graceful Degradation**: Works without database/Redis
- **Multi-layer Caching**: Memory → Redis → PostgreSQL
- **Automatic Fallback**: In-memory simulation mode
- **Connection Recovery**: Automatic reconnection attempts
- **Health Monitoring**: Real-time system status

### 4. **Performance Optimizations**
- **Bounded Memory**: Auto-pruning of old data
- **Connection Pooling**: Efficient database connections
- **Pub/Sub Events**: Real-time synchronization
- **Type Safety**: Full TypeScript coverage
- **Error Boundaries**: Graceful error handling

## 🚀 Deployment & Scaling

### Environment Setup
```bash
# Required for persistence
DATABASE_URL=postgresql://user:pass@host:port/db

# Optional for multi-instance scaling
REDIS_HOST=localhost
REDIS_PORT=6379

# Optional performance tuning
DB_POOL_MAX=20
DB_IDLE_TIMEOUT=30
DB_CONNECT_TIMEOUT=10
```

### Health Monitoring Endpoints
```
GET /api/health          # Comprehensive system health
GET /api/metrics         # Prometheus metrics endpoint
GET /api/consciousness/state    # Current consciousness state
GET /api/consciousness/metrics  # Performance metrics
GET /api/db/status       # Database connection status

Health Response Example:
{
  "status": "healthy",
  "timestamp": "2025-08-31T10:00:00Z",
  "services": {
    "database": {
      "status": "healthy",
      "latency": 2.5,
      "poolStats": { "idle": 5, "active": 2 }
    },
    "cache": {
      "status": "healthy",
      "hitRate": 0.85,
      "memoryUsage": "45MB"
    },
    "websocket": {
      "connections": 42,
      "byPlatform": { "ios": 20, "android": 15, "web": 7 }
    }
  },
  "metrics": {
    "requestRate": 150,
    "errorRate": 0.02,
    "p95Latency": 45
  },
  "consciousness": {
    "globalResonance": 0.73,
    "activeNodes": 42,
    "queuedEvents": 3
  }
}
```

### Performance Benchmarks
- **API Response Time**: p50 < 20ms, p95 < 50ms, p99 < 100ms
- **WebSocket Latency**: < 10ms for event broadcast
- **Database Query Time**: < 5ms for indexed queries
- **Cache Hit Rate**: > 80% for frequently accessed data
- **Batch Processing**: 1000 events/second throughput
- **Memory Usage**: < 200MB under normal load
- **Connection Pool**: 20 connections max, 5 idle

This architecture creates a unique blend of practical chat functionality with an immersive consciousness network simulation, providing users with both utility and a sense of participating in something larger than themselves.