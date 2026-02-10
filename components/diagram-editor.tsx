"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { DrawIoEmbed } from "react-drawio"
import { CollaborativeCursorLayer } from "@/components/collaborative-cursor-layer"
import { FollowingIndicator } from "@/components/following-indicator"
import { PresenceBadge } from "@/components/presence-badge"
import { useDiagram, usePresence } from "@/contexts/diagram-context"
import { useFollowUser } from "@/hooks/use-follow-user"
import type { Locale } from "@/lib/i18n/config"

interface DiagramEditorProps {
    drawioUi: "min" | "sketch"
    darkMode: boolean
    currentLang: Locale
    isMobile: boolean
    isLoaded: boolean
    isDrawioReady: boolean
    isElectron: boolean
    drawioBaseUrl: string
    onDrawioLoad: () => void
}

export function DiagramEditor({
    drawioUi,
    darkMode,
    currentLang,
    isMobile,
    isLoaded,
    isDrawioReady,
    isElectron,
    drawioBaseUrl,
    onDrawioLoad,
}: DiagramEditorProps) {
    const { drawioRef, handleDiagramAutoSave, handleDiagramExport } =
        useDiagram()
    const { localUser, remoteUsers, allUsers, status, updateCursor } =
        usePresence()

    const diagramContainerRef = useRef<HTMLDivElement>(null)

    // Follow user state
    const [followedUserId, setFollowedUserId] = useState<string | null>(null)

    // Follow user hook - handles auto-scroll and unfollow triggers
    const { isFollowing, followedUser } = useFollowUser({
        followedUserId,
        remoteUsers,
        diagramContainerRef,
        onUnfollow: () => setFollowedUserId(null),
    })

    // Handle follow user action
    const handleFollowUser = useCallback((userId: string) => {
        setFollowedUserId(userId)
    }, [])

    // Handle unfollow user action
    const handleUnfollowUser = useCallback(() => {
        setFollowedUserId(null)
    }, [])

    // Track mouse movement for local cursor broadcast
    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!diagramContainerRef.current || !updateCursor) {
                return
            }

            const rect = diagramContainerRef.current.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            // Broadcast cursor position (throttled in hook)
            updateCursor(x, y)
        },
        [updateCursor],
    )

    // Log connection status changes for debugging
    useEffect(() => {
        if (status === "connected") {
            console.log("[DiagramEditor] Multiplayer connected", {
                localUser,
                remoteUsersCount: remoteUsers.size,
            })
        } else if (status === "disconnected") {
            console.log("[DiagramEditor] Multiplayer disconnected")
        }
    }, [status, localUser, remoteUsers.size])

    return (
        <div className={`h-full relative ${isMobile ? "p-1" : "p-2"}`}>
            {/* Connection Status Badge */}
            {status !== "disconnected" && (
                <div className="absolute top-4 left-4 z-40">
                    <div
                        className={`
                        px-3 py-1.5 rounded-full text-xs font-medium
                        flex items-center gap-2
                        backdrop-blur-sm border shadow-sm
                        ${
                            status === "connected"
                                ? "bg-green-100/80 text-green-800 dark:bg-green-900/80 dark:text-green-100 border-green-300/30 dark:border-green-700/30"
                                : "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/80 dark:text-yellow-100 border-yellow-300/30 dark:border-yellow-700/30"
                        }
                    `}
                    >
                        <span
                            className={`
                                w-2 h-2 rounded-full
                                ${status === "connected" ? "bg-green-500" : "bg-yellow-500 animate-pulse"}
                            `}
                        />
                        {status === "connected"
                            ? "Collaborating"
                            : "Connecting..."}
                    </div>
                </div>
            )}

            {/* Presence Badge */}
            {allUsers.length > 0 && localUser && (
                <div className="absolute top-4 right-4 z-40">
                    <PresenceBadge
                        users={allUsers}
                        localUserId={localUser.user.id}
                        followedUserId={followedUserId}
                        onFollowUser={handleFollowUser}
                        onUnfollowUser={handleUnfollowUser}
                        position="top-right"
                    />
                </div>
            )}

            {/* Following Indicator */}
            {isFollowing && followedUser && (
                <FollowingIndicator
                    userName={followedUser.user.name}
                    onUnfollow={handleUnfollowUser}
                />
            )}

            <div
                ref={diagramContainerRef}
                className="h-full rounded-xl overflow-hidden shadow-soft-lg border border-border/30 relative"
                onMouseMove={handleMouseMove}
            >
                {isLoaded && (
                    <div
                        className={`h-full w-full ${
                            isDrawioReady ? "" : "invisible absolute inset-0"
                        }`}
                    >
                        <DrawIoEmbed
                            key={`${drawioUi}-${darkMode}-${currentLang}-${isElectron}`}
                            ref={drawioRef}
                            autosave
                            onAutoSave={(data) =>
                                handleDiagramAutoSave(data.xml)
                            }
                            onExport={handleDiagramExport}
                            onLoad={onDrawioLoad}
                            baseUrl={drawioBaseUrl}
                            urlParameters={{
                                ui: drawioUi,
                                spin: false,
                                libraries: false,
                                saveAndExit: false,
                                noSaveBtn: true,
                                noExitBtn: true,
                                dark: darkMode,
                                lang: currentLang,
                                // Enable offline mode in Electron to disable external service calls
                                ...(isElectron && {
                                    offline: true,
                                }),
                            }}
                        />
                    </div>
                )}

                {/* Collaborative Cursors Layer */}
                {remoteUsers.size > 0 && (
                    <CollaborativeCursorLayer
                        remoteUsers={remoteUsers}
                        diagramContainerRef={diagramContainerRef}
                    />
                )}

                {(!isLoaded || !isDrawioReady) && (
                    <div className="h-full w-full bg-background flex items-center justify-center">
                        <span className="text-muted-foreground">
                            Draw.io panel is loading...
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
