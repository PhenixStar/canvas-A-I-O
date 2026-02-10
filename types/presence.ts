/**
 * Type definitions for user presence tracking in collaborative sessions.
 */

import type { AppRole } from "@/lib/permissions"

/**
 * Cursor position on the canvas.
 */
export interface CursorPosition {
    x: number
    y: number
}

/**
 * Selection state for diagram elements.
 * Array of selected element IDs.
 */
export type SelectionState = string[]

/**
 * User information in presence state.
 */
export interface UserInfo {
    id: string
    name: string
    role: AppRole
}

/**
 * Complete presence state for a user in a collaborative session.
 * Includes user info, cursor position, selection, and assigned color.
 */
export interface UserPresence {
    user: UserInfo
    cursor: CursorPosition | null
    selection: SelectionState | null
    color: string
}

/**
 * Connection status for presence tracking.
 */
export type PresenceStatus = "connecting" | "connected" | "disconnected"

/**
 * Raw awareness state from Yjs (internal format).
 * Matches the structure stored in Yjs awareness.
 */
export interface AwarenessState {
    user?: UserInfo
    cursor?: CursorPosition | null
    selection?: SelectionState | null
    color?: string
}
