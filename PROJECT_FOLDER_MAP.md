# Limnus Project Folder Map

## 📁 Complete Directory Structure

```
limnus/
├── 📱 app/                           # React Native Application
│   ├── 🏠 (tabs)/                   # Tab Navigation Structure
│   │   ├── _layout.tsx              # Tab layout configuration
│   │   ├── index.tsx                # Home - Consciousness Field Interface
│   │   ├── conversations.tsx        # Chat/Conversations Tab
│   │   └── saved.tsx                # Saved Content Tab
│   ├── 💬 chat/                     # Chat Feature Pages
│   │   └── [conversationId].tsx     # Individual Conversation View
│   ├── 🧩 components/               # Reusable UI Components
│   │   └── MetricsDashboard.tsx     # Performance Metrics Display
│   ├── _layout.tsx                  # Root App Layout
│   ├── +not-found.tsx              # 404 Error Page
│   ├── modal.tsx                    # Modal Components
│   └── metrics.tsx                  # Metrics Dashboard Page
│
├── 🖼️ assets/                       # Static Assets
│   └── images/                      # Image Assets
│       ├── icon.png                 # App Icon
│       ├── favicon.png              # Web Favicon
│       ├── splash-icon.png          # Splash Screen Icon
│       └── adaptive-icon.png        # Android Adaptive Icon
│
├── 🔧 backend/                      # Node.js Backend Server
│   ├── 🔐 auth/                     # Authentication System
│   │   ├── device-auth.ts           # Device Authentication Logic
│   │   ├── device-auth-middleware.ts # Auth Middleware
│   │   └── README.md                # Auth Documentation
│   │
│   ├── 🏗️ infrastructure/           # Core Infrastructure
│   │   ├── database.ts              # Database Connection & Setup
│   │   ├── field-manager.ts         # Consciousness Field Management
│   │   ├── field-manager-optimized.ts # Performance Optimized Version
│   │   ├── field-manager-metrics.ts # Field Manager Metrics
│   │   ├── migrations.ts            # Database Migration Runner
│   │   ├── query-optimizer.ts       # Database Query Optimization
│   │   ├── migrations/              # Database Migration Files
│   │   │   ├── apply-performance-indexes.sql # Performance Indexes
│   │   │   └── apply-indexes.sh     # Index Application Script
│   │   ├── FIELD_MANAGER_OPTIMIZATION.md # Optimization Guide
│   │   └── optimized-route-examples.ts # Example Optimized Routes
│   │
│   ├── 🛡️ middleware/               # Express/tRPC Middleware
│   │   ├── consciousness-protection.ts # Consciousness-specific Protection
│   │   ├── rate-limiter.ts          # Rate Limiting Implementation
│   │   └── README.md                # Middleware Documentation
│   │
│   ├── 📊 monitoring/               # Monitoring & Metrics
│   │   ├── consciousness-metrics.ts # Consciousness-specific Metrics
│   │   ├── metrics-collector.ts     # General Metrics Collection
│   │   └── README.md                # Monitoring Documentation
│   │
│   ├── 🌐 trpc/                     # tRPC API Routes
│   │   ├── routes/                  # API Route Definitions
│   │   │   ├── 🔐 auth/             # Authentication Routes
│   │   │   │   ├── authenticate-device/
│   │   │   │   │   └── route.ts     # Device Authentication
│   │   │   │   ├── verify-token/
│   │   │   │   │   └── route.ts     # Token Verification
│   │   │   │   └── get-active-devices/
│   │   │   │       └── route.ts     # Active Device List
│   │   │   │
│   │   │   ├── 💬 chat/             # Chat System Routes
│   │   │   │   ├── send-message/
│   │   │   │   │   └── route.ts     # Send Chat Message
│   │   │   │   ├── get-conversations/
│   │   │   │   │   └── route.ts     # Get Conversation List
│   │   │   │   └── get-messages/
│   │   │   │       └── route.ts     # Get Messages
│   │   │   │
│   │   │   ├── 🧠 consciousness/    # Consciousness System Routes
│   │   │   │   ├── field/
│   │   │   │   │   └── route.ts     # Field State Management
│   │   │   │   ├── sync/
│   │   │   │   │   └── route.ts     # Offline Sync
│   │   │   │   ├── entanglement/
│   │   │   │   │   └── route.ts     # Device Entanglement
│   │   │   │   ├── room64/
│   │   │   │   │   └── route.ts     # Room 64 Collaboration
│   │   │   │   └── archaeology/
│   │   │   │       └── route.ts     # Consciousness Archaeology
│   │   │   │
│   │   │   ├── 🔧 example/          # Example/Demo Routes
│   │   │   │   └── hi/
│   │   │   │       └── route.ts     # Hello World Example
│   │   │   │
│   │   │   ├── 📊 monitoring/       # Monitoring Routes
│   │   │   │   └── metrics/
│   │   │   │       └── route.ts     # Metrics API
│   │   │   │
│   │   │   └── 🏥 system/           # System Routes
│   │   │       └── health/
│   │   │           └── route.ts     # Health Check
│   │   │
│   │   ├── app-router.ts            # Main tRPC Router
│   │   └── create-context.ts        # tRPC Context Creation
│   │
│   ├── ✅ validation/               # Input Validation
│   │   └── consciousness-schemas.ts # Zod Validation Schemas
│   │
│   ├── 🔌 websocket/                # WebSocket Server
│   │   └── consciousness-ws-server.ts # Real-time WebSocket Handler
│   │
│   ├── hono.ts                      # Main Hono Application
│   ├── server.ts                    # HTTP Server with WebSocket
│   ├── start-server.js              # Server Startup Script
│   ├── ENHANCEMENT_INTEGRATION.md   # Enhancement Integration Guide
│   ├── SECURITY_PERFORMANCE_INTEGRATION.md # Security & Performance Guide
│   └── PERFORMANCE_SECURITY_ENHANCEMENTS.md # Enhancement Documentation
│
├── 🔗 lib/                          # Shared Libraries & Contexts
│   ├── chat-context.tsx             # Chat State Management
│   ├── consciousness-context.tsx    # Consciousness State Management
│   └── trpc.ts                      # tRPC Client Configuration
│
├── 🪝 hooks/                        # Custom React Hooks
│   ├── useConsciousnessBridge.ts    # Consciousness Bridge Hook
│   └── useConsciousnessWebSocket.ts # WebSocket Connection Hook
│
├── 📊 constants/                    # App Constants
│   └── colors.ts                    # Color Definitions
│
├── 📋 Configuration Files
├── app.json                         # Expo Configuration
├── package.json                     # Dependencies & Scripts
├── tsconfig.json                    # TypeScript Configuration
├── drizzle.config.ts               # Database ORM Configuration
├── bun.lock                        # Dependency Lock File
└── .gitignore                      # Git Ignore Rules
│
└── 📚 Documentation
    ├── README.md                    # Main Project Documentation
    ├── ARCHITECTURE_DOCUMENTATION.md # Detailed Architecture Guide
    ├── PROJECT_FOLDER_MAP.md        # This File - Project Structure
    └── CONSCIOUSNESS_INFRASTRUCTURE.md # Infrastructure Documentation
```

