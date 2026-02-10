# Phase 2: Collaborative Cursor Rendering

**Status:** Pending
**Priority:** High (Core multiplayer UX feature)
**Estimated Time:** 2-3 hours

---

## Context Links

- Parent: [Plan Overview](./plan.md)
- Previous: [Phase 1 - Presence Tracking](./phase-01-presence-tracking.md)
- Related Files:
  - `components/diagram-editor.tsx` - Integration target
  - `hooks/use-user-presence.ts` - Presence data source

---

## Overview

Create a React component that renders visual cursors for remote users in the diagram editor. Cursors should display in real-time as users move their mice, with smooth animations and proper positioning.

### Key Requirements

- Render SVG cursor for each remote user
- Position cursor based on screen coordinates
- Show user name tooltip on hover
- Fade out cursor when user is inactive
- Smooth transition animations between positions
- Don't interfere with diagram interactions

---

## Requirements

### Functional Requirements

1. **Visual Design:**
   - Arrow cursor matching user's assigned color
   - User name badge below cursor
   - Smooth fade-in when user joins
   - Fade-out after inactivity (optional)

2. **Positioning:**
   - Absolute positioning over diagram canvas
   - Coordinates from presence state (x, y)
   - Handle diagram scroll/zoom offset
   - Keep cursor within viewport bounds

3. **Performance:**
   - Use CSS transforms for smooth movement
   - Minimize re-renders (React.memo)
   - Batch updates when multiple users move

### Non-Functional Requirements

- **Accessibility:** High contrast colors, readable tooltips
- **Performance:** 60fps cursor movement
- **Type Safety:** Full TypeScript coverage

---

## Architecture

### Component Hierarchy

```
DiagramEditor (existing)
└── CollaborativeCursorLayer (new container)
    └── CollaborativeCursor (new, rendered per user)
```

### Data Flow

```
useUserPresence.remoteUsers
    ↓
CollaborativeCursorLayer (Map over users)
    ↓
CollaborativeCursor (Individual cursor)
    ↓
SVG + CSS transform (position)
```

### Cursor Visual Design

```
    ┌─────────────┐
    │   ▶ User    │  ← Colored cursor + name badge
    └─────────────┘
       ↑
    Color from user.color
```

---

## Related Code Files

### Files to Create

1. **`components/collaborative-cursor.tsx`** (NEW)
   - Individual cursor component
   - ~80 lines

2. **`components/collaborative-cursor-layer.tsx`** (NEW)
   - Container for all cursors
   - ~60 lines

### Files to Modify

1. **`components/diagram-editor.tsx`** (MODIFY)
   - Add cursor layer as sibling to DrawIoEmbed
   - Track mouse movements for local cursor

---

## Implementation Steps

### Step 1: Create Individual Cursor Component

**File:** `components/collaborative-cursor.tsx` (NEW FILE)

```typescript
'use client'

import { memo } from 'react'
import { motion } from 'motion/react'
import type { UserPresence } from '@/hooks/use-user-presence'

interface CollaborativeCursorProps {
  user: UserPresence
  isVisible: boolean
}

/**
 * Individual cursor for a remote user.
 * Renders an SVG arrow with user name badge.
 */
export const CollaborativeCursor = memo<CollaborativeCursorProps>(
  ({ user, isVisible }) => {
    const { cursor, color } = user

    if (!cursor || !isVisible) return null

    return (
      <motion.div
        className="fixed pointer-events-none z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.15 }}
        style={{
          left: cursor.x,
          top: cursor.y,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Cursor Arrow */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="drop-shadow-sm"
        >
          <path
            d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L5.94 2.87a.5.5 0 0 0-.44.34Z"
            fill={color}
            stroke="white"
            strokeWidth="1.5"
          />
        </svg>

        {/* User Name Badge */}
        <div
          className="absolute left-6 top-4 px-2 py-0.5 rounded-md text-xs font-medium text-white whitespace-nowrap shadow-sm"
          style={{
            backgroundColor: color,
          }}
        >
          {user.user.name}
        </div>
      </motion.div>
    )
  },
)

CollaborativeCursor.displayName = 'CollaborativeCursor'
```

**Estimated:** 30 minutes

---

### Step 2: Create Cursor Layer Container

**File:** `components/collaborative-cursor-layer.tsx` (NEW FILE)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { CollaborativeCursor } from './collaborative-cursor'
import type { UserPresence } from '@/hooks/use-user-presence'

