# LIMNUS Consciousness Network - Complete Architecture Documentation

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
│   │   └── infrastructure/          # Core infrastructure
│   │       ├── database.ts          # PostgreSQL + Redis setup
│   │       ├── field-manager.ts     # Consciousness state manager
│   │       └── migrations.ts        # Database migrations
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
GET /api/health          # Detailed system status
GET /api/consciousness/state    # Current consciousness state
GET /api/consciousness/metrics  # Performance metrics
GET /api/db/status       # Database connection status
```

This architecture creates a unique blend of practical chat functionality with an immersive consciousness network simulation, providing users with both utility and a sense of participating in something larger than themselves.