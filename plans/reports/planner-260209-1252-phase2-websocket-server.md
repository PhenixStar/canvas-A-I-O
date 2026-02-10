# Planner Report: Phase 2 WebSocket Server Implementation Plan

**Date:** 2026-02-09
**Project:** Canvas AIO - Sprint 3 Real-time Collaboration
**Phase:** Phase 2 - WebSocket Server
**Status:** ✅ Planning Complete

---

## Executive Summary

A comprehensive implementation plan has been created for **Phase 2: WebSocket Server**, a critical component of Sprint 3's real-time collaboration features. The plan covers the deployment of a production-ready Hocuspocus WebSocket server that integrates with Better Auth for authentication and PostgreSQL for CRDT document persistence.

### Key Deliverables

1. **Detailed Implementation Plan** (`phase-02-websocket-server.md`)
   - 11-step implementation over 10 days
   - Complete code examples for all components
   - Testing and load testing strategies
   - Risk assessment and mitigation strategies

2. **Deployment Guide** (`phase-02-deployment.md`)
   - Complete VPS deployment procedures
   - PM2 and Nginx configuration
   - Monitoring and maintenance procedures
   - Troubleshooting and rollback procedures

3. **Overview Document** (`plan.md`)
   - High-level architecture overview
   - Success metrics and criteria
   - Technical stack details
   - Phase dependencies

---

## Planning Overview

### Scope

The WebSocket server implementation includes:

**Core Components:**
- Hocuspocus server configuration (port 3001)
- Better Auth session validation middleware
- PostgreSQL persistence adapter for Yjs documents
- PM2 process management
- Nginx reverse proxy configuration
- Health check endpoint (port 3002)

**Integration Points:**
- Better Auth sessions (existing from Sprint 2)
- PostgreSQL database (existing schema)
- Yjs client from Phase 1
- RBAC permission system (existing)

### Timeline

**Total Duration:** 10 working days

**Breakdown:**
- Days 1-2: Core setup and database schema
- Days 3-4: Authentication middleware
- Days 5-6: Database adapter implementation
- Days 7-8: Server configuration and deployment
- Days 9-10: Testing and load testing

### Resource Requirements

**Development:**
- 1 Full-stack developer (Node.js/TypeScript)
- Code reviewer for approval
- QA tester for validation

**Infrastructure:**
- VPS: sgp1-02 (209.38.58.83:2222)
- PostgreSQL database (existing)
- PM2 process manager
- Nginx reverse proxy

**Dependencies:**
- Better Auth sessions (Sprint 2) ✅
- PostgreSQL schema (RBAC) ✅
- Phase 1 Yjs client ✅

---

## Architecture Decisions

### 1. Separate Node.js Server

**Decision:** Deploy WebSocket server as separate Node.js process, not via Next.js API routes.

**Rationale:**
- Next.js API routes are serverless (unsuitable for persistent WebSocket)
- Independent scaling and deployment
- Better control over connection lifecycle
- Easier debugging and monitoring

**Trade-offs:**
- Additional deployment complexity
- Need PM2 for process management
- Separate monitoring required

### 2. Hocuspocus Framework

**Decision:** Use Hocuspocus server framework for WebSocket implementation.

**Rationale:**
- Built-in Yjs integration
- Extension architecture for auth/persistence
- Production-ready with enterprise support
- Active community and documentation

**Trade-offs:**
- Learning curve for custom extensions
- Less flexibility than raw WebSocket

### 3. PostgreSQL Persistence

**Decision:** Use PostgreSQL with custom DatabaseAdapter for Yjs document storage.

**Rationale:**
- Integrates with existing database
- Better Auth already uses PostgreSQL
- Transactional integrity
- No additional infrastructure (Redis)

**Trade-offs:**
- Need to implement custom adapter
- Slower than Redis for high-frequency writes
- Need debouncing to prevent excessive writes

---

## Technical Specifications

### Technology Stack

