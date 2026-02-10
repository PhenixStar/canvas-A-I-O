# Research Report: Sprint 3 Phase 3 - Multiplayer UX

**Research Date:** 2026-02-11
**Researcher:** Planner Agent
**Project:** canvas-A-I-O (AIO Canvas)
**Phase:** Sprint 3 - Real-time Collaboration

---

## Executive Summary

Researched the existing canvas-A-I-O codebase to create a comprehensive implementation plan for Phase 3: Multiplayer UX features. Found that Phases 1 (CRDT) and 2 (WebSocket Server) are complete with Yjs integration and Hocuspocus server configured. Created a detailed 5-phase plan for implementing user presence tracking, collaborative cursors, avatars, editor integration, and optional "Follow User" feature.

---

## Current State Assessment

### Completed Components

1. **CRDT Integration** (`lib/crdt.ts`):
   - Yjs document setup complete
   - WebsocketProvider configured for room-based collaboration
   - IndexedDB persistence for offline support
   - Room ID normalization and WebSocket URL resolution utilities

2. **CRDT Hook** (`hooks/use-crdt-diagram.ts`):
   - React hook for diagram XML sync
   - Connection status tracking
   - Remote XML change handling
   - Local XML sync with Yjs shared text

3. **Diagram Context** (`contexts/diagram-context.tsx`):
   - Comprehensive context provider with diagram state
   - Auto-save, history, and recent files hooks integrated
   - Collaboration room detection from query params/env
   - Draw.io reference management

4. **Authentication** (`lib/auth.ts`, `lib/auth-client.ts`):
   - Better Auth with Drizzle adapter
   - Role-based access control (owner/admin/editor/viewer)
   - Session management configured

5. **Database Schema** (`lib/db/schema.ts`):
   - User, session, account tables
   - Yjs document and update log tables for persistence
   - Role field already defined on user table

### Key Findings

1. **Yjs Awareness Available:** The WebsocketProvider from `y-websocket` includes built-in awareness API for presence tracking
2. **No Awareness Export:** Current `CrdtConnection` interface doesn't expose awareness - needs to be added
3. **React 19 Hooks:** Codebase uses React 19, enabling modern hook patterns
4. **Motion Library:** Already installed for animations (useful for cursor transitions)
5. **Lucide Icons:** Available for role badge icons

---

## Technical Architecture

### Existing Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **CRDT:** Yjs 13.6.20, y-websocket 2.1.0, y-indexeddb 9.0.12
- **Auth:** Better Auth 1.4.18
- **Database:** PostgreSQL with Drizzle ORM
- **Diagram:** react-drawio wrapper
- **UI:** Tailwind CSS 4, shadcn/ui components (likely)
- **Animations:** Motion (Framer Motion)

### Multiplayer Data Flow

```
User Edit (Browser A)
    ↓
Yjs CRDT (sharedText.update)
    ↓
WebsocketProvider (broadcast)
    ↓
WebSocket Server (Hocuspocus)
    ↓
Other Clients (Browser B, C, ...)
    ↓
Yjs CRDT (merge without conflicts)
    ↓
React Re-render (diagram updates)
```

### Presence Data Flow

```
User Presence (awareness.setLocalState)
    ↓
Yjs Awareness (broadcast)
    ↓
WebSocket Server (propagate)
    ↓
Other Clients (awareness.on('change'))
    ↓
React Hook (update remoteUsers)
    ↓
Cursor Component (re-render)
```

---

## Implementation Strategy

### Phase Breakdown

**Phase 1: Presence Tracking** (2-3 hours)
- Create `hooks/use-user-presence.ts`
- Add awareness export to `lib/crdt.ts`
- Create `lib/user-colors.ts` for hash-based colors
- Expose awareness from `use-crdt-diagram.ts`

**Phase 2: Cursor Rendering** (2-3 hours)
- Create `components/collaborative-cursor.tsx`
- Create `components/collaborative-cursor-layer.tsx`
- Add mouse tracking to diagram editor
- Implement coordinate mapping for overlay

