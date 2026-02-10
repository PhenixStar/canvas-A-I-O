/**
 * Coordinate mapping utilities for collaborative cursor positioning.
 * Handles transformation between diagram and screen coordinate systems.
 */

/**
 * Point in 2D space.
 */
export interface Point {
    x: number
    y: number
}

/**
 * Options for coordinate transformation.
 */
export interface CoordinateMappingOptions {
    /** Container element bounds */
    containerBounds: DOMRect
    /** Current scroll offset */
    scrollOffset?: Point
    /** Current zoom level (1 = 100%) */
    zoom?: number
}

/**
 * Convert diagram-relative coordinates to screen coordinates.
 *
 * Diagram coordinates have (0,0) at the top-left of the diagram canvas.
 * Screen coordinates have (0,0) at the top-left of the viewport.
 *
 * @param diagramX - X position in diagram coordinate space
 * @param diagramY - Y position in diagram coordinate space
 * @param options - Mapping options including container bounds
 * @returns Screen-relative position
 *
 * @example
 * ```ts
 * const bounds = containerRef.current.getBoundingClientRect()
 * const screenPos = diagramToScreen(100, 200, { containerBounds: bounds })
 * // Returns: { x: bounds.left + 100, y: bounds.top + 200 }
 * ```
 */
export function diagramToScreen(
    diagramX: number,
    diagramY: number,
    options: CoordinateMappingOptions,
): Point {
    const { containerBounds, scrollOffset = { x: 0, y: 0 }, zoom = 1 } = options

    return {
        x: containerBounds.left + diagramX * zoom - scrollOffset.x,
        y: containerBounds.top + diagramY * zoom - scrollOffset.y,
    }
}

/**
 * Convert screen coordinates to diagram-relative coordinates.
 *
 * Useful for handling mouse events and converting them to diagram positions.
 *
 * @param screenX - X position in screen coordinate space
 * @param screenY - Y position in screen coordinate space
 * @param options - Mapping options including container bounds
 * @returns Diagram-relative position
 *
 * @example
 * ```ts
 * const bounds = containerRef.current.getBoundingClientRect()
 * const diagramPos = screenToDiagram(
 *   event.clientX,
 *   event.clientY,
 *   { containerBounds: bounds }
 * )
 * ```
 */
export function screenToDiagram(
    screenX: number,
    screenY: number,
    options: CoordinateMappingOptions,
): Point {
    const { containerBounds, scrollOffset = { x: 0, y: 0 }, zoom = 1 } = options

    return {
        x: (screenX - containerBounds.left + scrollOffset.x) / zoom,
        y: (screenY - containerBounds.top + scrollOffset.y) / zoom,
    }
}

/**
 * Get current container bounds with error handling.
 *
 * @param containerRef - React ref to container element
 * @returns Container bounds or null if element not found
 *
 * @example
 * ```ts
 * const bounds = getContainerBounds(containerRef)
 * if (bounds) {
 *   const pos = diagramToScreen(x, y, { containerBounds: bounds })
 * }
 * ```
 */
export function getContainerBounds(
    containerRef: React.RefObject<HTMLElement>,
): DOMRect | null {
    if (!containerRef.current) {
        return null
    }

    try {
        return containerRef.current.getBoundingClientRect()
    } catch (error) {
        // Handle case where element has been removed from DOM
        console.warn("Failed to get container bounds:", error)
        return null
    }
}

/**
 * Calculate scroll offset from a scrollable container.
 *
 * @param scrollContainer - The scrollable container element
 * @returns Current scroll offset
 *
 * @example
 * ```ts
 * const scrollOffset = getScrollOffset(scrollableDiv)
 * const pos = diagramToScreen(x, y, {
 *   containerBounds: bounds,
 *   scrollOffset,
 * })
 * ```
 */
export function getScrollOffset(scrollContainer: HTMLElement): Point {
    return {
        x: scrollContainer.scrollLeft,
        y: scrollContainer.scrollTop,
    }
}

/**
 * Check if a point is within container bounds.
 *
 * @param point - Point to check
 * @param bounds - Container bounds
 * @returns True if point is within bounds
 *
 * @example
 * ```ts
 * const bounds = containerRef.current.getBoundingClientRect()
 * const isInside = isPointInBounds({ x: 100, y: 200 }, bounds)
 * ```
 */
export function isPointInBounds(point: Point, bounds: DOMRect): boolean {
    return (
        point.x >= bounds.left &&
        point.x <= bounds.right &&
        point.y >= bounds.top &&
        point.y <= bounds.bottom
    )
}

/**
 * Scroll container to position with optional padding.
 *
 * @param container - The scrollable container element
 * @param x - Target X position in diagram coordinates
 * @param y - Target Y position in diagram coordinates
 * @param options - Scroll options
 *
 * @example
 * ```ts
 * scrollToPosition(
 *   containerRef.current,
 *   cursorX,
 *   cursorY,
 *   { smooth: true, padding: 100 }
 * )
 * ```
 */
export function scrollToPosition(
    container: HTMLElement,
    x: number,
    y: number,
    options: {
        /** Use smooth scroll animation */
        smooth?: boolean
        /** Padding around target position (px) */
        padding?: number
        /** Current zoom level */
        zoom?: number
    } = {},
): void {
    const { smooth = true, zoom = 1 } = options

    const containerRect = container.getBoundingClientRect()

    // Calculate scroll position to center target
    const targetScrollLeft = x * zoom - containerRect.width / 2
    const targetScrollTop = y * zoom - containerRect.height / 2

    container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        top: Math.max(0, targetScrollTop),
        behavior: smooth ? "smooth" : "instant",
    })
}

/**
 * Get current viewport bounds in diagram coordinates.
 *
 * @param container - The scrollable container element
 * @param scrollOffset - Current scroll offset
 * @param zoom - Current zoom level (default: 1)
 * @returns Viewport bounds in diagram coordinates
 *
 * @example
 * ```ts
 * const bounds = getViewportBounds(container, { x: 0, y: 0 }, 1)
 * console.log(`Visible area: ${bounds.width}x${bounds.height}`)
 * ```
 */
export function getViewportBounds(
    container: HTMLElement,
    scrollOffset: Point,
    zoom = 1,
): {
    left: number
    top: number
    right: number
    bottom: number
    width: number
    height: number
} {
    const rect = container.getBoundingClientRect()

    return {
        left: scrollOffset.x / zoom,
        top: scrollOffset.y / zoom,
        right: (scrollOffset.x + rect.width) / zoom,
        bottom: (scrollOffset.y + rect.height) / zoom,
        width: rect.width / zoom,
        height: rect.height / zoom,
    }
}

/**
 * Check if a diagram point is currently visible in viewport.
 *
 * @param point - Point in diagram coordinates
 * @param container - The scrollable container element
 * @param scrollOffset - Current scroll offset
 * @param zoom - Current zoom level (default: 1)
 * @returns True if point is visible
 *
 * @example
 * ```ts
 * const isVisible = isPointVisible(
 *   { x: cursorX, y: cursorY },
 *   containerRef.current,
 *   { x: scrollLeft, y: scrollTop }
 * )
 * ```
 */
export function isPointVisible(
    point: Point,
    container: HTMLElement,
    scrollOffset: Point,
    zoom = 1,
): boolean {
    const viewport = getViewportBounds(container, scrollOffset, zoom)

    return (
        point.x >= viewport.left &&
        point.x <= viewport.right &&
        point.y >= viewport.top &&
        point.y <= viewport.bottom
    )
}
