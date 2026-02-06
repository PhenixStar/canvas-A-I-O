import { randomUUID } from "node:crypto"
import { getDatabase } from "./database-schema"
import type { RecentFile, StorageResult } from "./persistence-types"

/**
 * Add or update a recent file entry
 */
export function addRecentFile(
    file: Omit<RecentFile, "id">,
): StorageResult<RecentFile> {
    try {
        const db = getDatabase()
        const id = randomUUID()

        const stmt = db.prepare(`
            INSERT OR REPLACE INTO recent_files (id, file_path, file_name, last_accessed, thumbnail)
            VALUES (?, ?, ?, ?, ?)
        `)

        stmt.run(
            id,
            file.filePath,
            file.fileName,
            file.lastAccessed,
            file.thumbnail ?? null,
        )

        return {
            success: true,
            data: { ...file, id },
        }
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        }
    }
}

/**
 * Get list of recent files
 */
export function getRecentFiles(limit = 20): StorageResult<RecentFile[]> {
    try {
        const db = getDatabase()
        const stmt = db.prepare(`
            SELECT * FROM recent_files
            ORDER BY last_accessed DESC
            LIMIT ?
        `)

        const files = stmt.all(limit) as RecentFile[]
        return { success: true, data: files }
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        }
    }
}

/**
 * Clear all recent files
 */
export function clearRecentFiles(): StorageResult<void> {
    try {
        const db = getDatabase()
        db.prepare("DELETE FROM recent_files").run()
        return { success: true, data: undefined }
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        }
    }
}

/**
 * Remove a specific recent file entry
 */
export function removeRecentFile(filePath: string): StorageResult<void> {
    try {
        const db = getDatabase()
        db.prepare("DELETE FROM recent_files WHERE file_path = ?").run(filePath)
        return { success: true, data: undefined }
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        }
    }
}
