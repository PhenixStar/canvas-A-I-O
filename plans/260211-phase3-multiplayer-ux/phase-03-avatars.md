# Phase 3: User Avatars & Presence List

**Status:** Pending
**Priority:** Medium (UI enhancement for presence awareness)
**Estimated Time:** 1-2 hours

---

## Context Links

- Parent: [Plan Overview](./plan.md)
- Previous: [Phase 2 - Cursor Rendering](./phase-02-cursor-rendering.md)
- Related Files:
  - `hooks/use-user-presence.ts` - Presence data source
  - `lib/user-colors.ts` - Color utilities

---

## Overview

Create user avatar components that display collaborative users in the diagram editor. Avatars show user initials, names, roles, and online status. These components will be used in a presence list (sidebar or floating panel) to show who's currently viewing/editing the diagram.

### Key Requirements

- Avatar component with user initials
- Color-coded background based on user ID
- Tooltip with full name and role
- Online/offline status indicator
- Presence list showing all active users
- Compact design for minimal screen space

---

## Requirements

### Functional Requirements

1. **Avatar Badge:**
   - Circular badge with user initials (1-2 characters)
   - Background color from user's assigned color
   - White text for contrast
   - Size: 32px (small), 40px (medium), 48px (large)

2. **Presence List:**
   - Vertical list of all active users
   - Show avatar, name, role badge
   - Online status indicator (green dot)
   - Current user highlighted/distinct
   - Sort by: local user first, then by name

3. **Role Badges:**
   - Owner: Crown icon or "Owner" label
   - Admin: Shield icon or "Admin" label
   - Editor: Pencil icon or "Editor" label
   - Viewer: Eye icon or "Viewer" label

### Non-Functional Requirements

- **Accessibility:** ARIA labels, keyboard navigation
- **Performance:** Minimal re-renders (React.memo)
- **Responsive:** Adapts to mobile/desktop layouts
- **Type Safety:** Full TypeScript coverage

---

## Architecture

### Component Hierarchy

```
DiagramEditor
└── PresenceList (floating panel or sidebar)
    └── UserAvatar (repeated per user)
        ├── Initials Badge
        ├── Status Indicator
        └── Tooltip (name + role)
```

### Visual Design

```
┌─────────────────────────┐
│  Active Users (3)       │
├─────────────────────────┤
│  👑 You (Owner)         │  ← Local user, highlighted
│  [JD] John Doe          │
├─────────────────────────┤
│  🛡️ Alice (Admin)       │  ← Remote user
│  [AS] Alice Smith       │
├─────────────────────────┤
│  👁️ Bob (Viewer)        │  ← Remote user
│  [BW] Bob Wilson        │
└─────────────────────────┘
```

---

## Related Code Files

### Files to Create

1. **`components/user-avatar.tsx`** (NEW)
   - Individual avatar component
   - ~100 lines

2. **`components/presence-list.tsx`** (NEW)
   - Container for all user avatars
   - ~80 lines

### Files to Modify

1. **`components/diagram-editor.tsx`** (MODIFY)
   - Add presence list to UI
   - Position as floating panel or sidebar

---

## Implementation Steps

### Step 1: Create User Avatar Component

**File:** `components/user-avatar.tsx` (NEW FILE)

```typescript
'use client'

import { memo } from 'react'
import { Crown, Shield, Eye, Pencil } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getContrastColor } from '@/lib/user-colors'
import type { UserPresence } from '@/hooks/use-user-presence'

type AppRole = 'owner' | 'admin' | 'editor' | 'viewer'

interface UserAvatarProps {
  user: UserPresence
  isLocalUser?: boolean
  size?: 'small' | 'medium' | 'large'
  showRoleBadge?: boolean
  showStatus?: boolean
}

const sizeClasses = {
  small: 'w-8 h-8 text-xs',
  medium: 'w-10 h-10 text-sm',
  large: 'w-12 h-12 text-base',
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  editor: Pencil,
  viewer: Eye,
}

/**
 * User avatar component showing initials with color-coded background.
 * Includes tooltip with full user info and role badge.
 */
export const UserAvatar = memo<UserAvatarProps>(
  ({
    user,
    isLocalUser = false,
    size = 'medium',
    showRoleBadge = true,
    showStatus = true,
  }) => {
    const { user: userInfo, color } = user
    const RoleIcon = roleIcons[userInfo.role]

    // Extract initials (max 2 characters)
    const initials = userInfo.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    const textColor = getContrastColor(color)
    const sizeClass = sizeClasses[size]

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`
                relative rounded-full font-semibold flex items-center justify-center
                ${sizeClass}
                ${isLocalUser ? 'ring-2 ring-offset-2 ring-primary' : ''}
                transition-all hover:scale-110 cursor-pointer
              `}
              style={{ backgroundColor: color, color: textColor }}
              aria-label={`${userInfo.name} (${userInfo.role})`}
            >
              {initials}

              {/* Online Status Indicator */}
              {showStatus && (
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                  aria-label="Online"
                />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="flex items-center gap-2">
              {showRoleBadge && (
                <RoleIcon className="w-4 h-4" aria-hidden="true" />
              )}
              <div>
                <p className="font-medium">
                  {userInfo.name}
                  {isLocalUser && ' (You)'}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {userInfo.role}
                </p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  },
)

UserAvatar.displayName = 'UserAvatar'
```

