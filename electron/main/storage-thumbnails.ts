import { randomUUID } from "node:crypto"
import { getDatabase } from "./database-schema"
import type { StorageResult, ThumbnailCache } from "./persistence-types"

/**
 * Cache a thumbnail for a diagram
 */
export function cacheThumbnail(
    thumbnail: Omit<ThumbnailCache, "id">,
): StorageResult<ThumbnailCache> {
    try {
        const db = getDatabase()
        const id = randomUUID()

        const stmt = db.prepare(`
            INSERT OR REPLACE INTO thumbnails (id, diagram_id, thumbnail_data, timestamp, width, height)
            VALUES (?, ?, ?, ?, ?, ?)
        `)

        stmt.run(
            id,
            thumbnail.diagramId,
            thumbnail.thumbnailData,
            thumbnail.timestamp,
            thumbnail.width,
            thumbnail.height,
        )

        return {
            success: true,
            data: { ...thumbnail, id },
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
 * Get thumbnail for a specific diagram
 */
export function getThumbnail(
    diagramId: string,
): StorageResult<ThumbnailCache | null> {
    try {
        const db = getDatabase()
        const stmt = db.prepare(`
            SELECT * FROM thumbnails WHERE diagram_id = ?
        `)

        const entry = stmt.get(diagramId) as ThumbnailCache | undefined
        return { success: true, data: entry ?? null }
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
 * Delete thumbnail for a specific diagram
 */
export function deleteThumbnail(diagramId: string): StorageResult<void> {
    try {
        const db = getDatabase()
        db.prepare("DELETE FROM thumbnails WHERE diagram_id = ?").run(diagramId)
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
 * Clear old thumbnails
 */
export function clearOldThumbnail(daysOld = 30): StorageResult<number> {
    try {
        const db = getDatabase()
        const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000

        const stmt = db.prepare(`
            DELETE FROM thumbnails WHERE timestamp < ?
        `)

        const result = stmt.run(cutoffTime)
        return { success: true, data: result.changes }
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
