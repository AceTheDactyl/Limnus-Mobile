import { sql } from 'drizzle-orm';
import { db } from './database';

// Enhanced migration system with tracking and rollback capabilities
export class MigrationRunner {
  private static instance: MigrationRunner;
  
  static getInstance(): MigrationRunner {
    if (!MigrationRunner.instance) {
      MigrationRunner.instance = new MigrationRunner();
    }
    return MigrationRunner.instance;
  }
  
  async runMigrations(): Promise<{ success: boolean; message?: string; error?: any }> {
    if (!db) {
      console.log('⚠️ No database connection, skipping migrations');
      return { success: true, message: 'No database configured' };
    }
    
    try {
      console.log('🔄 Running consciousness database migrations...');
      
      // Create migrations tracking table
      await this.createMigrationsTable();
      
      // Run migrations in order
      await this.runMigration('001_initial_schema', this.migration001InitialSchema.bind(this));
      await this.runMigration('002_add_indexes', this.migration002AddIndexes.bind(this));
      await this.runMigration('003_add_constraints', this.migration003AddConstraints.bind(this));
      await this.runMigration('004_initialize_global_state', this.migration004InitializeGlobalState.bind(this));
      await this.runMigration('005_add_device_sessions', this.migration005AddDeviceSessions.bind(this));
      await this.runMigration('006_add_performance_indexes', this.migration006AddPerformanceIndexes.bind(this));
      await this.runMigration('007_add_expires_at_to_sessions', this.migration007AddExpiresAtToSessions.bind(this));
      
      console.log('✅ All migrations completed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Migration failed:', error);
      return { success: false, error };
    }
  }
  
