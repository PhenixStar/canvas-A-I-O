import { auth } from "@/lib/auth"

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
