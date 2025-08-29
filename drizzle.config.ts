import type { Config } from 'drizzle-kit';

export default {
  schema: './backend/infrastructure/database.ts',
  out: './backend/infrastructure/drizzle-migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/consciousness_db',
  },
} satisfies Config;