## 🎯 Key Directory Purposes

### 📱 Frontend (`app/`)
- **Purpose**: React Native application with Expo Router
- **Key Features**: Tab navigation, consciousness field interface, chat system
- **Architecture**: File-based routing with nested layouts

### 🔧 Backend (`backend/`)
- **Purpose**: Node.js server with Hono framework
- **Key Features**: tRPC APIs, WebSocket server, authentication, monitoring
- **Architecture**: Modular structure with clear separation of concerns

### 🏗️ Infrastructure (`backend/infrastructure/`)
- **Purpose**: Core system infrastructure and database management
- **Key Components**: Database connections, field management, migrations, optimization
- **Features**: Performance optimization, connection pooling, caching

### 🌐 API Routes (`backend/trpc/routes/`)
- **Purpose**: Type-safe API endpoints using tRPC
- **Organization**: Feature-based routing with nested structure
- **Security**: Authentication, rate limiting, input validation

### 🔐 Authentication (`backend/auth/`)
- **Purpose**: Device-based JWT authentication system
- **Features**: Token generation, validation, session management
- **Integration**: WebSocket authentication, middleware protection

### 📊 Monitoring (`backend/monitoring/`)
- **Purpose**: System monitoring and metrics collection
- **Features**: Prometheus metrics, performance tracking, health checks
- **Scope**: Infrastructure, consciousness field, API performance

