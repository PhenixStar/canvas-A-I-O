import { getDatabase } from "./database-schema"
import type { StorageResult } from "./persistence-types"

export { closeDatabase } from "./database-schema"
export {
    deleteApiKey,
    getAllApiKeys,
    getApiKey,
    storeApiKey,
} from "./storage-api-keys"
export {
    deleteAutoSave,
    getAllAutoSaves,
    getAutoSave,
    saveAutoSave,
} from "./storage-auto-save"
export {
    addDiagramHistory,
    deleteDiagramHistory,
    getDiagramHistory,
} from "./storage-diagram-history"
// Export all operations from sub-modules
export {
    decryptValue,
    encryptValue,
    isEncryptionAvailable,
} from "./storage-encryption"
export {
    addRecentFile,
    clearRecentFiles,
    getRecentFiles,
    removeRecentFile,
} from "./storage-recent-files"
export {
    cacheThumbnail,
    clearOldThumbnail,
    deleteThumbnail,
    getThumbnail,
} from "./storage-thumbnails"

/**
 * Cleanup old data across all tables
 */
export function cleanupOldData(daysToKeep = 30): StorageResult<void> {
    try {
        const db = getDatabase()
        const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000

        // Clean old diagram history (keep last 100 versions per diagram)
        db.prepare(`
            DELETE FROM diagram_history
            WHERE id NOT IN (
                SELECT id FROM diagram_history
                ORDER BY version DESC
                LIMIT 100
            )
        `).run()

        // Clean old thumbnails
        db.prepare("DELETE FROM thumbnails WHERE timestamp < ?").run(cutoffTime)

        // Clean old auto-saves
        db.prepare("DELETE FROM auto_save WHERE timestamp < ?").run(cutoffTime)

        // Clean old recent files (older than 90 days)
        const recentFileCutoff = Date.now() - 90 * 24 * 60 * 60 * 1000
        db.prepare("DELETE FROM recent_files WHERE last_accessed < ?").run(
            recentFileCutoff,
        )

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
 * Get database statistics
 */
export interface DatabaseStats {
    diagramHistoryCount: number
    recentFilesCount: number
    autoSaveCount: number
    thumbnailsCount: number
    apiKeysCount: number
    databaseSize: number
}

export function getDatabaseStats(): StorageResult<DatabaseStats> {
    try {
        const db = getDatabase()

        const diagramHistoryCount = (
            db
                .prepare("SELECT COUNT(*) as count FROM diagram_history")
                .get() as {
                count: number
            }
        ).count

        const recentFilesCount = (
            db.prepare("SELECT COUNT(*) as count FROM recent_files").get() as {
                count: number
            }
        ).count

        const autoSaveCount = (
            db.prepare("SELECT COUNT(*) as count FROM auto_save").get() as {
                count: number
            }
        ).count

        const thumbnailsCount = (
            db.prepare("SELECT COUNT(*) as count FROM thumbnails").get() as {
                count: number
            }
        ).count

        const apiKeysCount = (
            db.prepare("SELECT COUNT(*) as count FROM api_keys").get() as {
                count: number
            }
        ).count

        // Get database file size
        const dbPath = db.prepare("PRAGMA database_list").get() as {
            file: string
        }[]
        const databaseSize = dbPath[0]?.file
            ? require("node:fs").statSync(dbPath[0].file).size
            : 0

        return {
            success: true,
            data: {
                diagramHistoryCount,
                recentFilesCount,
                autoSaveCount,
                thumbnailsCount,
                apiKeysCount,
                databaseSize,
            },
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
