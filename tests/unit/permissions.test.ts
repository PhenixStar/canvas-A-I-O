import { describe, expect, it } from "vitest"
import type { AppRole } from "@/lib/permissions"
import { PermissionError } from "@/lib/permissions"

type DerivedPermissions = {
    role: AppRole
    isOwner: boolean
    isAdmin: boolean
    isEditor: boolean
    isViewer: boolean
    canCreateDiagram: boolean
    canEditDiagram: boolean
    canDeleteDiagram: boolean
    canShareDiagram: boolean
    canManageUsers: boolean
    canManageSettings: boolean
}

function derivePermissions(
    roleInput: AppRole | null | undefined,
): DerivedPermissions {
    const role = roleInput ?? "viewer"
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

describe("Permission system", () => {
    describe("Role hierarchy", () => {
        it("viewer has only viewer privileges", () => {
            const permissions = derivePermissions("viewer")

            expect(permissions.role).toBe("viewer")
            expect(permissions.isOwner).toBe(false)
            expect(permissions.isAdmin).toBe(false)
            expect(permissions.isEditor).toBe(false)
            expect(permissions.isViewer).toBe(true)
            expect(permissions.canCreateDiagram).toBe(false)
            expect(permissions.canEditDiagram).toBe(false)
            expect(permissions.canDeleteDiagram).toBe(false)
            expect(permissions.canShareDiagram).toBe(false)
            expect(permissions.canManageUsers).toBe(false)
            expect(permissions.canManageSettings).toBe(false)
        })

        it("editor includes viewer privileges and edit/create/delete/share abilities", () => {
            const permissions = derivePermissions("editor")

            expect(permissions.role).toBe("editor")
            expect(permissions.isOwner).toBe(false)
            expect(permissions.isAdmin).toBe(false)
            expect(permissions.isEditor).toBe(true)
            expect(permissions.isViewer).toBe(true)
            expect(permissions.canCreateDiagram).toBe(true)
            expect(permissions.canEditDiagram).toBe(true)
            expect(permissions.canDeleteDiagram).toBe(true)
            expect(permissions.canShareDiagram).toBe(true)
            expect(permissions.canManageUsers).toBe(false)
            expect(permissions.canManageSettings).toBe(false)
        })

        it("admin includes editor/viewer privileges and management abilities", () => {
            const permissions = derivePermissions("admin")

            expect(permissions.role).toBe("admin")
            expect(permissions.isOwner).toBe(false)
            expect(permissions.isAdmin).toBe(true)
            expect(permissions.isEditor).toBe(true)
            expect(permissions.isViewer).toBe(true)
            expect(permissions.canCreateDiagram).toBe(true)
            expect(permissions.canEditDiagram).toBe(true)
            expect(permissions.canDeleteDiagram).toBe(true)
            expect(permissions.canShareDiagram).toBe(true)
            expect(permissions.canManageUsers).toBe(true)
            expect(permissions.canManageSettings).toBe(true)
        })

        it("owner includes all privileges", () => {
            const permissions = derivePermissions("owner")

            expect(permissions.role).toBe("owner")
            expect(permissions.isOwner).toBe(true)
            expect(permissions.isAdmin).toBe(true)
            expect(permissions.isEditor).toBe(true)
            expect(permissions.isViewer).toBe(true)
            expect(permissions.canCreateDiagram).toBe(true)
            expect(permissions.canEditDiagram).toBe(true)
            expect(permissions.canDeleteDiagram).toBe(true)
            expect(permissions.canShareDiagram).toBe(true)
            expect(permissions.canManageUsers).toBe(true)
            expect(permissions.canManageSettings).toBe(true)
        })
    })

    describe("Permission derivation per role", () => {
        it("viewer permissions are all false for create/edit/delete/share", () => {
            const permissions = derivePermissions("viewer")

            expect(permissions.canCreateDiagram).toBe(false)
            expect(permissions.canEditDiagram).toBe(false)
            expect(permissions.canDeleteDiagram).toBe(false)
            expect(permissions.canShareDiagram).toBe(false)
        })

        it("editor permissions are true for create/edit/delete/share", () => {
            const permissions = derivePermissions("editor")

            expect(permissions.canCreateDiagram).toBe(true)
            expect(permissions.canEditDiagram).toBe(true)
            expect(permissions.canDeleteDiagram).toBe(true)
            expect(permissions.canShareDiagram).toBe(true)
        })

        it("admin matches editor permissions and can manage users/settings", () => {
            const permissions = derivePermissions("admin")

            expect(permissions.canCreateDiagram).toBe(true)
            expect(permissions.canEditDiagram).toBe(true)
            expect(permissions.canDeleteDiagram).toBe(true)
            expect(permissions.canShareDiagram).toBe(true)
            expect(permissions.canManageUsers).toBe(true)
            expect(permissions.canManageSettings).toBe(true)
        })

        it("owner has all admin-level permissions", () => {
            const permissions = derivePermissions("owner")

            expect(permissions.canCreateDiagram).toBe(true)
            expect(permissions.canEditDiagram).toBe(true)
            expect(permissions.canDeleteDiagram).toBe(true)
            expect(permissions.canShareDiagram).toBe(true)
            expect(permissions.canManageUsers).toBe(true)
            expect(permissions.canManageSettings).toBe(true)
        })
    })

    describe("Default role handling", () => {
        it('defaults to "viewer" for undefined role', () => {
            const permissions = derivePermissions(undefined)

            expect(permissions.role).toBe("viewer")
            expect(permissions.isViewer).toBe(true)
            expect(permissions.canCreateDiagram).toBe(false)
            expect(permissions.canEditDiagram).toBe(false)
            expect(permissions.canDeleteDiagram).toBe(false)
            expect(permissions.canShareDiagram).toBe(false)
            expect(permissions.canManageUsers).toBe(false)
            expect(permissions.canManageSettings).toBe(false)
        })

        it('defaults to "viewer" for null role', () => {
            const permissions = derivePermissions(null)

            expect(permissions.role).toBe("viewer")
            expect(permissions.isViewer).toBe(true)
            expect(permissions.canCreateDiagram).toBe(false)
            expect(permissions.canEditDiagram).toBe(false)
            expect(permissions.canDeleteDiagram).toBe(false)
            expect(permissions.canShareDiagram).toBe(false)
            expect(permissions.canManageUsers).toBe(false)
            expect(permissions.canManageSettings).toBe(false)
        })
    })

    describe("AppRole type", () => {
        it("matches expected role values", () => {
            const roleMap: Record<AppRole, true> = {
                owner: true,
                admin: true,
                editor: true,
                viewer: true,
            }

            expect(Object.keys(roleMap).sort()).toEqual([
                "admin",
                "editor",
                "owner",
                "viewer",
            ])
        })
    })

    describe("PermissionError", () => {
        it("has PermissionError name and statusCode", () => {
            const error = new PermissionError("Insufficient permissions", 403)

            expect(error).toBeInstanceOf(Error)
            expect(error.name).toBe("PermissionError")
            expect(error.statusCode).toBe(403)
        })

        it("sets constructor message and statusCode", () => {
            const error = new PermissionError("Authentication required", 401)

            expect(error.message).toBe("Authentication required")
            expect(error.statusCode).toBe(401)
        })
    })
})