**Estimated:** 45 minutes

---

### Step 2: Create Presence List Component

**File:** `components/presence-list.tsx` (NEW FILE)

```typescript
'use client'

import { memo } from 'react'
import { Users } from 'lucide-react'
import { UserAvatar } from './user-avatar'
import type { UserPresence } from '@/hooks/use-user-presence'

interface PresenceListProps {
  users: UserPresence[]
  localUserId: string | null
  className?: string
}

/**
 * Presence list showing all active users in the collaborative session.
 * Displays avatars, names, roles, and online status.
 */
export const PresenceList = memo<PresenceListProps>(
  ({ users, localUserId, className = '' }) => {
    // Sort: local user first, then by name
    const sortedUsers = [...users].sort((a, b) => {
      if (a.user.id === localUserId) return -1
      if (b.user.id === localUserId) return 1
      return a.user.name.localeCompare(b.user.name)
    })

    if (users.length === 0) {
      return null
    }

    return (
      <div
        className={`
          bg-background border border-border rounded-lg shadow-lg
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Active Users ({users.length})
          </span>
        </div>

        {/* User List */}
        <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
          {sortedUsers.map((user) => (
            <div
              key={user.user.id}
              className={`
                flex items-center gap-3 px-2 py-2 rounded-md
                ${user.user.id === localUserId ? 'bg-accent' : 'hover:bg-muted'}
                transition-colors
              `}
            >
              <UserAvatar
                user={user}
                isLocalUser={user.user.id === localUserId}
                size="small"
                showRoleBadge={false}
                showStatus={false}
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.user.name}
                  {user.user.id === localUserId && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      (You)
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user.user.role}
                </p>
              </div>

              {/* Online Status */}
              <div
                className="w-2 h-2 bg-green-500 rounded-full"
                aria-label="Online"
              />
            </div>
          ))}
        </div>
      </div>
    )
  },
)

PresenceList.displayName = 'PresenceList'
```

**Estimated:** 30 minutes

---

### Step 3: Compact Avatar Stack (Optional Enhancement)

**File:** `components/user-avatar-stack.tsx` (NEW FILE - OPTIONAL)

Create a stacked avatar display for showing multiple users in a small space:

```typescript
'use client'

import { UserAvatar } from './user-avatar'
import type { UserPresence } from '@/hooks/use-user-presence'

interface UserAvatarStackProps {
  users: UserPresence[]
  localUserId: string | null
  maxVisible?: number
  size?: 'small' | 'medium'
}

/**
 * Stacked avatar display for compact user list.
 * Shows avatars overlapping horizontally.
 */
