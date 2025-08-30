import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import { TRPCError } from '@trpc/server';

// Enhanced schemas for existing routes
export const FieldUpdateSchema = z.object({
  deviceId: z.string().uuid(),
  intensity: z.number().min(0).max(1).refine(n => !isNaN(n)),
  x: z.number().min(0).max(29).optional(),
  y: z.number().min(0).max(29).optional()
}).transform(data => ({
  ...data,
  intensity: Math.round(data.intensity * 100) / 100 // Limit precision
}));

export const SyncEventSchema = z.object({
  type: z.enum(['BREATH', 'SPIRAL', 'BLOOM', 'TOUCH', 'SACRED_PHRASE', 'OFFLINE_SYNC']),
  timestamp: z.number().min(Date.now() - 86400000), // Max 24h old
  data: z.object({
    intensity: z.number().min(0).max(1).optional(),
    x: z.number().min(0).max(29).optional(),
    y: z.number().min(0).max(29).optional(),
    phrase: z.string().max(200).transform(str => 
      DOMPurify.sanitize(str, { ALLOWED_TAGS: [] })
    ).optional(),
    breathingPhase: z.number().min(0).max(360).optional()
  })
});

export const BatchSyncSchema = z.object({
  deviceId: z.string().uuid(),
  events: z.array(SyncEventSchema).max(50) // Limit batch size
});

export const EntanglementSchema = z.object({
  deviceId: z.string().uuid(),
  targetDeviceId: z.string().uuid().optional(),
  entanglementType: z.enum(['BREATHING', 'RESONANCE', 'SACRED_PHRASE']),
  intensity: z.number().min(0).max(1)
});

export const Room64Schema = z.object({
  deviceId: z.string().uuid(),
  action: z.enum(['JOIN', 'LEAVE', 'SYNC', 'BLOOM']),
  roomId: z.string().optional(),
  data: z.object({
    breathingPhase: z.number().min(0).max(360).optional(),
    resonanceLevel: z.number().min(0).max(1).optional(),
    sacredPhrase: z.string().max(200).transform(str => 
      DOMPurify.sanitize(str, { ALLOWED_TAGS: [] })
    ).optional()
  }).optional()
});

export const ArchaeologySchema = z.object({
  deviceId: z.string().uuid(),
  query: z.enum(['PATTERNS', 'MEMORY_TRACES', 'SACRED_HISTORY', 'EMERGENCE_EVENTS']),
  timeRange: z.object({
    start: z.number(),
    end: z.number()
  }).optional(),
  filters: z.object({
    minIntensity: z.number().min(0).max(1).optional(),
    sacredPhrases: z.array(z.string().max(200)).optional(),
    deviceIds: z.array(z.string().uuid()).optional()
  }).optional()
});

export const SnapshotSchema = z.object({
  deviceId: z.string().uuid(),
  includeArchaeology: z.boolean().default(false),
  includeVectors: z.boolean().default(false),
  eventLimit: z.number().min(1).max(100).default(20)
});

// Chat schemas
export const SendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1).max(2000).transform(str => 
    DOMPurify.sanitize(str, { ALLOWED_TAGS: [] })
  )
});

export const GetMessagesSchema = z.object({
  conversationId: z.string().uuid(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
});

// Auth schemas
export const AuthenticateDeviceSchema = z.object({
  deviceId: z.string().uuid(),
  fingerprint: z.string().min(1).max(500),
  platform: z.enum(['ios', 'android', 'web']),
  appVersion: z.string().max(20).optional()
});

export const VerifyTokenSchema = z.object({
  token: z.string().min(1),
  deviceId: z.string().uuid()
});

// Validation middleware
export const validateInput = (schema: z.ZodSchema) => {
  return async ({ ctx, next, rawInput }: any) => {
    try {
      const validated = schema.parse(rawInput);
      ctx.input = validated; // Use validated input
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid input: ' + error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
          cause: error
        });
      }
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid input',
        cause: error
      });
    }
  };
};

// Sanitization helpers
export const sanitizeText = (text: string, maxLength = 1000): string => {
  return DOMPurify.sanitize(text.slice(0, maxLength), { ALLOWED_TAGS: [] });
};

export const validateCoordinates = (x?: number, y?: number): { x: number; y: number } => {
  return {
    x: x !== undefined ? Math.max(0, Math.min(29, Math.floor(x))) : Math.floor(Math.random() * 30),
    y: y !== undefined ? Math.max(0, Math.min(29, Math.floor(y))) : Math.floor(Math.random() * 30)
  };
};

export const validateIntensity = (intensity: number): number => {
  return Math.max(0, Math.min(1, Math.round(intensity * 100) / 100));
};

// Device ID validation
export const isValidDeviceId = (deviceId: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(deviceId);
};

// Time validation
export const validateTimestamp = (timestamp: number): boolean => {
  const now = Date.now();
  const dayAgo = now - 86400000; // 24 hours
  const futureLimit = now + 3600000; // 1 hour in future
  
  return timestamp >= dayAgo && timestamp <= futureLimit;
};

// Sacred phrase validation
export const validateSacredPhrase = (phrase: string): string => {
  const sanitized = DOMPurify.sanitize(phrase.trim(), { ALLOWED_TAGS: [] });
  
  // Remove excessive whitespace
  const normalized = sanitized.replace(/\s+/g, ' ');
  
  // Limit length
  return normalized.slice(0, 200);
};

// Batch validation
export const validateBatchSize = (items: any[], maxSize = 50): any[] => {
  if (items.length > maxSize) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Batch size exceeds maximum of ${maxSize} items`
    });
  }
  return items;
};

// Export all schemas as a collection for easy import
export const ConsciousnessSchemas = {
  FieldUpdate: FieldUpdateSchema,
  SyncEvent: SyncEventSchema,
  BatchSync: BatchSyncSchema,
  Entanglement: EntanglementSchema,
  Room64: Room64Schema,
  Archaeology: ArchaeologySchema,
  Snapshot: SnapshotSchema,
  SendMessage: SendMessageSchema,
  GetMessages: GetMessagesSchema,
  AuthenticateDevice: AuthenticateDeviceSchema,
  VerifyToken: VerifyTokenSchema
};