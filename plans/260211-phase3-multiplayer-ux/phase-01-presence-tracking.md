# Phase 1: User Presence Tracking

**Status:** Pending
**Priority:** High (Foundational for all multiplayer UX)
**Estimated Time:** 2-3 hours

---

## Context Links

- Parent: [Plan Overview](./plan.md)
- PRD Reference: `docs/prds/sprint3-realtime-collaboration.md` lines 151-181
- Related Files:
  - `lib/crdt.ts` - Existing CRDT connection
  - `hooks/use-crdt-diagram.ts` - Existing CRDT hook
  - `lib/auth-client.ts` - Auth session management

---

## Overview

Create a React hook that leverages Yjs awareness API to track which users are currently online in the collaborative diagram room. This hook will provide real-time presence data including user information, cursor positions, and selections.

### Key Requirements

- Track online users via Yjs awareness
- Subscribe to presence changes (join/leave/update)
- Provide current user's session data
- Map remote users' presence state
- Clean up listeners on unmount

---

## Requirements

### Functional Requirements

1. **Presence Data Structure:**
   ```typescript
   interface UserPresence {
     user: {
       id: string
       name: string
       role: AppRole  // 'owner' | 'admin' | 'editor' | 'viewer'
     }
     cursor: { x: number; y: number } | null
     selection: string[] | null  // selected element IDs
     color: string  // unique color per user
   }
   ```

2. **Hook API:**
   ```typescript
   interface UseUserPresenceReturn {
     // Current user's presence state
     localUser: UserPresence | null

     // Map of remote users (clientID -> presence)
     remoteUsers: Map<number, UserPresence>

     // Combined list of all users (for UI display)
     allUsers: UserPresence[]

     // Connection status
     status: 'connecting' | 'connected' | 'disconnected'

     // Actions
     updateCursor: (x: number, y: number) => void
     updateSelection: (selectedIds: string[]) => void
     setLocalColor: (color: string) => void
   }
   ```

3. **Authentication Integration:**
   - Fetch user data from Better Auth session
   - Include user role in presence state
   - Handle unauthenticated users (guest mode)

### Non-Functional Requirements

- **Performance:** Throttle cursor updates to avoid WebSocket spam
- **Reliability:** Handle awareness connection failures gracefully
- **Type Safety:** Full TypeScript coverage with proper types

---

## Architecture

### Component Interaction

```
useCrdtDiagram (existing)
  └── WebsocketProvider.awareness

useUserPresence (new)
  ├── Subscribe to awareness changes
  ├── Map awareness state to UserPresence[]
  ├── Throttle local cursor updates
  └── Provide actions for updating local state
```

### Data Flow

```
1. Hook mounts → Subscribe to awareness.on('change')
2. Awareness fires → Update remoteUsers state
3. User moves mouse → updateCursor(x, y) → Throttled → awareness.setLocalStateField()
4. User joins → awareness.addChangeListener() → Update allUsers
5. User leaves → awareness.removeChangeListener() → Remove from allUsers
```

---

## Related Code Files

### Files to Create

1. **`hooks/use-user-presence.ts`** (NEW)
   - Main presence tracking hook
   - ~150 lines

2. **`lib/user-colors.ts`** (NEW)
   - Color assignment utilities
   - Hash-based color generation
   - ~50 lines

### Files to Modify

1. **`lib/crdt.ts`** (MODIFY)
   - Export awareness from CrdtConnection
   - Add awareness field to interface

2. **`hooks/use-crdt-diagram.ts`** (MODIFY)
   - Expose awareness instance from hook
   - Add awareness to return type

3. **`lib/db/schema.ts`** (REFERENCE)
   - AppRole type already defined
   - User table structure

---

## Implementation Steps

### Step 1: Update CRDT Types

**File:** `lib/crdt.ts`

Add awareness export to existing `CrdtConnection` interface:

```typescript
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

export interface CrdtConnection {
  doc: Y.Doc
  sharedText: Y.Text
  wsProvider: WebsocketProvider
  indexeddbProvider?: IndexeddbPersistence
  roomId: string
  awareness: WebsocketProvider['awareness']  // ADD THIS
  destroy: () => void
}
```

Return awareness from `createCrdtConnection()`:

```typescript
export function createCrdtConnection(options: CrdtConnectionOptions): CrdtConnection {
  // ... existing code ...

  const wsProvider = new WebsocketProvider(wsUrl, roomId, doc)

  return {
    doc,
    sharedText,
    wsProvider,
    indexeddbProvider,
    roomId,
    awareness: wsProvider.awareness,  // ADD THIS
    destroy: () => { /* existing */ }
  }
}
```

