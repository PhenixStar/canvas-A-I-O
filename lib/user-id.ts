import { auth } from "@/lib/auth"
import type { AppRole } from "@/lib/permissions"

export interface UserIdentity {
    userId: string
    role: AppRole | null
}

export async function getUserIdentityFromRequest(
    req: Request,
): Promise<UserIdentity> {
    if (process.env.DATABASE_URL) {
        try {
            const session = await auth.api.getSession({
                headers: req.headers,
            })
            if (session?.user?.id) {
                return {
                    userId: session.user.id,
                    role:
                        ((session.user as Record<string, unknown>)
                            .role as AppRole) ?? null,
                }
            }
        } catch {
            // Fall through to IP-based ID
        }
    }

    const forwardedFor = req.headers.get("x-forwarded-for")
    const rawIp = forwardedFor?.split(",")[0]?.trim() || "anonymous"
    const userId =
        rawIp === "anonymous"
            ? rawIp
            : `user-${Buffer.from(rawIp).toString("base64url")}`
    return { userId, role: null }
}

export async function getUserIdFromRequest(req: Request): Promise<string> {
    if (process.env.DATABASE_URL) {
        try {
            const session = await auth.api.getSession({
                headers: req.headers,
            })
            if (session?.user?.id) {
                return session.user.id
            }
        } catch {
            // Fall through to IP-based ID
        }
    }

    const forwardedFor = req.headers.get("x-forwarded-for")
    const rawIp = forwardedFor?.split(",")[0]?.trim() || "anonymous"
    return rawIp === "anonymous"
        ? rawIp
        : `user-${Buffer.from(rawIp).toString("base64url")}`
}
