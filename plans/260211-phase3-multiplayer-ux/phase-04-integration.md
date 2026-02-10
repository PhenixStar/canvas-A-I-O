# Phase 4: Editor Integration & Testing

**Status:** Pending
**Priority:** High (Makes all features functional)
**Estimated Time:** 2-3 hours

---

## Context Links

- Parent: [Plan Overview](./plan.md)
- Previous:
  - [Phase 1 - Presence Tracking](./phase-01-presence-tracking.md)
  - [Phase 2 - Cursor Rendering](./phase-02-cursor-rendering.md)
  - [Phase 3 - Avatars](./phase-03-avatars.md)
- Related Files:
  - `contexts/diagram-context.tsx` - Add presence state
  - `components/diagram-editor.tsx` - Main integration point

---

## Overview

Integrate all multiplayer UX components into the diagram editor. Wire up the presence tracking hook, connect cursor rendering, and display the presence list. Test with multiple browser windows to verify real-time collaboration works correctly.

### Key Requirements

- Connect `useUserPresence` hook to diagram editor
- Render collaborative cursors overlay
- Display presence list with all users
- Track mouse movements for local cursor broadcast
- Test with 2+ browser windows
- Verify performance and UX

---

## Requirements

### Functional Requirements

1. **Diagram Context Integration:**
   - Add presence state to `DiagramContext`
   - Expose `useUserPresence` return values
   - Make presence data available to all child components

2. **Diagram Editor Integration:**
   - Import and use `useUserPresence` hook
   - Track mouse movements for cursor broadcast
   - Render `CollaborativeCursorLayer`
   - Render `PresenceList`
   - Handle connection status changes

3. **Testing Requirements:**
   - Test with 2+ browser windows in same room
   - Verify cursors appear for remote users
   - Verify presence list updates on join/leave
   - Check performance with 5+ users
   - Test diagram editing still works (no interference)

### Non-Functional Requirements

- **Performance:** <100ms cursor update latency
- **UX:** Smooth cursor movement at 60fps
- **Reliability:** Handle connection drops gracefully
- **Type Safety:** Full TypeScript coverage

---

## Architecture

### Component Integration Flow

```
DiagramProvider
├── useCrdtDiagram (existing)
├── useUserPresence (new - uses awareness from CRDT)
│   └── Returns: { localUser, remoteUsers, allUsers, updateCursor, status }
└── Provides to consumers

DiagramEditor (consumer)
├── Uses: useDiagram(), useUserPresence()
├── Tracks: onMouseMove → updateCursor()
├── Renders: CollaborativeCursorLayer (remoteUsers)
└── Renders: PresenceList (allUsers, localUserId)
```

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Window A                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ DiagramEditor                                        │    │
│  │  ├─ onMouseMove → updateCursor(x, y)                │    │
│  │  └─ Renders: [Cursor A (local), PresenceList]       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ WebSocket (Yjs Awareness)
                            │
┌─────────────────────────────────────────────────────────────┐
│                     Browser Window B                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ DiagramEditor                                        │    │
│  │  └─ Renders: [Cursor A (remote), Cursor B (local)]  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Related Code Files

### Files to Modify

1. **`contexts/diagram-context.tsx`** (MODIFY)
   - Add presence state to context
   - Create `usePresence()` hook

2. **`components/diagram-editor.tsx`** (MODIFY)
   - Wire up presence hook
   - Add cursor layer
   - Add presence list
   - Track mouse movements

### Files to Reference

- `lib/crdt.ts` - Awareness instance
- `hooks/use-crdt-diagram.ts` - CRDT hook
- `hooks/use-user-presence.ts` - Presence hook

---

## Implementation Steps

### Step 1: Update Diagram Context

**File:** `contexts/diagram-context.tsx` (MODIFY)

Add presence state to the diagram context:

