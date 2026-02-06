import { safeStorage } from "electron"
import { StorageError } from "./persistence-types"

/**
 * Prefix to identify encrypted values
 */
const ENCRYPTED_PREFIX = "encrypted:"

/**
 * Check if safeStorage encryption is available
 */
export function isEncryptionAvailable(): boolean {
    return safeStorage.isEncryptionAvailable()
}

/**
 * Encrypt a sensitive value using safeStorage
 */
export function encryptValue(value: string): string {
    if (!value) {
        return value
    }

    if (!isEncryptionAvailable()) {
        console.warn(
            "⚠️ SECURITY WARNING: safeStorage not available. " +
                "API keys will be stored in PLAINTEXT.",
        )
        return value
    }

    try {
        const encrypted = safeStorage.encryptString(value)
        return ENCRYPTED_PREFIX + encrypted.toString("base64")
    } catch (error) {
        console.error("Encryption failed:", error)
        throw new StorageError(
            "Failed to encrypt value",
            "ENCRYPTION_FAILED",
            error,
        )
    }
}

/**
 * Decrypt a sensitive value using safeStorage
 */
export function decryptValue(value: string): string {
    if (!value || !value.startsWith(ENCRYPTED_PREFIX)) {
        return value
    }
    if (!isEncryptionAvailable()) {
        console.warn(
            "Cannot decrypt value: safeStorage encryption is not available",
        )
        return value
    }
    try {
        const base64Data = value.slice(ENCRYPTED_PREFIX.length)
        const buffer = Buffer.from(base64Data, "base64")
        return safeStorage.decryptString(buffer)
    } catch (error) {
        console.error("Failed to decrypt value:", error)
        throw new StorageError(
            "Failed to decrypt value",
            "DECRYPTION_FAILED",
            error,
        )
    }
}
