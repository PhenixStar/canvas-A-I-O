import type { IncomingHttpHeaders, IncomingMessage } from "node:http"

const SESSION_COOKIE_NAMES = [
    "better-auth.session_token",
    "__Secure-better-auth.session_token",
]

const DOCUMENT_NAME_PATTERN = /^[a-zA-Z0-9._-]+$/
const MAX_DOCUMENT_NAME_LENGTH = 128

export type WebSocketRole = "owner" | "admin" | "editor" | "viewer"

export interface WebSocketUserContext {
    userId: string
    userName: string
    userEmail: string
    role: WebSocketRole
    permissions: string[]
}

const ROLE_PERMISSIONS: Record<WebSocketRole, string[]> = {
    owner: ["*"],
    admin: [
        "diagram:create",
        "diagram:edit",
        "diagram:view",
        "diagram:delete",
        "diagram:share",
    ],
    editor: [
        "diagram:create",
        "diagram:edit",
        "diagram:view",
        "diagram:delete",
    ],
    viewer: ["diagram:view"],
}

export function normalizeRole(role: unknown): WebSocketRole {
    if (
        role === "owner" ||
        role === "admin" ||
        role === "editor" ||
        role === "viewer"
    ) {
        return role
    }

    return "editor"
}

export function getPermissionsForRole(role: WebSocketRole): string[] {
    return [...ROLE_PERMISSIONS[role]]
}

export function hasPermission(
    permissions: string[],
    resource: string,
    action: string,
): boolean {
    if (permissions.includes("*")) {
        return true
    }

    if (permissions.includes(`${resource}:*`)) {
        return true
    }

    return permissions.includes(`${resource}:${action}`)
}

export function parseCookies(
    cookieHeader?: string | null,
): Record<string, string> {
    const cookies: Record<string, string> = {}

    if (!cookieHeader) {
        return cookies
    }

    for (const pair of cookieHeader.split(";")) {
        const separatorIndex = pair.indexOf("=")
        if (separatorIndex < 1) {
            continue
        }

        const key = pair.slice(0, separatorIndex).trim()
        const value = pair.slice(separatorIndex + 1).trim()

        if (!key) {
            continue
        }

        try {
            cookies[key] = decodeURIComponent(value)
        } catch {
            cookies[key] = value
        }
    }

    return cookies
}

export function toHeaders(headers: IncomingHttpHeaders | Headers): Headers {
    if (headers instanceof Headers) {
        return new Headers(headers)
    }

    const nextHeaders = new Headers()

    for (const [key, value] of Object.entries(headers)) {
        if (value === undefined) {
            continue
        }

        if (Array.isArray(value)) {
            const joinedValue =
                key.toLowerCase() === "cookie"
                    ? value.join("; ")
                    : value.join(", ")
            nextHeaders.set(key, joinedValue)
            continue
        }

        nextHeaders.set(key, value)
    }

    return nextHeaders
}

export function extractSessionTokenFromHeaders(
    headersInput: IncomingHttpHeaders | Headers,
): string | null {
    const headers = toHeaders(headersInput)

    const authorization = headers.get("authorization")
    if (authorization) {
        const match = authorization.match(/^Bearer\s+(.+)$/i)
        if (match?.[1]) {
            return match[1].trim()
        }
    }

    const xSessionToken =
        headers.get("x-session-token") || headers.get("x-auth-token")
    if (xSessionToken?.trim()) {
        return xSessionToken.trim()
    }

    const cookies = parseCookies(headers.get("cookie"))
    for (const cookieName of SESSION_COOKIE_NAMES) {
        if (cookies[cookieName]) {
            return cookies[cookieName]
        }
    }

    return null
}

export function extractSessionToken(
    request: Pick<IncomingMessage, "headers" | "url">,
): string | null {
    if (request.url) {
        try {
            const url = new URL(request.url, "http://localhost")
            const queryToken =
                url.searchParams.get("token") ||
                url.searchParams.get("access_token") ||
                url.searchParams.get("session_token")

            if (queryToken?.trim()) {
                return queryToken.trim()
            }
        } catch {
            // Invalid URL format from upgrade request, ignore and continue.
        }
    }

    return extractSessionTokenFromHeaders(request.headers)
}

export function isValidDocumentName(documentName: string): boolean {
    const trimmed = documentName.trim()

    if (!trimmed) {
        return false
    }

    if (trimmed.length > MAX_DOCUMENT_NAME_LENGTH) {
        return false
    }

    return DOCUMENT_NAME_PATTERN.test(trimmed)
}
