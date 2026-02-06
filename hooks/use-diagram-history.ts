"use client"

import { useCallback, useEffect, useState } from "react"
import type { DiagramHistoryEntry } from "../electron/main/persistence-types"

/**
 * Cache duration for diagram history (5 minutes)
 */
const CACHE_DURATION = 5 * 60 * 1000

export interface UseDiagramHistoryReturn {
    /** Array of history entries for the diagram */
    history: DiagramHistoryEntry[]
    /** Loading state */
    loading: boolean
    /** Error message if operation failed */
    error: string | null
    /** Add a new entry to diagram history */
    addEntry: (
        entry: Omit<DiagramHistoryEntry, "id" | "timestamp">,
    ) => Promise<void>
    /** Refresh history from database */
    getHistory: () => Promise<void>
}

/**
 * React hook for diagram history management (undo/redo)
 * Provides caching and auto-refresh capabilities
 *
 * @param diagramId - The diagram ID to manage history for
 * @returns Diagram history state and operations
 *
 * @example
 * ```tsx
 * const { history, loading, addEntry } = useDiagramHistory("diagram-123")
 *
 * // Add new history entry
 * await addEntry({
 *   diagramId: "diagram-123",
 *   version: 1,
 *   data: "<mxGraphModel>...</mxGraphModel>",
 *   description: "Added new shape"
 * })
 * ```
 */
export function useDiagramHistory(
    diagramId: string,
): UseDiagramHistoryReturn {
    const [history, setHistory] = useState<DiagramHistoryEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastFetch, setLastFetch] = useState<number>(0)

    /**
     * Check if running in Electron environment
     */
    const isElectron =
        typeof window !== "undefined" &&
        (window as any).electronAPI?.isElectron

    /**
     * Load history from persistence layer
     */
    const getHistory = useCallback(async () => {
        if (!diagramId) {
            setError("Invalid diagram ID")
            return
        }

        // Check cache
        const now = Date.now()
        if (now - lastFetch < CACHE_DURATION && history.length > 0) {
            return
        }

        setLoading(true)
        setError(null)

        try {
            if (!isElectron) {
                // Web fallback: use localStorage
                const stored = localStorage.getItem(
                    `diagram-history-${diagramId}`,
                )
                const entries: DiagramHistoryEntry[] = stored
                    ? JSON.parse(stored)
                    : []
                setHistory(entries)
                setLastFetch(now)
                return
            }

            // Electron: use IPC
            const entries =
                await (window as any).electronAPI.persistence.getDiagramHistory(
                    diagramId,
                )
            setHistory(entries)
            setLastFetch(now)
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to load history"
            setError(message)
            console.error("Failed to load diagram history:", err)
        } finally {
            setLoading(false)
        }
    }, [diagramId, isElectron, lastFetch, history.length])

    /**
     * Add entry to history
     */
    const addEntry = useCallback(
        async (
            entry: Omit<DiagramHistoryEntry, "id" | "timestamp">,
        ): Promise<void> => {
            if (!diagramId) {
                setError("Invalid diagram ID")
                return
            }

            setError(null)

            try {
                const newEntry: Omit<DiagramHistoryEntry, "id"> = {
                    ...entry,
                    timestamp: Date.now(),
                }

                if (!isElectron) {
                    // Web fallback: use localStorage
                    const stored = localStorage.getItem(
                        `diagram-history-${diagramId}`,
                    )
                    const entries: DiagramHistoryEntry[] = stored
                        ? JSON.parse(stored)
                        : []
                    const entryWithId: DiagramHistoryEntry = {
                        ...newEntry,
                        id: `history-${Date.now()}`,
                    }
                    entries.push(entryWithId)
                    localStorage.setItem(
                        `diagram-history-${diagramId}`,
                        JSON.stringify(entries),
                    )
                    setHistory(entries)
                    setLastFetch(Date.now())
                    return
                }

                // Electron: use IPC
                await (window as any).electronAPI.persistence.addDiagramHistory(
                    newEntry,
                )

                // Refresh history after adding
                await getHistory()
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to add entry"
                setError(message)
                console.error("Failed to add history entry:", err)
                throw err
            }
        },
        [diagramId, isElectron, getHistory],
    )

    // Load history on mount and diagram changes
    useEffect(() => {
        getHistory()
    }, [getHistory])

    return {
        history,
        loading,
        error,
        addEntry,
        getHistory,
    }
}
