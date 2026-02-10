"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { WebsocketProvider } from "y-websocket"
import type * as Y from "yjs"
import {
    type CrdtConnection,
    createCrdtConnection,
    normalizeRoomId,
} from "@/lib/crdt"

export type CrdtConnectionStatus =
    | "disabled"
    | "connecting"
    | "connected"
    | "disconnected"
    | "error"

interface UseCrdtDiagramOptions {
    enabled: boolean
    roomId: string
    wsUrl?: string
    initialXml?: string
    onRemoteXml?: (xml: string) => void
}

interface UseCrdtDiagramReturn {
    connectionStatus: CrdtConnectionStatus
    isSynced: boolean
    roomId: string
    syncLocalXml: (xml: string) => void
    awareness: WebsocketProvider["awareness"] | null
}

export function useCrdtDiagram({
    enabled,
    roomId,
    wsUrl,
    initialXml = "",
    onRemoteXml,
}: UseCrdtDiagramOptions): UseCrdtDiagramReturn {
    const [connectionStatus, setConnectionStatus] =
        useState<CrdtConnectionStatus>(enabled ? "connecting" : "disabled")
    const [isSynced, setIsSynced] = useState(false)

    const connectionRef = useRef<CrdtConnection | null>(null)
    const remoteXmlHandlerRef = useRef<typeof onRemoteXml>(onRemoteXml)
    const initialXmlRef = useRef(initialXml)

    const normalizedRoomId = normalizeRoomId(roomId)

    useEffect(() => {
        remoteXmlHandlerRef.current = onRemoteXml
    }, [onRemoteXml])

    useEffect(() => {
        initialXmlRef.current = initialXml
    }, [initialXml])

    const syncLocalXml = useCallback((xml: string) => {
        const connection = connectionRef.current
        if (!connection) return

        const nextXml = xml || ""
        const currentXml = connection.sharedText.toString()
        if (currentXml === nextXml) return

        connection.doc.transact(() => {
            connection.sharedText.delete(0, connection.sharedText.length)
            connection.sharedText.insert(0, nextXml)
        }, "local-xml-sync")
    }, [])

    useEffect(() => {
        if (!enabled) {
            setConnectionStatus("disabled")
            setIsSynced(false)
            connectionRef.current?.destroy()
            connectionRef.current = null
            return
        }

        setConnectionStatus("connecting")
        setIsSynced(false)

        let cancelled = false
        const connection = createCrdtConnection({
            roomId: normalizedRoomId,
            wsUrl,
            enableIndexedDb: true,
        })

        connectionRef.current = connection

        const maybeApplyInitialXml = () => {
            const currentXml = connection.sharedText.toString()
            const nextInitial = initialXmlRef.current || ""
            if (!currentXml && nextInitial) {
                connection.doc.transact(() => {
                    connection.sharedText.insert(0, nextInitial)
                }, "initial-xml")
            }
        }

        const emitRemoteXml = () => {
            const xml = connection.sharedText.toString()
            if (!xml) return
            remoteXmlHandlerRef.current?.(xml)
        }

        const handleStatus = (event: {
            status: "connecting" | "connected" | "disconnected"
        }) => {
            if (cancelled) return

            setConnectionStatus(
                event.status === "connected"
                    ? "connected"
                    : event.status === "connecting"
                      ? "connecting"
                      : "disconnected",
            )
        }

        const handleSync = (synced: boolean) => {
            if (cancelled) return
            setIsSynced(synced)
            if (synced) {
                emitRemoteXml()
            }
        }

        const handleTextChange = (event: Y.YTextEvent) => {
            if (cancelled || event.transaction.local) return
            emitRemoteXml()
        }

        maybeApplyInitialXml()

        connection.wsProvider.on("status", handleStatus)
        connection.wsProvider.on("sync", handleSync)
        connection.sharedText.observe(handleTextChange)

        connection.indexeddbProvider?.whenSynced
            .then(() => {
                if (cancelled) return
                emitRemoteXml()
            })
            .catch(() => {
                if (!cancelled) {
                    setConnectionStatus("error")
                }
            })

        return () => {
            cancelled = true
            connection.wsProvider.off("status", handleStatus)
            connection.wsProvider.off("sync", handleSync)
            connection.sharedText.unobserve(handleTextChange)
            connection.destroy()

            if (connectionRef.current === connection) {
                connectionRef.current = null
            }
        }
    }, [enabled, normalizedRoomId, wsUrl])

    return {
        connectionStatus,
        isSynced,
        roomId: normalizedRoomId,
        syncLocalXml,
        awareness: connectionRef.current?.awareness || null,
    }
}
