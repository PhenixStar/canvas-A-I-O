import { randomUUID } from "node:crypto"
import { getDatabase } from "./database-schema"
import type { DiagramHistoryEntry, StorageResult } from "./persistence-types"

/**
 * Add a diagram history entry
 */
export function addDiagramHistory(
    entry: Omit<DiagramHistoryEntry, "id">,
): StorageResult<DiagramHistoryEntry> {
    try {
        const db = getDatabase()
        const id = randomUUID()

        const stmt = db.prepare(`
            INSERT INTO diagram_history (id, diagram_id, version, data, timestamp, description)
            VALUES (?, ?, ?, ?, ?, ?)
        `)

        stmt.run(
            id,
            entry.diagramId,
            entry.version,
            entry.data,
            entry.timestamp,
            entry.description ?? null,
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
 * Get diagram history for a specific diagram
 */
export function getDiagramHistory(
    diagramId: string,
    limit = 50,
): StorageResult<DiagramHistoryEntry[]> {
    try {
        const db = getDatabase()
        const stmt = db.prepare(`
            SELECT * FROM diagram_history
            WHERE diagram_id = ?
            ORDER BY version DESC
            LIMIT ?
        `)

        const entries = stmt.all(diagramId, limit) as DiagramHistoryEntry[]
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

/**
 * Delete diagram history for a specific diagram
 */
export function deleteDiagramHistory(diagramId: string): StorageResult<void> {
    try {
        const db = getDatabase()
        const stmt = db.prepare(`
            DELETE FROM diagram_history WHERE diagram_id = ?
        `)

        stmt.run(diagramId)
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
