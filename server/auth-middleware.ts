import type { IncomingMessage } from "node:http"
import { and, eq, gt } from "drizzle-orm"
import { auth } from "../lib/auth"
import { db } from "../lib/db"
import * as schema from "../lib/db/schema"
import type { WebSocketUserContext } from "./auth-utils"
import {
    extractSessionToken,
    getPermissionsForRole,
    hasPermission,
    isValidDocumentName,
    normalizeRole,
    toHeaders,
} from "./auth-utils"
import { logger } from "./logger"

export type { WebSocketRole, WebSocketUserContext } from "./auth-utils"

export interface WebSocketAuthContext {
    sessionId: string
    sessionToken: string
    user: WebSocketUserContext
}

function toUserContext(
    session: any,
    token: string,
): WebSocketAuthContext | null {
    const user = session?.user
    if (!user?.id) {
        return null
    }

    const role = normalizeRole(user.role)

    return {
        sessionId: session.session?.id || "",
        sessionToken: token,
        user: {
            userId: user.id,
            userName: user.name || user.email || user.id,
            userEmail: user.email || "",
            role,
            permissions: getPermissionsForRole(role),
        },
    }
}

async function validateSessionTokenFromDatabase(
    token: string,
): Promise<WebSocketAuthContext | null> {
    const [row] = await db
        .select({
            sessionId: schema.session.id,
            sessionToken: schema.session.token,
            userId: schema.user.id,
            userName: schema.user.name,
            userEmail: schema.user.email,
            userRole: schema.user.role,
        })
        .from(schema.session)
        .innerJoin(schema.user, eq(schema.session.userId, schema.user.id))
        .where(
            and(
                eq(schema.session.token, token),
                gt(schema.session.expiresAt, new Date()),
            ),
        )
        .limit(1)

    if (!row?.userId) {
        return null
    }

    const role = normalizeRole(row.userRole)

    return {
        sessionId: row.sessionId,
        sessionToken: row.sessionToken,
        user: {
            userId: row.userId,
            userName: row.userName || row.userEmail || row.userId,
            userEmail: row.userEmail,
            role,
            permissions: getPermissionsForRole(role),
        },
    }
}

export async function validateSession(
    request: Pick<IncomingMessage, "headers" | "url">,
): Promise<WebSocketAuthContext | null> {
    const token = extractSessionToken(request)
    const headers = toHeaders(request.headers)

    if (token && !headers.get("authorization")) {
        headers.set("authorization", `Bearer ${token}`)
    }

    try {
        const session = await auth.api.getSession({ headers })
        const context = token ? toUserContext(session, token) : null
        if (context) {
            return context
        }
    } catch (error) {
        logger.debug(
            "Better Auth API getSession failed in websocket middleware",
            {
                error,
            },
        )
    }

    if (!token) {
        return null
    }

    try {
        return await validateSessionTokenFromDatabase(token)
    } catch (error) {
        logger.warn("Fallback database session validation failed", {
            error,
        })
        return null
    }
}

export { hasPermission, isValidDocumentName }

export async function checkDiagramAccess(
    user: WebSocketUserContext,
    documentName: string,
): Promise<boolean> {
    if (!isValidDocumentName(documentName)) {
        return false
    }

    return hasPermission(user.permissions, "diagram", "view")
}