```typescript
'use client'

// ... existing imports
import { useCrdtDiagram } from '@/hooks/use-crdt-diagram'
import { useUserPresence } from '@/hooks/use-user-presence'
import type { UserPresence } from '@/hooks/use-user-presence'

// Extend interface
interface DiagramContextType {
  // ... existing properties

  // Multiplayer presence properties
  presenceState: {
    localUser: UserPresence | null
    remoteUsers: Map<number, UserPresence>
    allUsers: UserPresence[]
    status: 'connecting' | 'connected' | 'disconnected'
  }
}

export function DiagramProvider({ children }: { children: React.ReactNode }) {
  // ... existing state

  // CRDT integration (existing)
  const roomFromQuery = searchParams.get('room')?.trim() || ''
  const roomFromEnv = process.env.NEXT_PUBLIC_COLLAB_ROOM_ID?.trim() || ''
  const collaborationRoomId = roomFromQuery || roomFromEnv
  const collaborationEnabled = collaborationRoomId.length > 0

  const crdtState = useCrdtDiagram({
    enabled: collaborationEnabled,
    roomId: collaborationRoomId,
    initialXml: chartXMLRef.current,
    onRemoteXml: (remoteXml) => {
      const nextXml = remoteXml || ''
      if (!nextXml || nextXml === chartXMLRef.current) return
      loadDiagram(nextXml, true)
    },
  })

  // Presence tracking (NEW)
  const presenceState = useUserPresence({
    enabled: collaborationEnabled,
    awareness: crdtState.awareness,
  })

  // ... existing useEffects and handlers

  return (
    <DiagramContext.Provider
      value={{
        // ... existing values
        presenceState: {
          localUser: presenceState.localUser,
          remoteUsers: presenceState.remoteUsers,
          allUsers: presenceState.allUsers,
          status: presenceState.status,
        },
      }}
    >
      {children}
    </DiagramContext.Provider>
  )
}

// Add convenience hook
export function usePresence() {
  const { presenceState } = useDiagram()
  return presenceState
}
```

**Estimated:** 30 minutes

---

### Step 2: Wire Up Diagram Editor

**File:** `components/diagram-editor.tsx` (MODIFY)

Integrate presence hook and render UI components:

```typescript
'use client'

import { useRef, useCallback, useEffect } from 'react'
import { DrawIoEmbed } from 'react-drawio'
import { useDiagram, usePresence } from '@/contexts/diagram-context'
import { CollaborativeCursorLayer } from '@/components/collaborative-cursor-layer'
import { PresenceList } from '@/components/presence-list'
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
  const { localUser, remoteUsers, allUsers, status } = usePresence()

  const diagramContainerRef = useRef<HTMLDivElement>(null)
  const updateCursorRef = useRef<((x: number, y: number) => void) | null>(null)

  // Track mouse movement for local cursor broadcast
  // We'll get this from useUserPresence directly
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!diagramContainerRef.current) return

    const rect = diagramContainerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // TODO: Call updateCursor from presence hook
    // Will be available in next step when we expose it
    console.log('Cursor position:', { x, y })
  }, [])

  // Connection status indicator
  useEffect(() => {
    if (status === 'connected') {
      console.log('Multiplayer connected')
    } else if (status === 'disconnected') {
      console.log('Multiplayer disconnected')
    }
  }, [status])

  return (
    <div className={`h-full relative ${isMobile ? 'p-1' : 'p-2'}`}>
      {/* Connection Status Badge */}
      {status !== 'disconnected' && (
        <div className="absolute top-4 left-4 z-40">
          <div
            className={`
              px-3 py-1 rounded-full text-xs font-medium
              flex items-center gap-2
              ${status === 'connected'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
              }
            `}
          >
            <span
              className={`
                w-2 h-2 rounded-full
                ${status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}
              `}
            />
            {status === 'connected' ? 'Collaborating' : 'Connecting...'}
          </div>
        </div>
      )}

      {/* Presence List */}
      {allUsers.length > 0 && (
        <div className="absolute top-4 right-4 z-40 w-64">
          <PresenceList
            users={allUsers}
            localUserId={localUser?.user.id || null}
          />
        </div>
      )}

      {/* Diagram Container */}
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
        {remoteUsers.size > 0 && (
          <CollaborativeCursorLayer
            remoteUsers={remoteUsers}
            diagramContainerRef={diagramContainerRef}
          />
        )}

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

**Estimated:** 45 minutes

---

### Step 3: Expose updateCursor from Presence Hook

**File:** `contexts/diagram-context.tsx` (ENHANCEMENT)

Make `updateCursor` available to consumers:

```typescript
interface DiagramContextType {
  // ... existing

