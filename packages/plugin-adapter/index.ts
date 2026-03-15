import nodes from "@flareo/nodes"

const PLUGINS = [nodes]

let _registry = null

function buildRegistry() {
  const registry = new Map()
  for (const plugin of PLUGINS) {
    const nodes = Array.isArray(plugin) ? plugin : [plugin]
    for (const node of nodes) {
      registry.set(node.type, node)
    }
  }
  return registry
}

export function getNodeRegistry() {
  if (!_registry) _registry = buildRegistry()
  return _registry
}

export function getNodeDefinitions() {
  return Array.from(getNodeRegistry().values())
}
