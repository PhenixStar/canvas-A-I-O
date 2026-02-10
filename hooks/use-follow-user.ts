/**
 * React hook for "Follow User" feature in collaborative sessions.
 * Automatically scrolls viewport to keep followed user's cursor in view.
 */

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { UserPresence } from "@/types/presence"

/**
 * Options for the useFollowUser hook.
 */
export interface UseFollowUserOptions {
    /** Currently followed user ID (null = not following) */
    followedUserId: string | null
    /** Map of remote users (clientID -> presence) */
    remoteUsers: Map<number, UserPresence>
    /** Reference to diagram container for scroll control */
    diagramContainerRef: React.RefObject<HTMLElement | HTMLDivElement | null>
    /** Callback when auto-unfollow is triggered */
    onUnfollow?: () => void
}

/**
 * Return value for the useFollowUser hook.
 */
export interface UseFollowUserReturn {
    /** Whether currently following a user */
    isFollowing: boolean
    /** Currently followed user's presence data */
    followedUser: UserPresence | null
    /** Manually trigger unfollow (e.g., from button click) */
    manualUnfollow: () => void
    /** Stop following due to local user interaction */
    stopFollowingOnInteraction: () => void
}

/**
 * Scroll throttle delay in milliseconds.
 * Prevents excessive scroll updates that could cause motion sickness.
 */
const SCROLL_THROTTLE_MS = 200

/**
 * Scroll delta threshold for detecting manual user scroll.
 * Prevents false positives from auto-scroll smoothing.
 */
const MANUAL_SCROLL_THRESHOLD = 50

/**
 * Padding around cursor position when scrolling (in pixels).
 * Ensures cursor isn't at exact edge of viewport.
 * (Reserved for future use with cursor padding in scroll calculations)
 */
const _CURSOR_PADDING = 100

/**
 * React hook for "Follow User" functionality.
 * Automatically scrolls diagram to keep followed user's cursor in view.
 *
 * Features:
 * - Smooth scroll animation to center cursor
 * - Throttled scroll updates (200ms)
 * - Auto-unfollow on manual scroll/interaction
 * - Auto-unfollow when followed user leaves
 *
 * @example
 * ```tsx
 * function DiagramEditor() {
 *   const [followedUserId, setFollowedUserId] = useState<string | null>(null)
 *   const diagramContainerRef = useRef<HTMLDivElement>(null)
 *
 *   const { isFollowing, followedUser, manualUnfollow } = useFollowUser({
 *     followedUserId,
 *     remoteUsers,
 *     diagramContainerRef,
 *     onUnfollow: () => setFollowedUserId(null),
 *   })
 *
 *   return (
 *     <div ref={diagramContainerRef}>
 *       {isFollowing && <FollowingIndicator user={followedUser} />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useFollowUser({
    followedUserId,
    remoteUsers,
    diagramContainerRef,
    onUnfollow,
}: UseFollowUserOptions): UseFollowUserReturn {
    const [isFollowing, setIsFollowing] = useState(false)
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastScrollPositionRef = useRef<{ top: number; left: number } | null>(
        null,
    )
    const isAutoScrollingRef = useRef(false)

    // Find followed user data from remote users map
    const followedUser = followedUserId
        ? Array.from(remoteUsers.values()).find(
              (u) => u.user.id === followedUserId,
          ) || null
        : null

    // Update following state based on user data
    useEffect(() => {
        setIsFollowing(!!followedUserId && !!followedUser)
    }, [followedUserId, followedUser])

    // Auto-unfollow when followed user leaves the room
    useEffect(() => {
        if (followedUserId && !followedUser) {
            onUnfollow?.()
        }
    }, [followedUserId, followedUser, onUnfollow])

    // Auto-scroll to followed user's cursor position
    useEffect(() => {
        if (
            !followedUser ||
            !followedUser.cursor ||
            !diagramContainerRef.current
        ) {
            return
        }

        const container = diagramContainerRef.current
        const { x, y } = followedUser.cursor

        // Throttle scroll updates to avoid excessive reflows
        if (scrollTimeoutRef.current) {
            return
        }

        scrollTimeoutRef.current = setTimeout(() => {
            if (!container || !followedUser.cursor) {
                scrollTimeoutRef.current = null
                return
            }

            // Get current container dimensions
            const containerRect = container.getBoundingClientRect()

            // Calculate scroll position to center cursor with padding
            const targetScrollLeft = x - containerRect.width / 2
            const targetScrollTop = y - containerRect.height / 2

            // Mark as auto-scrolling to prevent manual scroll detection
            isAutoScrollingRef.current = true

            // Smooth scroll to cursor position
            container.scrollTo({
                left: Math.max(0, targetScrollLeft),
                top: Math.max(0, targetScrollTop),
                behavior: "smooth",
            })

            // Clear auto-scroll flag after animation completes
            setTimeout(() => {
                isAutoScrollingRef.current = false
                // Update last known scroll position after auto-scroll
                lastScrollPositionRef.current = {
                    top: container.scrollTop,
                    left: container.scrollLeft,
                }
            }, 500)

            scrollTimeoutRef.current = null
        }, SCROLL_THROTTLE_MS)

        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current)
                scrollTimeoutRef.current = null
            }
        }
    }, [followedUser, followedUserId, diagramContainerRef])

    // Detect manual scroll/zoom → auto-unfollow
    useEffect(() => {
        if (!isFollowing || !diagramContainerRef.current) {
            return
        }

        const container = diagramContainerRef.current

        // Initialize last scroll position
        lastScrollPositionRef.current = {
            top: container.scrollTop,
            left: container.scrollLeft,
        }

        const handleScroll = () => {
            // Ignore scroll events during auto-scroll animation
            if (isAutoScrollingRef.current) {
                return
            }

            const scrollTop = container.scrollTop
            const scrollLeft = container.scrollLeft

            // Check if we have a previous position to compare
            if (!lastScrollPositionRef.current) {
                lastScrollPositionRef.current = {
                    top: scrollTop,
                    left: scrollLeft,
                }
                return
            }

            // Calculate scroll delta
            const scrollDelta =
                Math.abs(scrollTop - lastScrollPositionRef.current.top) +
                Math.abs(scrollLeft - lastScrollPositionRef.current.left)

            // Detect significant manual scroll (not from auto-scroll)
            if (scrollDelta > MANUAL_SCROLL_THRESHOLD) {
                onUnfollow?.()
            }

            // Update last known position
            lastScrollPositionRef.current = { top: scrollTop, left: scrollLeft }
        }

        container.addEventListener("scroll", handleScroll, { passive: true })

        return () => {
            container.removeEventListener("scroll", handleScroll)
            lastScrollPositionRef.current = null
        }
    }, [isFollowing, diagramContainerRef, onUnfollow])

    // Manual unfollow action (from button click)
    const manualUnfollow = useCallback(() => {
        onUnfollow?.()
    }, [onUnfollow])

    // Stop following due to local user interaction (e.g., mouse move)
    const stopFollowingOnInteraction = useCallback(() => {
        if (isFollowing) {
            onUnfollow?.()
        }
    }, [isFollowing, onUnfollow])

    return {
        isFollowing,
        followedUser,
        manualUnfollow,
        stopFollowingOnInteraction,
    }
}
