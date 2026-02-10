import { afterEach, describe, expect, it } from "vitest"
import {
    DEFAULT_COLLAB_ROOM_ID,
    DEFAULT_COLLAB_WS_URL,
    normalizeRoomId,
    resolveCollabWebSocketUrl,
} from "@/lib/crdt"

describe("normalizeRoomId", () => {
    it("falls back to default room for empty input", () => {
        expect(normalizeRoomId("")).toBe(DEFAULT_COLLAB_ROOM_ID)
        expect(normalizeRoomId("   ")).toBe(DEFAULT_COLLAB_ROOM_ID)
        expect(normalizeRoomId(undefined)).toBe(DEFAULT_COLLAB_ROOM_ID)
    })

    it("normalizes unsupported characters", () => {
        expect(normalizeRoomId("team room/alpha")).toBe("team-room-alpha")
        expect(normalizeRoomId("a---b")).toBe("a-b")
    })

    it("keeps safe room IDs unchanged", () => {
        expect(normalizeRoomId("room_123.alpha-beta")).toBe(
            "room_123.alpha-beta",
        )
    })
})

describe("resolveCollabWebSocketUrl", () => {
    const originalWsUrl = process.env.NEXT_PUBLIC_COLLAB_WS_URL

    afterEach(() => {
        if (originalWsUrl === undefined) {
            delete process.env.NEXT_PUBLIC_COLLAB_WS_URL
        } else {
            process.env.NEXT_PUBLIC_COLLAB_WS_URL = originalWsUrl
        }
    })

    it("prefers explicit URL", () => {
        expect(resolveCollabWebSocketUrl("wss://example.com/ws")).toBe(
            "wss://example.com/ws",
        )
    })

    it("uses default URL when none is provided", () => {
        delete process.env.NEXT_PUBLIC_COLLAB_WS_URL
        expect(resolveCollabWebSocketUrl("")).toBe(DEFAULT_COLLAB_WS_URL)
    })
})
