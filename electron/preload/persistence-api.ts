import { ipcRenderer } from "electron"
import type {
    DiagramHistoryEntry,
    RecentFile,
    AutoSaveEntry,
    ThumbnailCache,
} from "../main/persistence-types"

/**
 * Persistence API exposed to renderer process
 * Provides type-safe access to desktop storage operations
 */
export const persistenceAPI = {
    // ==================== Diagram History ====================

    /**
     * Add entry to diagram history (undo/redo)
     */
    addDiagramHistory: (entry: Omit<DiagramHistoryEntry, "id">) =>
        ipcRenderer.invoke("persistence:add-diagram-history", entry),

    /**
     * Get diagram history entries
     */
    getDiagramHistory: (diagramId: string, limit?: number) =>
        ipcRenderer.invoke("persistence:get-diagram-history", diagramId, limit),

    // ==================== Recent Files ====================

    /**
     * Add file to recent files list
     */
    addRecentFile: (file: Omit<RecentFile, "id">) =>
        ipcRenderer.invoke("persistence:add-recent-file", file),

    /**
     * Get list of recent files
     */
    getRecentFiles: (limit?: number) =>
        ipcRenderer.invoke("persistence:get-recent-files", limit),

    /**
     * Clear all recent files
     */
    clearRecentFiles: () =>
        ipcRenderer.invoke("persistence:clear-recent-files"),

    // ==================== Auto-Save ====================

    /**
     * Save auto-snapshot for crash recovery
     */
    saveAutoSave: (entry: Omit<AutoSaveEntry, "id">) =>
        ipcRenderer.invoke("persistence:save-auto-save", entry),

    /**
     * Get auto-save entry for diagram
     */
    getAutoSave: (diagramId: string) =>
        ipcRenderer.invoke("persistence:get-auto-save", diagramId),

    /**
     * Delete auto-save entry
     */
    deleteAutoSave: (diagramId: string) =>
        ipcRenderer.invoke("persistence:delete-auto-save", diagramId),

    // ==================== Thumbnails ====================

    /**
     * Cache thumbnail for diagram
     */
    cacheThumbnail: (thumbnail: Omit<ThumbnailCache, "id">) =>
        ipcRenderer.invoke("persistence:cache-thumbnail", thumbnail),

    /**
     * Get cached thumbnail
     */
    getThumbnail: (diagramId: string) =>
        ipcRenderer.invoke("persistence:get-thumbnail", diagramId),

    // ==================== API Keys ====================

    /**
     * Store encrypted API key
     */
    storeApiKey: (provider: string, apiKey: string) =>
        ipcRenderer.invoke("persistence:store-api-key", provider, apiKey),

    /**
     * Get stored API key
     */
    getApiKey: (provider: string) =>
        ipcRenderer.invoke("persistence:get-api-key", provider),

    /**
     * Delete stored API key
     */
    deleteApiKey: (provider: string) =>
        ipcRenderer.invoke("persistence:delete-api-key", provider),

    // ==================== Maintenance ====================

    /**
     * Clean up old data (history, thumbnails, auto-saves)
     */
    cleanupOldData: (daysToKeep?: number) =>
        ipcRenderer.invoke("persistence:cleanup-old-data", daysToKeep),
}
