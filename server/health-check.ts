import { sql } from "drizzle-orm"
import { db } from "../lib/db"

export interface HealthStatus {
    status: "healthy" | "degraded" | "unhealthy"
    timestamp: string
    uptimeSeconds: number
    database: {
        connected: boolean
        latencyMs: number | null
    }
    connections: {
        active: number
        documents: number
    }
    memory: {
        rss: number
        heapUsed: number
    }
}

export interface HealthInput {
    activeConnections: number
    loadedDocuments: number
}

export async function getHealthStatus({
    activeConnections,
    loadedDocuments,
}: HealthInput): Promise<HealthStatus> {
    const startedAt = Date.now()
    let databaseConnected = false
    let databaseLatencyMs: number | null = null

    try {
        await db.execute(sql`select 1`)
        databaseConnected = true
        databaseLatencyMs = Date.now() - startedAt
    } catch {
        databaseConnected = false
        databaseLatencyMs = null
    }

    const status: HealthStatus = {
        status: databaseConnected ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        database: {
            connected: databaseConnected,
            latencyMs: databaseLatencyMs,
        },
        connections: {
            active: activeConnections,
            documents: loadedDocuments,
        },
        memory: {
            rss: process.memoryUsage().rss,
            heapUsed: process.memoryUsage().heapUsed,
        },
    }

    return status
}
