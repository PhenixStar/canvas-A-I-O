import { sql } from "drizzle-orm"
import { db } from "../lib/db"

async function setupWebSocketDb() {
    console.log("Running WebSocket database setup...")

    await db.execute(sql`
        create table if not exists yjs_document (
            id text primary key,
            data bytea not null,
            updated_at timestamptz not null default now()
        )
    `)

    await db.execute(sql`
        create table if not exists yjs_update_log (
            id bigserial primary key,
            document_id text not null references yjs_document(id) on delete cascade,
            update_data bytea not null,
            user_id text references "user"(id) on delete set null,
            created_at timestamptz not null default now()
        )
    `)

    await db.execute(sql`
        create index if not exists yjs_update_log_document_id_idx
        on yjs_update_log(document_id)
    `)

    await db.execute(sql`
        create index if not exists yjs_update_log_user_id_idx
        on yjs_update_log(user_id)
    `)

    console.log("WebSocket database setup complete.")
}

setupWebSocketDb()
    .then(() => {
        process.exit(0)
    })
    .catch((error) => {
        console.error("WebSocket database setup failed:", error)
        process.exit(1)
    })
