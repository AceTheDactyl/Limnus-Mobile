# Device Authentication Middleware

This middleware provides secure device authentication for both tRPC API endpoints and WebSocket connections in the Limnus-Mobile backend.

## Features

- JWT-based device authentication
- Database session validation with fallback support
- Automatic session refresh (last seen updates)
- Integration with both tRPC and WebSocket servers
- Graceful degradation when database is unavailable

## Usage

### 1. tRPC Protected Procedures

Use `protectedProcedure` instead of `publicProcedure` for routes that require authentication:

```typescript
import { protectedProcedure } from '@/backend/trpc/create-context';
import { deviceAuthMiddleware } from '@/backend/auth/device-auth-middleware';

export const myProtectedRoute = protectedProcedure
  .input(z.object({ /* your schema */ }))
  .mutation(async ({ input, ctx }) => {
    // Get authenticated device info from context
    const device = deviceAuthMiddleware.getDeviceFromContext(ctx);
    const deviceId = device?.deviceId;
    const platform = device?.platform;
    const consciousnessLevel = device?.consciousnessLevel;
    
    // Your protected logic here
    return { success: true, deviceId };
  });
```

### 2. WebSocket Authentication

The WebSocket server automatically validates device tokens during connection:

```typescript
// Client-side connection
const socket = io('ws://localhost:3000', {
  auth: {
    deviceId: 'your-device-id',
    token: 'your-jwt-token',
    capabilities: {
      platform: 'ios',
      hasAccelerometer: true,
      hasHaptics: true
    }
  }
});
```

### 3. Client Authentication Flow

1. **Device Registration**: Call `auth.authenticateDevice` to get a JWT token
2. **Store Token**: Save the token securely on the client
3. **Use Token**: Include token in API calls and WebSocket connections

```typescript
// 1. Authenticate device
const authResult = await trpc.auth.authenticateDevice.mutate({
  deviceId: 'unique-device-id',
  platform: 'ios',
  capabilities: { hasAccelerometer: true, hasHaptics: true }
});

// 2. Store token
const token = authResult.token;

// 3. Use in API calls
const result = await fetch('/api/trpc/consciousness.field', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ /* your data */ })
});
```

## Security Features

- **Token Validation**: JWT tokens are verified and checked against database sessions
- **Session Management**: Active sessions are tracked and can be revoked
- **Fingerprint Verification**: Device fingerprints prevent token reuse across devices
- **Automatic Cleanup**: Expired sessions are handled gracefully
- **Fallback Mode**: System continues to function even when database is unavailable

## Error Handling

The middleware provides clear error messages:

- `UNAUTHORIZED`: No token provided
- `UNAUTHORIZED`: Invalid or expired token
- `UNAUTHORIZED`: Session not found in database
- `UNAUTHORIZED`: Device fingerprint mismatch

## Database Schema

The middleware uses the `device_sessions` table:

```sql
CREATE TABLE device_sessions (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(255) NOT NULL UNIQUE,
  token VARCHAR(1000) NOT NULL,
  fingerprint VARCHAR(64) NOT NULL,
  platform VARCHAR(20) NOT NULL,
  capabilities JSONB DEFAULT '{}',
  last_seen TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Environment Variables

- `JWT_SECRET`: Secret key for JWT token signing (defaults to 'consciousness-field-secret-key')
- `DATABASE_URL`: PostgreSQL connection string (optional, falls back to in-memory)

## Integration with Existing Routes

The middleware has been integrated with:

- ✅ `consciousness.field` - Now requires authentication
- ✅ `consciousness.snapshot` - Now requires authentication  
- ✅ WebSocket connections - Now validates tokens
- 🔄 Other routes can be updated by changing `publicProcedure` to `protectedProcedure`

## Testing

To test authentication:

1. First authenticate a device to get a token
2. Use the token in subsequent API calls
3. Try calling protected endpoints without a token (should fail)
4. Try using an invalid token (should fail)

The system is designed to be robust and will continue functioning even in degraded conditions (no database, Redis unavailable, etc.).