# Phase 3: Multiplayer UX - Implementation Plan

**Created:** 2026-02-11
**Status:** Ready for Implementation
**Target:** Sprint 3 Real-time Collaboration - Week 8

---

## Overview

Implement real-time multiplayer UX features for canvas-A-I-O, enabling users to see each other's presence, cursors, and avatars while collaborating on diagrams.

### Current State

- **Phase 1 (CRDT):** Complete - Yjs integration working with diagram XML sync
- **Phase 2 (WebSocket Server):** Complete - Hocuspocus server configured for Railway deployment
- **Authentication:** Better Auth with session management
- **Diagram Editor:** react-drawio wrapper with CRDT sync

### Phase 3 Goal

Add real-time user presence UI:
1. Track online users using Yjs awareness
2. Render collaborative cursors for remote users
3. Display user avatars with consistent colors
4. (Optional) "Follow User" feature

### Success Criteria

- [ ] See other users' cursors moving in real-time
- [ ] User avatars display with unique colors
- [ ] Presence list shows all online users
- [ ] Cursors disappear when users leave
- [ ] No impact on diagram editing performance
- [ ] Works with 5+ concurrent users

---

## Phases

| Phase | Status | Description |
|-------|--------|-------------|
| [Phase 1](./phase-01-presence-tracking.md) | Pending | User presence hook & Yjs awareness |
| [Phase 2](./phase-02-cursor-rendering.md) | Pending | Collaborative cursor component |
| [Phase 3](./phase-03-avatars.md) | Pending | User avatars & color assignment |
| [Phase 4](./phase-04-integration.md) | Pending | Editor integration & testing |
| [Phase 5](./phase-05-follow-user.md) | Pending | Optional "Follow User" feature |

---

## Architecture

### Component Hierarchy

```
DiagramProvider
├── useCrdtDiagram (existing)
│   └── WebsocketProvider.awareness
└── useUserPresence (new)
    ├── UserAvatar (new)
    └── CollaborativeCursor (new)
```

### Data Flow

```
User moves mouse
    ↓
DiagramEditor (onMouseMove)
    ↓
useUserPresence (throttled)
    ↓
Yjs Awareness (broadcast)
    ↓
Remote clients receive
    ↓
CollaborativeCursor renders
```

### Key Technologies

- **Yjs Awareness:** Built-in presence API from `y-websocket`
- **React 19 Hooks:** State management for presence data
- **Tailwind CSS:** Styling for cursors and avatars
- **Color Hashing:** Consistent colors per user ID

---

## Files to Create

1. `hooks/use-user-presence.ts` - Presence tracking hook
2. `lib/user-colors.ts` - Color assignment utilities
3. `components/collaborative-cursor.tsx` - Cursor overlay component
4. `components/user-avatar.tsx` - Avatar badge component

## Files to Modify

1. `lib/crdt.ts` - Export awareness from connection
2. `hooks/use-crdt-diagram.ts` - Expose awareness to consumers
3. `contexts/diagram-context.tsx` - Add presence state
4. `components/diagram-editor.tsx` - Integrate cursor overlay

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Cursor overlay blocks diagram interactions | High | Medium | Use `pointer-events: none` on overlay |
| Performance degradation with 5+ users | Medium | Low | Throttle presence updates (100ms) |
| Inconsistent colors across clients | Low | Medium | Hash-based color assignment |
| react-drawio iframe blocks cursor overlay | High | High | Use parent container for cursor layer |

---

## Dependencies

- Phase 1 (CRDT) - Complete
- Phase 2 (WebSocket Server) - Complete
- Better Auth sessions - Working
- react-drawio wrapper - Working

---

## Estimated Timeline

- **Phase 1:** 2-3 hours (Presence hook)
- **Phase 2:** 2-3 hours (Cursor rendering)
- **Phase 3:** 1-2 hours (Avatars & colors)
- **Phase 4:** 2-3 hours (Integration & testing)
- **Phase 5:** 2-3 hours (Follow User - optional)

**Total:** 9-14 hours (without Phase 5: 7-11 hours)

---

## Next Steps

1. Review this plan and approve approach
2. Begin Phase 1: Presence tracking hook
3. Test with 2+ local browser windows
4. Iterate based on testing feedback

---

## Questions That Need Clarification

### Question 1: Cursor Position Mapping

**Issue:** react-drawio uses an iframe, which complicates cursor coordinate mapping.

**Recommended Solutions:**

- **Solution A:** Place cursor overlay in parent container, map coordinates relative to diagram container
  - Pros: Cleaner separation, doesn't interfere with iframe
  - Cons: May need offset calculations for scroll/zoom

- **Solution B:** Inject cursor overlay into the iframe (if Draw.io allows)
  - Pros: Exact coordinate mapping
  - Cons: May break if Draw.io changes structure, cross-origin issues

**Awaiting User Selection:**

```
Please select your preferred solution or provide other suggestions:
[ ] Solution A - Parent container overlay (RECOMMENDED)
[ ] Solution B - Inject into iframe
[ ] Other solution: _______________
```

---

### Question 2: Presence Update Throttling

**Issue:** Need to balance real-time feel with WebSocket performance.

**Recommended Solutions:**

- **Solution A:** 100ms throttle (10 updates/second per user)
  - Pros: Smooth cursor movement, reasonable bandwidth
  - Cons: May be overkill for slow mouse movements

- **Solution B:** 200ms throttle (5 updates/second)
  - Pros: Lower bandwidth, still feels real-time
  - Cons: Slightly less smooth

**Awaiting User Selection:**

```
Please select your preferred throttling interval:
[ ] Solution A - 100ms throttle (RECOMMENDED)
[ ] Solution B - 200ms throttle
[ ] Other interval: _____ ms
```

---

### Question 3: "Follow User" Feature Priority

**Issue:** Need to determine if "Follow User" should be included in initial implementation.

**Recommended Solutions:**

- **Solution A:** Implement in Phase 5 (after core features work)
  - Pros: Focus on MVP first, test thoroughly
  - Cons: Delays potentially useful feature

- **Solution B:** Skip for now, add in future sprint
  - Pros: Faster delivery of core presence features
  - Cons: Users can't follow others' viewports

**Awaiting User Selection:**

```
Should "Follow User" be included in this phase?
[ ] Solution A - Include Phase 5 (implement after core works)
[ ] Solution B - Skip for now, add in future sprint
```

---

## User Feedback Area

Please supplement your opinions and suggestions on the overall planning in this area:

```
User additional content:






```
