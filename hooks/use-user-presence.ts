/**
 * React hook for tracking user presence in collaborative sessions.
 * Uses Yjs awareness API to provide real-time presence data.
 */

"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { getUserColor } from "@/lib/user-colors"
import type {
    CursorPosition,
    PresenceStatus,
    SelectionState,
    UserInfo,
    UserPresence,
} from "@/types/presence"

/**
 * Awareness instance type from y-protocols.
 */
export type AwarenessInstance = InstanceType<
    typeof import("y-protocols/awareness").Awareness
>

/**
 * Options for the useUserPresence hook.
 */
export interface UseUserPresenceOptions {
    /** Enable or disable presence tracking */
    enabled: boolean
    /** Yjs awareness instance from WebsocketProvider */
    awareness: AwarenessInstance | null
}

/**
 * Return value for the useUserPresence hook.
 */
export interface UseUserPresenceReturn {
    /** Current user's presence state */
    localUser: UserPresence | null
    /** Map of remote users (clientID -> presence) */
    remoteUsers: Map<number, UserPresence>
    /** Combined list of all users for UI display */
    allUsers: UserPresence[]
    /** Connection status */
    status: PresenceStatus
    /** Update local user's cursor position (throttled to 100ms) */
    updateCursor: (x: number, y: number) => void
    /** Update local user's element selection */
    updateSelection: (selectedIds: string[]) => void
    /** Set local user's assigned color */
    setLocalColor: (color: string) => void
}

/**
 * React hook for tracking user presence in collaborative sessions.
 *
 * @example
 * ```tsx
 * function DiagramEditor() {
 *   const { awareness } = useCrdtDiagram({ enabled: true, roomId: 'room-123' })
 *   const { allUsers, updateCursor, status } = useUserPresence({
 *     enabled: true,
 *     awareness,
 *   })
 *
 *   return (
 *     <div onMouseMove={(e) => updateCursor(e.clientX, e.clientY)}>
 *       {status === 'connected' && <UserAvatars users={allUsers} />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useUserPresence({
    enabled,
    awareness,
}: UseUserPresenceOptions): UseUserPresenceReturn {
    const { data: session } = useSession()
    const [remoteUsers, setRemoteUsers] = useState<Map<number, UserPresence>>(
        new Map(),
    )
    const [status, setStatus] = useState<PresenceStatus>("connecting")

    // Throttle cursor updates to avoid WebSocket spam
    const cursorUpdateRef = useRef<CursorPosition | null>(null)
    const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Build local user presence state from session
    const localUser = useMemo<UserPresence | null>(() => {
        if (!session?.user) {
            return null
        }

        return {
            user: {
                id: session.user.id,
                name: session.user.name || "Anonymous",
                role:
                    (session.user.role as UserPresence["user"]["role"]) ||
                    "editor",
            },
            cursor: null,
            selection: null,
            color: getUserColor(session.user.id),
        }
    }, [session])

    // Initialize local user state in awareness on mount
    useEffect(() => {
        if (!enabled || !awareness || !localUser) {
            return
        }

        awareness.setLocalStateField("user", localUser.user)
        awareness.setLocalStateField("color", localUser.color)
    }, [enabled, awareness, localUser])

    // Subscribe to awareness changes for remote users
    useEffect(() => {
        if (!enabled || !awareness) {
            setStatus("disconnected")
            setRemoteUsers(new Map())
            return
        }

        setStatus("connected")

        const handleAwarenessChange = () => {
            const states = awareness.getStates()

            const remote = new Map<number, UserPresence>()

            states.forEach(
                (state: Record<string, unknown>, clientID: number) => {
                    // Skip local user
                    if (clientID === awareness.clientID) {
                        return
                    }

                    // Only include users with complete state
                    if (state.user && state.color) {
                        remote.set(clientID, {
                            user: state.user as UserInfo,
                            cursor:
                                (state.cursor as CursorPosition | null) || null,
                            selection:
                                (state.selection as SelectionState | null) ||
                                null,
                            color: state.color as string,
                        })
                    }
                },
            )

            setRemoteUsers(remote)
        }

        // Initial sync
        handleAwarenessChange()

        // Listen for changes
        awareness.on("change", handleAwarenessChange)

        return () => {
            awareness.off("change", handleAwarenessChange)
        }
    }, [enabled, awareness])

    // Throttled cursor update (100ms = 10 updates/second max)
    const updateCursor = useCallback(
        (x: number, y: number) => {
            if (!awareness) {
                return
            }

            cursorUpdateRef.current = { x, y }

            if (throttleTimeoutRef.current) {
                return
            }

            throttleTimeoutRef.current = setTimeout(() => {
                if (cursorUpdateRef.current && awareness) {
                    awareness.setLocalStateField(
                        "cursor",
                        cursorUpdateRef.current,
                    )
                    cursorUpdateRef.current = null
                }
                throttleTimeoutRef.current = null
            }, 100)
        },
        [awareness],
    )

    // Update selection (not throttled - less frequent operation)
    const updateSelection = useCallback(
        (selectedIds: string[]) => {
            if (!awareness) {
                return
            }
            awareness.setLocalStateField("selection", selectedIds)
        },
        [awareness],
    )

    // Update local color (for user customization)
    const setLocalColor = useCallback(
        (color: string) => {
            if (!awareness) {
                return
            }
            awareness.setLocalStateField("color", color)
        },
        [awareness],
    )

    // Combine all users for UI display
    const allUsers = useMemo<UserPresence[]>(() => {
        const users: UserPresence[] = []
        if (localUser) {
            users.push(localUser)
        }
        users.push(...Array.from(remoteUsers.values()))
        return users
    }, [localUser, remoteUsers])

    // Cleanup throttle timeout on unmount
    useEffect(() => {
        return () => {
            if (throttleTimeoutRef.current) {
                clearTimeout(throttleTimeoutRef.current)
            }
        }
    }, [])

    return {
        localUser,
        remoteUsers,
        allUsers,
        status,
        updateCursor,
        updateSelection,
        setLocalColor,
    }
}