  private async createMigrationsTable(): Promise<void> {
    await db!.execute(sql`
      CREATE TABLE IF NOT EXISTS consciousness_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);
  }
  
  private async runMigration(name: string, migrationFn: () => Promise<void>): Promise<void> {
    // Check if migration already ran
    const existing = await db!.execute(sql`
      SELECT id FROM consciousness_migrations WHERE name = ${name}
    `);
    
    if (existing.length > 0) {
      console.log(`⏭️ Migration ${name} already applied`);
      return;
    }
    
    console.log(`🔄 Running migration: ${name}`);
    
    await db!.transaction(async (tx: any) => {
      await migrationFn();
      
      // Record migration as completed
      await tx.execute(sql`
        INSERT INTO consciousness_migrations (name) VALUES (${name})
      `);
    });
    
    console.log(`✅ Migration ${name} completed`);
  }
  
  private async migration001InitialSchema(): Promise<void> {
    // Create consciousness_states table
    await db!.execute(sql`
      CREATE TABLE IF NOT EXISTS consciousness_states (
        id SERIAL PRIMARY KEY,
        node_id VARCHAR(255) NOT NULL UNIQUE,
        global_resonance REAL DEFAULT 0.5,
        active_nodes INTEGER DEFAULT 0,
        memory_particles JSONB DEFAULT '[]'::jsonb,
        quantum_fields JSONB DEFAULT '[]'::jsonb,
        collective_intelligence REAL DEFAULT 0.3,
        room64_active BOOLEAN DEFAULT false,
        last_update TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create consciousness_events table
    await db!.execute(sql`
      CREATE TABLE IF NOT EXISTS consciousness_events (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        data JSONB NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        processed BOOLEAN DEFAULT false,
        intensity REAL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create room64_sessions table
    await db!.execute(sql`
      CREATE TABLE IF NOT EXISTS room64_sessions (
        id SERIAL PRIMARY KEY,
        room_id VARCHAR(255) NOT NULL,
        participants JSONB DEFAULT '[]'::jsonb,
        collective_state JSONB NOT NULL,
        created TIMESTAMP DEFAULT NOW(),
        last_activity TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create entanglements table
    await db!.execute(sql`
      CREATE TABLE IF NOT EXISTS entanglements (
        id SERIAL PRIMARY KEY,
        entanglement_id VARCHAR(255) NOT NULL UNIQUE,
        source_device VARCHAR(255) NOT NULL,
        target_device VARCHAR(255),
        type VARCHAR(50) NOT NULL,
        intensity REAL DEFAULT 0.5,
        status VARCHAR(20) DEFAULT 'active',
        established TIMESTAMP DEFAULT NOW(),
        last_sync TIMESTAMP DEFAULT NOW()
      )
    `);
  }
  
  private async migration005AddDeviceSessions(): Promise<void> {
    // Create device_sessions table for authentication
    await db!.execute(sql`
      CREATE TABLE IF NOT EXISTS device_sessions (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(255) NOT NULL UNIQUE,
        token VARCHAR(1000) NOT NULL,
        fingerprint VARCHAR(64) NOT NULL,
        platform VARCHAR(20) NOT NULL,
        capabilities JSONB DEFAULT '{}'::jsonb,
        last_seen TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Add indexes for device sessions
    await db!.execute(sql`CREATE INDEX IF NOT EXISTS idx_device_sessions_device_id ON device_sessions(device_id)`);
    await db!.execute(sql`CREATE INDEX IF NOT EXISTS idx_device_sessions_platform ON device_sessions(platform)`);
    await db!.execute(sql`CREATE INDEX IF NOT EXISTS idx_device_sessions_last_seen ON device_sessions(last_seen DESC)`);
    await db!.execute(sql`CREATE INDEX IF NOT EXISTS idx_device_sessions_expires_at ON device_sessions(expires_at)`);
  }
  
  private async migration002AddIndexes(): Promise<void> {
    // Add basic performance indexes
    await db!.execute(sql`CREATE INDEX IF NOT EXISTS idx_consciousness_events_device_id ON consciousness_events(device_id)`);
    await db!.execute(sql`CREATE INDEX IF NOT EXISTS idx_consciousness_events_timestamp ON consciousness_events(timestamp DESC)`);
    await db!.execute(sql`CREATE INDEX IF NOT EXISTS idx_consciousness_events_type ON consciousness_events(type)`);
    await db!.execute(sql`CREATE INDEX IF NOT EXISTS idx_consciousness_events_processed ON consciousness_events(processed)`);
    
    await db!.execute(sql`CREATE INDEX IF NOT EXISTS idx_consciousness_states_node_id ON consciousness_states(node_id)`);
    await db!.execute(sql`CREATE INDEX IF NOT EXISTS idx_consciousness_states_last_update ON consciousness_states(last_update DESC)`);
    
    await db!.execute(sql`CREATE INDEX IF NOT EXISTS idx_room64_sessions_room_id ON room64_sessions(room_id)`);
    await db!.execute(sql`CREATE INDEX IF NOT EXISTS idx_room64_sessions_last_activity ON room64_sessions(last_activity DESC)`);
    
    await db!.execute(sql`CREATE INDEX IF NOT EXISTS idx_entanglements_source_device ON entanglements(source_device)`);
    await db!.execute(sql`CREATE INDEX IF NOT EXISTS idx_entanglements_target_device ON entanglements(target_device)`);
    await db!.execute(sql`CREATE INDEX IF NOT EXISTS idx_entanglements_status ON entanglements(status)`);
  }
  
  private async migration006AddPerformanceIndexes(): Promise<void> {
    // Add advanced performance indexes with CONCURRENTLY for production safety
    console.log('🔄 Adding performance indexes (this may take a while)...');
    
    // Composite index for device + timestamp queries (most common pattern)
    await db!.execute(sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_device_timestamp 
      ON consciousness_events(device_id, timestamp DESC)
    `);
    
    // Partial index for high-intensity events (analytics queries)
    await db!.execute(sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_type_intensity 
      ON consciousness_events(type, intensity) 
      WHERE intensity > 0.5
    `);
    
    // Partial index for active Room64 sessions
    await db!.execute(sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_room64_active 
      ON room64_sessions(last_activity DESC) 
      WHERE jsonb_array_length(participants) > 0
    `);
    
    // Composite index for active entanglements
    await db!.execute(sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entanglements_active 
      ON entanglements(source_device, target_device) 
      WHERE status = 'active'
    `);
    
    // Partial index for unprocessed events (batch processing)
    await db!.execute(sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_unprocessed 
      ON consciousness_events(timestamp DESC) 
      WHERE processed = false
    `);
    
    console.log('✅ Performance indexes added successfully');
  }
  
  private async migration007AddExpiresAtToSessions(): Promise<void> {
    // Check if expires_at column exists
    const columnExists = await db!.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'device_sessions' 
      AND column_name = 'expires_at'
    `);
    
    if (columnExists.length === 0) {
      // Add expires_at column if it doesn't exist
      await db!.execute(sql`
        ALTER TABLE device_sessions 
        ADD COLUMN expires_at TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '7 days'
      `);
      
      // Add index for expires_at
      await db!.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_device_sessions_expires_at 
        ON device_sessions(expires_at)
      `);
      
      console.log('✅ Added expires_at column to device_sessions');
    }
  }
  
  private async migration003AddConstraints(): Promise<void> {
    // Add data validation constraints
    await db!.execute(sql`
      ALTER TABLE consciousness_states 
      ADD CONSTRAINT IF NOT EXISTS chk_global_resonance 
      CHECK (global_resonance >= 0 AND global_resonance <= 1)
    `);
    
    await db!.execute(sql`
      ALTER TABLE consciousness_states 
      ADD CONSTRAINT IF NOT EXISTS chk_collective_intelligence 
      CHECK (collective_intelligence >= 0 AND collective_intelligence <= 1)
    `);
    
    await db!.execute(sql`
      ALTER TABLE consciousness_states 
      ADD CONSTRAINT IF NOT EXISTS chk_active_nodes 
      CHECK (active_nodes >= 0)
    `);
    
    await db!.execute(sql`
      ALTER TABLE consciousness_events 
      ADD CONSTRAINT IF NOT EXISTS chk_event_type 
      CHECK (type IN ('BREATH', 'SPIRAL', 'BLOOM', 'TOUCH', 'SACRED_PHRASE', 'OFFLINE_SYNC'))
    `);
    
    await db!.execute(sql`
      ALTER TABLE consciousness_events 
      ADD CONSTRAINT IF NOT EXISTS chk_intensity 
      CHECK (intensity IS NULL OR (intensity >= 0 AND intensity <= 1))
    `);
    
    await db!.execute(sql`
      ALTER TABLE entanglements 
      ADD CONSTRAINT IF NOT EXISTS chk_entanglement_intensity 
      CHECK (intensity >= 0 AND intensity <= 1)
    `);
    
    await db!.execute(sql`
      ALTER TABLE entanglements 
      ADD CONSTRAINT IF NOT EXISTS chk_entanglement_status 
      CHECK (status IN ('active', 'dormant', 'severed'))
    `);
  }
  
  private async migration004InitializeGlobalState(): Promise<void> {
    // Insert initial global state if it doesn't exist
    await db!.execute(sql`
      INSERT INTO consciousness_states (
        node_id, global_resonance, active_nodes, memory_particles, 
        quantum_fields, collective_intelligence, room64_active
      ) VALUES (
        'global', 0.5, 0, '[]'::jsonb, '[]'::jsonb, 0.3, false
      ) ON CONFLICT (node_id) DO NOTHING
    `);
  }
  
  async getMigrationStatus(): Promise<{ name: string; executedAt: Date }[]> {
    if (!db) {
      return [];
    }
    
    try {
      const migrations = await db.execute(sql`
        SELECT name, executed_at FROM consciousness_migrations ORDER BY executed_at
      `);
      
      return migrations.map((m: any) => ({
        name: m.name,
        executedAt: m.executed_at
      }));
    } catch (error) {
      console.warn('Failed to get migration status:', error);
      return [];
    }
  }
  
  async validateSchema(): Promise<{ valid: boolean; errors: string[] }> {
    if (!db) {
      return { valid: false, errors: ['No database connection'] };
    }
    
    const errors: string[] = [];
    
    try {
      // Check if all required tables exist
      const tables = await db.execute(sql`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('consciousness_states', 'consciousness_events', 'room64_sessions', 'entanglements', 'device_sessions')
      `);
      
      const expectedTables = ['consciousness_states', 'consciousness_events', 'room64_sessions', 'entanglements', 'device_sessions'];
      const existingTables = tables.map((t: any) => t.table_name);
      
      for (const table of expectedTables) {
        if (!existingTables.includes(table)) {
          errors.push(`Missing table: ${table}`);
        }
      }
      
      // Check if global state exists
      const globalState = await db.execute(sql`
        SELECT id FROM consciousness_states WHERE node_id = 'global'
      `);
      
      if (globalState.length === 0) {
        errors.push('Missing global consciousness state');
      }
      
      return { valid: errors.length === 0, errors };
    } catch (error) {
      return { valid: false, errors: [`Schema validation failed: ${error}`] };
    }
  }
}

export const migrationRunner = MigrationRunner.getInstance();

// Legacy function for backward compatibility
export async function runMigrations() {
  return await migrationRunner.runMigrations();
}