#!/bin/bash

# Apply performance optimization indexes to Limnus database
# This script can be run safely multiple times - it only creates indexes if they don't exist

echo "🔧 Applying performance optimizations to Limnus database..."
echo "=================================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL to your PostgreSQL connection string"
    exit 1
fi

# Check if running in production
if [ "$NODE_ENV" = "production" ]; then
    CONCURRENTLY="CONCURRENTLY"
    echo "📌 Running in production mode - using CONCURRENTLY for index creation"
else
    CONCURRENTLY=""
    echo "📌 Running in development mode - indexes will be created synchronously"
fi

# Function to run SQL and check result
run_sql() {
    local sql_file=$1
    local description=$2
    
    echo ""
    echo "🔄 $description..."
    
    if psql "$DATABASE_URL" < "$sql_file" 2>&1 | tee /tmp/migration_output.log; then
        echo "✅ $description completed successfully"
        return 0
    else
        echo "❌ $description failed"
        cat /tmp/migration_output.log
        return 1
    fi
}

# Apply the indexes
if [ -f "apply-performance-indexes.sql" ]; then
    run_sql "apply-performance-indexes.sql" "Creating performance indexes"
else
    echo "❌ Error: apply-performance-indexes.sql not found"
    echo "Please run this script from the migrations directory"
    exit 1
fi

echo ""
echo "=================================================="
echo "🎉 Database optimization complete!"
echo ""
echo "📊 Index Statistics:"
psql "$DATABASE_URL" -c "
SELECT 
    tablename,
    COUNT(*) as index_count,
    pg_size_pretty(SUM(pg_relation_size(indexrelid))) as total_index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
" 2>/dev/null || echo "Unable to fetch index statistics"

echo ""
echo "💡 Tips:"
echo "  - Monitor query performance with: SELECT * FROM pg_stat_statements;"
echo "  - Check index usage with: SELECT * FROM pg_stat_user_indexes;"
echo "  - Vacuum tables regularly for optimal performance"
echo ""