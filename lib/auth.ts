import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { createAccessControl } from "better-auth/plugins/access"
import { admin } from "better-auth/plugins/admin"
import { eq } from "drizzle-orm"
import { db } from "./db"
import * as schema from "./db/schema"

if (process.env.DATABASE_URL && !process.env.BETTER_AUTH_SECRET) {
    throw new Error(
        "BETTER_AUTH_SECRET is required when DATABASE_URL is set. Generate one with: openssl rand -hex 32",
    )
}

const statement = {
    diagram: ["create", "edit", "view", "delete", "share"],
    user: ["manage", "list", "ban"],
    settings: ["read", "write"],
} as const

export const ac = createAccessControl(statement)

const ownerRole = ac.newRole({
    diagram: ["create", "edit", "view", "delete", "share"],
    user: ["manage", "list", "ban"],
    settings: ["read", "write"],
})

const adminRole = ac.newRole({
    diagram: ["create", "edit", "view", "delete", "share"],
    user: ["list", "ban"],
    settings: ["read", "write"],
})

const editorRole = ac.newRole({
    diagram: ["create", "edit", "view", "delete"],
    user: ["list"],
    settings: ["read"],
})

const viewerRole = ac.newRole({
    diagram: ["view"],
    user: [],
    settings: ["read"],
})

const hasGoogleCredentials =
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
const hasGithubCredentials =
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
    },
    socialProviders: {
        ...(hasGoogleCredentials && {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID as string,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            },
        }),
        ...(hasGithubCredentials && {
            github: {
                clientId: process.env.GITHUB_CLIENT_ID as string,
                clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
            },
        }),
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
    },
    trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS
        ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((o) =>
              o.trim(),
          )
        : [],
    plugins: [
        admin({
            defaultRole: "editor",
            adminRoles: ["owner", "admin"],
            ac,
            roles: {
                owner: ownerRole,
                admin: adminRole,
                editor: editorRole,
                viewer: viewerRole,
            },
        }),
    ],
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    const adminEmail = process.env.ADMIN_EMAIL
                    if (adminEmail && user.email === adminEmail) {
                        await db
                            .update(schema.user)
                            .set({ role: "owner" })
                            .where(eq(schema.user.id, user.id))
                    }
                },
            },
        },
    },
})
