/**
 * Container layer for rendering all collaborative cursors.
 * Maps diagram coordinates to screen coordinates and renders cursor overlays.
 */

"use client"

import { AnimatePresence } from "motion/react"
import { useEffect, useState } from "react"
import type { UserPresence } from "@/types/presence"
import { CollaborativeCursor } from "./collaborative-cursor"

export interface CollaborativeCursorLayerProps {
    /** Map of remote users by their client ID */
    remoteUsers: Map<number, UserPresence>
    /** Reference to the diagram container element */
    diagramContainerRef: React.RefObject<HTMLDivElement | null>
}

/**
 * Overlay layer that renders all remote users' cursors.
 *
 * Features:
 * - Maps diagram-relative coordinates to screen coordinates
 * - Tracks container bounds for accurate positioning
 * - Handles scroll and resize events
 * - Provides smooth enter/exit animations
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null)
 * const { remoteUsers } = useUserPresence({ enabled: true, awareness })
 *
 * return (
 *   <div ref={containerRef} className="relative">
 *     <CollaborativeCursorLayer
 *       remoteUsers={remoteUsers}
 *       diagramContainerRef={containerRef}
 *     />
 *     <DiagramCanvas />
 *   </div>
 * )
 * ```
 */
export function CollaborativeCursorLayer({
    remoteUsers,
    diagramContainerRef,
}: CollaborativeCursorLayerProps) {
    const [containerBounds, setContainerBounds] = useState<DOMRect | null>(null)

    // Track container bounds for coordinate mapping
    useEffect(() => {
        const updateBounds = () => {
            if (diagramContainerRef.current) {
                setContainerBounds(
                    diagramContainerRef.current.getBoundingClientRect(),
                )
            }
        }

        updateBounds()

        // Update on resize and scroll to maintain accurate positioning
        const resizeObserver = new ResizeObserver(updateBounds)
        if (diagramContainerRef.current) {
            resizeObserver.observe(diagramContainerRef.current)
        }

        // Listen for window scroll events (capture phase for nested scroll)
        window.addEventListener("scroll", updateBounds, true)
        window.addEventListener("resize", updateBounds)

        return () => {
            resizeObserver.disconnect()
            window.removeEventListener("scroll", updateBounds, true)
            window.removeEventListener("resize", updateBounds)
        }
    }, [diagramContainerRef])

    // Convert diagram-relative coordinates to screen coordinates
    const getScreenPosition = (x: number, y: number) => {
        if (!containerBounds) {
            return { x, y }
        }

        return {
            x: containerBounds.left + x,
            y: containerBounds.top + y,
        }
    }

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <AnimatePresence mode="popLayout">
                {Array.from(remoteUsers.entries()).map(([clientId, user]) => {
                    const screenPos = user.cursor
                        ? getScreenPosition(user.cursor.x, user.cursor.y)
                        : null

                    return (
                        <CollaborativeCursor
                            key={clientId}
                            user={{
                                ...user,
                                cursor: screenPos,
                            }}
                            isVisible={!!user.cursor}
                        />
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
