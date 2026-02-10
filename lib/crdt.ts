import { IndexeddbPersistence } from "y-indexeddb"
import { WebsocketProvider } from "y-websocket"
import * as Y from "yjs"

export const DEFAULT_COLLAB_WS_URL = "ws://localhost:3001"
export const DEFAULT_COLLAB_ROOM_ID = "canvas-a-i-o-room"
export const DIAGRAM_XML_FIELD = "diagram-xml"

export interface CrdtConnectionOptions {
    roomId: string
    wsUrl?: string
    enableIndexedDb?: boolean
}

export interface CrdtConnection {
    doc: Y.Doc
    sharedText: Y.Text
    wsProvider: WebsocketProvider
    indexeddbProvider?: IndexeddbPersistence
    roomId: string
    destroy: () => void
}

/**
 * Normalize room names so query/env input maps to stable, URL-safe IDs.
 */
export function normalizeRoomId(roomId: string | null | undefined): string {
    const trimmed = roomId?.trim() || ""
    if (!trimmed) return DEFAULT_COLLAB_ROOM_ID

    const normalized = trimmed
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")

    return normalized || DEFAULT_COLLAB_ROOM_ID
}

/**
 * Resolve websocket URL with explicit > env > default precedence.
 */
export function resolveCollabWebSocketUrl(explicitUrl?: string | null): string {
    const candidate =
        explicitUrl?.trim() ||
        process.env.NEXT_PUBLIC_COLLAB_WS_URL?.trim() ||
        DEFAULT_COLLAB_WS_URL

    return candidate
}

/**
 * Create a Yjs document + providers for a collaborative diagram room.
 */
export function createCrdtConnection(
    options: CrdtConnectionOptions,
): CrdtConnection {
    const roomId = normalizeRoomId(options.roomId)
    const wsUrl = resolveCollabWebSocketUrl(options.wsUrl)

    const doc = new Y.Doc()
    const sharedText = doc.getText(DIAGRAM_XML_FIELD)

    const wsProvider = new WebsocketProvider(wsUrl, roomId, doc)

    const shouldEnableIndexedDb =
        options.enableIndexedDb !== false &&
        typeof window !== "undefined" &&
        typeof window.indexedDB !== "undefined"

    const indexeddbProvider = shouldEnableIndexedDb
        ? new IndexeddbPersistence(`canvas-a-i-o:${roomId}`, doc)
        : undefined

    return {
        doc,
        sharedText,
        wsProvider,
        indexeddbProvider,
        roomId,
        destroy: () => {
            indexeddbProvider?.destroy()
            wsProvider.destroy()
            doc.destroy()
        },
    }
}
