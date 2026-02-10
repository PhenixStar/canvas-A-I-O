import { describe, expect, it } from "vitest"
import {
    extractSessionToken,
    extractSessionTokenFromHeaders,
    getPermissionsForRole,
    hasPermission,
    isValidDocumentName,
    parseCookies,
} from "../../server/auth-utils"

describe("parseCookies", () => {
    it("parses cookie pairs", () => {
        const cookies = parseCookies("a=1; b=hello")
        expect(cookies.a).toBe("1")
        expect(cookies.b).toBe("hello")
    })

    it("decodes URL-encoded cookie values", () => {
        const cookies = parseCookies("better-auth.session_token=token%3Aabc")
        expect(cookies["better-auth.session_token"]).toBe("token:abc")
    })
})

describe("extractSessionTokenFromHeaders", () => {
    it("prefers Bearer authorization token", () => {
        const token = extractSessionTokenFromHeaders(
            new Headers({
                authorization: "Bearer auth-token",
                cookie: "better-auth.session_token=cookie-token",
            }),
        )

        expect(token).toBe("auth-token")
    })

    it("extracts session token from Better Auth cookies", () => {
        const token = extractSessionTokenFromHeaders(
            new Headers({
                cookie: "better-auth.session_token=session-123; other=value",
            }),
        )

        expect(token).toBe("session-123")
    })

    it("extracts secure cookie variant", () => {
        const token = extractSessionTokenFromHeaders(
            new Headers({
                cookie: "__Secure-better-auth.session_token=session-456",
            }),
        )

        expect(token).toBe("session-456")
    })
})

describe("extractSessionToken", () => {
    it("extracts token from query string before headers", () => {
        const token = extractSessionToken({
            url: "/ws?token=query-token",
            headers: {
                authorization: "Bearer header-token",
            },
        })

        expect(token).toBe("query-token")
    })

    it("returns null when no token exists", () => {
        const token = extractSessionToken({
            url: "/ws",
            headers: {},
        })

        expect(token).toBeNull()
    })
})

describe("isValidDocumentName", () => {
    it("accepts valid room IDs", () => {
        expect(isValidDocumentName("diagram-123")).toBe(true)
        expect(isValidDocumentName("team_room.alpha-1")).toBe(true)
    })

    it("rejects invalid names", () => {
        expect(isValidDocumentName("")).toBe(false)
        expect(isValidDocumentName("bad room name")).toBe(false)
        expect(isValidDocumentName("../../escape")).toBe(false)
        expect(isValidDocumentName("x".repeat(129))).toBe(false)
    })
})

describe("hasPermission", () => {
    it("supports wildcard and explicit permissions", () => {
        expect(hasPermission(["*"], "diagram", "view")).toBe(true)
        expect(hasPermission(["diagram:*"], "diagram", "edit")).toBe(true)
        expect(hasPermission(["diagram:view"], "diagram", "view")).toBe(true)
        expect(hasPermission(["diagram:view"], "diagram", "edit")).toBe(false)
    })

    it("maps role permissions", () => {
        const editorPermissions = getPermissionsForRole("editor")
        expect(hasPermission(editorPermissions, "diagram", "view")).toBe(true)
        expect(hasPermission(editorPermissions, "diagram", "share")).toBe(false)
    })
})