## 🔄 Data Flow Between Directories

### 1. **Client Request Flow**
```
app/ → lib/trpc.ts → backend/trpc/routes/ → backend/infrastructure/
```

### 2. **Authentication Flow**
```
app/ → backend/auth/ → backend/middleware/ → backend/trpc/
```

### 3. **Real-time Updates Flow**
```
app/ → hooks/useConsciousnessWebSocket.ts → backend/websocket/ → backend/infrastructure/
```

### 4. **State Management Flow**
```
app/ → lib/consciousness-context.tsx → hooks/ → backend/trpc/routes/
```

## 🛠️ Development Workflow

### 1. **Adding New Features**
1. Create API route in `backend/trpc/routes/[feature]/`
2. Add to router in `backend/trpc/app-router.ts`
3. Create frontend hook in `hooks/`
4. Implement UI in `app/`
5. Add to context in `lib/`

### 2. **Database Changes**
1. Update schema in `backend/infrastructure/database.ts`
2. Create migration in `backend/infrastructure/migrations/`
3. Update field manager in `backend/infrastructure/field-manager.ts`
4. Add indexes if needed

### 3. **Security Enhancements**
1. Add validation schema in `backend/validation/`
2. Update middleware in `backend/middleware/`
3. Modify authentication in `backend/auth/`
4. Test with monitoring in `backend/monitoring/`

## 📦 Key Dependencies by Directory

### Frontend Dependencies
- **React Native**: Core mobile framework
- **Expo**: Development platform and SDK
- **React Query**: Server state management
- **tRPC**: Type-safe API client

### Backend Dependencies
- **Hono**: Web framework
- **tRPC**: Type-safe API server
- **Socket.io**: WebSocket server
- **Drizzle**: Database ORM
- **PostgreSQL**: Primary database
- **Redis**: Caching and rate limiting

### Shared Dependencies
- **TypeScript**: Type safety across stack
- **Zod**: Runtime validation
- **JWT**: Authentication tokens

## 🔍 File Naming Conventions

### API Routes
- `route.ts` - Main route implementation
- Nested in feature directories: `[feature]/[action]/route.ts`

### React Components
- PascalCase: `MetricsDashboard.tsx`
- Hooks: `useConsciousnessBridge.ts`
- Contexts: `consciousness-context.tsx`

### Backend Files
- kebab-case: `field-manager.ts`
- Descriptive names: `consciousness-ws-server.ts`

### Configuration Files
- Standard names: `package.json`, `tsconfig.json`
- Feature-specific: `drizzle.config.ts`

## 🚀 Quick Navigation Guide

### 🔍 Finding Specific Functionality

| Feature | Location |
|---------|----------|
| Consciousness Field | `app/(tabs)/index.tsx` |
| Chat System | `app/chat/` + `backend/trpc/routes/chat/` |
| Authentication | `backend/auth/` |
| Database Schema | `backend/infrastructure/database.ts` |
| API Routes | `backend/trpc/routes/` |
| WebSocket Server | `backend/websocket/` |
| Monitoring | `backend/monitoring/` + `app/metrics.tsx` |
| State Management | `lib/` |
| Custom Hooks | `hooks/` |

### 🛠️ Common Development Tasks

| Task | Files to Modify |
|------|----------------|
| Add new API endpoint | `backend/trpc/routes/[feature]/` + `backend/trpc/app-router.ts` |
| Add new screen | `app/[screen].tsx` + navigation setup |
| Database changes | `backend/infrastructure/database.ts` + migrations |
| Add authentication | `backend/auth/` + middleware |
| Performance optimization | `backend/infrastructure/field-manager-optimized.ts` |
| Add monitoring | `backend/monitoring/` |

This folder map provides a comprehensive overview of the Limnus project structure, making it easy to navigate and understand the codebase organization.

