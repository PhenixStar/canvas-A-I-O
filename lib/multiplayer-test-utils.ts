/**
 * Testing utilities for multiplayer features.
 * Provides mock users and presence simulation for local testing.
 */

import { getUserColor } from "@/lib/user-colors"
import type { CursorPosition, UserPresence } from "@/types/presence"

/**
 * Create a mock user for testing.
 */
export function createMockUser(
    id: string,
    name: string,
    role: UserPresence["user"]["role"] = "editor",
    cursor: CursorPosition | null = null,
): UserPresence {
    return {
        user: {
            id,
            name,
            role,
        },
        cursor,
        selection: null,
        color: getUserColor(id),
    }
}

/**
 * Generate multiple mock users for testing.
 */
export function generateMockUsers(count: number): UserPresence[] {
    const roles: Array<UserPresence["user"]["role"]> = [
        "admin",
        "editor",
        "viewer",
    ]
    const users: UserPresence[] = []

    for (let i = 0; i < count; i++) {
        users.push(
            createMockUser(
                `mock-user-${i + 1}`,
                `Test User ${i + 1}`,
                roles[i % roles.length],
                null,
            ),
        )
    }

    return users
}

/**
 * Create a mock remote users map for testing cursor rendering.
 */
export function createMockRemoteUsersMap(): Map<number, UserPresence> {
    const map = new Map<number, UserPresence>()

    // Add 3 mock users with cursor positions
    map.set(1, {
        user: { id: "user-1", name: "Alice", role: "admin" },
        cursor: { x: 100, y: 150 },
        selection: null,
        color: getUserColor("user-1"),
    })

    map.set(2, {
        user: { id: "user-2", name: "Bob", role: "editor" },
        cursor: { x: 300, y: 250 },
        selection: null,
        color: getUserColor("user-2"),
    })

    map.set(3, {
        user: { id: "user-3", name: "Charlie", role: "viewer" },
        cursor: { x: 500, y: 350 },
        selection: null,
        color: getUserColor("user-3"),
    })

    return map
}

/**
 * Simulate cursor movement for testing.
 * Returns a new position that moves towards a target.
 */
export function simulateCursorMovement(
    current: CursorPosition,
    target: CursorPosition,
    speed: number = 5,
): CursorPosition {
    const dx = target.x - current.x
    const dy = target.y - current.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < speed) {
        return target
    }

    return {
        x: current.x + (dx / distance) * speed,
        y: current.y + (dy / distance) * speed,
    }
}

/**
 * Simulate a user joining/leaving for testing presence list updates.
 */
export function simulateUserPresenceChange(
    currentUsers: Map<number, UserPresence>,
    action: "join" | "leave",
    userId?: number,
): Map<number, UserPresence> {
    const newMap = new Map(currentUsers)

    if (action === "join") {
        const id = userId ?? Math.max(...Array.from(newMap.keys()), 0) + 1
        const mockUser = createMockUser(
            `user-${id}`,
            `New User ${id}`,
            "editor",
            { x: Math.random() * 800, y: Math.random() * 600 },
        )
        newMap.set(id, mockUser)
    } else if (action === "leave" && userId) {
        newMap.delete(userId)
    } else if (action === "leave" && newMap.size > 0) {
        // Remove last user if no specific ID provided
        const keysArray = Array.from(newMap.keys())
        const lastKey = keysArray[keysArray.length - 1]
        if (lastKey !== undefined) {
            newMap.delete(lastKey)
        }
    }

    return newMap
}

/**
 * Create a mock awareness state for testing.
 * Useful when you don't have a real WebSocket server.
 */
export function createMockAwarenessState() {
    return {
        localUser: createMockUser("local-user", "You", "admin"),
        remoteUsers: createMockRemoteUsersMap(),
        allUsers: [
            createMockUser("local-user", "You", "admin"),
            ...Array.from(createMockRemoteUsersMap().values()),
        ],
    }
}

/**
 * Helper to log presence state for debugging.
 */
export function logPresenceState(users: Map<number, UserPresence>) {
    console.table(
        Array.from(users.entries()).map(([id, user]) => ({
            ID: id,
            Name: user.user.name,
            Role: user.user.role,
            Cursor: user.cursor
                ? `(${Math.round(user.cursor.x)}, ${Math.round(user.cursor.y)})`
                : "null",
            Color: user.color,
        })),
    )
}
