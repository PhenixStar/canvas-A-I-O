# Phase 5: "Follow User" Feature (Optional)

**Status:** Pending
**Priority:** Low (Nice-to-have enhancement)
**Estimated Time:** 2-3 hours

---

## Context Links

- Parent: [Plan Overview](./plan.md)
- Previous: [Phase 4 - Integration](./phase-04-integration.md)
- Related Files:
  - `components/diagram-editor.tsx` - Add follow controls
  - `hooks/use-user-presence.ts` - Track followed user

---

## Overview

Implement an optional "Follow User" feature that allows users to follow another user's viewport. When following, the diagram automatically scrolls/pans to keep the followed user's cursor in view. This is useful for observing another user's work or for presentation scenarios.

### Key Requirements

- Add "Follow" button in user avatar/presence list
- Track followed user's cursor position
- Auto-scroll diagram to keep cursor in viewport
- Visual indicator showing "Following [User]"
- Stop following on manual scroll/zoom
- Stop following when user leaves

---

## Requirements

### Functional Requirements

1. **Follow Controls:**
   - "Follow" button in user menu (avatar click or presence list)
   - Unfollow button when actively following
   - Visual indicator: "Following [Name]"

2. **Viewport Tracking:**
   - Monitor followed user's cursor position
   - Calculate scroll offset to center cursor
   - Smooth scroll animation (CSS or JS)

3. **Auto-Unfollow Triggers:**
   - User manually scrolls/zooms diagram
   - Followed user leaves the room
   - User clicks "Unfollow" button

### Non-Functional Requirements

- **Performance:** Scroll updates throttled (200ms)
- **UX:** Smooth scroll animation, no jarring movements
- **Type Safety:** Full TypeScript coverage

---

## Architecture

### Component Hierarchy

```
PresenceList
└── UserListItem
    └── FollowButton (if not local user)

DiagramEditor
├── useFollowUser (new hook)
├── Auto-scroll effect
└── Unfollow indicator
```

### Data Flow

```
User clicks "Follow" → setFollowedUserId(userId)
    ↓
useFollowUser monitors cursor position
    ↓
Calculate viewport offset
    ↓
Scroll diagram container (smooth)
    ↓
User manually scrolls → clearFollowedUser()
```

---

## Related Code Files

### Files to Create

1. **`hooks/use-follow-user.ts`** (NEW)
   - Follow user logic
   - ~80 lines

2. **`components/follow-button.tsx`** (NEW)
   - Follow/unfollow toggle button
   - ~40 lines

3. **`components/following-indicator.tsx`** (NEW)
   - Banner showing "Following [User]"
   - ~50 lines

### Files to Modify

1. **`hooks/use-user-presence.ts`** (MODIFY)
   - Add `followedUserId` state
   - Add `setFollowedUser` action

2. **`components/presence-list.tsx`** (MODIFY)
   - Add follow button for remote users

3. **`components/diagram-editor.tsx`** (MODIFY)
   - Add following indicator
   - Handle auto-scroll

---

## Implementation Steps

### Step 1: Create Follow User Hook

**File:** `hooks/use-follow-user.ts` (NEW FILE)

```typescript
'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { UserPresence } from '@/hooks/use-user-presence'

interface UseFollowUserOptions {
  followedUserId: string | null
  remoteUsers: Map<number, UserPresence>
  diagramContainerRef: React.RefObject<HTMLDivElement>
  onUnfollow?: () => void
}

interface UseFollowUserReturn {
  isFollowing: boolean
  followedUser: UserPresence | null
  manualUnfollow: () => void
}

/**
 * Hook to manage "Follow User" functionality.
 * Automatically scrolls diagram to keep followed user's cursor in view.
 */
export function useFollowUser({
  followedUserId,
  remoteUsers,
  diagramContainerRef,
  onUnfollow,
}: UseFollowUserOptions): UseFollowUserReturn {
  const isFollowing = !!followedUserId
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Find followed user data
  const followedUser = followedUserId
    ? Array.from(remoteUsers.values()).find((u) => u.user.id === followedUserId) || null
    : null

  // Auto-scroll to followed user's cursor
  useEffect(() => {
    if (!followedUser || !followedUser.cursor || !diagramContainerRef.current) {
      return
    }

    const container = diagramContainerRef.current
    const { x, y } = followedUser.cursor

    // Throttle scroll updates (200ms)
    if (scrollTimeoutRef.current) {
      return
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (!container || !followedUser.cursor) return

      // Calculate scroll position to center cursor
      const containerRect = container.getBoundingClientRect()
      const targetScrollLeft = followedUser.cursor.x - containerRect.width / 2
      const targetScrollTop = followedUser.cursor.y - containerRect.height / 2

      // Smooth scroll
      container.scrollTo({
        left: targetScrollLeft,
        top: targetScrollTop,
        behavior: 'smooth',
      })

      scrollTimeoutRef.current = null
    }, 200)

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
    let lastScrollTop = container.scrollTop
    let lastScrollLeft = container.scrollLeft

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      const scrollLeft = container.scrollLeft

      // Detect significant scroll change (not from auto-scroll)
      const scrollDelta = Math.abs(scrollTop - lastScrollTop) + Math.abs(scrollLeft - lastScrollLeft)

      if (scrollDelta > 50) {
        // User manually scrolled
        onUnfollow?.()
      }

      lastScrollTop = scrollTop
      lastScrollLeft = scrollLeft
    }

    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [isFollowing, diagramContainerRef, onUnfollow])

  // Manual unfollow action
  const manualUnfollow = useCallback(() => {
    onUnfollow?.()
  }, [onUnfollow])

  return {
    isFollowing,
    followedUser,
    manualUnfollow,
  }
}
```

