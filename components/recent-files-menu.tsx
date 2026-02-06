"use client"

import { memo } from "react"
import Image from "@/components/image-with-basepath"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Clock } from "lucide-react"
import { useDiagram } from "@/contexts/diagram-context"
import { useDictionary } from "@/hooks/use-dictionary"
import { formatMessage } from "@/lib/i18n/utils"
import { formatDistanceToNow } from "date-fns"

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
    const { recentFilesState, loadDiagram } = useDiagram()

    const { files, loading } = recentFilesState

    const handleOpenFile = (file: RecentFile) => {
        // For desktop files, we'd need to read from the file system
        // For now, we'll just log it. In a full implementation,
        // you'd call an Electron API to read the file content
        console.log("Opening recent file:", file)

        // TODO: Implement file opening logic
        // This would involve:
        // 1. Calling Electron API to read file content
        // 2. Loading the XML into the diagram
        // 3. Updating the current diagram ID
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
                        {files.map((file, index) => (
                            <DropdownMenuItem
                                key={`${file.filePath}-${index}`}
                                className="flex items-start gap-3 p-2 cursor-pointer"
                                onClick={() => handleOpenFile(file)}
                            >
                                {file.thumbnail ? (
                                    <div className="flex-shrink-0 w-16 h-12 bg-white rounded border overflow-hidden">
                                        <Image
                                            src={`data:image/svg+xml,${encodeURIComponent(
                                                file.thumbnail,
                                            )}`}
                                            alt={formatFileName(file.filePath)}
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
                                    <div className="text-sm font-medium truncate">
                                        {file.fileName ||
                                            formatFileName(file.filePath)}
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
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
})
