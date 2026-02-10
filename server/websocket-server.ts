import { createServer } from "node:http"
import { Hocuspocus, type onConnectPayload } from "@hocuspocus/server"
import {
    checkDiagramAccess,
    hasPermission,
    validateSession,
} from "./auth-middleware"
import { DatabaseAdapter } from "./database-adapter"
import { getHealthStatus } from "./health-check"
import { logger } from "./logger"

function parseNumber(input: string | undefined, fallback: number): number {
    const parsed = Number.parseInt(input || "", 10)

    if (Number.isNaN(parsed) || parsed <= 0) {
        return fallback
    }

    return parsed
}

function parseBoolean(input: string | undefined, fallback: boolean): boolean {
    if (input === undefined) {
        return fallback
    }

    const normalized = input.trim().toLowerCase()
    if (["1", "true", "yes", "on"].includes(normalized)) {
        return true
    }

    if (["0", "false", "no", "off"].includes(normalized)) {
        return false
    }

    return fallback
}

function createWebSocketError(
    code: number,
    reason: string,
): Error & {
    code: number
    reason: string
} {
    const error = new Error(reason) as Error & {
        code: number
        reason: string
    }

    error.code = code
    error.reason = reason

    return error
}

const WS_PORT = parseNumber(process.env.WS_PORT, 3001)
const WS_HOST = process.env.WS_HOST || "0.0.0.0"
const HEALTH_PORT = parseNumber(process.env.WS_HEALTH_PORT, WS_PORT + 1)
const WS_DEBOUNCE_MS = parseNumber(process.env.WS_DEBOUNCE_MS, 1000)
const WS_MAX_DEBOUNCE_MS = parseNumber(process.env.WS_MAX_DEBOUNCE_MS, 5000)
const WS_MAX_DOCUMENT_BYTES = parseNumber(
    process.env.WS_MAX_DOCUMENT_BYTES,
    10 * 1024 * 1024,
)
const WS_ENABLE_UPDATE_LOG = parseBoolean(
    process.env.WS_ENABLE_UPDATE_LOG,
    false,
)
const WS_ALLOWED_ORIGINS = (process.env.WS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for WebSocket server persistence")
}

const dbAdapter = new DatabaseAdapter({
    enableUpdateLog: WS_ENABLE_UPDATE_LOG,
    maxDocumentBytes: WS_MAX_DOCUMENT_BYTES,
})

function isAllowedOrigin(originHeader: string | undefined): boolean {
    if (WS_ALLOWED_ORIGINS.length === 0) {
        return true
    }

    if (!originHeader) {
        return false
    }

    return WS_ALLOWED_ORIGINS.includes(originHeader)
}

async function authenticateConnection(payload: onConnectPayload) {
    const origin =
        typeof payload.request.headers.origin === "string"
            ? payload.request.headers.origin
            : undefined

    if (!isAllowedOrigin(origin)) {
        throw createWebSocketError(4403, "origin-not-allowed")
    }

    const authContext = await validateSession(payload.request)

    if (!authContext) {
        throw createWebSocketError(4401, "unauthorized")
    }

    const hasAccess = await checkDiagramAccess(
        authContext.user,
        payload.documentName,
    )

    if (!hasAccess) {
        throw createWebSocketError(4403, "forbidden")
    }

    const canEdit = hasPermission(
        authContext.user.permissions,
        "diagram",
        "edit",
    )

    payload.connection.readOnly = !canEdit

    return {
        user: authContext.user,
        sessionId: authContext.sessionId,
    }
}

export const hocuspocus = new Hocuspocus()

