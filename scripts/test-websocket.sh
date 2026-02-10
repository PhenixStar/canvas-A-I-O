#!/usr/bin/env bash
set -euo pipefail

WS_URL="${WS_URL:-ws://localhost:3001}"
HEALTH_URL="${WS_HEALTH_URL:-http://localhost:3002/health}"

printf "Checking health endpoint: %s\n" "$HEALTH_URL"
curl --silent --show-error --fail "$HEALTH_URL" >/tmp/canvas-ws-health.json
cat /tmp/canvas-ws-health.json
printf "\n"

printf "Checking unauthenticated WebSocket rejection: %s\n" "$WS_URL"
node <<'NODE'
const WebSocket = require('ws')
const Y = require('yjs')
const { WebsocketProvider } = require('y-websocket')

const wsUrl = process.env.WS_URL || 'ws://localhost:3001'
const room = 'ws-auth-smoke-test'
const doc = new Y.Doc()
const provider = new WebsocketProvider(wsUrl, room, doc, {
  WebSocketPolyfill: WebSocket,
})

const timeout = setTimeout(() => {
  provider.destroy()
  doc.destroy()
  console.error('Timed out waiting for auth rejection')
  process.exit(1)
}, 8000)

provider.on('status', ({ status }) => {
  console.log(`Provider status: ${status}`)
})

provider.on('connection-close', (event) => {
  clearTimeout(timeout)
  provider.destroy()
  doc.destroy()

  const code = event?.code ?? 0
  const reason = event?.reason ? event.reason.toString() : ''
  console.log(`Closed with code=${code} reason=${reason}`)

  if (code === 4401 || code === 4403 || code === 1008) {
    console.log('PASS: unauthenticated connection was rejected')
    process.exit(0)
  }

  console.error('Unexpected close code for unauthenticated request')
  process.exit(1)
})

provider.on('connection-error', (error) => {
  clearTimeout(timeout)
  provider.destroy()
  doc.destroy()
  console.error('WebSocket connection error:', error)
  process.exit(1)
})
NODE

printf "All websocket smoke checks passed.\n"
