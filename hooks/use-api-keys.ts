"use client"

import { useCallback, useEffect, useState } from "react"

export interface APIKeyInfo {
    provider: string
    hasKey: boolean
    lastUsed?: number
}

export interface UseAPIKeysReturn {
    /** Map of provider -> API key (only existence, not actual keys) */
    keys: Map<string, APIKeyInfo>
    /** Loading state */
    loading: boolean
    /** Error message if operation failed */
    error: string | null
    /** Store API key for a provider */
    storeKey: (provider: string, apiKey: string) => Promise<void>
    /** Check if provider has stored key */
    getKey: (provider: string) => Promise<string | null>
    /** Delete API key for a provider */
    deleteKey: (provider: string) => Promise<void>
    /** Refresh all keys from storage */
    refreshKeys: () => Promise<void>
}

const COMMON_PROVIDERS = [
    "openai",
    "anthropic",
    "openrouter",
    "google",
    "cohere",
    "replicate",
] as const

const isElectron =
    typeof window !== "undefined" && (window as any).electronAPI?.isElectron

/**
 * Helper to get keys from localStorage
 */
function getWebKeys(): Record<string, string> {
    const stored = localStorage.getItem("api-keys")
    return stored ? JSON.parse(stored) : {}
}

/**
 * Helper to set keys in localStorage
 */
function setWebKeys(keys: Record<string, string>): void {
    localStorage.setItem("api-keys", JSON.stringify(keys))
}

/**
 * React hook for API key management
 * Securely stores and retrieves API keys with encryption (in Electron)
 *
 * @returns API key state and operations
 *
 * @example
 * ```tsx
 * const { keys, loading, storeKey, getKey, deleteKey } = useAPIKeys()
 *
 * // Store a key
 * await storeKey("openai", "sk-...")
 *
 * // Check if key exists
 * const openAIKey = await getKey("openai")
 *
 * // Delete a key
 * await deleteKey("openai")
 * ```
 */
export function useAPIKeys(): UseAPIKeysReturn {
    const [keys, setKeys] = useState<Map<string, APIKeyInfo>>(new Map())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    /**
     * Load all API keys from storage
     */
    const refreshKeys = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const keyMap = new Map<string, APIKeyInfo>()

            if (!isElectron) {
                const storedKeys = getWebKeys()
                for (const provider of COMMON_PROVIDERS) {
                    if (storedKeys[provider]) {
                        keyMap.set(provider, { provider, hasKey: true })
                    }
                }
            } else {
                for (const provider of COMMON_PROVIDERS) {
                    try {
                        const key = await (
                            window as any
                        ).electronAPI.persistence.getApiKey(provider)
                        if (key) {
                            keyMap.set(provider, { provider, hasKey: true })
                        }
                    } catch {
                        // Provider might not have a key, that's fine
                    }
                }
            }

            setKeys(keyMap)
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load API keys",
            )
            console.error("Failed to load API keys:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    /**
     * Store API key for a provider
     */
    const storeKey = useCallback(
        async (provider: string, apiKey: string): Promise<void> => {
            if (!provider || !apiKey) {
                setError("Provider and API key are required")
                return
            }

            setError(null)

            try {
                if (!isElectron) {
                    console.warn(
                        "Storing API keys in localStorage is not secure. Use Electron for encrypted storage.",
                    )
                    const storedKeys = getWebKeys()
                    storedKeys[provider] = apiKey
                    setWebKeys(storedKeys)
                    setKeys((prev) => {
                        const updated = new Map(prev)
                        updated.set(provider, { provider, hasKey: true })
                        return updated
                    })
                    return
                }

                await (window as any).electronAPI.persistence.storeApiKey(
                    provider,
                    apiKey,
                )

                setKeys((prev) => {
                    const updated = new Map(prev)
                    updated.set(provider, {
                        provider,
                        hasKey: true,
                        lastUsed: Date.now(),
                    })
                    return updated
                })
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to store API key",
                )
                console.error("Failed to store API key:", err)
                throw err
            }
        },
        [],
    )

    /**
     * Get API key for a provider
     */
    const getKey = useCallback(
        async (provider: string): Promise<string | null> => {
            if (!provider) {
                setError("Provider is required")
                return null
            }

            setError(null)

            try {
                if (!isElectron) {
                    const storedKeys = getWebKeys()
                    return storedKeys[provider] || null
                }

                return await (window as any).electronAPI.persistence.getApiKey(
                    provider,
                )
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to get API key",
                )
                console.error("Failed to get API key:", err)
                return null
            }
        },
        [],
    )

    /**
     * Delete API key for a provider
     */
    const deleteKey = useCallback(async (provider: string): Promise<void> => {
        if (!provider) {
            setError("Provider is required")
            return
        }

        setError(null)

        try {
            if (!isElectron) {
                const storedKeys = getWebKeys()
                delete storedKeys[provider]
                setWebKeys(storedKeys)
                setKeys((prev) => {
                    const updated = new Map(prev)
                    updated.delete(provider)
                    return updated
                })
                return
            }

            await (window as any).electronAPI.persistence.deleteApiKey(provider)

            setKeys((prev) => {
                const updated = new Map(prev)
                updated.delete(provider)
                return updated
            })
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to delete API key",
            )
            console.error("Failed to delete API key:", err)
            throw err
        }
    }, [])

    // Load keys on mount
    useEffect(() => {
        refreshKeys()
    }, [refreshKeys])

    // Listen for storage events (multi-tab sync for web)
    useEffect(() => {
        if (isElectron) return

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "api-keys") {
                refreshKeys()
            }
        }

        window.addEventListener("storage", handleStorageChange)
        return () => window.removeEventListener("storage", handleStorageChange)
    }, [refreshKeys])

    return {
        keys,
        loading,
        error,
        storeKey,
        getKey,
        deleteKey,
        refreshKeys,
    }
}
