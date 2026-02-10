import WebSocket from "ws"
import { WebsocketProvider } from "y-websocket"
import * as Y from "yjs"

const CONCURRENT_USERS = Number.parseInt(
    process.env.CONCURRENT_USERS || "5",
    10,
)
const UPDATES_PER_USER = Number.parseInt(
    process.env.UPDATES_PER_USER || "20",
    10,
)
const ROOM_ID = process.env.ROOM_ID || "load-test-room"
const WS_URL = process.env.WS_URL || "ws://localhost:3001"
const AUTH_TOKEN = process.env.AUTH_TOKEN || ""
const UPDATE_DELAY_MS = Number.parseInt(process.env.UPDATE_DELAY_MS || "50", 10)
const WebSocketPolyfill = WebSocket as unknown as typeof globalThis.WebSocket

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

function createSyncPromise(provider: WebsocketProvider): Promise<void> {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            provider.off("sync", onSync)
            reject(new Error("sync timeout"))
        }, 10000)

        const onSync = (isSynced: boolean) => {
            if (!isSynced) {
                return
            }

            clearTimeout(timeout)
            provider.off("sync", onSync)
            resolve()
        }

        provider.on("sync", onSync)
    })
}

async function simulateUser(userIndex: number): Promise<number> {
    const doc = new Y.Doc()
    const text = doc.getText("diagram-xml")

    const provider = new WebsocketProvider(WS_URL, ROOM_ID, doc, {
        WebSocketPolyfill,
        params: AUTH_TOKEN ? { token: AUTH_TOKEN } : undefined,
    })

    const startedAt = Date.now()

    try {
        await createSyncPromise(provider)

        for (
            let updateIndex = 0;
            updateIndex < UPDATES_PER_USER;
            updateIndex++
        ) {
            doc.transact(() => {
                text.insert(text.length, `u${userIndex}-m${updateIndex};`)
            }, "load-test")

            await sleep(UPDATE_DELAY_MS)
        }

        await sleep(250)
        return Date.now() - startedAt
    } finally {
        provider.destroy()
        doc.destroy()
    }
}

async function runLoadTest() {
    console.log(`Starting load test with ${CONCURRENT_USERS} concurrent users`)
    console.log(
        JSON.stringify(
            {
                wsUrl: WS_URL,
                roomId: ROOM_ID,
                updatesPerUser: UPDATES_PER_USER,
                updateDelayMs: UPDATE_DELAY_MS,
                authTokenProvided: Boolean(AUTH_TOKEN),
            },
            null,
            2,
        ),
    )

    const startedAt = Date.now()
    const promises = Array.from({ length: CONCURRENT_USERS }, (_value, index) =>
        simulateUser(index),
    )

    const results = await Promise.allSettled(promises)
    const completed = results.filter((result) => result.status === "fulfilled")
    const failures = results.filter((result) => result.status === "rejected")

    const elapsedMs = Date.now() - startedAt
    const completedDurations = completed.map((result) => result.value)
    const avgUserDurationMs =
        completedDurations.length > 0
            ? Math.round(
                  completedDurations.reduce((sum, value) => sum + value, 0) /
                      completedDurations.length,
              )
            : 0

    console.log(
        JSON.stringify(
            {
                elapsedMs,
                completedUsers: completed.length,
                failedUsers: failures.length,
                avgUserDurationMs,
            },
            null,
            2,
        ),
    )

    if (failures.length > 0) {
        for (const failure of failures) {
            console.error("Load test user failed:", failure.reason)
        }
        process.exit(1)
    }
}

runLoadTest().catch((error) => {
    console.error("Load test failed:", error)
    process.exit(1)
})
