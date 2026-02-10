#!/usr/bin/env tsx
import { readFileSync } from "fs"
import { join } from "path"
import { Client } from "pg"

const migrationSQL = readFileSync(
    join(__dirname, "../drizzle/0000_fair_mother_askani.sql"),
    "utf-8",
)

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    })

    try {
        await client.connect()
        console.log("✓ Connected to database")

        await client.query(migrationSQL)
        console.log("✓ Migration completed successfully")

        const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

        console.log(
            "\n✓ Created tables:",
            result.rows.map((r: any) => r.table_name).join(", "),
        )
    } catch (error) {
        console.error("✗ Migration failed:", error)
        process.exit(1)
    } finally {
        await client.end()
    }
}

migrate()
