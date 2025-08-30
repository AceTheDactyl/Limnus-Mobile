import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import { TRPCError } from '@trpc/server';

// Enhanced schemas for existing routes
export const FieldUpdateSchema = z.object({
  deviceId: z.string().uuid('Invalid device ID format'),
  intensity: z.number()
    .min(0, 'Intensity must be at least 0')
    .max(1, 'Intensity cannot exceed 1')
    .refine(n => !isNaN(n), 'Intensity must be a valid number')
    .transform(n => Math.round(n * 100) / 100),
  x: z.number().int().min(0).max(29).optional(),
  y: z.number().int().min(0).max(29).optional()
});

// Discriminated union for better type safety and validation
export const ConsciousnessEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('BREATH'),
    timestamp: z.number().refine(
      ts => ts > Date.now() - 86400000,
      'Event timestamp too old (max 24h)'
    ),
    data: z.object({
      intensity: z.number().min(0).max(1).optional(),
      breathingPhase: z.number().min(0).max(360).optional()
    })
  }),
  z.object({
    type: z.literal('SACRED_PHRASE'),
    timestamp: z.number().refine(
      ts => ts > Date.now() - 86400000,
      'Event timestamp too old (max 24h)'
    ),
    data: z.object({
      phrase: z.string()
        .min(1, 'Sacred phrase cannot be empty')
        .max(200, 'Sacred phrase too long')
        .transform(str => DOMPurify.sanitize(str, { ALLOWED_TAGS: [] })),
      intensity: z.number().min(0).max(1).default(0.7),
      x: z.number().int().min(0).max(29).optional(),
      y: z.number().int().min(0).max(29).optional()
    })
  }),
  z.object({
    type: z.literal('SPIRAL'),
    timestamp: z.number().refine(
      ts => ts > Date.now() - 86400000,
      'Event timestamp too old (max 24h)'
    ),
    data: z.object({
      x: z.number().int().min(0).max(29),
      y: z.number().int().min(0).max(29),
      intensity: z.number().min(0).max(1)
    })
  }),
  z.object({
    type: z.literal('BLOOM'),
    timestamp: z.number().refine(
      ts => ts > Date.now() - 86400000,
      'Event timestamp too old (max 24h)'
    ),
    data: z.object({
      intensity: z.number().min(0).max(1).default(1.0)
    })
  }),
  z.object({
    type: z.literal('TOUCH'),
    timestamp: z.number().refine(
      ts => ts > Date.now() - 86400000,
      'Event timestamp too old (max 24h)'
    ),
    data: z.object({
      x: z.number().int().min(0).max(29).optional(),
      y: z.number().int().min(0).max(29).optional(),
      intensity: z.number().min(0).max(1)
    })
  }),
  z.object({
    type: z.literal('OFFLINE_SYNC'),
    timestamp: z.number().refine(
      ts => ts > Date.now() - 86400000,
      'Event timestamp too old (max 24h)'
    ),
    data: z.object({
      eventCount: z.number().int().min(1).optional(),
      lastSyncTime: z.number().optional()
    })
  })
]);

// Legacy schema for backward compatibility
export const SyncEventSchema = ConsciousnessEventSchema;

export const BatchSyncSchema = z.object({
  deviceId: z.string().uuid('Invalid device ID format'),
  events: z.array(ConsciousnessEventSchema)
    .min(1, 'At least one event required')
    .max(50, 'Too many events in batch (max 50)')
    .refine(
      events => {
        const now = Date.now();
        return events.every(e => e.timestamp <= now + 60000); // Allow 1min future
      },
      'Events cannot be too far in the future'
    )
});

export const EntanglementSchema = z.object({
  deviceId: z.string().uuid('Invalid device ID format'),
  targetDeviceId: z.string().uuid('Invalid target device ID format').optional(),
  entanglementType: z.enum(['BREATHING', 'RESONANCE', 'SACRED_PHRASE'], {
    message: 'Invalid entanglement type'
  }),
  intensity: z.number()
    .min(0, 'Intensity must be at least 0')
    .max(1, 'Intensity cannot exceed 1')
}).refine(
  data => data.deviceId !== data.targetDeviceId,
  'Cannot entangle device with itself'
);

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

// Enhanced validation middleware with better error handling
export const validateInput = (schema: z.ZodSchema) => {
  return async ({ ctx, next, rawInput }: any) => {
    try {
      const validated = await schema.parseAsync(rawInput);
      // Pass validated input to next middleware
      ctx.validatedInput = validated;
      return next({ 
        ctx: { ...ctx, rawInput: validated } 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.issues.map((e: any) => {
          const path = e.path.length > 0 ? e.path.join('.') : 'root';
          return `${path}: ${e.message}`;
        }).join('; ');
        
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Validation failed: ${formattedErrors}`,
          cause: error.flatten()
        });
      }
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid input format',
        cause: error
      });
    }
  };
};

// Specialized validation for different input types
export const validateFieldInput = validateInput(FieldUpdateSchema);
export const validateBatchSync = validateInput(BatchSyncSchema);
export const validateEntanglement = validateInput(EntanglementSchema);
export const validateRoom64 = validateInput(Room64Schema);
export const validateArchaeology = validateInput(ArchaeologySchema);

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

// Type inference helpers
export type FieldUpdateInput = z.infer<typeof FieldUpdateSchema>;
export type ConsciousnessEventInput = z.infer<typeof ConsciousnessEventSchema>;
export type BatchSyncInput = z.infer<typeof BatchSyncSchema>;
export type EntanglementInput = z.infer<typeof EntanglementSchema>;
export type Room64Input = z.infer<typeof Room64Schema>;
export type ArchaeologyInput = z.infer<typeof ArchaeologySchema>;

// Enhanced validation helpers
export const validateEventBatch = (events: unknown[]): ConsciousnessEventInput[] => {
  if (!Array.isArray(events)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Events must be an array'
    });
  }
  
  return events.map((event, index) => {
    try {
      return ConsciousnessEventSchema.parse(event);
    } catch (error) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Invalid event at index ${index}: ${error instanceof z.ZodError ? error.issues[0]?.message : 'Unknown error'}`
      });
    }
  });
};

// Export all schemas as a collection for easy import
export const ConsciousnessSchemas = {
  FieldUpdate: FieldUpdateSchema,
  ConsciousnessEvent: ConsciousnessEventSchema,
  SyncEvent: SyncEventSchema, // Legacy
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