**Estimated:** 1 hour

---

### Step 2: Create Follow Button Component

**File:** `components/follow-button.tsx` (NEW FILE)

```typescript
'use client'

import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import type { UserPresence } from '@/hooks/use-user-presence'

interface FollowButtonProps {
  user: UserPresence
  isFollowing: boolean
  onFollow: () => void
  onUnfollow: () => void
}

/**
 * Button to follow/unfollow a remote user.
 * Shows eye icon when not following, eye-off when following.
 */
export function FollowButton({
  user,
  isFollowing,
  onFollow,
  onUnfollow,
}: FollowButtonProps) {
  return (
    <Button
      variant={isFollowing ? 'default' : 'ghost'}
      size="sm"
      onClick={isFollowing ? onUnfollow : onFollow}
      className="h-8 px-2"
    >
      {isFollowing ? (
        <>
          <EyeOff className="w-4 h-4 mr-1" />
          Unfollow
        </>
      ) : (
        <>
          <Eye className="w-4 h-4 mr-1" />
          Follow
        </>
      )}
    </Button>
  )
}
```

**Estimated:** 20 minutes

---

### Step 3: Create Following Indicator

**File:** `components/following-indicator.tsx` (NEW FILE)

```typescript
'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'motion/react'

interface FollowingIndicatorProps {
  userName: string
  onUnfollow: () => void
}

/**
 * Banner indicator showing currently followed user.
 * Displays at top of diagram with unfollow button.
 */
export function FollowingIndicator({ userName, onUnfollow }: FollowingIndicatorProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="absolute top-16 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-3">
          <span className="text-sm font-medium">
            Following <span className="font-bold">{userName}</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onUnfollow}
            className="h-6 w-6 p-0 hover:bg-primary-foreground/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
```

**Estimated:** 25 minutes

---

### Step 4: Update Presence List

**File:** `components/presence-list.tsx` (MODIFY)

Add follow button to user list items:

```typescript
import { FollowButton } from './follow-button'

interface PresenceListProps {
  users: UserPresence[]
  localUserId: string | null
  followedUserId: string | null
  onFollowUser: (userId: string) => void
  onUnfollowUser: () => void
  className?: string
}

// In the user list rendering:
{sortedUsers.map((user) => (
  <div key={user.user.id} className="...">
    <UserAvatar ... />

    <div className="flex-1 min-w-0">
      {/* ... existing user info */}
    </div>

    {/* Follow Button (only for remote users) */}
    {user.user.id !== localUserId && (
      <FollowButton
        user={user}
        isFollowing={user.user.id === followedUserId}
        onFollow={() => onFollowUser(user.user.id)}
        onUnfollow={onUnfollowUser}
      />
    )}
  </div>
))}
```

**Estimated:** 20 minutes

---

### Step 5: Integrate into Diagram Editor

**File:** `components/diagram-editor.tsx` (MODIFY)

Add follow feature to editor:

```typescript
'use client'

import { useState, useCallback } from 'react'
import { useDiagram, usePresence } from '@/contexts/diagram-context'
import { useFollowUser } from '@/hooks/use-follow-user'
import { FollowingIndicator } from '@/components/following-indicator'
import { PresenceList } from '@/components/presence-list'

export function DiagramEditor({ /* props */ }) {
  const { drawioRef, handleDiagramAutoSave, handleDiagramExport } = useDiagram()
  const { localUser, remoteUsers, allUsers } = usePresence()

  const diagramContainerRef = useRef<HTMLDivElement>(null)

  // Follow state
  const [followedUserId, setFollowedUserId] = useState<string | null>(null)

  // Follow user hook
  const { isFollowing, followedUser, manualUnfollow } = useFollowUser({
    followedUserId,
    remoteUsers,
    diagramContainerRef,
    onUnfollow: () => setFollowedUserId(null),
  })

  const handleFollowUser = useCallback((userId: string) => {
    setFollowedUserId(userId)
  }, [])

  const handleUnfollowUser = useCallback(() => {
    setFollowedUserId(null)
  }, [])

  // Auto-unfollow when followed user leaves
  useEffect(() => {
    if (followedUserId && !Array.from(remoteUsers.values()).find(u => u.user.id === followedUserId)) {
      setFollowedUserId(null)
    }
  }, [followedUserId, remoteUsers])

  return (
    <div className={`h-full relative ${isMobile ? 'p-1' : 'p-2'}`}>
      {/* Following Indicator */}
      {isFollowing && followedUser && (
        <FollowingIndicator
          userName={followedUser.user.name}
          onUnfollow={handleUnfollowUser}
        />
      )}

      {/* Presence List with Follow Buttons */}
      {allUsers.length > 0 && (
        <div className="absolute top-4 right-4 z-40 w-64">
          <PresenceList
            users={allUsers}
            localUserId={localUser?.user.id || null}
            followedUserId={followedUserId}
            onFollowUser={handleFollowUser}
            onUnfollowUser={handleUnfollowUser}
          />
        </div>
      )}

      {/* Diagram container with ref */}
      <div ref={diagramContainerRef} /* ... existing props */>
        {/* ... existing diagram content */}
      </div>
    </div>
  )
}
```

