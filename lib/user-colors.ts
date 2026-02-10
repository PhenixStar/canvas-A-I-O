/**
 * User color utilities for collaborative presence tracking.
 * Provides consistent color assignment based on user IDs.
 */

/**
 * Predefined color palette with high contrast, accessible colors.
 * Colors are chosen to work well on both light and dark backgrounds.
 */
export const USER_COLORS = [
    "#ef4444", // red-500
    "#f97316", // orange-500
    "#eab308", // yellow-500
    "#22c55e", // green-500
    "#06b6d4", // cyan-500
    "#3b82f6", // blue-500
    "#8b5cf6", // violet-500
    "#d946ef", // fuchsia-500
    "#f43f5e", // rose-500
    "#14b8a6", // teal-500
] as const

/**
 * Generate consistent color from user ID using hash function.
 * Ensures same user always gets same color across sessions.
 *
 * @param userId - The user's unique identifier
 * @returns Hex color code from predefined palette
 *
 * @example
 * ```ts
 * const color = getUserColor('user-123')
 * // Returns a consistent color based on hash of 'user-123'
 * ```
 */
export function getUserColor(userId: string): string {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash)
    }

    return USER_COLORS[Math.abs(hash) % USER_COLORS.length]
}

/**
 * Get contrasting text color (black/white) based on background color.
 * Calculates luminance to determine best text color for readability.
 *
 * @param hexColor - Hex color code (e.g., '#3b82f6')
 * @returns '#000000' for light backgrounds, '#ffffff' for dark backgrounds
 *
 * @example
 * ```ts
 * const textColor = getContrastColor('#3b82f6')
 * // Returns '#ffffff' (white text on blue background)
 * ```
 */
export function getContrastColor(hexColor: string): string {
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    return luminance > 0.5 ? "#000000" : "#ffffff"
}

/**
 * Extract initials from user name for avatar display.
 *
 * @param name - User's full name
 * @param maxLength - Maximum number of initials to extract (default: 2)
 * @returns Uppercase initials
 *
 * @example
 * ```ts
 * getUserInitials('John Doe') // Returns 'JD'
 * getUserInitials('Alice') // Returns 'A'
 * getUserInitials('A Very Long Name') // Returns 'AV'
 * ```
 */
export function getUserInitials(name: string, maxLength = 2): string {
    if (!name) return "?"

    const parts = name.trim().split(/\s+/)
    const initials = parts.map((part) => part[0]?.toUpperCase()).filter(Boolean)

    if (initials.length === 0) return "?"
    if (initials.length === 1) return initials[0]

    return initials.slice(0, maxLength).join("")
}