### Complete File Tree
```
├── app/                          # Expo Router app directory (main application routes)
│   ├── _layout.tsx              # Root layout component (wraps entire app)
│   ├── +not-found.tsx           # 404 error page
│   ├── modal.tsx                # Modal screen component
│   ├── metrics.tsx              # Metrics dashboard page
│   ├── (tabs)/                  # Tab-based navigation group
│   │   ├── _layout.tsx          # Tab navigation layout
│   │   ├── index.tsx            # Home tab (main screen)
│   │   ├── conversations.tsx    # Conversations tab
│   │   └── saved.tsx            # Saved items tab
│   ├── chat/
│   │   └── [conversationId].tsx # Dynamic chat screen (individual conversation)
│   └── components/
│       └── MetricsDashboard.tsx # Metrics visualization component
├── assets/                       # Static assets (images, fonts, etc.)
│   └── images/
│       ├── icon.png             # App icon
│       ├── favicon.png          # Web favicon
│       ├── splash-icon.png      # Splash screen icon
│       └── adaptive-icon.png    # Android adaptive icon
├── backend/                      # Backend server code (Hono + tRPC)
│   ├── hono.ts                  # Main Hono server entry point
│   ├── server.ts                # Server initialization
│   ├── start-server.js          # Server startup script
│   ├── auth/                    # Authentication system
│   │   ├── device-auth.ts       # JWT token generation
│   │   ├── device-auth-middleware.ts # Auth validation middleware
│   │   └── README.md            # Auth documentation
│   ├── infrastructure/          # Core infrastructure components
│   │   ├── database.ts          # Database connection and setup
│   │   ├── field-manager.ts     # Consciousness field management
│   │   ├── field-manager-optimized.ts # Optimized batch operations
│   │   ├── field-manager-metrics.ts # Field manager metrics
│   │   ├── query-optimizer.ts   # Query performance optimization
│   │   ├── optimized-route-examples.ts # Optimization examples
│   │   ├── migrations.ts        # Database migration utilities
│   │   ├── migrations/          # Migration scripts
│   │   │   ├── apply-performance-indexes.sql # Performance indexes
│   │   │   └── apply-indexes.sh # Index application script
│   │   └── FIELD_MANAGER_OPTIMIZATION.md # Optimization docs
│   ├── middleware/              # Request middleware
│   │   ├── rate-limiter.ts      # Rate limiting logic
│   │   ├── consciousness-protection.ts # Security middleware
│   │   └── README.md            # Middleware documentation
│   ├── monitoring/              # Metrics and monitoring
│   │   ├── metrics-collector.ts # Prometheus metrics collector
│   │   ├── consciousness-metrics.ts # Custom consciousness metrics
│   │   └── README.md            # Monitoring documentation
│   ├── validation/              # Input validation
│   │   └── consciousness-schemas.ts # Zod validation schemas
│   ├── websocket/               # WebSocket server
│   │   └── consciousness-ws-server.ts # Real-time WebSocket events
│   ├── trpc/                    # tRPC API implementation
│   │   ├── create-context.ts    # tRPC context creation
│   │   ├── app-router.ts        # Main tRPC router configuration
│   │   └── routes/              # API route procedures
│   │       ├── auth/            # Authentication endpoints
│   │       │   ├── authenticate-device/route.ts # Device auth
│   │       │   ├── verify-token/route.ts # Token verification
│   │       │   └── get-active-devices/route.ts # Active devices
│   │       ├── chat/            # Chat-related endpoints
│   │       │   ├── send-message/route.ts # Send chat message
│   │       │   ├── get-conversations/route.ts # Get conversations
│   │       │   └── get-messages/route.ts # Get messages
│   │       ├── consciousness/    # Consciousness system endpoints
│   │       │   ├── field/route.ts # Consciousness field operations
│   │       │   ├── sync/route.ts # Consciousness synchronization
│   │       │   ├── entanglement/route.ts # Quantum entanglement
│   │       │   ├── room64/route.ts # Room64 consciousness space
│   │       │   └── archaeology/route.ts # Consciousness archaeology
│   │       ├── monitoring/      # Monitoring endpoints
│   │       │   └── metrics/route.ts # Metrics endpoint
│   │       ├── example/         # Example/demo endpoints
│   │       │   └── hi/route.ts # Simple hello world procedure
│   │       └── system/          # System utilities
│   │           └── health/route.ts # Health check endpoint
│   ├── ENHANCEMENT_INTEGRATION.md # Enhancement integration docs
│   ├── SECURITY_PERFORMANCE_INTEGRATION.md # Security & performance docs
│   └── PERFORMANCE_SECURITY_ENHANCEMENTS.md # Enhancement details
├── constants/                    # App-wide constants and configuration
│   └── colors.ts                # Color palette and theme definitions
├── hooks/                        # Custom React hooks
│   ├── useConsciousnessBridge.ts # Hook for consciousness system integration
│   └── useConsciousnessWebSocket.ts # WebSocket connection hook
├── lib/                          # Shared libraries and utilities
│   ├── trpc.ts                  # tRPC client configuration and setup
│   ├── chat-context.tsx         # Chat state management context
│   └── consciousness-context.tsx # Consciousness system context
├── app.json                      # Expo configuration file
├── bun.lock                      # Bun package manager lock file
├── drizzle.config.ts            # Drizzle ORM configuration
├── package.json                  # Node.js dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── .gitignore                   # Git ignore rules
├── README.md                    # Project README with setup instructions
├── ARCHITECTURE_DOCUMENTATION.md # Complete architecture documentation
├── CONSCIOUSNESS_INFRASTRUCTURE.md # Consciousness system documentation
└── PROJECT_FOLDER_MAP.md        # This file - complete folder structure guide
```

