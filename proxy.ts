import { match as matchLocale } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { i18n } from "./lib/i18n/config"

const SESSION_COOKIE_NAME = "better-auth.session_token"

const PUBLIC_API_PATHS = [
    "/api/auth",
    "/api/config",
    "/api/server-models",
    "/api/verify-access-code",
]

function getLocale(request: NextRequest): string | undefined {
    const negotiatorHeaders: Record<string, string> = {}
    request.headers.forEach((value, key) => {
        negotiatorHeaders[key] = value
    })

    // @ts-expect-error locales are readonly
    const locales: string[] = i18n.locales

    const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
        locales,
    )

    return matchLocale(languages, locales, i18n.defaultLocale)
}

function isPublicApiRoute(pathname: string): boolean {
    return PUBLIC_API_PATHS.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
    )
}

function isAuthPage(pathname: string): boolean {
    return pathname.includes("/login") || pathname.includes("/register")
}

export function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    const authEnabled = !!process.env.DATABASE_URL

    // Skip static files and Next.js internals (no auth or locale needed)
    if (
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/drawio") ||
        pathname.includes("/favicon") ||
        /\.(.*)$/.test(pathname)
    ) {
        return
    }

    // API route handling: auth check only, no locale redirect
    if (pathname.startsWith("/api/")) {
        if (!authEnabled || isPublicApiRoute(pathname)) {
            return
        }

        const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value
        if (!sessionCookie) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 },
            )
        }
        return
    }

    // Page route auth: redirect unauthenticated users to login
    if (authEnabled && !isAuthPage(pathname)) {
        const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value
        if (!sessionCookie) {
            const segments = pathname.split("/").filter(Boolean)
            const lang = segments[0] || "en"
            const loginUrl = new URL(`/${lang}/login`, request.url)
            loginUrl.searchParams.set("callbackUrl", pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    // Locale detection: redirect if pathname is missing a locale prefix
    const pathnameIsMissingLocale = i18n.locales.every(
        (locale) =>
            !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
    )

    if (pathnameIsMissingLocale) {
        const locale = getLocale(request)
        return NextResponse.redirect(
            new URL(
                `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
                request.url,
            ),
        )
    }
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
    ],
}
