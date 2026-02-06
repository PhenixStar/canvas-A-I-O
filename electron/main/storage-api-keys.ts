import { randomUUID } from "node:crypto"
import { getDatabase } from "./database-schema"
import type { ApiKeyEntry, StorageResult } from "./persistence-types"
import { decryptValue, encryptValue } from "./storage-encryption"

/**
 * Store an API key (encrypted)
 */
export function storeApiKey(
    provider: string,
    apiKey: string,
): StorageResult<ApiKeyEntry> {
    try {
        const db = getDatabase()
        const id = randomUUID()
        const now = Date.now()
        const encryptedKey = encryptValue(apiKey)

        const stmt = db.prepare(`
            INSERT OR REPLACE INTO api_keys (id, provider, encrypted_key, created_at, last_used)
            VALUES (?, ?, ?, ?, ?)
        `)

        stmt.run(id, provider, encryptedKey, now, now)

        return {
            success: true,
            data: {
                id,
                provider,
                encryptedKey,
                createdAt: now,
                lastUsed: now,
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

/**
 * Get and decrypt an API key
 */
export function getApiKey(provider: string): StorageResult<string | null> {
    try {
        const db = getDatabase()
        const stmt = db.prepare(`
            SELECT encrypted_key FROM api_keys WHERE provider = ?
        `)

        const entry = stmt.get(provider) as
            | { encrypted_key: string }
            | undefined

        if (!entry) {
            return { success: true, data: null }
        }

        const decryptedKey = decryptValue(entry.encrypted_key)

        // Update last_used timestamp
        db.prepare("UPDATE api_keys SET last_used = ? WHERE provider = ?").run(
            Date.now(),
            provider,
        )

        return { success: true, data: decryptedKey }
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
 * Delete an API key
 */
export function deleteApiKey(provider: string): StorageResult<void> {
    try {
        const db = getDatabase()
        db.prepare("DELETE FROM api_keys WHERE provider = ?").run(provider)
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
 * Get all API key providers
 */
export function getAllApiKeys(): StorageResult<string[]> {
    try {
        const db = getDatabase()
        const stmt = db.prepare(`
            SELECT provider FROM api_keys ORDER BY provider
        `)

        const entries = stmt.all() as { provider: string }[]
        return { success: true, data: entries.map((e) => e.provider) }
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
