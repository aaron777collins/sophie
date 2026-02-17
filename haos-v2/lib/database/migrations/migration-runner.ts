import { Pool, PoolClient } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

interface MigrationRecord {
  id: number;
  name: string;
  executed_at: Date;
  checksum: string;
}

interface Migration {
  name: string;
  id: number;
  up: string;
  down?: string;
  checksum: string;
}

export class MigrationRunner {
  private pool: Pool;
  private migrationsPath: string;

  constructor(pool: Pool, migrationsPath?: string) {
    this.pool = pool;
    this.migrationsPath = migrationsPath || path.join(__dirname, './');
  }

  /**
   * Initialize the migration system by creating the schema_migrations table
   */
  async initialize(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Create schema_migrations table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id INTEGER PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          checksum VARCHAR(64) NOT NULL,
          UNIQUE(id),
          UNIQUE(name)
        );
      `);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get the current migration version
   */
  async getCurrentVersion(): Promise<number> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT COALESCE(MAX(id), 0) as current_version FROM schema_migrations'
      );
      return parseInt(result.rows[0].current_version, 10);
    } finally {
      client.release();
    }
  }

  /**
   * Get all executed migrations
   */
  async getExecutedMigrations(): Promise<MigrationRecord[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT id, name, executed_at, checksum FROM schema_migrations ORDER BY id ASC'
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  /**
   * Load migrations from the file system
   */
  private async loadMigrations(): Promise<Migration[]> {
    const files = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql') && file.match(/^\d{3}-/))
      .sort();

    const migrations: Migration[] = [];

    for (const file of files) {
      const filePath = path.join(this.migrationsPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const id = parseInt(file.substring(0, 3), 10);
      const name = file.replace(/^\d{3}-/, '').replace(/\.sql$/, '');

      // Split up and down migrations
      const sections = content.split(/^--\s*DOWN\s*$/m);
      const up = sections[0].trim();
      const down = sections[1]?.trim();

      // Generate checksum
      const checksum = this.generateChecksum(content);

      migrations.push({
        id,
        name,
        up,
        down,
        checksum
      });
    }

    return migrations;
  }

  /**
   * Generate MD5 checksum for migration content
   */
  private generateChecksum(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Validate migration checksums to ensure consistency
   */
  private async validateMigrations(migrations: Migration[]): Promise<void> {
    const executedMigrations = await this.getExecutedMigrations();
    
    for (const executed of executedMigrations) {
      const migration = migrations.find(m => m.id === executed.id);
      if (!migration) {
        throw new Error(`Migration ${executed.id}-${executed.name} was executed but file is missing`);
      }
      
      if (migration.checksum !== executed.checksum) {
        throw new Error(`Migration ${executed.id}-${executed.name} checksum mismatch. File may have been modified after execution.`);
      }
    }
  }

  /**
   * Run migrations up to a specific version (or latest if not specified)
   */
  async migrateUp(targetVersion?: number): Promise<void> {
    await this.initialize();
    
    const migrations = await this.loadMigrations();
    await this.validateMigrations(migrations);
    
    const currentVersion = await this.getCurrentVersion();
    const executedMigrations = await this.getExecutedMigrations();
    const executedIds = new Set(executedMigrations.map(m => m.id));

    // Determine target version
    const maxVersion = Math.max(...migrations.map(m => m.id), 0);
    const target = targetVersion !== undefined ? targetVersion : maxVersion;

    if (target < currentVersion) {
      throw new Error(`Target version ${target} is lower than current version ${currentVersion}. Use migrateDown to rollback.`);
    }

    // Find migrations to execute
    const migrationsToRun = migrations
      .filter(m => m.id <= target && !executedIds.has(m.id))
      .sort((a, b) => a.id - b.id);

    if (migrationsToRun.length === 0) {
      console.log('No migrations to run. Database is up to date.');
      return;
    }

    console.log(`Running ${migrationsToRun.length} migrations...`);

    for (const migration of migrationsToRun) {
      await this.executeMigration(migration, 'up');
    }

    const newVersion = await this.getCurrentVersion();
    console.log(`Migration completed. Database version: ${newVersion}`);
  }

  /**
   * Roll back migrations to a specific version
   */
  async migrateDown(targetVersion: number): Promise<void> {
    await this.initialize();
    
    const migrations = await this.loadMigrations();
    await this.validateMigrations(migrations);
    
    const currentVersion = await this.getCurrentVersion();
    
    if (targetVersion >= currentVersion) {
      throw new Error(`Target version ${targetVersion} is not lower than current version ${currentVersion}`);
    }

    const executedMigrations = await this.getExecutedMigrations();
    
    // Find migrations to rollback (in reverse order)
    const migrationsToRollback = executedMigrations
      .filter(m => m.id > targetVersion)
      .sort((a, b) => b.id - a.id); // Reverse order for rollback

    if (migrationsToRollback.length === 0) {
      console.log('No migrations to rollback.');
      return;
    }

    console.log(`Rolling back ${migrationsToRollback.length} migrations...`);

    for (const executedMigration of migrationsToRollback) {
      const migration = migrations.find(m => m.id === executedMigration.id);
      if (!migration || !migration.down) {
        throw new Error(`Migration ${executedMigration.id}-${executedMigration.name} does not have a rollback script`);
      }

      await this.executeMigration(migration, 'down');
    }

    const newVersion = await this.getCurrentVersion();
    console.log(`Rollback completed. Database version: ${newVersion}`);
  }

  /**
   * Execute a single migration
   */
  private async executeMigration(migration: Migration, direction: 'up' | 'down'): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      if (direction === 'up') {
        console.log(`Applying migration ${migration.id}-${migration.name}...`);
        
        // Execute the migration SQL
        await client.query(migration.up);
        
        // Record the migration
        await client.query(
          'INSERT INTO schema_migrations (id, name, checksum) VALUES ($1, $2, $3)',
          [migration.id, migration.name, migration.checksum]
        );
        
        console.log(`✓ Applied migration ${migration.id}-${migration.name}`);
      } else {
        console.log(`Rolling back migration ${migration.id}-${migration.name}...`);
        
        if (!migration.down) {
          throw new Error(`Migration ${migration.id}-${migration.name} has no rollback script`);
        }
        
        // Execute the rollback SQL
        await client.query(migration.down);
        
        // Remove the migration record
        await client.query(
          'DELETE FROM schema_migrations WHERE id = $1',
          [migration.id]
        );
        
        console.log(`✓ Rolled back migration ${migration.id}-${migration.name}`);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Migration ${migration.id}-${migration.name} failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      client.release();
    }
  }

  /**
   * Get migration status
   */
  async getStatus(): Promise<void> {
    await this.initialize();
    
    const migrations = await this.loadMigrations();
    const executedMigrations = await this.getExecutedMigrations();
    const executedIds = new Set(executedMigrations.map(m => m.id));
    
    console.log('\nMigration Status:');
    console.log('=================');
    
    if (migrations.length === 0) {
      console.log('No migrations found.');
      return;
    }

    for (const migration of migrations) {
      const isExecuted = executedIds.has(migration.id);
      const status = isExecuted ? '✓ Applied' : '✗ Pending';
      const executedAt = isExecuted 
        ? executedMigrations.find(m => m.id === migration.id)?.executed_at.toISOString() 
        : '';
      
      console.log(`${migration.id.toString().padStart(3, '0')}-${migration.name}: ${status} ${executedAt}`);
    }
    
    const currentVersion = await this.getCurrentVersion();
    console.log(`\nCurrent version: ${currentVersion}`);
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}