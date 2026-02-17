#!/usr/bin/env node

import { Pool } from 'pg';
import { MigrationRunner } from '../lib/database/migrations/migration-runner';
import * as path from 'path';

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

/**
 * Get database configuration from environment variables
 */
function getDatabaseConfig(): DatabaseConfig {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'haos_v2'
  };
}

/**
 * Print usage information
 */
function printUsage(): void {
  console.log(`
HAOS v2 Database Migration Tool

Usage: npm run migrate <command> [options]

Commands:
  up [version]      Run migrations up to specified version (or latest)
  down <version>    Roll back migrations to specified version
  status           Show migration status
  current          Show current migration version
  help             Show this help message

Examples:
  npm run migrate up              # Run all pending migrations
  npm run migrate up 5            # Run migrations up to version 5
  npm run migrate down 3          # Roll back to version 3
  npm run migrate status          # Show migration status
  npm run migrate current         # Show current version

Environment Variables:
  DB_HOST         Database host (default: localhost)
  DB_PORT         Database port (default: 5432)
  DB_USER         Database user (default: postgres)
  DB_PASSWORD     Database password (default: postgres)
  DB_NAME         Database name (default: haos_v2)

Note: Make sure your PostgreSQL database is running and accessible.
`);
}

/**
 * Validate database connection
 */
async function validateConnection(pool: Pool): Promise<void> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✓ Database connection successful');
  } catch (error) {
    console.error('✗ Database connection failed:', error instanceof Error ? error.message : String(error));
    console.error('\nPlease check your database configuration and ensure PostgreSQL is running.');
    process.exit(1);
  }
}

/**
 * Main migration function
 */
async function runMigration(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printUsage();
    return;
  }

  // Get database configuration
  const config = getDatabaseConfig();
  
  console.log('HAOS v2 Migration Tool');
  console.log('=====================');
  console.log(`Connecting to: ${config.user}@${config.host}:${config.port}/${config.database}`);
  
  // Create database connection pool
  const pool = new Pool(config);
  
  try {
    // Validate connection first
    await validateConnection(pool);
    
    // Initialize migration runner
    const migrationsPath = path.join(__dirname, '..', 'lib', 'database', 'migrations');
    const runner = new MigrationRunner(pool, migrationsPath);

    // Execute command
    switch (command.toLowerCase()) {
      case 'up': {
        const version = args[1] ? parseInt(args[1], 10) : undefined;
        if (args[1] && isNaN(version as number)) {
          console.error('Error: Version must be a number');
          process.exit(1);
        }
        await runner.migrateUp(version);
        break;
      }

      case 'down': {
        const version = parseInt(args[1], 10);
        if (!args[1] || isNaN(version)) {
          console.error('Error: down command requires a valid version number');
          printUsage();
          process.exit(1);
        }
        await runner.migrateDown(version);
        break;
      }

      case 'status':
        await runner.getStatus();
        break;

      case 'current': {
        await runner.initialize();
        const version = await runner.getCurrentVersion();
        console.log(`Current migration version: ${version}`);
        break;
      }

      case 'reset': {
        // Hidden command for development - completely reset database
        if (process.env.NODE_ENV === 'production') {
          console.error('Error: reset command is not allowed in production');
          process.exit(1);
        }
        console.warn('⚠️  WARNING: This will completely reset your database!');
        console.warn('All data will be lost. This action cannot be undone.');
        
        // Simple confirmation (in a real app, you might want a more robust confirmation)
        if (process.env.FORCE_RESET !== 'true') {
          console.log('To proceed, set FORCE_RESET=true environment variable');
          process.exit(1);
        }

        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          
          // Drop all tables (this is destructive!)
          const result = await client.query(`
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public' AND tablename != 'schema_migrations'
          `);
          
          for (const row of result.rows) {
            await client.query(`DROP TABLE IF EXISTS ${row.tablename} CASCADE`);
          }
          
          // Drop schema_migrations table too
          await client.query('DROP TABLE IF EXISTS schema_migrations CASCADE');
          
          await client.query('COMMIT');
          console.log('✓ Database reset complete');
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
        break;
      }

      default:
        console.error(`Error: Unknown command '${command}'`);
        printUsage();
        process.exit(1);
    }

  } catch (error) {
    console.error('Migration failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run the migration if this file is executed directly
if (require.main === module) {
  runMigration();
}