**Phase 3: Avatars & Presence List** (1-2 hours)
- Create `components/user-avatar.tsx`
- Create `components/presence-list.tsx`
- Add role badges with icons
- Create avatar stack (optional)

**Phase 4: Editor Integration** (2-3 hours)
- Update `contexts/diagram-context.tsx` with presence state
- Wire up `components/diagram-editor.tsx`
- Create testing checklist
- Deploy and test with multiple browsers

**Phase 5: Follow User** (2-3 hours, optional)
- Create `hooks/use-follow-user.ts`
- Create follow button component
- Add following indicator
- Implement auto-scroll logic

**Total Estimated Time:** 9-14 hours (core: 7-11 hours)

---

## Key Design Decisions

### Cursor Position Mapping

**Challenge:** react-drawio uses an iframe, complicating cursor positioning.

**Solution:** Place cursor overlay in parent container, map coordinates relative to diagram container using `getBoundingClientRect()`.

**Benefits:**
- Cleaner separation from iframe
- Doesn't interfere with Draw.io internals
- Works regardless of iframe cross-origin policies

**Risks:**
- Need to handle scroll/zoom offset calculations
- Coordinate mismatch if diagram scrolls

**Mitigation:** Use ResizeObserver and scroll listeners to track container bounds.

### Color Assignment

**Strategy:** Hash-based color generation from user ID.

**Implementation:** Simple hash function → index into predefined color palette (9 high-contrast colors).

**Benefits:**
- Consistent colors across sessions
- No server storage needed
- Accessible color palette (high contrast)

**Palette:**
```typescript
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
```

### Presence Update Throttling

**Strategy:** 100ms throttle (10 updates/second per user).

**Rationale:** Balances smooth cursor movement with bandwidth efficiency.

**Benefits:**
- Smooth 60fps rendering
- Reasonable WebSocket traffic
- Prevents spam on rapid mouse movement

**Alternative:** 200ms (5 updates/second) for lower bandwidth.

### Follow User (Optional)

**Approach:** Auto-scroll diagram to center followed user's cursor.

**Auto-unfollow Triggers:**
- User manually scrolls
- Followed user leaves room
- User clicks "Unfollow" button

**Known Limitation:** Draw.io iframe may complicate scroll injection.

---

## Open Questions for User

### 1. Cursor Position Mapping

Please select your preferred solution:

```
[ ] Solution A - Parent container overlay (RECOMMENDED)
    Pros: Cleaner separation, doesn't interfere with iframe
    Cons: May need offset calculations for scroll/zoom

[ ] Solution B - Inject into iframe
    Pros: Exact coordinate mapping
    Cons: May break if Draw.io changes structure, cross-origin issues

[ ] Other: _______________________
```

### 2. Presence Update Throttling

Please select your preferred throttling interval:

```
[ ] Solution A - 100ms throttle (RECOMMENDED)
    Pros: Smooth cursor movement, reasonable bandwidth
    Cons: May be overkill for slow mouse movements

[ ] Solution B - 200ms throttle
    Pros: Lower bandwidth, still feels real-time
    Cons: Slightly less smooth

[ ] Other interval: _____ ms
```

### 3. "Follow User" Feature Priority

Should "Follow User" be included in this phase?

```
[ ] Solution A - Include Phase 5 (implement after core works)
    Pros: Complete feature set in one sprint
    Cons: Additional 2-3 hours of development

[ ] Solution B - Skip for now, add in future sprint
    Pros: Faster delivery of core presence features
    Cons: Delays potentially useful feature
```

---

## Files to Create

1. `hooks/use-user-presence.ts` (~150 lines)
2. `lib/user-colors.ts` (~50 lines)
3. `components/collaborative-cursor.tsx` (~80 lines)
4. `components/collaborative-cursor-layer.tsx` (~60 lines)
5. `components/user-avatar.tsx` (~100 lines)
6. `components/presence-list.tsx` (~80 lines)
7. `components/follow-button.tsx` (~40 lines, optional)
8. `components/following-indicator.tsx` (~50 lines, optional)
9. `hooks/use-follow-user.ts` (~80 lines, optional)
10. `scripts/test-local-multiplayer.sh` (~20 lines)

