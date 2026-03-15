import { defineNode } from "@flareo/sdk"

function getByPath(obj, path) {
  const parts = String(path).split(".")
  let v = obj
  for (const p of parts) {
    v = v?.[p]
    if (v === undefined) break
  }
  return v
}

export default defineNode({
  type: "transform",
  name: "Transform",
  icon: "lucide:arrow-left-right",
  category: "core",
  provider: "Built-in",
  description: "Extract a value from input data using a path",
  tags: ["data", "extract", "jsonpath"],
  schema: {
    path: {
      type: "string",
      label: "Path",
      default: "0.title",
      placeholder: "0.title",
      hint: "e.g. 0.title for first item's title",
    },
  },
  async execute({ input, config }) {
    const path = config.path || "0"
    const data = input
    const value = getByPath(data, path)
    return { value }
  },
})