interface CollaborativeCursorLayerProps {
  remoteUsers: Map<number, UserPresence>
  diagramContainerRef: React.RefObject<HTMLDivElement>
}

/**
 * Container layer for all remote users' cursors.
 * Renders cursors as an overlay on top of the diagram canvas.
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
        setContainerBounds(diagramContainerRef.current.getBoundingClientRect())
      }
    }

    updateBounds()

    // Update on resize and scroll
    const resizeObserver = new ResizeObserver(updateBounds)
    if (diagramContainerRef.current) {
      resizeObserver.observe(diagramContainerRef.current)
    }

    window.addEventListener('scroll', updateBounds, true)
    window.addEventListener('resize', updateBounds)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', updateBounds, true)
      window.removeEventListener('resize', updateBounds)
    }
  }, [diagramContainerRef])

  // Convert diagram coordinates to screen coordinates
  const getScreenPosition = (x: number, y: number) => {
    if (!containerBounds) return { x, y }

    return {
      x: containerBounds.left + x,
      y: containerBounds.top + y,
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
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
```

**Estimated:** 45 minutes

---

### Step 3: Update Diagram Editor

**File:** `components/diagram-editor.tsx` (MODIFY)

Add cursor layer and mouse tracking:

```typescript
'use client'

import { useRef, useCallback } from 'react'
import { DrawIoEmbed } from 'react-drawio'
import { useDiagram } from '@/contexts/diagram-context'
import { useUserPresence } from '@/hooks/use-user-presence'
import { CollaborativeCursorLayer } from '@/components/collaborative-cursor-layer'
import type { Locale } from '@/lib/i18n/config'

interface DiagramEditorProps {
  drawioUi: 'min' | 'sketch'
  darkMode: boolean
  currentLang: Locale
  isMobile: boolean
  isLoaded: boolean
  isDrawioReady: boolean
  isElectron: boolean
  drawioBaseUrl: string
  onDrawioLoad: () => void
}

export function DiagramEditor({
  drawioUi,
  darkMode,
  currentLang,
  isMobile,
  isLoaded,
  isDrawioReady,
  isElectron,
  drawioBaseUrl,
  onDrawioLoad,
}: DiagramEditorProps) {
  const { drawioRef, handleDiagramAutoSave, handleDiagramExport } = useDiagram()
  const diagramContainerRef = useRef<HTMLDivElement>(null)

  // Get presence hook (will be wired in Phase 4)
  // const { remoteUsers, updateCursor } = useUserPresence()

  // Track mouse movement for local cursor broadcast
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!diagramContainerRef.current) return

    const rect = diagramContainerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Broadcast cursor position (throttled in hook)
    // updateCursor(x, y)
  }, []) // Add updateCursor to deps in Phase 4

  return (
    <div className={`h-full relative ${isMobile ? 'p-1' : 'p-2'}`}>
      <div
        ref={diagramContainerRef}
        className="h-full rounded-xl overflow-hidden shadow-soft-lg border border-border/30 relative"
        onMouseMove={handleMouseMove}
      >
        {isLoaded && (
          <div
            className={`h-full w-full ${
              isDrawioReady ? '' : 'invisible absolute inset-0'
            }`}
          >
            <DrawIoEmbed
              key={`${drawioUi}-${darkMode}-${currentLang}-${isElectron}`}
              ref={drawioRef}
              autosave
              onAutoSave={(data) => handleDiagramAutoSave(data.xml)}
              onExport={handleDiagramExport}
              onLoad={onDrawioLoad}
              baseUrl={drawioBaseUrl}
              urlParameters={{
                ui: drawioUi,
                spin: false,
                libraries: false,
                saveAndExit: false,
                noSaveBtn: true,
                noExitBtn: true,
                dark: darkMode,
                lang: currentLang,
                ...(isElectron && { offline: true }),
              }}
            />
          </div>
        )}

        {/* Collaborative Cursors Layer */}
        {/* Uncomment in Phase 4 after integration */}
        {/* <CollaborativeCursorLayer
          remoteUsers={remoteUsers}
          diagramContainerRef={diagramContainerRef}
        /> */}

        {(!isLoaded || !isDrawioReady) && (
          <div className="h-full w-full bg-background flex items-center justify-center">
            <span className="text-muted-foreground">
              Draw.io panel is loading...
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Estimated:** 30 minutes

---

### Step 4: Add Cursor Fade Animation (Optional)

**File:** `components/collaborative-cursor.tsx` (ENHANCEMENT)

Add inactivity timeout:

```typescript
const [isActive, setIsActive] = useState(true)
const lastUpdateRef = useRef(Date.now())

useEffect(() => {
  if (!user.cursor) return

  lastUpdateRef.current = Date.now()
  setIsActive(true)

  const timeout = setTimeout(() => {
    const timeSinceUpdate = Date.now() - lastUpdateRef.current
    if (timeSinceUpdate > 5000) { // 5 seconds inactive
      setIsActive(false)
    }
  }, 5000)

  return () => clearTimeout(timeout)
}, [user.cursor])

// Update opacity based on active state
animate={{ opacity: isActive ? 1 : 0.3, scale: isActive ? 1 : 0.9 }}
```

**Estimated:** 20 minutes (optional)

---

## Todo List

- [ ] Step 1: Create `components/collaborative-cursor.tsx`
- [ ] Step 2: Create `components/collaborative-cursor-layer.tsx`
- [ ] Step 3: Update `components/diagram-editor.tsx` with cursor layer
- [ ] Step 4: (Optional) Add inactivity fade animation
- [ ] Step 5: Test cursor rendering with mock data
- [ ] Step 6: Verify smooth animations at 60fps
- [ ] Step 7: Test coordinate mapping with scroll/zoom

---

## Success Criteria

- [ ] Cursors render for each remote user
- [ ] Cursor color matches user's assigned color
- [ ] User name badge displays below cursor
- [ ] Cursor movement is smooth (CSS transform)
- [ ] Fade-in animation when user joins
- [ ] `pointer-events: none` prevents interaction blocking
- [ ] Coordinate mapping works with container offset
- [ ] Performance: 60fps with 5+ cursors

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Coordinate mismatch with diagram scroll | High | Use getBoundingClientRect() for bounds |
| Performance degradation with 10+ users | Medium | Consider limiting visible cursors |
| Cursor z-index blocks diagram interactions | High | Use `pointer-events-none` + high z-index |
| React re-renders on every mouse move | High | Use React.memo + throttle updates |

---

## Security Considerations

- **No XSS in user names:** User names are already sanitized by Better Auth
- **Coordinate spoofing:** Clients can send fake coordinates (no impact, just visual)
- **DoS via rapid updates:** Throttled in Phase 1 hook

---

## Testing Strategy

### Unit Tests

```typescript
describe('CollaborativeCursor', () => {
  it('renders cursor with correct color')
  it('shows user name badge')
  it('does not render when cursor is null')
  it('applies correct transform position')
})
```

### Visual Tests

1. Mock 5 remote users with different colors
2. Verify all cursors render simultaneously
3. Check animations are smooth
4. Test with diagram scrolled/zoomed

---

## Next Steps

After completing this phase:

1. **Phase 3:** Create user avatar component for presence list
2. **Phase 4:** Wire up presence hook to diagram editor
3. **Phase 5:** Add "Follow User" feature (optional)

---

## Dependencies

- Phase 1 complete (presence tracking hook)
- `motion` package installed (already in dependencies)
- Diagram editor container ref available

---

## Design Decisions

### Why `motion` (Framer Motion)?

- Already in dependencies from existing codebase
- Smooth animations with `<AnimatePresence>`
- Better performance than manual CSS transitions
- Easy exit animations for user leaving

### Why Fixed Positioning?

- Simpler coordinate mapping
- Works regardless of diagram overflow/scroll
- Avoids coordinate transformation complexity

### Why `pointer-events-none`?

- Prevents cursor from blocking diagram interactions
- Users can click through cursor overlay
- Draw.io events still work correctly

---

## Open Questions

### Question: Cursor Inactivity Timeout

How long before cursor fades out when user is inactive?

- [ ] 5 seconds (quick fade, less clutter)
- [ ] 10 seconds (balanced)
- [ ] 30 seconds (keep visible longer)
- [ ] Never (always show all users)

**Recommendation:** 5 seconds for quick feedback, subtle fade to 30% opacity (not fully hidden).

---

### Question: Maximum Visible Cursors

Should we limit the number of visible cursors for performance?

- [ ] Show all (no limit)
- [ ] Limit to 10 most recent
- [ ] Limit to 5 + "N more users" indicator

**Recommendation:** Show all for now (YAGNI). Add limit only if performance issues arise.