  // Multiplayer presence properties
  presenceState: {
    localUser: UserPresence | null
    remoteUsers: Map<number, UserPresence>
    allUsers: UserPresence[]
    status: 'connecting' | 'connected' | 'disconnected'
    updateCursor: (x: number, y: number) => void  // ADD THIS
  }
}

// In provider:
const presenceState = useUserPresence({
  enabled: collaborationEnabled,
  awareness: crdtState.awareness,
})

// In context value:
presenceState: {
  localUser: presenceState.localUser,
  remoteUsers: presenceState.remoteUsers,
  allUsers: presenceState.allUsers,
  status: presenceState.status,
  updateCursor: presenceState.updateCursor,  // ADD THIS
}
```

Then update `diagram-editor.tsx`:

```typescript
const { localUser, remoteUsers, allUsers, status, updateCursor } = usePresence()

const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
  if (!diagramContainerRef.current) return

  const rect = diagramContainerRef.current.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  updateCursor(x, y)
}, [updateCursor])
```

**Estimated:** 15 minutes

---

### Step 4: Local Testing Setup

Create a simple test script to verify multiplayer works:

**File:** `scripts/test-local-multiplayer.sh` (NEW FILE)

```bash
#!/bin/bash

# Test local multiplayer collaboration
# Opens 2 browser windows with the same room ID

ROOM_ID="test-room-$(date +%s)"
BASE_URL="http://localhost:6002"

echo "Opening 2 browser windows for room: $ROOM_ID"
echo "Window 1: User A"
echo "Window 2: User B"

# Open first window
if command -v open &> /dev/null; then
  # macOS
  open "$BASE_URL?room=$ROOM_ID"
  sleep 1
  open "$BASE_URL?room=$ROOM_ID"
elif command -v xdg-open &> /dev/null; then
  # Linux
  xdg-open "$BASE_URL?room=$ROOM_ID"
  sleep 1
  xdg-open "$BASE_URL?room=$ROOM_ID"
elif command -v start &> /dev/null; then
  # Windows
  start "$BASE_URL?room=$ROOM_ID"
  timeout /t 2 >nul
  start "$BASE_URL?room=$ROOM_ID"
else
  echo "Please open 2 browser windows manually:"
  echo "$BASE_URL?room=$ROOM_ID"
fi
```

**Estimated:** 10 minutes

---

### Step 5: Manual Testing Checklist

Create a test plan document:

**File:** `docs/testing/multiplayer-ux-checklist.md` (NEW FILE)

```markdown
# Multiplayer UX Testing Checklist

## Setup
- [ ] Start dev server: `npm run dev`
- [ ] Start WebSocket server: `npm run collab:server`
- [ ] Open 2 browser windows with same room ID

## Presence Features

### User Presence
- [ ] Both users appear in presence list
- [ ] Local user highlighted with ring
- [ ] User names display correctly
- [ ] Role badges show correct icons

### Collaborative Cursors
- [ ] Remote cursor appears when user moves mouse
- [ ] Cursor color matches user's assigned color
- [ ] Cursor movement is smooth (60fps)
- [ ] Cursor name badge shows on hover
- [ ] Cursor disappears when user leaves room

### Connection Status
- [ ] "Connecting" status shows on join
- [ ] "Connected" status shows when ready
- [ ] Status badge color changes correctly

### Diagram Editing
- [ ] Both users can edit simultaneously
- [ ] Changes sync in <200ms
- [ ] No conflicts or data loss
- [ ] Cursor overlay doesn't block interactions

### Performance
- [ ] No lag with 2 users
- [ ] No memory leaks after 5 minutes
- [ ] Cursor throttling works (100ms)

### Edge Cases
- [ ] User refreshes page (reconnects)
- [ ] User closes tab (disappears from list)
- [ ] Network disconnect/reconnect
- [ ] Room ID changes (clears presence)

