"use client"

import { formatDistanceToNow } from "date-fns"
import { AlertTriangle, Clock, Save, Trash2 } from "lucide-react"
import { memo, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useDiagram } from "@/contexts/diagram-context"
import { useDictionary } from "@/hooks/use-dictionary"

interface AutoSaveEntry {
    id: string
    diagramId: string
    xml: string
    timestamp: number
}

interface AutoSaveRestoreDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const AutoSaveRestoreDialog = memo(function AutoSaveRestoreDialog({
    open,
    onOpenChange,
}: AutoSaveRestoreDialogProps) {
    const dict = useDictionary()
    const { loadDiagram, currentDiagramId: currentId } = useDiagram()

    const [autoSaveEntries, setAutoSaveEntries] = useState<AutoSaveEntry[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedEntry, setSelectedEntry] = useState<AutoSaveEntry | null>(
        null,
    )

    // Check for auto-saved versions when dialog opens
    useEffect(() => {
        if (open && currentId) {
            loadAutoSaves()
        }
    }, [open, currentId])

    const loadAutoSaves = async () => {
        setLoading(true)
        try {
            // In a full implementation, this would call the Electron API
            // to fetch auto-save entries for the current diagram
            // For now, we'll simulate empty state
            setAutoSaveEntries([])
        } catch (error) {
            console.error("Failed to load auto-saves:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleRestore = () => {
        if (selectedEntry) {
            loadDiagram(selectedEntry.xml, true)
            onOpenChange(false)
        }
    }

    const handleDiscard = () => {
        // Discard all auto-saved versions
        onOpenChange(false)
    }

    const handleKeepWorking = () => {
        // Close dialog and continue with current state
        onOpenChange(false)
    }

    const hasAutoSaves = autoSaveEntries.length > 0

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {hasAutoSaves ? (
                            <Save className="h-5 w-5 text-yellow-500" />
                        ) : (
                            <AlertTriangle className="h-5 w-5" />
                        )}
                        <span>
                            {dict.autoSave?.recoverTitle ||
                                "Recover Unsaved Work"}
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        {hasAutoSaves
                            ? dict.autoSave?.foundDescription ||
                              "We found auto-saved versions of your diagram"
                            : dict.autoSave?.noSaveDescription ||
                              "No auto-saved versions found"}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-8 text-center text-muted-foreground">
                        {dict.common?.loading || "Loading..."}
                    </div>
                ) : hasAutoSaves ? (
                    <div className="py-4">
                        <div className="space-y-2">
                            {autoSaveEntries.map((entry) => (
                                <div
                                    key={entry.id}
                                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                                        selectedEntry?.id === entry.id
                                            ? "ring-2 ring-primary"
                                            : ""
                                    }`}
                                    onClick={() => setSelectedEntry(entry)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            entry.timestamp,
                                                        ),
                                                        {
                                                            addSuffix: true,
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(
                                                    entry.timestamp,
                                                ).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {entry.diagramId}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-muted-foreground">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p>
                            {dict.autoSave?.noVersionsMessage ||
                                "No auto-saved versions available to recover"}
                        </p>
                    </div>
                )}

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    {hasAutoSaves ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleDiscard}
                                className="flex-1 sm:flex-none"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {dict.autoSave?.discard || "Discard All"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleKeepWorking}
                                className="flex-1 sm:flex-none"
                            >
                                {dict.autoSave?.keepWorking || "Keep Working"}
                            </Button>
                            <Button
                                onClick={handleRestore}
                                disabled={!selectedEntry}
                                className="flex-1 sm:flex-none"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {dict.autoSave?.restore || "Restore Selected"}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={handleKeepWorking}>
                            {dict.autoSave?.startNew || "Start New"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
})

// Helper hook to trigger auto-save recovery check on app startup
export function useAutoSaveRecovery() {
    const [showRecoveryDialog, setShowRecoveryDialog] = useState(false)

    useEffect(() => {
        // Check for unsaved auto-saves on mount
        // This would typically check with the Electron API
        const checkForAutoSaves = async () => {
            // Implementation would check for auto-save entries
            // For now, this is a placeholder
        }

        checkForAutoSaves()
    }, [])

    return { showRecoveryDialog, setShowRecoveryDialog }
}
