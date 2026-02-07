"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDictionary } from "@/hooks/use-dictionary"
import { authClient } from "@/lib/auth-client"

export default function RegisterPage() {
    const dict = useDictionary()
    const router = useRouter()
    const params = useParams()
    const lang = (params?.lang as string) || "en"

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const { error: authError } = await authClient.signUp.email({
                name,
                email,
                password,
            })
            if (authError) {
                setError(authError.message || dict.auth.registerFailed)
                return
            }
            router.push(`/${lang}`)
        } catch {
            setError(dict.errors.networkError)
        } finally {
            setLoading(false)
        }
    }

    const handleOAuth = async (provider: "google" | "github") => {
        await authClient.signIn.social({
            provider,
            callbackURL: `/${lang}`,
        })
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight">
                    {dict.auth.registerTitle}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {dict.auth.registerDescription}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">{dict.auth.name}</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder={dict.auth.namePlaceholder}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                        className="h-10"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">{dict.auth.email}</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder={dict.auth.emailPlaceholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="h-10"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">{dict.auth.password}</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder={dict.auth.passwordPlaceholder}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        minLength={8}
                        className="h-10"
                    />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button
                    type="submit"
                    className="w-full h-10"
                    disabled={loading}
                >
                    {loading ? dict.common.loading : dict.auth.register}
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        {dict.auth.orContinueWith}
                    </span>
                </div>
            </div>

            <OAuthButtons
                onGoogleClick={() => handleOAuth("google")}
                onGithubClick={() => handleOAuth("github")}
            />

            <p className="text-center text-sm text-muted-foreground">
                {dict.auth.hasAccount}{" "}
                <Link
                    href={`/${lang}/login`}
                    className="text-primary underline-offset-4 hover:underline"
                >
                    {dict.auth.login}
                </Link>
            </p>
        </div>
    )
}
