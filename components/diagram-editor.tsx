"use client"

import { DrawIoEmbed } from "react-drawio"
import { useDiagram } from "@/contexts/diagram-context"
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

    return (
        <div className={`h-full relative ${isMobile ? "p-1" : "p-2"}`}>
            <div className="h-full rounded-xl overflow-hidden shadow-soft-lg border border-border/30 relative">
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
