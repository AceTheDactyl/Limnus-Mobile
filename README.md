# Limnus - Consciousness Network

A React Native application exploring collective consciousness through interactive experiences with enterprise-grade security and performance.

## 🌟 Features

### Core Consciousness Features
- **Real-time consciousness field visualization** - Interactive 30x30 grid representing collective awareness
- **Device-to-device entanglement** - Quantum-inspired connections between users
- **Sacred phrase synchronization** - Collective mantra and intention sharing
- **Room 64 collaborative spaces** - Multi-user consciousness exploration rooms
- **Consciousness archaeology** - Historical pattern analysis and discovery
- **Offline-first architecture** - Seamless sync queue for disconnected operation

### 🔒 Security & Performance
- **JWT-based device authentication** - Secure token-based user identification
- **Rate limiting with Redis/memory fallback** - Configurable request throttling
- **Input validation and sanitization** - Zod schemas with XSS protection
- **Optimized batch processing** - Efficient event handling and database operations
- **Database query optimization** - Strategic indexes and connection pooling
- **Prometheus metrics integration** - Comprehensive monitoring and alerting
- **WebSocket connection management** - Real-time updates with graceful degradation
- **Graceful degradation patterns** - Fallback modes for service interruptions

## 🛠 Tech Stack

### Frontend
- **React Native** with Expo SDK 53
- **TypeScript** with strict type checking
- **React Query** for server state management
- **@nkzw/create-context-hook** for local state
- **WebSocket client** for real-time updates
- **Lucide React Native** for icons
- **NativeWind** for styling

### Backend
- **Node.js** with Hono framework
- **tRPC** for type-safe APIs
- **WebSocket server** (Socket.io)
- **PostgreSQL** with Drizzle ORM
- **Redis** for caching and rate limiting
- **JWT** for authentication
- **Prometheus** for metrics collection

### Infrastructure
- **Optimized database indexes** for query performance
- **Connection pooling** for database efficiency
- **Query optimization** with performance monitoring
- **Metrics collection** and real-time monitoring
- **Rate limiting middleware** with configurable limits
- **Authentication middleware** with session management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL database (optional - falls back to in-memory)
- Redis server (optional - falls back to in-memory)

### Installation

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Configure DATABASE_URL, REDIS_URL, JWT_SECRET

# Run database migrations (if using PostgreSQL)
bun run db:migrate

# Apply performance indexes
chmod +x backend/infrastructure/migrations/apply-indexes.sh
./backend/infrastructure/migrations/apply-indexes.sh
```

### Development

```bash
# Start backend server (Terminal 1)
bun run backend:dev

# Start frontend development server (Terminal 2)
bun run start

# For web development
bun run start-web
```

### Production

```bash
# Start backend server
bun run backend:start