**Estimated:** 30 minutes

---

## Todo List

- [ ] Step 1: Create `hooks/use-follow-user.ts`
- [ ] Step 2: Create `components/follow-button.tsx`
- [ ] Step 3: Create `components/following-indicator.tsx`
- [ ] Step 4: Update `components/presence-list.tsx` with follow button
- [ ] Step 5: Update `components/diagram-editor.tsx` with follow feature
- [ ] Step 6: Test follow/unfollow functionality
- [ ] Step 7: Verify auto-scroll works smoothly
- [ ] Step 8: Test auto-unfollow on manual scroll
- [ ] Step 9: Test auto-unfollow when user leaves

---

## Success Criteria

- [ ] Follow button appears for remote users
- [ ] Clicking follow starts tracking user's cursor
- [ ] Diagram auto-scrolls to keep cursor in view
- [ ] Following indicator displays current user name
- [ ] Manual scroll stops following
- [ ] Unfollow button stops tracking
- [ ] Auto-unfollow when followed user leaves
- [ ] Smooth scroll animation (no jarring)

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scroll detection conflicts with auto-scroll | High | Use threshold (50px delta) to distinguish |
| Performance issues with constant scrolling | Medium | Throttle scroll updates (200ms) |
| User confusion about why viewport moves | Low | Clear "Following" indicator + easy unfollow |
| Conflicts with diagram's own scroll handling | Medium | Test thoroughly with react-drawio iframe |

---

## Known Limitations

1. **react-drawio iframe:** Scroll behavior may be limited if Draw.io uses iframe
   - **Workaround:** Scroll parent container instead
   - **Future:** Inject scroll events into iframe if needed

2. **Zoom support:** Current implementation doesn't handle zoom
   - **Future enhancement:** Track zoom level and adjust

3. **Mobile UX:** Follow button may be too small on touch devices
   - **Future:** Make follow button larger on mobile

---

## Testing Strategy

### Manual Testing

1. **Basic Follow:**
   - Open 2 browser windows
   - User A clicks "Follow" on User B
   - User B moves cursor around
   - Verify User A's viewport follows

2. **Unfollow Triggers:**
   - Manually scroll → should stop following
   - Click "Unfollow" → should stop following
   - User B leaves room → should auto-unfollow

3. **Edge Cases:**
   - Follow user with null cursor
   - Follow user who immediately leaves
   - Rapid follow/unfollow clicks

---

## Next Steps

After completing this phase:

1. **Final Testing:** End-to-end test all multiplayer features
2. **Documentation:** Update user guide with follow feature
3. **Deployment:** Push to production
4. **Monitoring:** Track follow feature usage

---

## Dependencies

- Phases 1-4 complete
- `motion` package for animations (already installed)
- Button component from shadcn/ui (check if available)

---

## Alternative Approaches

### Option A: Simple Follow (Current)

- Auto-scroll to cursor position
- Stop on manual interaction
- Simple, predictable behavior

### Option B: Smart Follow

- Predict user's intended area based on cursor movement
- Only scroll when cursor approaches viewport edge
- More complex, smoother experience

**Recommendation:** Start with Option A (YAGNI). Upgrade to Option B if UX testing shows need.

---

## Open Questions

### Question: Follow Button Location

Where should the follow button appear?

- [ ] In presence list (next to each user)
- [ ] In avatar tooltip (hover to see)
- [ ] Both (for discoverability)

**Recommendation:** Both. Primary in presence list, secondary in tooltip for quick access.

---

### Question: Scroll Behavior

How should the viewport follow the user?

- [ ] Center cursor in viewport (current implementation)
- [ ] Keep cursor in visible area (lazy follow)
- [ ] Smooth pan with cursor leading viewport

**Recommendation:** Center cursor for MVP. Test with users and adjust based on feedback.

---

### Question: Follow Priority

What happens when User A follows User B, who is following User C?

- [ ] A follows B, B follows C (cascading)
- [ ] Only one follow allowed per user
- [ ] A loses follow when B starts following C

**Recommendation:** Cascading (each user independent). Simple implementation, predictable behavior.
