"use client"

import { memo, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Search, History, Clock, FileText } from "lucide-react"
import { useDiagram } from "@/contexts/diagram-context"
import { useDictionary } from "@/hooks/use-dictionary"
import { formatMessage } from "@/lib/i18n/utils"
import { formatDistanceToNow } from "date-fns"

interface DiagramHistoryEntry {
    id: string
    diagramId: string
    version: number
    data: string
    timestamp: number
}

interface DiagramHistoryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const DiagramHistoryDialog = memo(
    function DiagramHistoryDialog({
        open,
        onOpenChange,
    }: DiagramHistoryDialogProps) {
        const dict = useDictionary()
        const { historyState, loadDiagram } = useDiagram()
        const { history, loading } = historyState

        const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
        const [searchQuery, setSearchQuery] = useState("")

        // Filter history based on search query
        const filteredHistory = useMemo(() => {
            if (!searchQuery.trim()) return history

            const query = searchQuery.toLowerCase()
            return history.filter((entry: DiagramHistoryEntry) => {
                // Search in version number and timestamp
                const versionMatch = entry.version.toString().includes(query)
                const dateMatch = new Date(entry.timestamp)
                    .toISOString()
                    .toLowerCase()
                    .includes(query)

                return versionMatch || dateMatch
            })
        }, [history, searchQuery])

        const handleClose = () => {
            setSelectedIndex(null)
            setSearchQuery("")
            onOpenChange(false)
        }

        const handleConfirmRestore = () => {
            if (selectedIndex !== null && filteredHistory[selectedIndex]) {
                const entry = filteredHistory[selectedIndex]
                // Load the XML data from the history entry
                // The data field contains the diagram XML
                loadDiagram(entry.data, true)
                handleClose()
            }
        }

        const handleRestoreVersion = (index: number) => {
            setSelectedIndex(index)
            handleConfirmRestore()
        }

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            <span>
                                {dict.history?.title || "Diagram History"}
                            </span>
                        </DialogTitle>
                        <DialogDescription>
                            {dict.history?.description ||
                                "View and restore previous versions of your diagram"}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={
                                dict.history?.searchPlaceholder ||
                                "Search by version or date..."
                            }
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            {dict.common?.loading || "Loading..."}
                        </div>
                    ) : filteredHistory.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            {searchQuery
                                ? (dict.history?.noResults ||
                                  "No matching versions found")
                                : (dict.history?.noHistory ||
                                  "No history available")}
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
                                {filteredHistory.map(
                                    (entry: DiagramHistoryEntry, index) => (
                                        <div
                                            key={`${entry.id}-${index}`}
                                            className={`border rounded-md overflow-hidden transition-all cursor-pointer hover:shadow-md ${
                                                selectedIndex === index
                                                    ? "ring-2 ring-primary"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handleRestoreVersion(index)
                                            }
                                        >
                                            {/* Thumbnail Preview - Safe placeholder */}
                                            <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 border-b flex items-center justify-center">
                                                <div className="text-center p-4">
                                                    <FileText className="h-12 w-12 mx-auto text-primary/50 mb-2" />
                                                    <div className="text-xs text-muted-foreground">
                                                        v{entry.version}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Version Info */}
                                            <div className="p-3 bg-card">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="text-sm font-medium">
                                                        {dict.history?.version ||
                                                            "Version"}{" "}
                                                        {entry.version}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDistanceToNow(
                                                        new Date(entry.timestamp),
                                                        {
                                                            addSuffix: true,
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex-shrink-0">
                        {selectedIndex !== null ? (
                            <>
                                <div className="flex-1 text-sm text-muted-foreground">
                                    {formatMessage(
                                        dict.history?.restoreTo ||
                                            "Restore to version {version}",
                                        {
                                            version:
                                                filteredHistory[selectedIndex]
                                                    ?.version,
                                        },
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedIndex(null)}
                                >
                                    {dict.common?.cancel || "Cancel"}
                                </Button>
                                <Button onClick={handleConfirmRestore}>
                                    {dict.common?.confirm || "Confirm"}
                                </Button>
                            </>
                        ) : (
                            <Button variant="outline" onClick={handleClose}>
                                {dict.common?.close || "Close"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    },
)
