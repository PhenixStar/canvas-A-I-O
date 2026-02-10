/**
 * Individual cursor component for collaborative editing.
 * Renders a colored cursor arrow with user name label.
 */

"use client"

import { motion } from "motion/react"
import { memo } from "react"
import type { UserPresence } from "@/types/presence"

export interface CollaborativeCursorProps {
    /** User presence data containing cursor position and user info */
    user: UserPresence
    /** Whether the cursor should be visible */
    isVisible: boolean
}

/**
 * Collaborative cursor showing remote user's mouse position.
 * Features:
 * - SVG arrow pointer in user's assigned color
 * - User name badge with contrasting text
 * - Smooth motion animations for position changes
 * - Fade in/out on user presence changes
 *
 * @example
 * ```tsx
 * <CollaborativeCursor
 *   user={userPresence}
 *   isVisible={!!userPresence.cursor}
 * />
 * ```
 */
export const CollaborativeCursor = memo<CollaborativeCursorProps>(
    ({ user, isVisible }) => {
        const { cursor, color } = user

        if (!cursor || !isVisible) {
            return null
        }

        return (
            <motion.div
                className="fixed pointer-events-none z-50"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                    duration: 0.15,
                    ease: "easeOut",
                }}
                style={{
                    left: cursor.x,
                    top: cursor.y,
                    transform: "translate(-50%, -50%)",
                }}
            >
                {/* Cursor Arrow - Standard mouse pointer shape */}
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="drop-shadow-sm"
                    aria-hidden="true"
                >
                    <path
                        d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L5.94 2.87a.5.5 0 0 0-.44.34Z"
                        fill={color}
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                    />
                </svg>

                {/* User Name Badge */}
                <div
                    className="absolute left-6 top-4 px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap shadow-sm"
                    style={{
                        backgroundColor: color,
                        color: "white",
                    }}
                >
                    {user.user.name}
                </div>
            </motion.div>
        )
    },
)

CollaborativeCursor.displayName = "CollaborativeCursor"
