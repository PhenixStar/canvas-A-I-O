import { existsSync, mkdirSync } from "node:fs"
import * as path from "node:path"
import Database from "better-sqlite3"
import { app } from "electron"

/**
 * Get the database file path in userData directory
 */
function getDatabasePath(): string {
    const userDataPath = app.getPath("userData")
    return path.join(userDataPath, "canvas-persistence.db")
}

/**
 * Ensure userData directory exists
 */
function ensureUserDataDir(): void {
    const userDataPath = app.getPath("userData")
    if (!existsSync(userDataPath)) {
        mkdirSync(userDataPath, { recursive: true })
    }
}

/**
 * Create all database tables with proper schema
 */
export function createTables(db: typeof Database): void {
    // Diagram history table for undo/redo
    db.exec(`
        CREATE TABLE IF NOT EXISTS diagram_history (
            id TEXT PRIMARY KEY,
            diagram_id TEXT NOT NULL,
            version INTEGER NOT NULL,
            data TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            description TEXT,
            UNIQUE(diagram_id, version)
        );
    `)

    // Index for diagram history queries
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_diagram_history_diagram_id
        ON diagram_history(diagram_id);
    `)

    // Recent files table
    db.exec(`
        CREATE TABLE IF NOT EXISTS recent_files (
            id TEXT PRIMARY KEY,
            file_path TEXT NOT NULL UNIQUE,
            file_name TEXT NOT NULL,
            last_accessed INTEGER NOT NULL,
            thumbnail TEXT
        );
    `)

    // Index for sorting by last accessed
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_recent_files_last_accessed
        ON recent_files(last_accessed DESC);
    `)

    // Auto-save table for crash recovery
    db.exec(`
        CREATE TABLE IF NOT EXISTS auto_save (
            id TEXT PRIMARY KEY,
            diagram_id TEXT NOT NULL UNIQUE,
            data TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            version INTEGER NOT NULL
        );
    `)

    // Index for auto-save timestamp queries
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_auto_save_timestamp
        ON auto_save(timestamp DESC);
    `)

    // Thumbnail cache table
    db.exec(`
        CREATE TABLE IF NOT EXISTS thumbnails (
            id TEXT PRIMARY KEY,
            diagram_id TEXT NOT NULL UNIQUE,
            thumbnail_data TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            width INTEGER NOT NULL,
            height INTEGER NOT NULL
        );
    `)

    // Index for thumbnail cleanup
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_thumbnails_timestamp
        ON thumbnails(timestamp DESC);
    `)

    // API keys table (encrypted)
    db.exec(`
        CREATE TABLE IF NOT EXISTS api_keys (
            id TEXT PRIMARY KEY,
            provider TEXT NOT NULL UNIQUE,
            encrypted_key TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            last_used INTEGER NOT NULL
        );
    `)

    // Index for provider lookups
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_api_keys_provider
        ON api_keys(provider);
    `)
}

/**
 * Initialize database connection with WAL mode for better concurrency
 */
export function initializeDatabase(): typeof Database {
    ensureUserDataDir()

    const dbPath = getDatabasePath()
    const db = new Database(dbPath)

    // Enable WAL mode for better read/write concurrency
    db.pragma("journal_mode = WAL")

    // Optimize performance
    db.pragma("synchronous = NORMAL")
    db.pragma("cache_size = -64000") // 64MB cache
    db.pragma("temp_store = MEMORY")

    // Create tables if they don't exist
    createTables(db)

    return db
}

/**
 * Get database instance (singleton pattern)
 * Call this from storage-manager
 */
let dbInstance: typeof Database | null = null

export function getDatabase(): typeof Database {
    if (!dbInstance) {
        dbInstance = initializeDatabase()
    }
    return dbInstance
}

/**
 * Close database connection
 * Call this during app shutdown
 */
export function closeDatabase(): void {
    if (dbInstance) {
        dbInstance.close()
        dbInstance = null
    }
}

/**
 * Run database migrations for schema changes
 * Version 1: Initial schema
 */
export function runMigrations(db: typeof Database): void {
    // Create user_version table if not exists
    db.exec(`
        CREATE TABLE IF NOT EXISTS schema_version (
            version INTEGER PRIMARY KEY
        );
    `)

    const versionRow = db.prepare("SELECT version FROM schema_version").get() as
        | { version: number }
        | undefined

    const currentVersion = versionRow?.version ?? 0

    if (currentVersion < 1) {
        // Version 1: Initial schema (already created by createTables)
        db.prepare(
            "INSERT OR REPLACE INTO schema_version (version) VALUES (1)",
        ).run()
    }

    // Future migrations would go here:
    // if (currentVersion < 2) { ... }
}
