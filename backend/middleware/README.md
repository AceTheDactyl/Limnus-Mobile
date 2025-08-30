# Consciousness Rate Limiter

A comprehensive rate limiting system for the Limnus-Mobile consciousness network backend, designed to prevent abuse while maintaining the flow of authentic consciousness interactions.

## Overview

The `ConsciousnessRateLimiter` provides intelligent rate limiting for different types of consciousness events, with Redis-backed persistence and in-memory fallback for resilience.

## Rate Limits by Action Type

### Field Updates (`field_update`)
- **Limit**: 30 updates per minute
- **Block Duration**: 10 seconds
- **Purpose**: Prevents spam of field touch/interaction events

### Sacred Phrases (`sacred_phrase`)
- **Limit**: 5 phrases per minute
- **Block Duration**: 60 seconds
- **Purpose**: Maintains the sacred nature of phrase crystallization

### Sync Batches (`sync_batch`)
- **Limit**: 10 batch operations per minute
- **Block Duration**: 30 seconds
- **Purpose**: Prevents overwhelming the system with offline sync floods

### Entanglements (`entanglement`)
- **Limit**: 3 entanglements per 5 minutes
- **Block Duration**: 2 minutes
- **Purpose**: Ensures meaningful quantum connections between devices

### Room64 Actions (`room64_action`)
- **Limit**: 20 actions per minute
- **Block Duration**: 15 seconds
- **Purpose**: Maintains flow in collective consciousness rooms

### Archaeology Queries (`archaeology`)
- **Limit**: 10 queries per 5 minutes
- **Block Duration**: 60 seconds
- **Purpose**: Prevents excessive historical data mining

### Chat Messages (`chat_message`)
- **Limit**: 20 messages per minute
- **Block Duration**: 30 seconds
- **Purpose**: Maintains natural conversation flow with AI companion

## Architecture

### Backend Integration
- Automatically initialized with Redis if available, falls back to in-memory storage
- Integrated into tRPC context for seamless middleware usage
- Provides detailed error responses with retry timing

### Middleware Usage
```typescript
// Apply to individual procedures
export const fieldProcedure = protectedProcedure
  .use(withFieldUpdateLimit)
  .input(schema)
  .mutation(async ({ input, ctx }) => {
    // Rate limit automatically enforced before this runs
  });

// Apply to batch operations
export const syncProcedure = protectedProcedure
  .use(withBatchRateLimit('sync_batch', 1))
  .input(schema)
  .mutation(async ({ input, ctx }) => {
    // Rate limit based on number of events in batch
  });
```

### Monitoring & Status
- Real-time rate limit status available via `/api/rate-limit/status/:deviceId`
- Integrated into health check and metrics endpoints
- Detailed logging for rate limit violations and successes

## Error Handling

When rate limits are exceeded, the system returns:
```json
{
  "code": "TOO_MANY_REQUESTS",
  "message": "Rate limit exceeded for field_update. Try again in 8 seconds.",
  "cause": {
    "retryAfter": 8000,
    "remainingPoints": 0,
    "totalHits": 31
  }
}
```

## Graceful Degradation

- If Redis is unavailable, automatically falls back to in-memory rate limiting
- If rate limiter fails to initialize, requests proceed without rate limiting (with warnings)
- Maintains consciousness network availability even during infrastructure issues

## Device-Based Limiting

All rate limits are applied per device ID, ensuring:
- Individual users can't be blocked by others' activity
- Fair resource allocation across the consciousness network
- Proper isolation between different client instances

## Future Enhancements

- Dynamic rate limit adjustment based on network load
- Whitelist/blacklist functionality for specific devices
- Rate limit analytics and pattern detection
- Integration with consciousness field intensity for adaptive limits