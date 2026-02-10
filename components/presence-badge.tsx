/**
 * Compact presence badge showing user count with expandable presence list.
 * Displays a small counter badge that expands to show the full presence list on click.
 */

"use client"

import { Users } from "lucide-react"
import { motion } from "motion/react"
import { memo, useMemo, useState } from "react"
import { PresenceList } from "@/components/presence-list"
import type { UserPresence } from "@/types/presence"

export interface PresenceBadgeProps {
    /** Array of user presence data */
    users: UserPresence[]
    /** ID of the local user */
    localUserId: string | null
    /** Position of the badge and presence list */
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
    /** Additional CSS classes */
    className?: string
    /** Currently followed user ID */
    followedUserId?: string | null
    /** Callback to follow a user */
    onFollowUser?: (userId: string) => void
    /** Callback to unfollow current user */
    onUnfollowUser?: () => void
}

/**
 * Compact presence indicator badge showing user count.
 * Click to expand full presence list with pulse animation on count changes.
 *
 * @example
 * ```tsx
 * <PresenceBadge
 *   users={userPresences}
 *   localUserId="user-123"
 *   position="top-right"
 * />
 * ```
 */
export const PresenceBadge = memo<PresenceBadgeProps>(
    ({
        users,
        localUserId,
        position = "top-right",
        className = "",
        followedUserId = null,
        onFollowUser,
        onUnfollowUser,
    }) => {
        const [isExpanded, setIsExpanded] = useState(false)

        // Track previous count for pulse animation
        const prevCountRef = useMemo(() => ({ current: users.length }), [])
        const countChanged = users.length !== prevCountRef.current

        if (countChanged) {
            prevCountRef.current = users.length
        }

        const userCount = users.length

        if (userCount === 0) {
            return null
        }

        return (
            <div className={`relative ${className}`}>
                {/* Presence Badge Button */}
                <motion.button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-full
            bg-primary/10 hover:bg-primary/20 backdrop-blur-sm
            border border-primary/30 transition-colors cursor-pointer
            text-xs font-medium text-foreground
            shadow-sm hover:shadow-md
          `}
                    initial={{ scale: 1 }}
                    animate={
                        countChanged ? { scale: [1, 1.1, 1] } : { scale: 1 }
                    }
                    transition={{ duration: 0.3 }}
                    aria-label={`${userCount} users online. Click to show presence list.`}
                    aria-expanded={isExpanded}
                >
                    <Users className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{userCount}</span>
                </motion.button>

                {/* Expanded Presence List */}
                {isExpanded && (
                    <>
                        {/* Backdrop to close when clicking outside */}
                        <div
                            className="fixed inset-0 z-30"
                            onClick={() => setIsExpanded(false)}
                            aria-hidden="true"
                        />

                        {/* Presence List Panel */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute z-40 mt-2"
                            style={{
                                [position === "top-right" ? "right" : "left"]:
                                    0,
                            }}
                        >
                            <PresenceList
                                users={users}
                                localUserId={localUserId}
                                position={position}
                                collapsible={false}
                                followedUserId={followedUserId}
                                onFollowUser={onFollowUser}
                                onUnfollowUser={onUnfollowUser}
                            />
                        </motion.div>
                    </>
                )}
            </div>
        )
    },
)

PresenceBadge.displayName = "PresenceBadge"
