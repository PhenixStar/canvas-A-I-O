export type LogLevel = "debug" | "info" | "warn" | "error"

const LOG_LEVEL_WEIGHT: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
}

function resolveLogLevel(): LogLevel {
    const raw = process.env.LOG_LEVEL?.toLowerCase()
    if (
        raw === "debug" ||
        raw === "info" ||
        raw === "warn" ||
        raw === "error"
    ) {
        return raw
    }

    return process.env.NODE_ENV === "development" ? "debug" : "info"
}

const configuredLevel = resolveLogLevel()
const isProduction = process.env.NODE_ENV === "production"

function shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_WEIGHT[level] >= LOG_LEVEL_WEIGHT[configuredLevel]
}

function serializeMetadata(
    metadata: Record<string, unknown> | undefined,
): string {
    if (!metadata) {
        return ""
    }

    return JSON.stringify(metadata, (_key, value) => {
        if (value instanceof Error) {
            return {
                name: value.name,
                message: value.message,
                stack: value.stack,
            }
        }

        if (typeof value === "bigint") {
            return value.toString()
        }

        return value
    })
}

function write(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
) {
    if (!shouldLog(level)) {
        return
    }

    const timestamp = new Date().toISOString()
    const payload = {
        ts: timestamp,
        level,
        message,
        service: "canvas-collab-ws",
        ...metadata,
    }

    if (isProduction) {
        const line = serializeMetadata(payload)

        if (level === "error") {
            console.error(line)
            return
        }

        if (level === "warn") {
            console.warn(line)
            return
        }

        console.log(line)
        return
    }

    const metaText = metadata ? ` ${serializeMetadata(metadata)}` : ""
    const line = `[${timestamp}] [${level.toUpperCase()}] ${message}${metaText}`

    if (level === "error") {
        console.error(line)
        return
    }

    if (level === "warn") {
        console.warn(line)
        return
    }

    if (level === "debug") {
        console.debug(line)
        return
    }

    console.info(line)
}

export const logger = {
    debug: (message: string, metadata?: Record<string, unknown>) => {
        write("debug", message, metadata)
    },
    info: (message: string, metadata?: Record<string, unknown>) => {
        write("info", message, metadata)
    },
    warn: (message: string, metadata?: Record<string, unknown>) => {
        write("warn", message, metadata)
    },
    error: (message: string, metadata?: Record<string, unknown>) => {
        write("error", message, metadata)
    },
}
