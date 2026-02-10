# Sprint 3: Real-time Collaboration - PRD

**Created:** 2026-02-09
**Status:** Draft - Pending Review
**Target:** Weeks 6-9 of Phase 4 Enterprise Features

---

## Problem Statement

Current canvas-A-I-O is single-user only. Multiple users cannot collaborate on the same diagram simultaneously. Need real-time sync with conflict-free editing.

---

## Solution Overview

Implement CRDT-based real-time collaboration using:
- **Yjs** for conflict-free sync (CRDT engine)
- **WebSocket server** for real-time propagation
- **y-indexeddb** for offline persistence
- **React hooks** for cursor/presence UI

**Targets:**
- 5+ concurrent users
- <200ms sync latency
- Seamless online/offline transitions

---

## Technical Architecture

```
Client A (Yjs + React) ──┐
Client B (Yjs + React) ──┼──► WebSocket Server ──► PostgreSQL
Client C (Yjs + React) ──┘       (Hocuspocus)        (persistence)
                                      │
                                      ▼
                               Better Auth
                               (session validation)
```

### Data Flow

1. **Local Edit:** User edits diagram → Yjs CRDT update
2. **Sync:** Yjs broadcasts via WebSocket
3. **Server:** Hocuspocus validates auth, propagates to other clients
4. **Receive:** Other clients apply CRDT update (merge without conflicts)
5. **Persist:** Server saves to PostgreSQL periodically
6. **Offline:** y-indexeddb stores local updates, syncs on reconnect

---

## Implementation Phases

### Phase 1: Core CRDT Integration (Week 6)

**Goal:** Yjs + draw.io XML sync working

**Tasks:**
- [ ] Install dependencies: `yjs`, `y-indexeddb`, `y-websocket`, `@hocuspocus/server`
- [ ] Create `lib/crdt.ts` - Yjs document initialization
- [ ] Create `hooks/use-crdt-diagram.ts` - React hook for diagram sync
- [ ] Integrate with existing diagram state
- [ ] Test: Two browsers editing same diagram → sync works

**Key Files:**
- `lib/crdt.ts` - Yjs provider, WebSocket setup
- `hooks/use-crdt-diagram.ts` - `useSyncedStore()` pattern
- `components/diagram-editor.tsx` - Integrate CRDT hook

**Dependencies:**
```json
{
  "yjs": "^13.6.20",
  "y-indexeddb": "^9.0.12",
  "y-websocket": "^2.0.4",
  "@hocuspocus/server": "^2.13.4",
  "@hocuspocus/transformer": "^2.0.0"
}
```

**Code Pattern:**
```typescript
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'

const doc = new Y.Doc()
const wsProvider = new WebsocketProvider(
  'ws://localhost:3001',
  'diagram-room-id',
  doc
)
const indexeddbProvider = new IndexeddbPersistence(
  'diagram-room-id',
  doc
)
```

---

### Phase 2: WebSocket Server (Week 7)

**Goal:** Authenticated WebSocket server for production

**Architecture Decision:** Separate Node.js server (not Next.js API routes)

**Rationale:**
- Next.js API routes are serverless (not suitable for persistent WebSocket)
- Separate server = better control, easier scaling
- Can run on different port (3001)

**Tasks:**
- [ ] Create `server/websocket-server.ts` - Hocuspocus server
- [ ] Implement Better Auth session validation
- [ ] Add PostgreSQL adapter for document persistence
- [ ] Configure VPS deployment (pm2 process management)
- [ ] Test: 5 concurrent users, <200ms sync

**Key Files:**
- `server/websocket-server.ts` - Hocuspocus config
- `server/auth-middleware.ts` - Better Auth validation
- `server/DatabaseAdapter.ts` - PostgreSQL persistence

**Server Code:**
```typescript
import { Server } from '@hocuspocus/server'
import { DatabaseAdapter } from './DatabaseAdapter'
import { verifyAuth } from './auth-middleware'

const server = Server.configure({
  port: 3001,
  authenticate: async (token) => {
    const session = await verifyAuth(token)
    return session ? { user: session.user } : null
  },
  extensions: [
    new DatabaseAdapter({ pg: pool })
  ]
})

server.listen()
```

**Deployment:**
- Use PM2: `pm2 start server/websocket-server.ts --name canvas-ws`
- Nginx reverse proxy: `ws://209.38.58.83:3001`

---

### Phase 3: Multiplayer UX (Week 8)

**Goal:** User presence, cursors, selections

**Tasks:**
- [ ] Create `hooks/use-user-presence.ts` - Track online users
- [ ] Create `components/collaborative-cursor.tsx` - Remote cursor rendering
- [ ] Create `components/user-avatar.tsx` - User presence badges
- [ ] Add color assignment per user
- [ ] Add "Follow User" feature (optional)

**Key Files:**
- `hooks/use-user-presence.ts` - `useAwareness()` from Yjs
- `components/collaborative-cursor.tsx` - Cursor SVG overlay
- `components/user-avatar.tsx` - Avatar + name tooltip

**Presence Data:**
```typescript
interface UserPresence {
  user: { id: string; name: string; role: AppRole }
  cursor: { x: number; y: number } | null
  selection: string[] | null  // selected element IDs
  color: string  // unique color per user
}
```

