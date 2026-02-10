/**
 * User avatar component for collaborative presence display.
 * Shows user initials with color-coded background and role badge.
 */

"use client"

import { Crown, Pencil, Shield } from "lucide-react"
import { memo, useMemo } from "react"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { getContrastColor, getUserInitials } from "@/lib/user-colors"
import type { UserInfo } from "@/types/presence"

export interface UserAvatarProps {
    /** User information */
    user: UserInfo
    /** Background color for avatar (defaults to user color hash) */
    color?: string
    /** Size variant */
    size?: "sm" | "md" | "lg"
    /** Show role badge icon */
    showRole?: boolean
    /** Highlight as local user */
    isLocalUser?: boolean
    /** Show online status indicator */
    showStatus?: boolean
    /** Callback when avatar is clicked */
    onClick?: () => void
    /** Whether this user is currently being followed */
    isFollowing?: boolean
}

const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
} as const

const roleIcons = {
    owner: Crown,
    admin: Shield,
    editor: Pencil,
    viewer: null,
} as const

/**
 * User avatar component showing initials with color-coded background.
 * Includes tooltip with full user info and optional role badge.
 *
 * @example
 * ```tsx
 * <UserAvatar
 *   user={{ id: '1', name: 'John Doe', role: 'admin' }}
 *   color="#3b82f6"
 *   size="md"
 *   isLocalUser={false}
 * />
 * ```
 */
export const UserAvatar = memo<UserAvatarProps>(
    ({
        user,
        color,
        size = "md",
        showRole = true,
        isLocalUser = false,
        showStatus = true,
        onClick,
        isFollowing = false,
    }) => {
        const RoleIcon = roleIcons[user.role]

        // Extract initials (max 2 characters)
        const initials = useMemo(
            () => getUserInitials(user.name, 2),
            [user.name],
        )

        // Calculate contrasting text color
        const textColor = useMemo(
            () => getContrastColor(color || getUserColor(user.id)),
            [color, user.id],
        )

        const sizeClass = sizeClasses[size]

        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        onClick={onClick}
                        className={`
              relative rounded-full font-semibold flex items-center justify-center
              ${sizeClass}
              ${isLocalUser ? "ring-2 ring-offset-2 ring-primary" : ""}
              ${isFollowing ? "ring-2 ring-offset-2 ring-blue-500" : ""}
              ${onClick ? "cursor-pointer" : "cursor-default"}
              transition-all hover:scale-110 select-none border-0 p-0
            `}
                        style={{
                            backgroundColor: color || getUserColor(user.id),
                            color: textColor,
                        }}
                        aria-label={`${user.name} (${user.role})`}
                    >
                        {initials}

                        {/* Online Status Indicator */}
                        {showStatus && (
                            <span
                                className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"
                                aria-hidden="true"
                            />
                        )}
                    </button>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                    <div className="flex items-center gap-2">
                        {showRole && RoleIcon && (
                            <RoleIcon className="w-4 h-4" aria-hidden="true" />
                        )}
                        <div>
                            <p className="font-medium">
                                {user.name}
                                {isLocalUser && (
                                    <span className="ml-1 text-muted-foreground">
                                        (You)
                                    </span>
                                )}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                                {user.role}
                            </p>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        )
    },
)

UserAvatar.displayName = "UserAvatar"

/**
 * Generate consistent color from user ID.
 * Re-implementation from lib/user-colors for component usage.
 */
function getUserColor(userId: string): string {
    const USER_COLORS = [
        "#ef4444",
        "#f97316",
        "#eab308",
        "#22c55e",
        "#06b6d4",
        "#3b82f6",
        "#8b5cf6",
        "#d946ef",
        "#f43f5e",
        "#14b8a6",
    ] as const

    let hash = 0
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash)
    }

    return USER_COLORS[Math.abs(hash) % USER_COLORS.length]
}
