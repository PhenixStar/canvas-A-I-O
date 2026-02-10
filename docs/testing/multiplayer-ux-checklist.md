# Multiplayer UX Testing Checklist

## Setup
- [ ] Start dev server: `npm run dev`
- [ ] Start WebSocket server: `npm run collab:server`
- [ ] Open 2 browser windows with same room ID (e.g., `?room=test-123`)

## Presence Features

### User Presence
- [ ] Both users appear in presence list
- [ ] Local user highlighted with ring/accent background
- [ ] User names display correctly
- [ ] Role badges show correct roles (admin, editor, viewer)

### Collaborative Cursors
- [ ] Remote cursor appears when user moves mouse over diagram
- [ ] Cursor color matches user's assigned color
- [ ] Cursor movement is smooth (60fps)
- [ ] Cursor name badge shows on hover
- [ ] Cursor disappears when user leaves room
- [ ] Multiple cursors render simultaneously

### Connection Status
- [ ] "Connecting..." status shows on join
- [ ] "Collaborating" status shows when ready
- [ ] Status badge color changes correctly (yellow → green)
- [ ] Presence badge shows correct user count

### Diagram Editing
- [ ] Both users can edit simultaneously
- [ ] Changes sync in <200ms
- [ ] No conflicts or data loss
- [ ] Cursor overlay doesn't block interactions
- [ ] Drawing works normally with cursors visible

### Performance
- [ ] No lag with 2 users
- [ ] No memory leaks after 5 minutes
- [ ] Cursor throttling works (100ms)
- [ ] Resize events update cursor positions correctly
- [ ] Scroll events update cursor positions correctly

### Edge Cases
- [ ] User refreshes page (reconnects successfully)
- [ ] User closes tab (disappears from list after ~30s)
- [ ] Network disconnect/reconnect handles gracefully
- [ ] Room ID changes (clears presence and reconnects)
- [ ] Multiple tabs open with different room IDs

## UI/UX Checks

### Presence Badge
- [ ] Badge shows correct user count
- [ ] Badge pulses when count changes
- [ ] Clicking badge expands presence list
- [ ] Clicking outside closes expanded list
- [ ] Badge positioned correctly (top-right)

### Presence List
- [ ] Local user appears first in list
- [ ] "You" label shown next to local user
- [ ] User avatars show correct colors
- [ ] Scrollable when many users (>5)
- [ ] Collapsible header works
- [ ] Online indicator (green dot) visible

### Cursor Layer
- [ ] Cursors don't interfere with diagram interaction
- [ ] Pointer events properly disabled on overlay
- [ ] Cursor arrows point correctly
- [ ] Name labels readable on any background

## Cleanup
- [ ] Close all browser windows
- [ ] Stop dev server (Ctrl+C)
- [ ] Stop WebSocket server (Ctrl+C)

## Known Limitations
- Anonymous users show as "Anonymous" if not logged in
- Cursor updates throttled to 100ms (10 updates/sec)
- Presence cleanup takes ~30s after tab close (Yjs timeout)
