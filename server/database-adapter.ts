import type {
    Extension,
    onLoadDocumentPayload,
    onStoreDocumentPayload,
} from "@hocuspocus/server"
import { eq } from "drizzle-orm"
import { applyUpdate, encodeStateAsUpdate } from "yjs"
import { db } from "../lib/db"
import { yjsDocument, yjsUpdateLog } from "../lib/db/schema"
import { logger } from "./logger"

export interface DatabaseAdapterOptions {
    enableUpdateLog?: boolean
    maxDocumentBytes?: number
}

const DEFAULT_MAX_DOCUMENT_BYTES = 10 * 1024 * 1024

export class DatabaseAdapter implements Extension {
    extensionName = "PostgresDatabaseAdapter"

    private readonly enableUpdateLog: boolean
    private readonly maxDocumentBytes: number

    constructor(options: DatabaseAdapterOptions = {}) {
        this.enableUpdateLog = Boolean(options.enableUpdateLog)
        this.maxDocumentBytes =
            options.maxDocumentBytes && options.maxDocumentBytes > 0
                ? options.maxDocumentBytes
                : DEFAULT_MAX_DOCUMENT_BYTES
    }

    async onLoadDocument({
        documentName,
        document,
    }: onLoadDocumentPayload): Promise<void> {
        try {
            const existing = await db.query.yjsDocument.findFirst({
                where: eq(yjsDocument.id, documentName),
            })

            if (!existing?.data) {
                logger.debug("No stored Yjs document state found", {
                    documentName,
                })
                return
            }

            applyUpdate(document, this.toUint8Array(existing.data))
            logger.info("Loaded Yjs document state", {
                documentName,
                bytes: existing.data.length,
            })
        } catch (error) {
            logger.error("Failed loading Yjs document from PostgreSQL", {
                documentName,
                error,
            })
            throw error
        }
    }

    async onStoreDocument({
        documentName,
        document,
        context,
    }: onStoreDocumentPayload): Promise<void> {
        const encodedState = encodeStateAsUpdate(document)

        if (encodedState.byteLength > this.maxDocumentBytes) {
            throw new Error(
                `Document exceeds limit (${encodedState.byteLength} > ${this.maxDocumentBytes})`,
            )
        }

        const stateBuffer = Buffer.from(encodedState)
        const userId =
            typeof context?.user?.userId === "string" && context.user.userId
                ? context.user.userId
                : null

        try {
            await db.transaction(async (tx) => {
                const now = new Date()

                await tx
                    .insert(yjsDocument)
                    .values({
                        id: documentName,
                        data: stateBuffer,
                        updatedAt: now,
                    })
                    .onConflictDoUpdate({
                        target: yjsDocument.id,
                        set: {
                            data: stateBuffer,
                            updatedAt: now,
                        },
                    })

                if (this.enableUpdateLog) {
                    await tx.insert(yjsUpdateLog).values({
                        documentId: documentName,
                        updateData: stateBuffer,
                        userId,
                        createdAt: now,
                    })
                }
            })

            logger.debug("Stored Yjs document state", {
                documentName,
                bytes: stateBuffer.length,
                userId,
            })
        } catch (error) {
            logger.error("Failed storing Yjs document in PostgreSQL", {
                documentName,
                error,
            })
            throw error
        }
    }

    private toUint8Array(input: Buffer | Uint8Array): Uint8Array {
        if (!Buffer.isBuffer(input)) {
            return input
        }

        return new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
    }
}
