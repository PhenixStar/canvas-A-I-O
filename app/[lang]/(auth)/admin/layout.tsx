import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function AdminLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    const role = (session?.user as Record<string, unknown>)?.role as string
    if (!session || !["owner", "admin"].includes(role)) {
        redirect(`/${lang}`)
    }

    return <>{children}</>
}
