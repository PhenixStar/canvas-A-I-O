import { auth } from "./auth"

export type AppRole = "owner" | "admin" | "editor" | "viewer"

export class PermissionError extends Error {
    statusCode: number

    constructor(message: string, statusCode: number) {
        super(message)
        this.name = "PermissionError"
        this.statusCode = statusCode
    }
}

export async function requirePermission(
    req: Request,
    resource: string,
    actions: string[],
): Promise<void> {
    const session = await auth.api.getSession({
        headers: req.headers,
    })

    if (!session) {
        throw new PermissionError("Authentication required", 401)
    }

    for (const action of actions) {
        let hasPermission = false

        try {
            const result = await (auth.api as any).userHasPermission({
                headers: req.headers,
                body: {
                    userId: session.user.id,
                    permission: {
                        [resource]: [action],
                    },
                },
            })

            hasPermission = Boolean(result?.success)
        } catch {
            hasPermission = false
        }

        if (!hasPermission) {
            throw new PermissionError("Insufficient permissions", 403)
        }
    }
}

export async function getUserRole(req: Request): Promise<AppRole | null> {
    const session = await auth.api.getSession({
        headers: req.headers,
    })

    return (session?.user?.role as AppRole | undefined) ?? null
}