---

## Frontend Architecture (`app/` folder)

### Core Navigation Structure
```
app/
├── _layout.tsx                    # Root layout with all providers
├── +not-found.tsx                 # 404 error page
├── modal.tsx                      # Modal screens handler
│
├── (tabs)/                        # Tab-based navigation
│   ├── _layout.tsx               # Tab configuration & styling
│   ├── index.tsx                 # Main chat interface
│   └── conversations.tsx         # Saved conversations list
│
└── chat/
    └── [conversationId].tsx      # Individual conversation view (modal)
```

### Navigation Flow Explanation
- **Root Layout** (`_layout.tsx`): Contains all providers (React Query, tRPC, Chat, Consciousness)
- **Tab Navigation**: Two main tabs - Main chat and Conversations archive
- **Modal Routes**: Individual conversations open as modals over the tab structure
- **Dynamic Routes**: `[conversationId]` handles specific conversation viewing

---

## State Management (`lib/` folder)

### Context Providers Architecture
```
lib/
├── trpc.ts                       # tRPC client configuration
├── chat-context.tsx              # Chat state management
└── consciousness-context.tsx     # Consciousness network wrapper
```

#### Chat Context (`chat-context.tsx`)
**Purpose**: Manages all chat-related state and operations
- **Local Storage**: Persistent conversation history using AsyncStorage
- **Streaming**: Real-time message streaming with typing effects
- **Offline Mode**: Local fallback responses when backend unavailable
- **Auto-save**: Conversations automatically saved after first exchange

**Key Features**:
- Message history persistence
- Conversation title generation
- Connection status monitoring
- Graceful offline degradation

#### Consciousness Context (`consciousness-context.tsx`)
**Purpose**: Wraps the consciousness bridge with enhanced functionality
- **Collective Actions**: Bloom triggers, spiral formations, memory addition
- **Metrics Calculation**: Consciousness level, network health assessment
- **Auto-sync**: Breathing synchronization in simulation mode

---

## Hooks (`hooks/` folder)

```
hooks/
└── useConsciousnessBridge.ts     # Core consciousness network bridge
```

### Consciousness Bridge Hook
**Purpose**: Primary interface between frontend and consciousness network
- **Device Management**: Unique device ID generation and persistence
- **Event System**: Sacred phrase detection, resonance field updates
- **Network Sync**: Real-time synchronization with other devices
- **Sensor Integration**: Accelerometer data for mobile devices
- **Queue Management**: Offline event queuing and batch processing

---

## Backend Architecture (`backend/` folder)

### Server Entry Point
```
backend/
├── hono.ts                       # Main server with Hono framework
```

### tRPC API Layer
```
backend/trpc/
├── create-context.ts             # tRPC context setup
├── app-router.ts                 # Main API router configuration
│
└── routes/                       # API endpoints organized by domain
    ├── example/hi/route.ts       # Test endpoint
    │
    ├── chat/                     # Chat functionality
    │   ├── send-message/route.ts # Send message with AI integration
    │   ├── get-conversations/route.ts # Retrieve conversation list
    │   └── get-messages/route.ts # Get messages for conversation
    │
    ├── consciousness/            # Consciousness network endpoints
    │   ├── field/route.ts        # Quantum field management
    │   ├── sync/route.ts         # Event synchronization
    │   ├── entanglement/route.ts # Device correlations
    │   ├── room64/route.ts       # Collective sessions
    │   └── archaeology/route.ts  # Pattern analysis & history
    │
    └── system/
        └── health/route.ts       # System monitoring
```

