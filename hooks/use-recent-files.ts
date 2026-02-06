"use client"

import { useCallback, useEffect, useState } from "react"
import type { RecentFile } from "../electron/main/persistence-types"

export interface UseRecentFilesReturn {
    /** Array of recent file entries */
    files: RecentFile[]
    /** Loading state */
    loading: boolean
    /** Error message if operation failed */
    error: string | null
    /** Add a file to recent files list */
    addFile: (file: Omit<RecentFile, "id" | "lastAccessed">) => Promise<void>
    /** Refresh recent files from storage */
    getFiles: () => Promise<void>
    /** Clear all recent files */
    clearFiles: () => Promise<void>
}

/**
 * React hook for recent files management
 * Auto-handles missing files and provides web fallback
 *
 * @param limit - Maximum number of files to return (default: 20)
 * @returns Recent files state and operations
 *
 * @example
 * ```tsx
 * const { files, loading, addFile, clearFiles } = useRecentFiles(10)
 *
 * // Add file when opened
 * await addFile({
 *   filePath: "/path/to/file.drawio",
 *   fileName: "My Diagram.drawio",
 *   thumbnail: "data:image/png;base64,..."
 * })
 *
 * // Clear all recent files
 * await clearFiles()
 * ```
 */
export function useRecentFiles(limit: number = 20): UseRecentFilesReturn {
    const [files, setFiles] = useState<RecentFile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    /**
     * Check if running in Electron environment
     */
    const isElectron =
        typeof window !== "undefined" && (window as any).electronAPI?.isElectron

    /**
     * Load recent files from storage
     */
    const getFiles = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            if (!isElectron) {
                // Web fallback: use localStorage
                const stored = localStorage.getItem("recent-files")
                const allFiles: RecentFile[] = stored ? JSON.parse(stored) : []

                // Filter out missing files (in web, just validate structure)
                const validFiles = allFiles.filter(
                    (file) => file.filePath && file.fileName,
                )

                setFiles(validFiles.slice(0, limit))
                return
            }

            // Electron: use IPC
            const recentFiles = await (
                window as any
            ).electronAPI.persistence.getRecentFiles(limit)

            // In Electron, we could also check if files still exist
            // For now, just return them as-is
            setFiles(recentFiles)
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to load recent files"
            setError(message)
            console.error("Failed to load recent files:", err)
        } finally {
            setLoading(false)
        }
    }, [isElectron, limit])

    /**
     * Add file to recent files list
     */
    const addFile = useCallback(
        async (
            file: Omit<RecentFile, "id" | "lastAccessed">,
        ): Promise<void> => {
            setError(null)

            try {
                const newFile: Omit<RecentFile, "id"> = {
                    ...file,
                    lastAccessed: Date.now(),
                }

                if (!isElectron) {
                    // Web fallback: use localStorage
                    const stored = localStorage.getItem("recent-files")
                    const files: RecentFile[] = stored ? JSON.parse(stored) : []

                    // Remove duplicate entries
                    const filtered = files.filter(
                        (f) => f.filePath !== file.filePath,
                    )

                    // Add new file at the beginning
                    const fileWithId: RecentFile = {
                        ...newFile,
                        id: `recent-${Date.now()}`,
                    }
                    const updated = [fileWithId, ...filtered].slice(0, limit)

                    localStorage.setItem(
                        "recent-files",
                        JSON.stringify(updated),
                    )
                    setFiles(updated)
                    return
                }

                // Electron: use IPC
                await (window as any).electronAPI.persistence.addRecentFile(
                    newFile,
                )

                // Refresh list after adding
                await getFiles()
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to add file"
                setError(message)
                console.error("Failed to add recent file:", err)
                throw err
            }
        },
        [isElectron, limit, getFiles],
    )

    /**
     * Clear all recent files
     */
    const clearFiles = useCallback(async (): Promise<void> => {
        setError(null)

        try {
            if (!isElectron) {
                // Web fallback: clear localStorage
                localStorage.removeItem("recent-files")
                setFiles([])
                return
            }

            // Electron: use IPC
            await (window as any).electronAPI.persistence.clearRecentFiles()

            // Clear local state
            setFiles([])
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to clear recent files"
            setError(message)
            console.error("Failed to clear recent files:", err)
        }
    }, [isElectron])

    // Load files on mount
    useEffect(() => {
        getFiles()
    }, [getFiles])

    // Listen for file system changes (Electron only)
    useEffect(() => {
        if (!isElectron) return

        // In a real implementation, we might listen for file system events
        // For now, just refresh on window focus
        const handleFocus = () => {
            getFiles()
        }

        window.addEventListener("focus", handleFocus)
        return () => window.removeEventListener("focus", handleFocus)
    }, [isElectron, getFiles])

    return {
        files,
        loading,
        error,
        addFile,
        getFiles,
        clearFiles,
    }
}