**Core Dependencies:**
- `@hocuspocus/server` ^2.13.4
- `@hocuspocus/transformer` ^2.0.0
- `better-auth` ^1.4.18
- `pg` ^8.18.0
- `drizzle-orm` ^2.45.1

**Additional Dependencies:**
- `ws` - WebSocket library
- `winston` or `pino` - Logging
- `pm2` - Process management
- `tsx` - TypeScript execution

### Database Schema

**New Tables:**

```sql
CREATE TABLE yjs_document (
  id TEXT PRIMARY KEY,
  data BYTEA NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE yjs_update_log (
  id BIGSERIAL PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES yjs_document(id) ON DELETE CASCADE,
  update BYTEA NOT NULL,
  user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Server Configuration

**Ports:**
- 3001: WebSocket server
- 3002: Health check endpoint

**Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `WS_PORT` - WebSocket server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level (info/debug/error)
- `BETTER_AUTH_SECRET` - Auth secret key
- `BETTER_AUTH_URL` - Base URL for auth

---

## Implementation Approach

### Step-by-Step Process

**Step 1: Setup (Day 1)**
- Install dependencies
- Create database schema
- Run migrations
- Verify setup

**Step 2: Authentication (Days 2-3)**
- Implement session token extraction
- Validate Better Auth sessions
- Test authentication flow
- Handle edge cases

**Step 3: Persistence (Days 4-5)**
- Create DatabaseAdapter extension
- Implement document load/save
- Add debouncing logic
- Test persistence

**Step 4: Server Configuration (Days 6-7)**
- Create main WebSocket server
- Configure Hocuspocus
- Add logging
- Implement health checks

**Step 5: Deployment (Days 8-9)**
- Configure PM2
- Setup Nginx reverse proxy
- Deploy to VPS
- Verify deployment

**Step 6: Testing (Day 10)**
- Unit tests
- Integration tests
- Load tests
- Bug fixes

### Code Quality Standards

**TypeScript:**
- Strict mode enabled
- No `any` types
- Proper error handling
- Comprehensive type definitions

**Testing:**
- Unit tests for all utilities
- Integration tests for workflows
- Load tests for performance
- Manual testing for UX

**Documentation:**
- Inline code comments
- API documentation
- Deployment procedures
- Troubleshooting guides

---

## Risk Assessment

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Better Auth session extraction fails | HIGH | MEDIUM | Test early; document session format; implement fallback |
| Yjs binary data corruption | CRITICAL | LOW | Checksum validation; backup/restore; extensive testing |
| WebSocket memory leak | HIGH | MEDIUM | Memory profiling; document GC; PM2 monitoring; max_memory_restart |
| Nginx drops connections | HIGH | LOW | Thorough config testing; increase timeouts; monitor logs |
| PostgreSQL write bottleneck | MEDIUM | LOW | Debouncing (1s); batch writes; query optimization; indexing |

### Deployment Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| VPS firewall blocks ports | HIGH | LOW | Check firewall rules; document ports; test locally first |
| PM2 misconfigured | HIGH | LOW | Setup script; installation docs; test commands |
| Nginx syntax error | MEDIUM | LOW | Always run `nginx -t`; backup config; test staging |
| Environment variables missing | HIGH | MEDIUM | Use `.env.example`; validate on startup; document all vars |
| Database migration fails | CRITICAL | LOW | Test locally first; backup before migration; use transactions |

---

## Success Criteria

### Functional Requirements

- [ ] WebSocket server accepts connections on port 3001
- [ ] Valid Better Auth sessions can connect
- [ ] Invalid/expired sessions are rejected (401)
- [ ] Yjs document state persists to PostgreSQL
- [ ] Document state loads correctly after server restart
- [ ] Permission checks prevent unauthorized room access
- [ ] Health check endpoint returns correct status

### Non-Functional Requirements

- [ ] <200ms sync latency for 5 concurrent users
- [ ] Server handles 100+ concurrent connections
- [ ] Zero data loss on server restart
- [ ] Graceful handling of malformed CRDT updates
- [ ] PM2 keeps server running (auto-restart on crash)
- [ ] Nginx reverse proxy works correctly
- [ ] Memory usage stable over time (no leaks)

### Integration Requirements

- [ ] Works with Phase 1 Yjs client (`y-websocket`)
- [ ] Uses existing Better Auth session format
- [ ] Integrates with existing PostgreSQL schema
- [ ] Compatible with existing RBAC system
- [ ] Health check endpoint accessible

### Security Requirements

- [ ] All connections authenticated (no anonymous access)
- [ ] Session tokens validated on every connection
- [ ] Diagram access permissions enforced
- [ ] Invalid sessions rejected immediately
- [ ] Security events logged (denials, failures)

---

## Performance Targets

### Concurrency
- **Target:** 5+ concurrent users (Phase 2 goal)
- **Maximum:** 100 concurrent connections (server capacity)
- **Future:** Redis pub/sub for horizontal scaling (50+ users)

### Latency
- **Target:** <200ms sync latency (end-to-end)
- **Authentication:** <50ms session validation
- **Document Load:** <100ms initial load
- **Database Write:** <50ms (with debouncing)

### Reliability
- **Uptime:** 99.9% (43 min/month downtime)
- **Data Loss:** Zero (with persistence)
- **Auto-restart:** <5s recovery time
- **Graceful Degradation:** Continue under high load

---

## Testing Strategy

### Unit Tests

**Components:**
- Auth middleware (token extraction, validation)
- DatabaseAdapter (load, save, debouncing)
- Permission checks (diagram access)
- Logger (formatting, levels)

**Coverage Target:** 80%

### Integration Tests

**Scenarios:**
- Valid session connection
- Invalid session rejection
- Document persistence cycle
- Permission enforcement
- Multi-user sync

**Tools:** Vitest, Playwright

### Load Tests

**Metrics:**
- 5 concurrent users (target)
- 100 updates/second per user
- Memory usage over time
- Connection churn

**Tools:** Custom load test script, k6

### Manual Tests

**Workflows:**
- Browser connection with valid session
- Browser rejection with invalid session
- Document creation and editing
- Server restart recovery
- Multi-user collaboration (3 windows)

---

## Deployment Plan

### Pre-Deployment

- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] Documentation complete
- [ ] Environment variables documented
- [ ] Database backup created
- [ ] Rollback plan prepared

### Deployment Steps

1. **VPS Setup** (30 min)
   - Install PM2
   - Configure firewall
   - Verify PostgreSQL
   - Create directories

2. **Code Deployment** (30 min)
   - Build TypeScript
   - Upload to VPS
   - Install dependencies
   - Verify files

3. **Database Migration** (15 min)
   - Create backup
   - Run migration
   - Verify schema
   - Test queries

4. **Server Start** (15 min)
   - Configure PM2
   - Start server
   - Verify logs
   - Check status

5. **Nginx Configuration** (30 min)
   - Update config
   - Test syntax
   - Reload Nginx
   - Verify proxy

6. **Verification** (30 min)
   - Health check
   - WebSocket connection
   - Authentication test
   - Multi-user test

**Total Deployment Time:** ~3 hours

### Post-Deployment

- [ ] PM2 monitoring active
- [ ] Logs being collected
- [ ] Health check accessible
- [ ] Memory usage stable
- [ ] CPU usage normal
- [ ] Alerts configured

---

## Open Questions

### 1. Database Storage Format

**Question:** What format to use for Yjs document storage in PostgreSQL?

**Options:**
- A) Binary blob (BYTEA) - Recommended
- B) Base64-encoded text (TEXT)
- C) Incremental updates only

**Status:** Awaiting user selection

**Recommendation:** Option A (binary blob) for best performance and simplicity.

---

### 2. Document Naming Convention

**Question:** Should room identifiers include additional prefixes or metadata?

**Current Plan:** `diagram-{diagramId}`

**Considerations:**
- Include user ID for isolation?
- Use UUIDs without prefix?
- Handle shared vs. private diagrams?

**Status:** Awaiting user input

---

### 3. Health Check Endpoint Port

**Question:** Should health check use separate port or share with WebSocket?

**Options:**
- A) Separate port 3002 - Recommended
- B) Same port 3001 with HTTP fallback
- C) Via Next.js API route

**Status:** Awaiting user selection

**Recommendation:** Option A (separate port) for clean separation and independent firewalling.

---

## Next Steps

### Immediate Actions

1. **Review Planning Documents** (Day 0)
   - Stakeholder review of plan.md
   - Technical review of implementation details
   - Approval to proceed

2. **Address Open Questions** (Day 0)
   - Get user input on storage format
   - Confirm naming conventions
   - Approve health check approach

3. **Setup Development Environment** (Day 1)
   - Install dependencies
   - Create database schema
   - Verify Better Auth integration

4. **Begin Implementation** (Day 1-10)
   - Follow detailed implementation plan
   - Daily progress updates
   - Code reviews at checkpoints

### Post-Phase 2

**Phase 3: Multiplayer UX** (Week 8)
- User presence indicators
- Multiplayer cursors
- User avatars
- Color assignment

**Phase 4: Offline Sync** (Week 9)
- y-indexeddb configuration
- Offline indicators
- Reconnection logic
- Sync status badges

---

## Recommendations

### Technical Recommendations

1. **Start Simple:** Implement basic WebSocket server first, add features incrementally
2. **Test Early:** Set up testing infrastructure from day 1, not as afterthought
3. **Monitor Continuously:** Setup PM2 monitoring and logging before going live
4. **Document Everything:** Keep runbook updated with learnings from deployment

### Process Recommendations

1. **Code Reviews:** Required for all WebSocket server code
2. **Staging Environment:** Test deployment on staging VPS before production
3. **Incremental Rollout:** Start with small user group, expand gradually
4. **Performance Baseline:** Measure baseline metrics, track changes

### Risk Mitigation

1. **Backup Strategy:** Daily automated backups of database and code
2. **Rollback Plan:** Documented rollback procedures for each deployment step
3. **Monitoring Alerts:** Setup alerts for crashes, high memory, failed connections
4. **Security Review:** Have security review authentication and permission logic

---

## Conclusion

The Phase 2 WebSocket Server implementation plan is **complete and ready for execution**. All necessary documentation has been created, including:

- ✅ Detailed implementation guide with code examples
- ✅ Deployment procedures for VPS
- ✅ Testing strategies and acceptance criteria
- ✅ Risk assessment and mitigation strategies
- ✅ Troubleshooting guides and rollback procedures

The plan follows YAGNI/KISS/DRY principles and integrates seamlessly with existing Canvas AIO architecture. With 10-day timeline and clear success criteria, the implementation is well-scoped and achievable.

**Status:** Ready for implementation pending stakeholder approval and open question resolution.

---

## Documents Created

1. **`plans/260209-1252-phase2-websocket-server/plan.md`**
   - Overview and context
   - Architecture overview
   - Success metrics
   - Key decisions

2. **`plans/260209-1252-phase2-websocket-server/phase-02-websocket-server.md`**
   - 11-step implementation plan
   - Complete code examples
   - Testing strategies
   - Risk assessment
   - Open questions

3. **`plans/260209-1252-phase2-websocket-server/phase-02-deployment.md`**
   - Complete deployment guide
   - VPS setup procedures
   - PM2 and Nginx configuration
   - Monitoring and maintenance
   - Troubleshooting procedures

4. **`plans/reports/planner-260209-1252-phase2-websocket-server.md`** (this file)
   - Executive summary
   - Planning overview
   - Recommendations
   - Next steps

---

**Planner:** Sonnet 4.5 (planner agent)
**Date:** 2026-02-09
**Status:** Planning Complete ✅
