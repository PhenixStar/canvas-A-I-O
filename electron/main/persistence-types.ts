import { z } from "zod"

/**
 * Diagram history entry for undo/redo functionality
 */
export interface DiagramHistoryEntry {
    id: string
    diagramId: string
    version: number
    data: string
    timestamp: number
    description?: string
}

/**
 * Recent file entry for quick access
 */
export interface RecentFile {
    id: string
    filePath: string
    fileName: string
    lastAccessed: number
    thumbnail?: string
}

/**
 * Auto-save entry for crash recovery
 */
export interface AutoSaveEntry {
    id: string
    diagramId: string
    data: string
    timestamp: number
    version: number
}

/**
 * Thumbnail cache entry
 */
export interface ThumbnailCache {
    id: string
    diagramId: string
    thumbnailData: string
    timestamp: number
    width: number
    height: number
}

/**
 * API key storage (encrypted)
 */
export interface ApiKeyEntry {
    id: string
    provider: string
    encryptedKey: string
    createdAt: number
    lastUsed: number
}

/**
 * Zod validation schemas
 */

export const DiagramHistoryEntrySchema = z.object({
    id: z.string().uuid(),
    diagramId: z.string().min(1),
    version: z.number().int().positive(),
    data: z.string().min(1),
    timestamp: z.number().int().positive(),
    description: z.string().optional(),
})

export const RecentFileSchema = z.object({
    id: z.string().uuid(),
    filePath: z.string().min(1),
    fileName: z.string().min(1),
    lastAccessed: z.number().int().positive(),
    thumbnail: z.string().optional(),
})

export const AutoSaveEntrySchema = z.object({
    id: z.string().uuid(),
    diagramId: z.string().min(1),
    data: z.string().min(1),
    timestamp: z.number().int().positive(),
    version: z.number().int().positive(),
})

export const ThumbnailCacheSchema = z.object({
    id: z.string().uuid(),
    diagramId: z.string().min(1),
    thumbnailData: z.string().min(1),
    timestamp: z.number().int().positive(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
})

export const ApiKeyEntrySchema = z.object({
    id: z.string().uuid(),
    provider: z.string().min(1),
    encryptedKey: z.string().min(1),
    createdAt: z.number().int().positive(),
    lastUsed: z.number().int().positive(),
})

/**
 * Storage error class
 */
export class StorageError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly cause?: unknown,
    ) {
        super(message)
        this.name = "StorageError"
    }
}

/**
 * Result type for storage operations
 */
export type StorageResult<T> =
    | { success: true; data: T }
    | { success: false; error: string }