export function UserAvatarStack({
  users,
  localUserId,
  maxVisible = 4,
  size = 'small',
}: UserAvatarStackProps) {
  const visibleUsers = users.slice(0, maxVisible)
  const remainingCount = users.length - maxVisible

  return (
    <div className="flex items-center -space-x-2">
      {visibleUsers.map((user) => (
        <div
          key={user.user.id}
          className="rounded-full ring-2 ring-background"
          style={{ zIndex: users.indexOf(user) }}
        >
          <UserAvatar
            user={user}
            isLocalUser={user.user.id === localUserId}
            size={size}
            showRoleBadge={false}
            showStatus={false}
          />
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          className="
            w-8 h-8 rounded-full bg-muted text-muted-foreground
            flex items-center justify-center text-xs font-medium
            ring-2 ring-background
          "
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}
```

**Estimated:** 20 minutes (optional)

---

### Step 4: Integrate into Diagram Editor

**File:** `components/diagram-editor.tsx` (MODIFY)

Add presence list to the editor UI:

```typescript
'use client'

import { DrawIoEmbed } from 'react-drawio'
import { useDiagram } from '@/contexts/diagram-context'
import { PresenceList } from '@/components/presence-list'
import type { Locale } from '@/lib/i18n/config'

interface DiagramEditorProps {
  // ... existing props
  allUsers?: UserPresence[]  // ADD THIS
  localUserId?: string | null  // ADD THIS
}

export function DiagramEditor({
  // ... existing props
  allUsers = [],
  localUserId = null,
}: DiagramEditorProps) {
  // ... existing code

  return (
    <div className={`h-full relative ${isMobile ? 'p-1' : 'p-2'}`}>
      {/* Presence List - Top Right Corner */}
      {allUsers.length > 0 && (
        <div className="absolute top-4 right-4 z-40 w-64">
          <PresenceList
            users={allUsers}
            localUserId={localUserId}
          />
        </div>
      )}

      {/* Existing diagram content */}
      <div className="h-full rounded-xl overflow-hidden shadow-soft-lg border border-border/30 relative">
        {/* ... existing DrawIoEmbed and cursor layer */}
      </div>
    </div>
  )
}
```

**Estimated:** 15 minutes

---

## Todo List

- [ ] Step 1: Create `components/user-avatar.tsx`
- [ ] Step 2: Create `components/presence-list.tsx`
- [ ] Step 3: (Optional) Create `components/user-avatar-stack.tsx`
- [ ] Step 4: Update `components/diagram-editor.tsx` with presence list
- [ ] Step 5: Test avatar rendering with mock users
- [ ] Step 6: Verify tooltip interactions
- [ ] Step 7: Test responsive behavior on mobile
- [ ] Step 8: Verify role icons display correctly

---

## Success Criteria

- [ ] Avatar displays user initials (1-2 chars)
- [ ] Background color matches user's assigned color
- [ ] Text contrast is readable (white/dark based on bg)
- [ ] Tooltip shows full name and role
- [ ] Online status indicator (green dot) visible
- [ ] Local user highlighted with ring
- [ ] Presence list sorted correctly (local first)
- [ ] Role badges display appropriate icons
- [ ] Component is memoized to prevent re-renders

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Initials extraction fails | Low | Fallback to first character of name |
| Color contrast poor | Low | Use getContrastColor() utility |
| Too many users clutter UI | Medium | Add max-height + scroll, or limit visible |
| Performance with 20+ users | Low | React.memo prevents unnecessary re-renders |

---

## Security Considerations

- **User name sanitization:** Names already sanitized by Better Auth
- **Role display:** Show actual role from session (not user-provided)
- **No PII:** Only show name + role (no email/ID)

---

## Testing Strategy

### Unit Tests

```typescript
describe('UserAvatar', () => {
  it('extracts initials correctly')
  it('shows correct color')
  it('highlights local user')
  it('displays role icon')
})

describe('PresenceList', () => {
  it('sorts users correctly')
  it('shows user count')
  it('handles empty user list')
})
```

### Visual Tests

1. Test with 1, 5, 10+ users
2. Verify color contrast for all preset colors
3. Test tooltip positioning (edge cases)
4. Verify responsive layout on mobile

---

## Next Steps

After completing this phase:

1. **Phase 4:** Integrate all components with live data
2. **Phase 5:** Add "Follow User" feature (optional)
3. Deploy and test with real users

---

## Dependencies

- Phase 1 complete (presence tracking)
- `lucide-react` icons installed (already in dependencies)
- Tooltip components from shadcn/ui (check if available)

---

## Design Decisions

### Why Initials Instead of Avatars?

- YAGNI: User images not required for MVP
- Simpler implementation (no image uploads)
- Consistent sizing and appearance
- Works offline (no image loading issues)

### Why Circular Badge?

- Industry standard for collaborative apps (Google Docs, Figma)
- Space-efficient
- Easy to stack for compact display

### Why Show Roles?

- Helps identify who can edit vs. view-only
- Useful for permission awareness
- Minimal extra space (icon + text)

---

## Open Questions

### Question: Presence List Placement

Where should the presence list appear in the UI?

- [ ] Floating panel (top-right corner) - RECOMMENDED
- [ ] Sidebar (left or right)
- [ ] Collapsible drawer
- [ ] Bottom bar

**Recommendation:** Floating panel top-right (non-intrusive, easy to hide).

---

### Question: Avatar Stack vs Full List

For diagrams with 10+ users, should we:

- [ ] Always show full list with scroll
- [ ] Show avatar stack (compact) + expand on click
- [ ] Limit to 5 most recent + "N more" counter

**Recommendation:** Full list with scroll for MVP. Add stack in future if UX testing shows need.

---

### Question: Offline Users

Should we show users who were recently active but are now offline?

- [ ] No (only show currently online)
- [ ] Yes (with grayed out status)
- [ ] Show "Last seen X min ago" tooltip

**Recommendation:** No (YAGNI). Only show currently online users. Offline tracking adds complexity without clear benefit.