hocuspocus.configure({
    name: "canvas-collab",
    address: WS_HOST,
    port: WS_PORT,
    debounce: WS_DEBOUNCE_MS,
    maxDebounce: WS_MAX_DEBOUNCE_MS,
    stopOnSignals: false,
    quiet: process.env.NODE_ENV === "production",
    extensions: [dbAdapter],
    onConnect: async (payload) => {
        try {
            const context = await authenticateConnection(payload)

            logger.info("WebSocket client authenticated", {
                documentName: payload.documentName,
                socketId: payload.socketId,
                userId: context.user.userId,
                role: context.user.role,
                readOnly: payload.connection.readOnly,
            })

            return context
        } catch (error) {
            logger.warn("WebSocket authentication failed", {
                documentName: payload.documentName,
                socketId: payload.socketId,
                error,
            })

            throw error
        }
    },
    connected: async ({ documentName, context, instance }) => {
        logger.info("WebSocket client connected", {
            documentName,
            userId: context?.user?.userId,
            activeConnections: instance.getConnectionsCount(),
        })
    },
    onDisconnect: async ({ documentName, context, instance }) => {
        logger.info("WebSocket client disconnected", {
            documentName,
            userId: context?.user?.userId,
            activeConnections: instance.getConnectionsCount(),
        })
    },
    onListen: async ({ port }) => {
        logger.info("WebSocket server listening", {
            host: WS_HOST,
            port,
        })
    },
    onLoadDocument: async ({ documentName }) => {
        logger.debug("Loading Yjs document", {
            documentName,
        })
    },
    onStoreDocument: async ({ documentName, clientsCount }) => {
        logger.debug("Persisting Yjs document", {
            documentName,
            clientsCount,
        })
    },
    onDestroy: async () => {
        logger.info("WebSocket server destroyed")
    },
})

const healthServer = createServer(async (req, res) => {
    const method = req.method || "GET"
    const path = (req.url || "").split("?")[0]

    if (method === "GET" && (path === "/health" || path === "/healthz")) {
        const status = await getHealthStatus({
            activeConnections: hocuspocus.getConnectionsCount(),
            loadedDocuments: hocuspocus.getDocumentsCount(),
        })

        res.statusCode = status.status === "healthy" ? 200 : 503
        res.setHeader("Content-Type", "application/json")
        res.end(JSON.stringify(status))
        return
    }

    res.statusCode = 404
    res.setHeader("Content-Type", "application/json")
    res.end(
        JSON.stringify({
            error: "not_found",
        }),
    )
})

let started = false
let shuttingDown = false

async function listenHealthServer(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        const onError = (error: Error) => {
            healthServer.off("listening", onListening)
            reject(error)
        }

        const onListening = () => {
            healthServer.off("error", onError)
            resolve()
        }

        healthServer.once("error", onError)
        healthServer.once("listening", onListening)
        healthServer.listen(HEALTH_PORT, WS_HOST)
    })

    logger.info("Health check server listening", {
        host: WS_HOST,
        port: HEALTH_PORT,
    })
}

async function closeHealthServer(): Promise<void> {
    if (!healthServer.listening) {
        return
    }

    await new Promise<void>((resolve) => {
        healthServer.close(() => {
            resolve()
        })
    })
}

export async function startWebSocketServer(): Promise<void> {
    if (started) {
        return
    }

    started = true

    try {
        await hocuspocus.listen()
        await listenHealthServer()
    } catch (error) {
        started = false

        try {
            await closeHealthServer()
            await hocuspocus.destroy()
        } catch {
            // Ignore cleanup failures from partial startup.
        }

        throw error
    }
}

export async function stopWebSocketServer(signal?: string): Promise<void> {
    if (!started || shuttingDown) {
        return
    }

    shuttingDown = true

    logger.info("Shutting down WebSocket server", {
        signal,
    })

    try {
        await closeHealthServer()
        await hocuspocus.destroy()
        logger.info("WebSocket shutdown complete")
    } finally {
        shuttingDown = false
        started = false
    }
}

async function handleProcessSignal(signal: string) {
    try {
        await stopWebSocketServer(signal)
        process.exit(0)
    } catch (error) {
        logger.error("Failed to stop WebSocket server gracefully", {
            signal,
            error,
        })
        process.exit(1)
    }
}

process.on("SIGINT", () => {
    void handleProcessSignal("SIGINT")
})

process.on("SIGTERM", () => {
    void handleProcessSignal("SIGTERM")
})

process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection in WebSocket server", {
        reason,
    })
})

process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception in WebSocket server", {
        error,
    })

    void handleProcessSignal("uncaughtException")
})

const entryPath = process.argv[1] || ""
const shouldStart =
    entryPath.endsWith("websocket-server.ts") ||
    entryPath.endsWith("websocket-server.js")

if (shouldStart) {
    startWebSocketServer().catch((error) => {
        logger.error("Failed to start WebSocket server", {
            error,
        })
        process.exit(1)
    })
}
