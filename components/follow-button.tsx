/**
 * Follow button component for user presence tracking.
 * Allows users to follow/unfollow remote users in collaborative sessions.
 */

"use client"

import { Eye, EyeOff } from "lucide-react"
import { memo } from "react"
import { Button } from "@/components/ui/button"
import type { UserPresence } from "@/types/presence"

export interface FollowButtonProps {
    /** User presence data for the target user */
    user: UserPresence
    /** Whether currently following this user */
    isFollowing: boolean
    /** Callback to start following */
    onFollow: () => void
    /** Callback to stop following */
    onUnfollow: () => void
    /** Whether button should be disabled (e.g., user has no cursor) */
    disabled?: boolean
    /** Size variant */
    size?: "sm" | "default"
}

/**
 * Button to follow/unfollow a remote user's cursor.
 * Shows eye icon when not following, eye-off when following.
 *
 * Only appears for remote users (not local user).
 * Disabled when target user has no cursor position yet.
 *
 * @example
 * ```tsx
 * <FollowButton
 *   user={userPresence}
 *   isFollowing={followedUserId === userPresence.user.id}
 *   onFollow={() => setFollowedUserId(userPresence.user.id)}
 *   onUnfollow={() => setFollowedUserId(null)}
 *   disabled={!userPresence.cursor}
 * />
 * ```
 */
export const FollowButton = memo<FollowButtonProps>(
    ({
        user,
        isFollowing,
        onFollow,
        onUnfollow,
        disabled = false,
        size = "sm",
    }) => {
        const handleClick = () => {
            if (disabled) return
            if (isFollowing) {
                onUnfollow()
            } else {
                onFollow()
            }
        }

        const buttonSize =
            size === "sm"
                ? "h-7 px-2 gap-1.5 text-xs"
                : "h-8 px-3 gap-2 text-sm"

        return (
            <Button
                variant={isFollowing ? "default" : "ghost"}
                size={size === "sm" ? "sm" : "default"}
                onClick={handleClick}
                disabled={disabled}
                className={buttonSize}
                aria-label={
                    isFollowing
                        ? `Stop following ${user.user.name}`
                        : `Follow ${user.user.name}`
                }
                aria-pressed={isFollowing}
            >
                {isFollowing ? (
                    <>
                        <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="hidden sm:inline">Unfollow</span>
                    </>
                ) : (
                    <>
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="hidden sm:inline">Follow</span>
                    </>
                )}
            </Button>
        )
    },
)

FollowButton.displayName = "FollowButton"
