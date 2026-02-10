/**
 * Following indicator component for collaborative sessions.
 * Displays banner showing currently followed user with unfollow button.
 */

"use client"

import { X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { memo } from "react"
import { Button } from "@/components/ui/button"

export interface FollowingIndicatorProps {
    /** Name of the user being followed */
    userName: string
    /** Callback to stop following */
    onUnfollow: () => void
    /** Optional message displayed instead of default */
    message?: string
}

/**
 * Banner indicator showing currently followed user.
 * Displays at top of diagram with unfollow button.
 *
 * Uses motion/react for smooth entrance/exit animations.
 *
 * @example
 * ```tsx
 * <FollowingIndicator
 *   userName="John Doe"
 *   onUnfollow={() => setFollowedUserId(null)}
 * />
 * ```
 */
export const FollowingIndicator = memo<FollowingIndicatorProps>(
    ({ userName, onUnfollow, message }) => {
        const defaultMessage = (
            <>
                Following <span className="font-bold">{userName}</span>
            </>
        )

        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="absolute top-16 left-1/2 -translate-x-1/2 z-50"
                >
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-3">
                        <span className="text-sm font-medium">
                            {message || defaultMessage}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onUnfollow}
                            className="h-6 w-6 p-0 hover:bg-primary-foreground/20"
                            aria-label={`Stop following ${userName}`}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </motion.div>
            </AnimatePresence>
        )
    },
)

FollowingIndicator.displayName = "FollowingIndicator"
