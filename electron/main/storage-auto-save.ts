import { randomUUID } from "node:crypto"
import { getDatabase } from "./database-schema"
import type { AutoSaveEntry, StorageResult } from "./persistence-types"

/**
 * Save or update auto-save entry
 */
export function saveAutoSave(
    entry: Omit<AutoSaveEntry, "id">,
): StorageResult<AutoSaveEntry> {
    try {
        const db = getDatabase()
        const id = randomUUID()

        const stmt = db.prepare(`
            INSERT OR REPLACE INTO auto_save (id, diagram_id, data, timestamp, version)
            VALUES (?, ?, ?, ?, ?)
        `)

        stmt.run(
            id,
            entry.diagramId,
            entry.data,
            entry.timestamp,
            entry.version,
        )

        return {
            success: true,
            data: { ...entry, id },
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
 * Get auto-save entry for a specific diagram
 */
export function getAutoSave(
    diagramId: string,
): StorageResult<AutoSaveEntry | null> {
    try {
        const db = getDatabase()
        const stmt = db.prepare(`
            SELECT * FROM auto_save WHERE diagram_id = ?
        `)

        const entry = stmt.get(diagramId) as AutoSaveEntry | undefined
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
 * Delete auto-save entry for a specific diagram
 */
export function deleteAutoSave(diagramId: string): StorageResult<void> {
    try {
        const db = getDatabase()
        db.prepare("DELETE FROM auto_save WHERE diagram_id = ?").run(diagramId)
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
 * Get all auto-save entries
 */
export function getAllAutoSaves(): StorageResult<AutoSaveEntry[]> {
    try {
        const db = getDatabase()
        const stmt = db.prepare(`
            SELECT * FROM auto_save ORDER BY timestamp DESC
        `)

        const entries = stmt.all() as AutoSaveEntry[]
        return { success: true, data: entries }
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