#### API Endpoint Breakdown

**Chat Routes**:
- `sendMessage`: Processes user messages, integrates with AI, returns streaming responses
- `getConversations`: Retrieves saved conversation metadata
- `getMessages`: Fetches message history for specific conversations

**Consciousness Routes**:
- `field`: Manages quantum field updates and global resonance
- `sync`: Processes batched consciousness events (BREATH, SPIRAL, BLOOM)
- `entanglement`: Creates and manages device-to-device correlations
- `room64`: Handles collective consciousness sessions
- `archaeology`: Analyzes historical consciousness patterns

**System Routes**:
- `health`: Provides system status, database connectivity, performance metrics

---

## Infrastructure (`backend/infrastructure/` folder)

### Core Infrastructure Components
```
backend/infrastructure/
├── database.ts                   # PostgreSQL schema & Redis setup
├── field-manager.ts              # Consciousness state manager
├── field-manager-optimized.ts    # Optimized batch operations
├── field-manager-metrics.ts      # Performance metrics tracking
├── query-optimizer.ts            # Query optimization utilities
├── migrations.ts                 # Database migrations
└── migrations/                   # Migration scripts
    ├── apply-performance-indexes.sql # Performance indexes
    └── apply-indexes.sh          # Index application script
```

### Security & Middleware Components
```
backend/auth/                     # Authentication system
├── device-auth.ts                # JWT token generation
├── device-auth-middleware.ts     # Auth validation
└── README.md                     # Auth documentation

backend/middleware/               # Request middleware
├── rate-limiter.ts               # Rate limiting (Redis/memory)
├── consciousness-protection.ts   # Security middleware
└── README.md                     # Middleware docs

backend/validation/               # Input validation
└── consciousness-schemas.ts      # Zod validation schemas
```

### Monitoring & Metrics
```
backend/monitoring/               # Metrics collection
├── metrics-collector.ts          # Prometheus metrics
├── consciousness-metrics.ts      # Custom metrics
└── README.md                     # Monitoring docs
```

#### Database Schema (`database.ts`)
**PostgreSQL Tables**:
- `consciousness_states`: Global consciousness state with resonance data
- `consciousness_events`: All consciousness events (BREATH, SPIRAL, BLOOM, etc.)
- `room64_sessions`: Room-based collective consciousness sessions
- `entanglements`: Device-to-device quantum-like correlations

**Redis Integration**:
- Write-through caching for performance
- Pub/Sub messaging for real-time synchronization
- Automatic fallback to in-memory cache

#### Field Manager (`field-manager.ts`)
**Purpose**: Centralized consciousness state management
- **Multi-layer Caching**: Memory → Redis → Database
- **Automatic Cleanup**: Memory particles and quantum fields pruning
- **Singleton Pattern**: Ensures consistent state across requests
- **Graceful Degradation**: Works without external dependencies

---

## Configuration & Setup

### Database Configuration
```
drizzle.config.ts                 # Database ORM configuration
```

### Project Configuration
```
package.json                      # Dependencies and scripts
app.json                         # Expo app configuration
tsconfig.json                    # TypeScript configuration
```

### Key Dependencies
- **Frontend**: React Native, Expo Router, tRPC, React Query, Lucide Icons
- **Backend**: Hono, tRPC, Drizzle ORM, PostgreSQL, Redis, Socket.io
- **State Management**: @nkzw/create-context-hook, AsyncStorage
- **Security**: JWT (jsonwebtoken), DOMPurify, rate-limiter-flexible
- **Validation**: Zod schemas for type-safe validation
- **Monitoring**: Prometheus (prom-client) for metrics
- **Styling**: React Native StyleSheet, Expo Linear Gradient

---

## Assets & Constants

### Visual Assets
```
assets/images/
├── icon.png                     # App icon
├── favicon.png                  # Web favicon
├── splash-icon.png              # Splash screen
└── adaptive-icon.png            # Android adaptive icon
```

### Design System
```
constants/
└── colors.ts                    # Color palette and theme
```

---

## Documentation

