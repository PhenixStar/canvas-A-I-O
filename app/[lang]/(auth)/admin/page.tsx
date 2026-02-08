"use client"

import { UserManagement } from "@/components/admin/user-management"

export default function AdminPage() {
    return (
        <div className="container mx-auto max-w-4xl p-6">
            <h1 className="mb-6 text-2xl font-bold">Admin Panel</h1>
            <UserManagement />
        </div>
    )
}
