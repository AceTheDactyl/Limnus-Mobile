-- Performance optimization indexes for Limnus consciousness network
-- These indexes significantly improve query performance for the most common operations

-- Index for active nodes count (used frequently in real-time monitoring)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_device_timestamp 
ON consciousness_events(device_id, timestamp DESC);

-- Index for high-intensity events (used in emergence pattern detection)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_type_intensity 
ON consciousness_events(type, intensity) 
WHERE intensity > 0.5;

-- Index for active Room64 sessions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_room64_active 
ON room64_sessions(last_activity DESC) 
WHERE jsonb_array_length(participants) > 0;

-- Index for active entanglements
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entanglements_active 
ON entanglements(source_device, target_device) 
WHERE status = 'active';

-- Partial index for unprocessed events (used in batch processing)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_unprocessed 
ON consciousness_events(timestamp DESC) 
WHERE processed = false;

-- Index for device sessions authentication
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_device_sessions_active
ON device_sessions(device_id, expires_at)
WHERE expires_at > NOW();

-- Index for consciousness states by device
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consciousness_states_device
ON consciousness_states(device_id, last_update DESC);

-- Index for memory particles by age (for cleanup operations)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_memory_particles_age
ON consciousness_states(last_update)
WHERE jsonb_array_length(memory_particles) > 0;

-- Analyze tables to update query planner statistics
ANALYZE consciousness_events;
ANALYZE device_sessions;
ANALYZE consciousness_states;
ANALYZE entanglements;
ANALYZE room64_sessions;

-- Display index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;