**Estimated:** 5 minutes

---

### Step 2: Expose Awareness from CRDT Hook

**File:** `hooks/use-crdt-diagram.ts`

Add awareness to return type:

```typescript
import * as Y from 'yjs'

interface UseCrdtDiagramReturn {
  connectionStatus: CrdtConnectionStatus
  isSynced: boolean
  roomId: string
  syncLocalXml: (xml: string) => void
  awareness: Y.Awareness | null  // ADD THIS
}
```

Return awareness from hook:

```typescript
export function useCrdtDiagram(options: UseCrdtDiagramOptions): UseCrdtDiagramReturn {
  // ... existing code ...

  return {
    connectionStatus,
    isSynced,
    roomId: normalizedRoomId,
    syncLocalXml,
    awareness: connectionRef.current?.awareness || null,  // ADD THIS
  }
}
```

**Estimated:** 5 minutes

---

### Step 3: Create User Color Utilities

**File:** `lib/user-colors.ts`

Implement hash-based color generation for consistent user colors:

```typescript
/**
 * Generate consistent color from user ID using hash function
 * Ensures same user always gets same color across sessions
 */
export function getUserColor(userId: string): string {
  // Simple hash function
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }

  // Predefined color palette (high contrast, accessible)
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#d946ef', // fuchsia
    '#f43f5e', // rose
  ]

  return colors[Math.abs(hash) % colors.length]
}

/**
 * Get contrasting text color (black/white) based on background
 */
export function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.5 ? '#000000' : '#ffffff'
}
```

**Estimated:** 15 minutes

---

### Step 4: Create User Presence Hook

**File:** `hooks/use-user-presence.ts` (NEW FILE)

Main implementation with awareness integration:

```typescript
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type * as Y from 'yjs'
import { useSession } from '@/lib/auth-client'
import { getUserColor } from '@/lib/user-colors'

// Type imports from schema
type AppRole = 'owner' | 'admin' | 'editor' | 'viewer'

export interface UserPresence {
  user: {
    id: string
    name: string
    role: AppRole
  }
  cursor: { x: number; y: number } | null
  selection: string[] | null
  color: string
}

export interface UseUserPresenceOptions {
  enabled: boolean
  awareness: Y.Awareness | null
}

export interface UseUserPresenceReturn {
  localUser: UserPresence | null
  remoteUsers: Map<number, UserPresence>
  allUsers: UserPresence[]
  status: 'connecting' | 'connected' | 'disconnected'
  updateCursor: (x: number, y: number) => void
  updateSelection: (selectedIds: string[]) => void
  setLocalColor: (color: string) => void
}

export function useUserPresence({
  enabled,
  awareness,
}: UseUserPresenceOptions): UseUserPresenceReturn {
  const { data: session } = useSession()
  const [remoteUsers, setRemoteUsers] = useState<Map<number, UserPresence>>(new Map())
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  // Throttle cursor updates
  const cursorUpdateRef = useRef<{ x: number; y: number } | null>(null)
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Local user presence state
  const localUser = useMemo<UserPresence | null>(() => {
    if (!session?.user) return null

    return {
      user: {
        id: session.user.id,
        name: session.user.name || 'Anonymous',
        role: (session.user.role as AppRole) || 'editor',
      },
      cursor: null,
      selection: null,
      color: getUserColor(session.user.id),
    }
  }, [session])

  // Set initial local state on mount
  useEffect(() => {
    if (!enabled || !awareness || !localUser) return

    awareness.setLocalStateField('user', localUser.user)
    awareness.setLocalStateField('color', localUser.color)
  }, [enabled, awareness, localUser])

  // Subscribe to awareness changes
  useEffect(() => {
    if (!enabled || !awareness) {
      setStatus('disconnected')
      setRemoteUsers(new Map())
      return
    }

    setStatus('connected')

    const handleAwarenessChange = () => {
      const states = awareness.getStates()

      const remote = new Map<number, UserPresence>()

      states.forEach((state, clientID) => {
        // Skip local user
        if (clientID === awareness.clientID) return

        // Only include users with complete state
        if (state.user && state.color) {
          remote.set(clientID, {
            user: state.user,
            cursor: state.cursor || null,
            selection: state.selection || null,
            color: state.color,
          })
        }
      })

      setRemoteUsers(remote)
    }

    // Initial sync
    handleAwarenessChange()

    // Listen for changes
    awareness.on('change', handleAwarenessChange)

    return () => {
      awareness.off('change', handleAwarenessChange)
    }
  }, [enabled, awareness])

  // Throttled cursor update
  const updateCursor = useCallback((x: number, y: number) => {
    if (!awareness) return

    cursorUpdateRef.current = { x, y }

    if (throttleTimeoutRef.current) return

    throttleTimeoutRef.current = setTimeout(() => {
      if (cursorUpdateRef.current && awareness) {
        awareness.setLocalStateField('cursor', cursorUpdateRef.current)
        cursorUpdateRef.current = null
      }
      throttleTimeoutRef.current = null
    }, 100) // 100ms throttle = 10 updates/second
  }, [awareness])

  // Update selection (not throttled - less frequent)
  const updateSelection = useCallback((selectedIds: string[]) => {
    if (!awareness) return
    awareness.setLocalStateField('selection', selectedIds)
  }, [awareness])

  // Update local color (for user customization)
  const setLocalColor = useCallback((color: string) => {
    if (!awareness) return
    awareness.setLocalStateField('color', color)
  }, [awareness])

  // Combine all users for UI display
  const allUsers = useMemo<UserPresence[]>(() => {
    const users: UserPresence[] = []
    if (localUser) users.push(localUser)
    users.push(...Array.from(remoteUsers.values()))
    return users
  }, [localUser, remoteUsers])

  // Cleanup throttle timeout on unmount
  useEffect(() => {
    return () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current)
      }
    }
  }, [])

  return {
    localUser,
    remoteUsers,
    allUsers,
    status,
    updateCursor,
    updateSelection,
    setLocalColor,
  }
}
```

