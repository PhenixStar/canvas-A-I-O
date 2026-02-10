/**
 * React hook for tracking diagram container bounds and position.
 * Provides accurate container dimensions for cursor positioning.
 */

"use client"

import { useEffect, useRef, useState } from "react"

export interface ContainerBounds {
    width: number
    height: number
    left: number
    top: number
    right: number
    bottom: number
}

export interface UseDiagramContainerReturn {
    containerRef: React.RefObject<HTMLDivElement | null>
    bounds: ContainerBounds | null
    isReady: boolean
}

/**
 * React hook for tracking diagram container bounds and position.
 *
 * Features:
 * - Tracks container dimensions and position
 * - Monitors resize events for accurate positioning
 * - Provides ref for cursor positioning
 * - Returns container dimensions and position
 *
 * @example
 * ```tsx
 * function DiagramEditor() {
 *   const { containerRef, bounds } = useDiagramContainer()
 *
 *   return (
 *     <div ref={containerRef} className="relative">
 *       {bounds && <div>Container: {bounds.width}x{bounds.height}</div>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useDiagramContainer(): UseDiagramContainerReturn {
    const containerRef = useRef<HTMLDivElement>(null)
    const [bounds, setBounds] = useState<ContainerBounds | null>(null)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        const container = containerRef.current
        if (!container) {
            return
        }

        const updateBounds = () => {
            const rect = container.getBoundingClientRect()
            const newBounds: ContainerBounds = {
                width: rect.width,
                height: rect.height,
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
            }
            setBounds(newBounds)
            setIsReady(true)
        }

        // Initial measurement
        updateBounds()

        // Update on resize using ResizeObserver for accurate tracking
        const resizeObserver = new ResizeObserver(() => {
            updateBounds()
        })

        resizeObserver.observe(container)

        // Update on window scroll and resize (capture phase for nested scroll)
        window.addEventListener("scroll", updateBounds, true)
        window.addEventListener("resize", updateBounds)

        return () => {
            resizeObserver.disconnect()
            window.removeEventListener("scroll", updateBounds, true)
            window.removeEventListener("resize", updateBounds)
        }
    }, [])

    return {
        containerRef,
        bounds,
        isReady,
    }
}
