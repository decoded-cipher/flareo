import { sql } from "drizzle-orm"
import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const flows = sqliteTable("flows", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nodes: text("nodes").notNull(),
  edges: text("edges").notNull(),
  compiled: text("compiled"),
  created_at: text("created_at").default(sql`(current_timestamp)`),
  updated_at: text("updated_at").default(sql`(current_timestamp)`),
})

export const runs = sqliteTable("runs", {
  id: text("id").primaryKey(),
  flow_id: text("flow_id").notNull().references(() => flows.id),
  status: text("status").notNull(),
  workflow_instance_id: text("workflow_instance_id"),
  input: text("input"),
  output: text("output"),
  error: text("error"),
  started_at: text("started_at"),
  finished_at: text("finished_at"),
  created_at: text("created_at").default(sql`(current_timestamp)`),
})
