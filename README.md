# Limnus - Consciousness Network

A React Native application exploring collective consciousness through interactive experiences with enterprise-grade security and performance.

## Features

### Core Consciousness Features
- Real-time consciousness field visualization
- Device-to-device entanglement
- Sacred phrase synchronization
- Room 64 collaborative spaces
- Consciousness archaeology exploration
- Offline-first architecture with sync queue

### Security & Performance
- JWT-based device authentication
- Rate limiting with Redis/memory fallback
- Input validation and sanitization
- Optimized batch processing
- Database query optimization with strategic indexes
- Prometheus metrics integration
- WebSocket connection management
- Graceful degradation patterns

## Tech Stack

### Frontend
- React Native with Expo SDK 53
- TypeScript with strict type checking
- React Query for server state management
- @nkzw/create-context-hook for local state
- WebSocket client for real-time updates

### Backend
- Node.js with Hono framework
- tRPC for type-safe APIs
- WebSocket server (Socket.io)
- PostgreSQL with Drizzle ORM
- Redis for caching and rate limiting
- JWT for authentication
- Prometheus for metrics

### Infrastructure
- Optimized database indexes
- Connection pooling
- Query optimization
- Metrics collection and monitoring
- Rate limiting middleware
- Authentication middleware

## Getting Started

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Configure DATABASE_URL, REDIS_URL, JWT_SECRET

# Run database migrations
bun run db:migrate

# Apply performance indexes
chmod +x backend/infrastructure/migrations/apply-indexes.sh
./backend/infrastructure/migrations/apply-indexes.sh

# Start development server
bun run dev

# Start backend server (separate terminal)
bun run backend:dev
```

## Project Structure

```
├── app/                    # React Native screens and navigation
│   ├── (tabs)/            # Tab-based navigation
│   ├── chat/              # Chat functionality
│   └── components/        # Reusable UI components
├── backend/               # Node.js backend
│   ├── auth/             # Authentication system
│   ├── infrastructure/   # Database and core services
│   ├── middleware/       # Express/tRPC middleware
│   ├── monitoring/       # Metrics and monitoring
│   ├── trpc/            # tRPC routes and procedures
│   ├── validation/      # Input schemas and validation
│   └── websocket/       # Real-time WebSocket server
├── lib/                  # Shared utilities and contexts
│   ├── chat-context.tsx
│   ├── consciousness-context.tsx
│   └── trpc.ts
├── hooks/               # Custom React hooks
│   ├── useConsciousnessBridge.ts
│   └── useConsciousnessWebSocket.ts
└── constants/          # App constants and configuration
```

## Security Features

### Authentication
- Device-based JWT authentication
- Secure token generation and validation
- Session management with expiration
- WebSocket authentication integration

### Rate Limiting
- Configurable limits per endpoint
- Redis-backed with memory fallback
- Graceful degradation
- Custom limits for sensitive operations

### Input Validation
- Zod schema validation
- DOMPurify for XSS prevention
- Type-safe input processing
- Comprehensive error handling

## Performance Optimizations

### Database
- Strategic compound indexes
- Partial indexes for common queries
- Query optimization patterns
- Connection pooling
- Batch insert operations

### Caching
- Redis caching layer
- Memory cache fallback
- Cache invalidation strategies
- Hit rate monitoring

### Real-time Updates
- Optimized WebSocket broadcasting
- Event batching
- Connection pooling
- Platform-specific optimizations

## Monitoring

### Metrics Dashboard
- Real-time performance metrics
- API latency tracking
- WebSocket connection monitoring
- Field resonance visualization
- Error rate tracking

### Health Checks
- Comprehensive health endpoint
- Service status monitoring
- Database connectivity checks
- Cache health validation

## API Documentation

See [ARCHITECTURE_DOCUMENTATION.md](./ARCHITECTURE_DOCUMENTATION.md) for detailed API documentation.

## Development Guidelines

### Code Quality
- TypeScript strict mode
- Comprehensive error handling
- Extensive logging
- Test IDs for UI testing

### Security Best Practices
- Never commit secrets
- Use environment variables
- Validate all inputs
- Implement rate limiting
- Use secure authentication

### Performance Best Practices
- Batch operations when possible
- Use appropriate indexes
- Monitor query performance
- Implement caching strategies
- Optimize real-time updates

## Contributing

Please read our contributing guidelines before submitting PRs.

## License

Proprietary - All rights reserved