"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { AutoSaveEntry } from "../electron/main/persistence-types"

/**
 * Default auto-save interval (30 seconds)
 */
const DEFAULT_SAVE_INTERVAL = 30 * 1000

export interface UseAutoSaveReturn {
    /** Timestamp of last successful save */
    lastSaved: number | null
    /** Whether there are unsaved changes */
    isDirty: boolean
    /** Whether save operation is in progress */
    saving: boolean
    /** Manually trigger save now */
    saveNow: () => Promise<void>
    /** Clear auto-save data for current diagram */
    clearAutoSave: () => Promise<void>
}

/**
 * React hook for diagram auto-save functionality
 * Automatically saves diagram XML changes with debouncing
 *
 * @param diagramId - The diagram ID to auto-save
 * @param xml - Current diagram XML content
 * @param enabled - Whether auto-save is enabled (default: true)
 * @param interval - Auto-save interval in milliseconds (default: 30000ms)
 * @returns Auto-save state and controls
 *
 * @example
 * ```tsx
 * const [xml, setXml] = useState("<mxGraphModel>...</mxGraphModel>")
 * const { lastSaved, isDirty, saveNow } = useAutoSave("diagram-123", xml, true, 30000)
 *
 * // Show last saved time
 * <span>Last saved: {lastSaved ? new Date(lastSaved).toLocaleString() : 'Never'}</span>
 *
 * // Manual save button
 * <button onClick={saveNow} disabled={saving}>
 *   {saving ? 'Saving...' : 'Save Now'}
 * </button>
 * ```
 */
export function useAutoSave(
    diagramId: string,
    xml: string,
    enabled: boolean = true,
    interval: number = DEFAULT_SAVE_INTERVAL,
): UseAutoSaveReturn {
    const [lastSaved, setLastSaved] = useState<number | null>(null)
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const lastSavedXmlRef = useRef<string>("")
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    /**
     * Check if running in Electron environment
     */
    const isElectron =
        typeof window !== "undefined" && (window as any).electronAPI?.isElectron

    /**
     * Perform the actual save operation
     */
    const performSave = useCallback(async () => {
        if (!diagramId || !xml || !enabled) return

        setSaving(true)
        setIsDirty(false)

        try {
            const entry: Omit<AutoSaveEntry, "id"> = {
                diagramId,
                data: xml,
                timestamp: Date.now(),
                version: 1, // Could be incremented based on actual version
            }

            if (!isElectron) {
                // Web fallback: use localStorage
                const key = `autosave-${diagramId}`
                localStorage.setItem(key, JSON.stringify(entry))
                setLastSaved(Date.now())
                lastSavedXmlRef.current = xml
                return
            }

            // Electron: use IPC
            await (window as any).electronAPI.persistence.saveAutoSave(entry)

            setLastSaved(Date.now())
            lastSavedXmlRef.current = xml
        } catch (err) {
            console.error("Failed to auto-save:", err)
            setIsDirty(true) // Mark as dirty again if save failed
        } finally {
            setSaving(false)
        }
    }, [diagramId, xml, enabled, isElectron])

    /**
     * Manually trigger save now
     */
    const saveNow = useCallback(async () => {
        // Clear any pending save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
            saveTimeoutRef.current = null
        }

        await performSave()
    }, [performSave])

    /**
     * Clear auto-save data for current diagram
     */
    const clearAutoSave = useCallback(async (): Promise<void> => {
        if (!diagramId) return

        try {
            if (!isElectron) {
                // Web fallback: clear localStorage
                localStorage.removeItem(`autosave-${diagramId}`)
                setLastSaved(null)
                lastSavedXmlRef.current = ""
                return
            }

            // Electron: use IPC
            await (window as any).electronAPI.persistence.deleteAutoSave(
                diagramId,
            )

            setLastSaved(null)
            lastSavedXmlRef.current = ""
        } catch (err) {
            console.error("Failed to clear auto-save:", err)
        }
    }, [diagramId, isElectron])

    /**
     * Load previous auto-save on mount
     */
    useEffect(() => {
        if (!diagramId || !enabled) return

        async function loadAutoSave() {
            try {
                if (!isElectron) {
                    // Web fallback: check localStorage
                    const key = `autosave-${diagramId}`
                    const stored = localStorage.getItem(key)
                    if (stored) {
                        const entry: AutoSaveEntry = JSON.parse(stored)
                        setLastSaved(entry.timestamp)
                        lastSavedXmlRef.current = entry.data
                    }
                    return
                }

                // Electron: use IPC
                const entry = await (
                    window as any
                ).electronAPI.persistence.getAutoSave(diagramId)

                if (entry) {
                    setLastSaved(entry.timestamp)
                    lastSavedXmlRef.current = entry.data
                }
            } catch (err) {
                console.error("Failed to load auto-save:", err)
            }
        }

        loadAutoSave()
    }, [diagramId, enabled, isElectron])

    /**
     * Watch for XML changes and trigger auto-save
     */
    useEffect(() => {
        if (!enabled || !xml) return

        // Skip if XML hasn't changed since last save
        if (xml === lastSavedXmlRef.current) return

        // Mark as dirty
        setIsDirty(true)

        // Clear previous timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        // Schedule new save
        saveTimeoutRef.current = setTimeout(() => {
            performSave()
        }, interval)

        // Cleanup on unmount
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [xml, enabled, interval, performSave])

    /**
     * Perform save on unmount if dirty
     */
    useEffect(() => {
        return () => {
            if (isDirty && enabled && xml) {
                // Save immediately on unmount
                performSave()
            }
        }
    }, [isDirty, enabled, xml, performSave])

    return {
        lastSaved,
        isDirty,
        saving,
        saveNow,
        clearAutoSave,
    }
}
