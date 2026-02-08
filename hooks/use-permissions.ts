"use client"

import { authClient } from "@/lib/auth-client"
import type { AppRole } from "@/lib/permissions"

export function usePermissions() {
    const { data: session } = authClient.useSession()
    const role =
        ((session?.user as Record<string, unknown>)?.role as AppRole) ??
        "viewer"

    const isOwner = role === "owner"
    const isAdmin = role === "admin" || isOwner
    const isEditor = role === "editor" || isAdmin
    const isViewer = role === "viewer" || isEditor

    return {
        role,
        isOwner,
        isAdmin,
        isEditor,
        isViewer,
        canCreateDiagram: isEditor,
        canEditDiagram: isEditor,
        canDeleteDiagram: isEditor,
        canShareDiagram: isOwner || role === "admin" || role === "editor",
        canManageUsers: isAdmin,
        canManageSettings: isAdmin,
    }
}