## Cleanup
- [ ] Close all browser windows
- [ ] Stop dev server
- [ ] Stop WebSocket server
```

**Estimated:** 10 minutes

---

## Todo List

- [ ] Step 1: Update `contexts/diagram-context.tsx` with presence state
- [ ] Step 2: Wire up `components/diagram-editor.tsx` with presence hook
- [ ] Step 3: Expose `updateCursor` from presence state
- [ ] Step 4: Create local testing script
- [ ] Step 5: Create testing checklist document
- [ ] Step 6: Test with 2 browser windows locally
- [ ] Step 7: Verify all checklist items pass
- [ ] Step 8: Fix any bugs found during testing
- [ ] Step 9: Deploy to staging and test with remote users

---

## Success Criteria

- [ ] Presence list shows all connected users
- [ ] Collaborative cursors render for remote users
- [ ] Cursor movement is smooth (<100ms latency)
- [ ] Mouse tracking broadcasts position correctly
- [ ] Connection status displays accurately
- [ ] Diagram editing works without interference
- [ ] 2+ users can collaborate simultaneously
- [ ] Users join/leave updates presence correctly

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Context provider re-render loop | High | Use useMemo for presence state values |
| Mouse move handler fires too often | Medium | Throttling in presence hook (100ms) |
| Cursor layer blocks interactions | High | Verified `pointer-events-none` set |
| Memory leak from awareness listeners | Medium | Ensure cleanup in useEffect returns |

---

## Troubleshooting Guide

### Issue: Cursors not appearing

**Possible causes:**
1. Awareness not initialized
2. Remote users map empty
3. Cursor coordinates null

**Debug steps:**
```typescript
console.log('Awareness:', awareness)
console.log('Remote users:', Array.from(remoteUsers.entries()))
console.log('Cursor positions:', Array.from(remoteUsers.values()).map(u => u.cursor))
```

### Issue: Presence list empty

**Possible causes:**
1. Collaboration not enabled (no room ID)
2. Session data unavailable
3. Awareness not connected

**Debug steps:**
```typescript
console.log('Collaboration enabled:', collaborationEnabled)
console.log('Room ID:', collaborationRoomId)
console.log('All users:', allUsers)
```

### Issue: Laggy cursor movement

**Possible causes:**
1. Throttle not working
2. Too many re-renders
3. Network latency

**Solutions:**
1. Check throttle timeout in presence hook
2. Verify React.memo on cursor component
3. Increase throttle interval if needed

---

## Testing Strategy

### Local Testing

1. **Two Browser Windows:**
   ```bash
   # Terminal 1: Dev server
   npm run dev

   # Terminal 2: WebSocket server
   npm run collab:server

   # Browser: Open 2 windows with same room
   http://localhost:6002?room=test-123
   ```

2. **Verify:**
   - User B sees User A's cursor
   - User A sees User B's cursor
   - Presence list shows both users
   - Edits sync between windows

### Load Testing

Test with 5+ users (use multiple browsers or devices):

1. Open 5 browser windows
2. Move mouse in each window
3. Verify all cursors render smoothly
4. Check performance (DevTools Performance tab)

---

## Next Steps

After completing this phase:

1. **Phase 5:** Implement "Follow User" feature (optional)
2. **Documentation:** Update user docs with multiplayer features
3. **Deploy:** Push to production VPS
4. **Monitor:** Track WebSocket connection metrics

---

## Dependencies

- Phases 1-3 complete
- WebSocket server running
- Dev server running
- Modern browser with WebSocket support

---

## Performance Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Cursor update latency | <100ms | console.log timestamp diff |
| Presence sync latency | <200ms | Watch for user join delay |
| Render FPS | 60fps | React DevTools Profiler |
| Memory (5 users, 5 min) | <50MB | Chrome DevTools Memory |

---

## Open Questions

### Question: Production Room IDs

How will users share rooms in production?

- [ ] URL param: `?room=xxx` (current implementation)
- [ ] Dedicated "Share" button that copies URL
- [ ] Invite system with unique room tokens
- [ ] Private rooms with access control

**Recommendation:** Keep URL param for MVP. Add "Share" button in future UI polish.

---

### Question: Anonymous Users

Should unauthenticated users be allowed to collaborate?

- [ ] Yes (guest mode with "Anonymous" name)
- [ ] No (require authentication)
- [ ] Read-only for guests

**Recommendation:** Yes for development/testing. Add auth check in production before Phase 4 completion.

---

### Question: Max Users per Room

Should we limit the number of users per room?

- [ ] No limit (let server handle it)
- [ ] Soft limit (warn at 10 users)
- [ ] Hard limit (reject after 20 users)

**Recommendation:** No limit for MVP. Monitor server load and add limits if needed.
