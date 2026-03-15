import { WorkflowEntrypoint } from "cloudflare:workers"
import { getNodeRegistry } from "@flareo/plugin-adapter"

export class FlareoWorkflow extends WorkflowEntrypoint {
  async run(event, step) {
    const { input, plan, runId } = event.payload
    const registry = getNodeRegistry()
    const db = this.env.DB

    const context = { input: input ?? {} }

    try {
      for (const s of plan.steps) {
        const nodeDef = registry.get(s.type)
        if (!nodeDef) throw new Error(`Unknown node type: ${s.type}`)
        const prevData =
          s.dependsOn.length === 0
            ? context.input
            : s.dependsOn.length === 1
              ? context[s.dependsOn[0]]
              : Object.fromEntries(s.dependsOn.map((id) => [id, context[id]]))

        context[s.id] = await step.do(`step-${s.id}`, async () => {
          return await nodeDef.execute({ input: prevData, config: s.config })
        })
      }

      const lastKey = plan.steps[plan.steps.length - 1]?.id
      const output = lastKey ? context[lastKey] : context
      const now = new Date().toISOString()
      if (runId && db) {
        await db.prepare(
          "UPDATE runs SET status = ?, output = ?, finished_at = ? WHERE id = ?"
        )
          .bind("complete", JSON.stringify(output), now, runId)
          .run()
      }
      return context
    } catch (err) {
      const now = new Date().toISOString()
      if (runId && db) {
        await db.prepare(
          "UPDATE runs SET status = ?, error = ?, finished_at = ? WHERE id = ?"
        )
          .bind("errored", String(err?.message ?? err), now, runId)
          .run()
      }
      throw err
    }
  }
}