**Estimated:** 1.5-2 hours

---

### Step 5: Add TypeScript Types

**File:** `types/presence.ts` (NEW FILE) - Optional

Extract types for reusability:

```typescript
import type { AppRole } from '@/lib/db/schema'

export interface UserPresence {
  user: {
    id: string
    name: string
    role: AppRole
  }
  cursor: { x: number; y: number } | null
  selection: string[] | null
  color: string
}

export type PresenceStatus = 'connecting' | 'connected' | 'disconnected'
```

**Estimated:** 10 minutes (optional)

---

## Todo List

- [ ] Step 1: Update `lib/crdt.ts` to export awareness
- [ ] Step 2: Update `hooks/use-crdt-diagram.ts` to expose awareness
- [ ] Step 3: Create `lib/user-colors.ts` with color utilities
- [ ] Step 4: Create `hooks/use-user-presence.ts` main hook
- [ ] Step 5: (Optional) Extract types to `types/presence.ts`
- [ ] Step 6: Test hook with mock awareness instance
- [ ] Step 7: Verify TypeScript compilation
- [ ] Step 8: Test with 2 browser windows (after Phase 4 integration)

---

## Success Criteria

- [ ] Hook compiles without TypeScript errors
- [ ] Awareness instance correctly exposed from CRDT connection
- [ ] Local user state initialized from Better Auth session
- [ ] Remote users map updates when awareness changes
- [ ] Cursor updates throttled to ~100ms intervals
- [ ] Cleanup runs correctly on unmount
- [ ] All users list combines local + remote users

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Session data unavailable | Medium | Provide fallback to "Anonymous" guest user |
| Awareness connection drops | High | Handle gracefully, show "disconnected" status |
| Throttle too aggressive | Low | Make throttle interval configurable (future) |
| Memory leak from listeners | High | Ensure cleanup in useEffect return |

---

## Security Considerations

- **No sensitive data in presence:** Only share user ID, name, role
- **No PII:** Avoid email addresses in presence state
- **Role-based access:** Include user role for potential UI customization

---

## Testing Strategy

### Unit Tests

```typescript
describe('useUserPresence', () => {
  it('initializes local user from session')
  it('subscribes to awareness changes')
  it('updates remote users on awareness change')
  it('throttles cursor updates')
  it('cleans up listeners on unmount')
})
```

### Integration Tests

1. Test with 2 browser windows in same room
2. Verify cursors appear when second user joins
3. Verify cleanup when user leaves

---

## Next Steps

After completing this phase:

1. **Phase 2:** Create collaborative cursor component
2. **Phase 3:** Create user avatar component
3. **Phase 4:** Integrate with diagram editor
4. **Phase 5:** Add "Follow User" feature

---

## Dependencies

- Better Auth session working
- Yjs awareness accessible from CRDT hook
- TypeScript types defined for AppRole

---

## Open Questions

### Question: Guest User Handling

If user is not authenticated (no session), should we:
- [ ] Allow guest mode with "Anonymous" name + random ID
- [ ] Require authentication to collaborate
- [ ] Show read-only view for unauthenticated users

**Recommendation:** Allow guest mode for testing, but require auth in production.