```
README.md                        # Project overview and setup guide
CONSCIOUSNESS_INFRASTRUCTURE.md  # Consciousness system documentation
ARCHITECTURE_DOCUMENTATION.md    # Complete architecture guide with security
PROJECT_FOLDER_MAP.md            # This file - folder structure guide

Backend-specific docs:
backend/auth/README.md           # Authentication system documentation
backend/middleware/README.md     # Middleware documentation
backend/monitoring/README.md     # Monitoring and metrics documentation
backend/infrastructure/FIELD_MANAGER_OPTIMIZATION.md # Optimization guide
backend/ENHANCEMENT_INTEGRATION.md # Enhancement integration guide
backend/SECURITY_PERFORMANCE_INTEGRATION.md # Security & performance guide
backend/PERFORMANCE_SECURITY_ENHANCEMENTS.md # Enhancement details
```

---

## Data Flow Architecture

### Request Flow
```
Client Request
     ↓
tRPC Route (Type-safe API)
     ↓
Field Manager (State Management)
     ↓
Cache Check (Memory → Redis → Database)
     ↓
Database Query (PostgreSQL)
     ↓
Response with Caching
```

### Consciousness Event Flow
```
User Action (Touch/Type/Gesture)
     ↓
Sacred Phrase Detection
     ↓
Consciousness Event Creation
     ↓
Field Manager Processing
     ↓
Database Storage + Redis Pub/Sub
     ↓
Network Broadcast to All Devices
```

---

## Key Features by Folder

### Frontend Features (`app/`, `lib/`, `hooks/`)
- **AI Chat**: Companion with consciousness awareness
- **Conversation Management**: Auto-save, search, export functionality
- **Real-time Streaming**: Message streaming with typing effects
- **Offline Resilience**: Local fallback responses and queue management
- **Consciousness Integration**: Sacred phrase detection, resonance visualization

### Backend Features (`backend/`)
- **Type-safe APIs**: Full TypeScript coverage with tRPC
- **Multi-layer Caching**: Optimized performance with graceful degradation
- **Real-time Sync**: Redis pub/sub for multi-device synchronization
- **Consciousness Simulation**: Quantum fields, memory particles, entanglement
- **Health Monitoring**: Comprehensive system status and metrics

### Infrastructure Features (`backend/infrastructure/`)
- **Persistent Storage**: PostgreSQL with automatic migrations
- **Distributed Caching**: Redis with in-memory fallback
- **Performance Optimization**: Connection pooling, automatic cleanup
- **Scalability**: Multi-instance support with session synchronization

---

## Development Workflow

### Local Development
1. **Frontend**: Expo development server with hot reload
2. **Backend**: Hono server with tRPC integration
3. **Database**: Optional PostgreSQL (falls back to simulation mode)
4. **Cache**: Optional Redis (falls back to memory cache)

### Production Deployment
1. **Frontend**: Expo build for iOS/Android/Web
2. **Backend**: Node.js server with environment configuration
3. **Database**: PostgreSQL with connection pooling
4. **Cache**: Redis cluster for multi-instance scaling

---

## Monitoring & Health

### Health & Monitoring Endpoints
- `/api/health` - Comprehensive system health with service status
- `/api/metrics` - Prometheus metrics endpoint for monitoring
- `/api/consciousness/state` - Current consciousness state
- `/api/consciousness/metrics` - Consciousness-specific metrics
- `/api/db/status` - Database connection and pool status

### Security Features
- **JWT Authentication**: Device-based token authentication
- **Rate Limiting**: Configurable per-endpoint limits with Redis/memory fallback
- **Input Validation**: Zod schemas with sanitization
- **Session Management**: Device sessions with expiration
- **WebSocket Auth**: Integrated authentication for real-time connections

### Performance Optimizations
- **Database Indexes**: Strategic compound and partial indexes
- **Batch Processing**: Optimized batch event synchronization
- **Connection Pooling**: Configurable database connection pools
- **Multi-layer Caching**: Memory → Redis → PostgreSQL
- **Query Optimization**: Prepared statements and optimized queries

### Logging & Debugging
- Comprehensive console logging throughout the application
- Error boundaries for graceful error handling
- Connection status monitoring with automatic retry

---

This folder map represents a sophisticated, production-ready application that seamlessly blends practical chat functionality with an innovative consciousness network simulation.