**UX Libraries to Study:**
- [Tiptap Collaboration](https://tiptap.dev/product/collaboration) - Reference patterns
- [React Flow Multiplayer](https://reactflow.dev/learn/advanced-use/multiplayer) - Diagram-specific
- [Liveblocks Multiplayer](https://liveblocks.io/multiplayer) - Platform example

---

### Phase 4: Offline Sync & Polish (Week 9)

**Goal:** Seamless offline/online, production-ready

**Tasks:**
- [ ] Configure y-indexeddb for automatic persistence
- [ ] Add reconnection handlers (exponential backoff)
- [ ] Add offline indicator UI
- [ ] Add sync status badges (syncing/synced/conflict)
- [ ] Performance testing (1000+ node diagrams)
- [ ] Load testing (10 concurrent users)

**Offline Flow:**
```
User goes offline:
  1. y-indexeddb continues storing updates
  2. UI shows "Offline" badge
  3. Edits queued locally

User reconnects:
  1. WebSocket reconnects
  2. Yjs syncs pending updates
  3. Server merges CRDT (no conflicts)
  4. UI shows "Synced"
```

**Performance Targets:**
- <100ms local updates (CRDT merge)
- <200ms remote sync (WebSocket RTT)
- <50MB memory for 1000-node diagram
- Support 10+ concurrent users

---

## Security Considerations

1. **WebSocket Authentication:**
   - Validate Better Auth session on connection
   - Reject unauthenticated WebSocket connections
   - Check diagram read permissions via RBAC

2. **Room Isolation:**
   - Room ID = diagram ID (random UUID)
   - Users can only join rooms for diagrams they have access to
   - Server validates `requirePermission('diagram', 'view')`

3. **Rate Limiting:**
   - Max 100 updates/second per connection
   - Drop excessive updates to prevent spam

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Yjs XML handling incompatible | High | Medium | Prototype Phase 1 early; fallback to JSON if needed |
| WebSocket scaling issues | High | Low | Use Redis pub/sub for multi-server; start single-server |
| Offline sync conflicts | Medium | Low | CRDT handles most; user prompt for rare conflicts |
| Performance degradation | Medium | Medium | Load testing early; optimize large diagrams |
| Auth integration complexity | Medium | Low | Better Auth has session hooks; use existing patterns |

---

## Testing Strategy

### Unit Tests
- CRDT merge logic (various conflict scenarios)
- Offline queue operations
- Auth middleware validation

### Integration Tests
- 2-client sync (manual test)
- 5-client sync (automated with Playwright)
- Offline → online transition

### Load Tests
- 10 concurrent users
- 1000-node diagram sync performance
- WebSocket connection churn

---

## Success Criteria

- [ ] 2+ users can edit same diagram simultaneously
- [ ] Edits sync in <200ms (measured)
- [ ] No data loss on offline/online transition
- [ ] Authenticated users only (Better Auth validated)
- [ ] Works with existing RBAC (diagram permissions)
- [ ] Performance acceptable on 1000-node diagrams
- [ ] Deployed to production VPS

---

## Open Questions

1. **Draw.io XML compatibility:** Does Yjs XmlFragment handle complex draw.io XML?
   - **Action:** Prototype Phase 1 with real diagram XML

2. **PostgreSQL schema:** How to store Yjs documents in PostgreSQL?
   - **Options:** Binary blobs vs. JSONB vs. Yjs DB adapter
   - **Decision:** Use Hocuspocus PostgreSQL adapter

3. **Scaling beyond 1 server:** When to add Redis pub/sub?
   - **Decision:** Defer until >50 concurrent users

---

## Dependencies

- Sprint 2 (RBAC) must be complete ✓
- PostgreSQL schema pushed (pending)
- Better Auth sessions working ✓

---

## Sources

### Yjs & CRDT
- [Yjs Documentation](https://docs.yjs.dev/)
- [Yjs GitHub](https://github.com/yjs/yjs)
- [Yjs XmlFragment Discussion](https://discuss.yjs.dev/t/best-way-to-communicate-xmlfragment/2298)
- [Building Collaborative App with Yjs + Next.js](https://medium.com/@connect.hashblock/from-zero-to-real-time-building-a-live-collaboration-tool-with-yjs-and-next-js-e82eadccd828)

### WebSocket & Server
- [Hocuspocus Server](https://tiptap.dev/hocuspocus)
- [WebSocket Chat in Next.js](https://mandeepsingh.hashnode.dev/websocket-chat-in-nextjs)
- [Better Auth](https://www.better-auth.com/)

### Offline Sync
- [Yjs Offline Support](https://docs.yjs.dev/getting-started/allowing-offline-editing)
- [y-indexeddb Issues - Sync Problems](https://github.com/y-js/y-indexeddb/issues/5)
- [Offline-first Frontend 2025](https://blog.logrocket.com/offline-firstfrontend-apps-2025-indexeddb-sqlite/)

### Multiplayer UX
- [Liveblocks Multiplayer](https://liveblocks.io/multiplayer)
- [Tiptap Collaboration](https://tiptap.dev/product/collaboration)
- [React Flow Multiplayer](https://reactflow.dev/learn/advanced-use/multiplayer)
- [How Google Docs Shows Cursors](https://javascript.plainenglish.io/how-google-docs-shows-other-peoples-cursor-in-real-time-fe0f83cfb4ca)
- [Build Collaborative Whiteboard with Supabase](https://dev.to/keyurparalkar/mastering-real-time-collaboration-building-figma-and-miro-inspired-features-with-supabase-57eh)

---

**Next:** Review PRD with user → Approval → Implementation Phase 1