## Files to Modify

1. `lib/crdt.ts` - Add awareness export
2. `hooks/use-crdt-diagram.ts` - Expose awareness
3. `contexts/diagram-context.tsx` - Add presence state
4. `components/diagram-editor.tsx` - Integrate all components

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Cursor overlay blocks diagram interactions | High | Medium | Use `pointer-events: none` |
| Performance degradation with 5+ users | Medium | Low | Throttle updates (100ms) |
| Inconsistent colors across clients | Low | Medium | Hash-based color assignment |
| react-drawio iframe blocks cursor overlay | High | High | Use parent container approach |
| Context re-render loop | High | Low | Use useMemo for stable references |
| Memory leak from awareness listeners | Medium | Low | Ensure cleanup in useEffect |

---

## Success Criteria

### Must Have (Phases 1-4)

- [ ] See other users' cursors moving in real-time
- [ ] User avatars display with unique colors
- [ ] Presence list shows all online users
- [ ] Cursors disappear when users leave
- [ ] No impact on diagram editing performance
- [ ] Works with 5+ concurrent users
- [ ] <200ms sync latency measured
- [ ] 2+ users can edit simultaneously without conflicts

### Nice to Have (Phase 5)

- [ ] "Follow User" feature works smoothly
- [ ] Auto-scroll keeps followed user in view
- [ ] Manual scroll stops following
- [ ] Visual indicator shows following state

---

## Testing Strategy

### Local Testing

1. **Setup:**
   - Start dev server: `npm run dev`
   - Start WebSocket server: `npm run collab:server`
   - Open 2 browser windows with same room ID

2. **Verify:**
   - User B sees User A's cursor
   - Presence list shows both users
   - Edits sync between windows
   - Cursors disappear on leave

### Load Testing

- Open 5+ browser windows
- Move mouse in each window
- Verify all cursors render smoothly
- Check performance (Chrome DevTools)

---

## Next Steps

1. **User Review:** Review this plan and answer open questions
2. **Implementation:** Begin Phase 1 (Presence Tracking)
3. **Testing:** Test locally with 2+ browsers after Phase 4
4. **Deployment:** Deploy to staging, then production

---

## References

### Yjs Documentation
- [Yjs Docs](https://docs.yjs.dev/)
- [Yjs Awareness API](https://docs.yjs.dev/api/awareness)

### Multiplayer UX Examples
- [Tiptap Collaboration](https://tiptap.dev/product/collaboration)
- [React Flow Multiplayer](https://reactflow.dev/learn/advanced-use/multiplayer)
- [Liveblocks Multiplayer](https://liveblocks.io/multiplayer)

### Internal PRD
- `docs/prds/sprint3-realtime-collaboration.md` (lines 151-181)

---

## Appendix: Codebase Structure

```
canvas-A-I-O/
├── lib/
│   ├── crdt.ts                 # Yjs integration
│   ├── auth.ts                 # Better Auth server config
│   ├── auth-client.ts          # Better Auth client
│   ├── db/
│   │   ├── index.ts            # Database client
│   │   └── schema.ts           # Drizzle schema
│   └── user-colors.ts          # NEW: Color utilities
├── hooks/
│   ├── use-crdt-diagram.ts     # CRDT hook
│   ├── use-user-presence.ts    # NEW: Presence hook
│   └── use-follow-user.ts      # NEW: Follow hook (optional)
├── contexts/
│   └── diagram-context.tsx     # Diagram state provider
├── components/
│   ├── diagram-editor.tsx      # Main editor component
│   ├── collaborative-cursor.tsx        # NEW: Cursor component
│   ├── collaborative-cursor-layer.tsx  # NEW: Cursor container
│   ├── user-avatar.tsx         # NEW: Avatar badge
│   ├── presence-list.tsx       # NEW: User list
│   ├── follow-button.tsx       # NEW: Follow toggle (optional)
│   └── following-indicator.tsx # NEW: Follow banner (optional)
└── scripts/
    └── test-local-multiplayer.sh       # NEW: Testing script
```

---

**End of Research Report**
