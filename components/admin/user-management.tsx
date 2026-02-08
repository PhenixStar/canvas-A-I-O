"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { authClient } from "@/lib/auth-client"

interface User {
    id: string
    name: string
    email: string
    role: string
    banned: boolean
    createdAt: string
}

const ROLES = ["owner", "admin", "editor", "viewer"] as const

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    async function fetchUsers() {
        try {
            const res = await authClient.admin.listUsers({
                query: { limit: 100 },
            })
            setUsers((res.data?.users as unknown as User[]) ?? [])
        } catch {
            toast.error("Failed to load users")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    async function handleSetRole(userId: string, role: string) {
        try {
            await authClient.admin.setRole({
                userId,
                role: role as "admin" | "user",
            })
            toast.success("Role updated successfully")
            await fetchUsers()
        } catch {
            toast.error("Failed to update role")
        }
    }

    async function handleBan(userId: string) {
        try {
            await authClient.admin.banUser({ userId })
            toast.success("User banned successfully")
            await fetchUsers()
        } catch {
            toast.error("Failed to ban user")
        }
    }

    async function handleUnban(userId: string) {
        try {
            await authClient.admin.unbanUser({ userId })
            toast.success("User unbanned successfully")
            await fetchUsers()
        } catch {
            toast.error("Failed to unban user")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        )
    }

    if (users.length === 0) {
        return (
            <p className="py-8 text-center text-muted-foreground">
                No users found
            </p>
        )
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="px-4 py-3 text-left font-medium">
                                Name
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Email
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Role
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Status
                            </th>
                            <th className="px-4 py-3 text-right font-medium">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="border-b last:border-0"
                            >
                                <td className="px-4 py-3">{user.name}</td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {user.email}
                                </td>
                                <td className="px-4 py-3">
                                    <Select
                                        value={user.role}
                                        onValueChange={(role) =>
                                            handleSetRole(user.id, role)
                                        }
                                    >
                                        <SelectTrigger className="w-28">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ROLES.map((r) => (
                                                <SelectItem key={r} value={r}>
                                                    {r.charAt(0).toUpperCase() +
                                                        r.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                            user.banned
                                                ? "bg-destructive/10 text-destructive"
                                                : "bg-green-500/10 text-green-700 dark:text-green-400"
                                        }`}
                                    >
                                        {user.banned ? "Banned" : "Active"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {user.banned ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleUnban(user.id)}
                                        >
                                            Unban
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleBan(user.id)}
                                        >
                                            Ban
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
