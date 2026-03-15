import { defineNode } from "@flareo/sdk"

export default defineNode({
  type: "http",
  name: "HTTP Request",
  category: "core",
  provider: "Built-in",
  description: "Make an HTTP request to any URL",
  tags: ["api", "rest", "fetch"],
  schema: {
    url: { type: "string", label: "URL", required: true, placeholder: "https://api.example.com" },
    method: {
      type: "options",
      label: "Method",
      default: "GET",
      options: [
        { name: "GET", value: "GET" },
        { name: "POST", value: "POST" },
        { name: "PUT", value: "PUT" },
        { name: "PATCH", value: "PATCH" },
        { name: "DELETE", value: "DELETE" },
      ],
    },
  },
  async execute({ input, config }) {
    const url = config.url || ""
    const method = config.method || "GET"
    const res = await fetch(url, { method })
    const text = await res.text()
    try {
      return JSON.parse(text)
    } catch {
      return { status: res.status, body: text }
    }
  },
})
