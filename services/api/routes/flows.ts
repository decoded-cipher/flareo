import type { Hono } from "hono"
import { drizzle } from "drizzle-orm/d1"
import { desc, eq } from "drizzle-orm"
import { compile } from "@flareo/compiler"
import * as schema from "../schema"

function parseJson(raw: string | null | undefined, fallback: unknown) {
  if (raw == null || raw === "") return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function flowsRoutes(app: Hono) {
  app.get("/flows", async (c) => {
    const db = drizzle(c.env.DB, { schema })
    const list = await db.select().from(schema.flows).orderBy(desc(schema.flows.updated_at))
    return c.json(list)
  })

  app.post("/flows", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>
    const id = (body?.id as string) ?? crypto.randomUUID()
    const nodes = (body?.nodes ?? []) as Array<{ id: string; type?: string; data?: unknown }>
    const edges = (body?.edges ?? []) as Array<{ source: string; target: string }>
    let compiled: string | null = null
    try {
      compiled = JSON.stringify(
        compile({
          nodes: nodes.map((n) => ({ id: n.id, type: n.type ?? "default", data: n.data })),
          edges: edges.map((e) => ({ source: e.source, target: e.target })),
        })
      )
    } catch {
      /* leave compiled null if graph is empty/invalid */
    }
    const db = drizzle(c.env.DB, { schema })
    await db.insert(schema.flows).values({
      id,
      name: (body?.name as string) ?? "Untitled",
      nodes: JSON.stringify(nodes),
      edges: JSON.stringify(edges),
      compiled,
    })
    return c.json({ id, name: (body?.name as string) ?? "Untitled" })
  })

  app.get("/flows/:id", async (c) => {
    const id = c.req.param("id")
    const db = drizzle(c.env.DB, { schema })
    const [flow] = await db.select().from(schema.flows).where(eq(schema.flows.id, id))
    if (!flow) return c.json({ error: "Flow not found" }, 404)
    return c.json({ ...flow, nodes: parseJson(flow.nodes, []), edges: parseJson(flow.edges, []) })
  })

  app.put("/flows/:id", async (c) => {
    const id = c.req.param("id")
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>
    const db = drizzle(c.env.DB, { schema })
    const [flow] = await db.select().from(schema.flows).where(eq(schema.flows.id, id))
    if (!flow) return c.json({ error: "Flow not found" }, 404)
    const name = (body?.name as string) ?? flow.name
    const nodesRaw = body?.nodes !== undefined ? body.nodes : parseJson(flow.nodes, [])
    const edgesRaw = body?.edges !== undefined ? body.edges : parseJson(flow.edges, [])
    const nodes = nodesRaw as Array<{ id: string; type?: string; data?: unknown }>
    const edges = edgesRaw as Array<{ source: string; target: string }>
    let compiled: string | null = null
    try {
      compiled = JSON.stringify(
        compile({
          nodes: nodes.map((n) => ({ id: n.id, type: n.type ?? "default", data: n.data })),
          edges: edges.map((e) => ({ source: e.source, target: e.target })),
        })
      )
    } catch {
      /* leave compiled null if graph is empty/invalid */
    }
    await db
      .update(schema.flows)
      .set({
        name,
        nodes: JSON.stringify(nodes),
        edges: JSON.stringify(edges),
        compiled,
        updated_at: new Date().toISOString(),
      })
      .where(eq(schema.flows.id, id))
    return c.json({ id, name })
  })

  app.delete("/flows/:id", async (c) => {
    const db = drizzle(c.env.DB, { schema })
    await db.delete(schema.flows).where(eq(schema.flows.id, c.req.param("id")))
    return c.json({ success: true })
  })

  app.post("/flows/:id/run", async (c) => {
    const flowId = c.req.param("id")
    const input = await c.req.json().catch(() => ({}))
    const runId = crypto.randomUUID()
    const db = drizzle(c.env.DB, { schema })

    const [flow] = await db.select().from(schema.flows).where(eq(schema.flows.id, flowId))

    if (!flow) return c.json({ error: "Flow not found" }, 404)

    let steps: Array<{ id: string; type: string; config: unknown; dependsOn: string[] }> = []
    const compiledPlan = flow.compiled ? parseJson(flow.compiled, null) as { steps: typeof steps } | null : null
    if (compiledPlan?.steps?.length) {
      steps = compiledPlan.steps
    } else {
      const nodes = parseJson(flow.nodes, []) as Array<{ id: string; type?: string; data?: unknown }>
      const edges = parseJson(flow.edges, []) as Array<{ source: string; target: string }>
      try {
        steps = compile({
          nodes: nodes.map((n) => ({ id: n.id, type: n.type ?? "default", data: n.data })),
          edges: edges.map((e) => ({ source: e.source, target: e.target })),
        }).steps
      } catch (err) {
        await db.insert(schema.runs).values({ id: runId, flow_id: flowId, status: "failed", input: JSON.stringify(input), error: String(err) })
        return c.json({ error: "Failed to compile flow", runId }, 500)
      }
    }
    
    await db.insert(schema.runs).values({ id: runId, flow_id: flowId, status: "queued", input: JSON.stringify(input) })
    
    try {
      const instance = await c.env.FLAREO_WORKFLOW.create({ params: { flowId, runId, input, plan: { steps } } })
      await db.update(schema.runs).set({ workflow_instance_id: instance.id, status: "running" }).where(eq(schema.runs.id, runId))
      return c.json({ runId, instanceId: instance.id })
    } catch (err) {
      await db.update(schema.runs).set({ status: "failed", error: String(err) }).where(eq(schema.runs.id, runId))
      return c.json({ error: "Failed to start workflow", runId }, 500)
    }
  })
}
