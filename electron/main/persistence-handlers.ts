import { ipcMain } from "electron"
import {
    AutoSaveEntrySchema,
    DiagramHistoryEntrySchema,
    RecentFileSchema,
    type StorageResult,
    ThumbnailCacheSchema,
} from "./persistence-types"
import {
    addDiagramHistory,
    addRecentFile,
    cacheThumbnail,
    cleanupOldData,
    clearRecentFiles,
    deleteApiKey,
    deleteAutoSave,
    getApiKey,
    getAutoSave,
    getDiagramHistory,
    getRecentFiles,
    getThumbnail,
    saveAutoSave,
    storeApiKey,
} from "./storage-manager"

/**
 * Helper function to handle storage results
 * Throws error if operation failed
 */
function handleStorageResult<T>(result: StorageResult<T>): T {
    if (result.success === false) {
        throw new Error(result.error)
    }
    return result.data
}

/**
 * Register all persistence-related IPC handlers
 */
export function registerPersistenceHandlers(): void {
    console.log("Registering persistence handlers...")

    // ==================== Diagram History ====================

    ipcMain.handle(
        "persistence:add-diagram-history",
        (_event, rawData: unknown) => {
            // Validate input using Zod schema
            const validationResult = DiagramHistoryEntrySchema.omit({
                id: true,
            }).safeParse(rawData)

            if (!validationResult.success) {
                throw new Error(
                    `Invalid diagram history data: ${validationResult.error.issues.map((e) => e.message).join(", ")}`,
                )
            }

            const result = addDiagramHistory(validationResult.data)
            return handleStorageResult(result)
        },
    )

    ipcMain.handle(
        "persistence:get-diagram-history",
        (_event, diagramId: string) => {
            if (typeof diagramId !== "string" || !diagramId.trim()) {
                throw new Error("Invalid diagram ID")
            }

            const result = getDiagramHistory(diagramId)
            return handleStorageResult(result)
        },
    )

    // ==================== Recent Files ====================

    ipcMain.handle(
        "persistence:add-recent-file",
        (_event, rawData: unknown) => {
            // Validate input using Zod schema
            const validationResult = RecentFileSchema.omit({
                id: true,
            }).safeParse(rawData)

            if (!validationResult.success) {
                throw new Error(
                    `Invalid recent file data: ${validationResult.error.issues.map((e) => e.message).join(", ")}`,
                )
            }

            const result = addRecentFile(validationResult.data)
            return handleStorageResult(result)
        },
    )

    ipcMain.handle("persistence:get-recent-files", (_event, limit = 20) => {
        if (typeof limit !== "number" || limit < 1 || limit > 100) {
            throw new Error("Invalid limit (must be between 1 and 100)")
        }

        const result = getRecentFiles(limit)
        return handleStorageResult(result)
    })

    ipcMain.handle("persistence:clear-recent-files", () => {
        const result = clearRecentFiles()
        return handleStorageResult(result)
    })

    // ==================== Auto-Save ====================

    ipcMain.handle("persistence:save-auto-save", (_event, rawData: unknown) => {
        // Validate input using Zod schema
        const validationResult = AutoSaveEntrySchema.omit({
            id: true,
        }).safeParse(rawData)

        if (!validationResult.success) {
            throw new Error(
                `Invalid auto-save data: ${validationResult.error.issues.map((e) => e.message).join(", ")}`,
            )
        }

        const result = saveAutoSave(validationResult.data)
        return handleStorageResult(result)
    })

    ipcMain.handle("persistence:get-auto-save", (_event, diagramId: string) => {
        if (typeof diagramId !== "string" || !diagramId.trim()) {
            throw new Error("Invalid diagram ID")
        }

        const result = getAutoSave(diagramId)
        return handleStorageResult(result)
    })

    ipcMain.handle(
        "persistence:delete-auto-save",
        (_event, diagramId: string) => {
            if (typeof diagramId !== "string" || !diagramId.trim()) {
                throw new Error("Invalid diagram ID")
            }

            const result = deleteAutoSave(diagramId)
            return handleStorageResult(result)
        },
    )

    // ==================== Thumbnails ====================

    ipcMain.handle(
        "persistence:cache-thumbnail",
        (_event, rawData: unknown) => {
            // Validate input using Zod schema
            const validationResult = ThumbnailCacheSchema.omit({
                id: true,
            }).safeParse(rawData)

            if (!validationResult.success) {
                throw new Error(
                    `Invalid thumbnail data: ${validationResult.error.issues.map((e) => e.message).join(", ")}`,
                )
            }

            const result = cacheThumbnail(validationResult.data)
            return handleStorageResult(result)
        },
    )

    ipcMain.handle("persistence:get-thumbnail", (_event, diagramId: string) => {
        if (typeof diagramId !== "string" || !diagramId.trim()) {
            throw new Error("Invalid diagram ID")
        }

        const result = getThumbnail(diagramId)
        return handleStorageResult(result)
    })

    // ==================== API Keys ====================

    ipcMain.handle(
        "persistence:store-api-key",
        (_event, provider: string, apiKey: string) => {
            if (
                typeof provider !== "string" ||
                !provider.trim() ||
                typeof apiKey !== "string" ||
                !apiKey.trim()
            ) {
                throw new Error("Invalid provider or API key")
            }

            const result = storeApiKey(provider.trim(), apiKey.trim())
            return handleStorageResult(result)
        },
    )

    ipcMain.handle("persistence:get-api-key", (_event, provider: string) => {
        if (typeof provider !== "string" || !provider.trim()) {
            throw new Error("Invalid provider")
        }

        const result = getApiKey(provider.trim())
        return handleStorageResult(result)
    })

    ipcMain.handle("persistence:delete-api-key", (_event, provider: string) => {
        if (typeof provider !== "string" || !provider.trim()) {
            throw new Error("Invalid provider")
        }

        const result = deleteApiKey(provider.trim())
        return handleStorageResult(result)
    })

    // ==================== Maintenance ====================

    ipcMain.handle(
        "persistence:cleanup-old-data",
        (_event, daysToKeep = 30) => {
            if (
                typeof daysToKeep !== "number" ||
                daysToKeep < 1 ||
                daysToKeep > 365
            ) {
                throw new Error(
                    "Invalid days to keep (must be between 1 and 365)",
                )
            }

            const result = cleanupOldData(daysToKeep)
            return handleStorageResult(result)
        },
    )

    console.log("Persistence handlers registered successfully")
}