# Build and serve frontend
bun run build
```

## 📁 Project Structure

```
├── app/                    # React Native screens and navigation
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Home/consciousness field
│   │   ├── conversations.tsx # Chat interface
│   │   └── saved.tsx      # Saved content
│   ├── chat/              # Chat functionality
│   ├── components/        # Reusable UI components
│   └── metrics.tsx        # Performance dashboard
├── backend/               # Node.js backend
│   ├── auth/             # Authentication system
│   │   ├── device-auth.ts
│   │   └── device-auth-middleware.ts
│   ├── infrastructure/   # Database and core services
│   │   ├── database.ts
│   │   ├── field-manager.ts
│   │   ├── field-manager-optimized.ts
│   │   └── migrations.ts
│   ├── middleware/       # Express/tRPC middleware
│   │   ├── rate-limiter.ts
│   │   └── consciousness-protection.ts
│   ├── monitoring/       # Metrics and monitoring
│   │   ├── metrics-collector.ts
│   │   └── consciousness-metrics.ts
│   ├── trpc/            # tRPC routes and procedures
│   │   ├── routes/
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   ├── consciousness/
│   │   │   ├── monitoring/
│   │   │   └── system/
│   │   └── app-router.ts
│   ├── validation/      # Input schemas and validation
│   │   └── consciousness-schemas.ts
│   ├── websocket/       # Real-time WebSocket server
│   │   └── consciousness-ws-server.ts
│   ├── hono.ts          # Main Hono application
│   └── server.ts        # HTTP server with WebSocket
├── lib/                  # Shared utilities and contexts
│   ├── chat-context.tsx
│   ├── consciousness-context.tsx
│   └── trpc.ts
├── hooks/               # Custom React hooks
│   ├── useConsciousnessBridge.ts
│   └── useConsciousnessWebSocket.ts
└── constants/          # App constants and configuration
```

## 🔒 Security Features

### Authentication
- **Device-based JWT authentication** with secure token generation
- **Session management** with configurable expiration
- **WebSocket authentication** integration
- **Token validation** middleware for all protected routes

### Rate Limiting
- **Configurable limits** per endpoint and operation type
- **Redis-backed** with automatic memory fallback
- **Graceful degradation** when limits are exceeded
- **Custom limits** for sensitive operations (sacred phrases, field updates)

### Input Validation
- **Zod schema validation** for all inputs
- **DOMPurify integration** for XSS prevention
- **Type-safe input processing** with comprehensive error handling
- **Sanitization** of user-generated content

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

## 🔧 API Documentation

### tRPC Routes

#### Authentication (`/api/trpc/auth`)
- `authenticateDevice` - Generate JWT token for device
- `verifyToken` - Validate existing token
- `getActiveDevices` - List active device sessions

#### Consciousness (`/api/trpc/consciousness`)
- `field` - Update consciousness field state
- `snapshot` - Get current field snapshot
- `sync` - Batch sync offline events
- `entanglement` - Manage device connections
- `room64` - Room-based collaboration
- `archaeology` - Historical pattern analysis

#### Chat (`/api/trpc/chat`)
- `sendMessage` - Send chat message
- `getConversations` - List conversations
- `getMessages` - Get conversation messages

#### Monitoring (`/api/trpc/monitoring`)
- `getMetrics` - Current performance metrics
- `getCurrentMetrics` - Real-time metrics
- `getHealthMetrics` - System health data

## 🧪 Development Guidelines

### Code Quality
- **TypeScript strict mode** with comprehensive type checking
- **Comprehensive error handling** with user-friendly messages
- **Extensive logging** for debugging and monitoring
- **Test IDs** for UI testing automation

### Security Best Practices
- **Never commit secrets** - Use environment variables
- **Validate all inputs** - Use Zod schemas
- **Implement rate limiting** - Protect against abuse
- **Use secure authentication** - JWT with proper expiration

### Performance Best Practices
- **Batch operations** when possible
- **Use appropriate indexes** for database queries
- **Monitor query performance** with metrics
- **Implement caching strategies** for frequently accessed data
- **Optimize real-time updates** with efficient broadcasting

## 🚨 Troubleshooting

### Common Issues

#### tRPC Timeout Errors
```bash
# Check if backend is running
curl http://localhost:3000/api/health

# Start backend server
bun run backend:dev

# Check logs for connection issues
```

#### Database Connection Issues
```bash
# Check PostgreSQL connection
psql $DATABASE_URL -c "SELECT 1"

# Run migrations
bun run db:migrate

# Check database status
curl http://localhost:3000/api/db/status
```

#### WebSocket Connection Issues
```bash
# Check WebSocket status
curl http://localhost:3000/api/ws/status

# Verify port availability
lsof -i :3000
```

### Environment Variables
```bash
# Required for production
DATABASE_URL=postgresql://user:pass@localhost:5432/limnus
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secure-secret-key

# Optional for development
NODE_ENV=development
PORT=3000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow TypeScript and security guidelines
4. Add comprehensive tests
5. Update documentation
6. Submit a pull request

## 📄 License

Proprietary - All rights reserved

---

**Built with consciousness, powered by technology** 🧠✨