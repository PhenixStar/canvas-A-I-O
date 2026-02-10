/**
 * Presence list component showing all active users in a collaborative session.
 * Displays user avatars, names, roles, and online status in a scrollable panel.
 */

"use client"

import { ChevronDown, Users } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { memo, useMemo, useState } from "react"
import { FollowButton } from "@/components/follow-button"
import { UserAvatar } from "@/components/user-avatar"
import type { UserPresence } from "@/types/presence"

export interface PresenceListProps {
    /** Array of user presence data */
    users: UserPresence[]
    /** ID of the local user (will be highlighted) */
    localUserId: string | null
    /** Position of the presence list */
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
    /** Whether the panel is collapsible */
    collapsible?: boolean
    /** Additional CSS classes */
    className?: string
    /** Currently followed user ID */
    followedUserId?: string | null
    /** Callback to follow a user */
    onFollowUser?: (userId: string) => void
    /** Callback to unfollow current user */
    onUnfollowUser?: () => void
}

const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
} as const

/**
 * Presence list showing all active users in the collaborative session.
 * Displays avatars, names, roles, and online status with collapsible panel.
 *
 * @example
 * ```tsx
 * <PresenceList
 *   users={userPresences}
 *   localUserId="user-123"
 *   position="top-right"
 *   collapsible
 * />
 * ```
 */
export const PresenceList = memo<PresenceListProps>(
    ({
        users,
        localUserId,
        position = "top-right",
        collapsible = true,
        className = "",
        followedUserId = null,
        onFollowUser,
        onUnfollowUser,
    }) => {
        const [isExpanded, setIsExpanded] = useState(true)

        // Sort: local user first, then by name
        const sortedUsers = useMemo(() => {
            return [...users].sort((a, b) => {
                if (a.user.id === localUserId) return -1
                if (b.user.id === localUserId) return 1
                return a.user.name.localeCompare(b.user.name)
            })
        }, [users, localUserId])

        if (users.length === 0) {
            return null
        }

        const positionClass = positionClasses[position]

        return (
            <div
                className={`
          absolute z-40 w-72 bg-background/95 backdrop-blur-sm
          border border-border rounded-lg shadow-lg overflow-hidden
          ${positionClass}
          ${className}
        `}
            >
                {/* Header */}
                <button
                    onClick={() => collapsible && setIsExpanded(!isExpanded)}
                    className={`
            w-full flex items-center justify-between gap-2 px-3 py-2.5
            border-b border-border bg-muted/50 hover:bg-muted/70
            transition-colors cursor-pointer select-none
          `}
                    aria-label={
                        isExpanded
                            ? "Collapse presence list"
                            : "Expand presence list"
                    }
                >
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                            Active Users ({users.length})
                        </span>
                    </div>
                    {collapsible && (
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </motion.div>
                    )}
                </button>

                {/* User List */}
                <AnimatePresence initial={false}>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                                {sortedUsers.map((userPresence) => {
                                    const isLocalUser =
                                        userPresence.user.id === localUserId

                                    return (
                                        <motion.div
                                            key={userPresence.user.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            transition={{ duration: 0.15 }}
                                            className={`
                        flex items-center gap-3 px-2 py-2 rounded-md
                        ${isLocalUser ? "bg-accent/50" : "hover:bg-muted/50"}
                        transition-colors cursor-default
                      `}
                                        >
                                            <UserAvatar
                                                user={userPresence.user}
                                                color={userPresence.color}
                                                size="sm"
                                                showRole={false}
                                                isLocalUser={isLocalUser}
                                                showStatus={false}
                                            />

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {userPresence.user.name}
                                                    {isLocalUser && (
                                                        <span className="ml-1 text-xs text-muted-foreground">
                                                            (You)
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {userPresence.user.role}
                                                </p>
                                            </div>

                                            {/* Follow Button (only for remote users) */}
                                            {!isLocalUser &&
                                                onFollowUser &&
                                                onUnfollowUser && (
                                                    <FollowButton
                                                        user={userPresence}
                                                        isFollowing={
                                                            followedUserId ===
                                                            userPresence.user.id
                                                        }
                                                        onFollow={() =>
                                                            onFollowUser(
                                                                userPresence
                                                                    .user.id,
                                                            )
                                                        }
                                                        onUnfollow={
                                                            onUnfollowUser
                                                        }
                                                        disabled={
                                                            !userPresence.cursor
                                                        }
                                                        size="sm"
                                                    />
                                                )}

                                            {/* Online Status Indicator */}
                                            <span
                                                className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"
                                                aria-hidden="true"
                                            />
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )
    },
)

PresenceList.displayName = "PresenceList"
