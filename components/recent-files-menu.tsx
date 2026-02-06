"use client"

import { formatDistanceToNow } from "date-fns"
import { Clock, Loader2 } from "lucide-react"
import { memo, useState } from "react"
import { toast } from "sonner"
import Image from "@/components/image-with-basepath"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDiagram } from "@/contexts/diagram-context"
import { useDictionary } from "@/hooks/use-dictionary"

interface RecentFile {
    filePath: string
    fileName: string
    thumbnail?: string
    openedAt: number
}

interface RecentFilesMenuProps {
    children: React.ReactNode
}

export const RecentFilesMenu = memo(function RecentFilesMenu({
    children,
}: RecentFilesMenuProps) {
    const dict = useDictionary()
    const { recentFilesState, loadDiagram, setCurrentDiagramId } = useDiagram()
    const [loadingFile, setLoadingFile] = useState<string | null>(null)

    const { files, loading } = recentFilesState

    const handleOpenFile = async (file: RecentFile) => {
        // Check if running in Electron
        const isElectron =
            typeof window !== "undefined" &&
            (window as any).electronAPI?.isElectron

        if (!isElectron) {
            toast.error(
                "Recent files are only available in the desktop application",
            )
            return
        }

        try {
            setLoadingFile(file.filePath)

            // Call Electron API to read file content
            const result = await (
                window as any
            ).electronAPI.persistence.readFile(file.filePath)

            if (result.success) {
                // Load the diagram XML
                loadDiagram(result.data, true)

                // Update current diagram ID based on file path
                const diagramId = file.filePath
                setCurrentDiagramId(diagramId)

                toast.success(`Opened ${file.fileName}`)
            } else {
                throw new Error("Failed to read file")
            }
        } catch (error) {
            console.error("Failed to open recent file:", error)
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to open file. It may have been moved or deleted.",
            )
        } finally {
            setLoadingFile(null)
        }
    }

    const formatFileName = (filePath: string): string => {
        // Extract just the filename from the path
        const parts = filePath.split(/[/\\]/)
        return parts[parts.length - 1] || filePath
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{dict.recentFiles?.title || "Recent Files"}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {loading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        {dict.common?.loading || "Loading..."}
                    </div>
                ) : files.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        {dict.recentFiles?.empty || "No recent files"}
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        {files.map((file, index) => {
                            const isLoading = loadingFile === file.filePath

                            return (
                                <DropdownMenuItem
                                    key={`${file.filePath}-${index}`}
                                    className="flex items-start gap-3 p-2 cursor-pointer"
                                    onClick={() => handleOpenFile(file)}
                                    disabled={isLoading}
                                >
                                    {file.thumbnail ? (
                                        <div className="flex-shrink-0 w-16 h-12 bg-white rounded border overflow-hidden">
                                            <Image
                                                src={`data:image/svg+xml,${encodeURIComponent(
                                                    file.thumbnail,
                                                )}`}
                                                alt={formatFileName(
                                                    file.filePath,
                                                )}
                                                width={64}
                                                height={48}
                                                className="object-contain w-full h-full"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex-shrink-0 w-16 h-12 bg-muted rounded flex items-center justify-center">
                                            <Clock className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate flex items-center gap-2">
                                            {file.fileName ||
                                                formatFileName(file.filePath)}
                                            {isLoading && (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">
                                            {file.filePath}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(
                                                new Date(file.openedAt),
                                                {
                                                    addSuffix: true,
                                                },
                                            )}
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            )
                        })}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
})
