import { defineNode } from "@flareo/sdk"

const DEFAULT_WEBHOOK =
  "https://discord.com/api/webhooks/1479831788779208786/X6Aw7O5LnmMQVKTUOLwEC92PaaNigBXHNE8tC1i5Z_w494P3bTxrhXtghJn06a1kk-MN"

export default defineNode({
  type: "webhook",
  name: "Webhook",
  category: "utility",
  provider: "Built-in",
  description: "Send data to a webhook URL",
  tags: ["webhook", "discord", "notify"],
  schema: {
    url: {
      type: "string",
      label: "Webhook URL",
      default: DEFAULT_WEBHOOK,
      placeholder: "https://...",
    },
  },
  async execute({ input, config }) {
    const url = config?.url || DEFAULT_WEBHOOK
    const content =
      typeof input === "string" ? input : JSON.stringify(input, null, 2)
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })
    return input
  },
})
