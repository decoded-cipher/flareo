export function compile(graph) {
  const { nodes, edges } = graph

  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const incoming = new Map()
  for (const edge of edges) {
    const list = incoming.get(edge.target) ?? []
    list.push(edge.source)
    incoming.set(edge.target, list)
  }

  const sorted = topologicalSort(nodes.map((n) => n.id), (id) => incoming.get(id) ?? [])
  const steps = []

  for (const nodeId of sorted) {
    const node = nodeMap.get(nodeId)
    if (!node) continue
    steps.push({
      id: nodeId,
      type: node.type,
      config: node.data?.config ?? {},
      dependsOn: incoming.get(nodeId) ?? [],
    })
  }

  return { steps }
}

function topologicalSort(ids, getDeps) {
  const visited = new Set()
  const result = []

  function visit(id) {
    if (visited.has(id)) return
    visited.add(id)
    for (const dep of getDeps(id)) visit(dep)
    result.push(id)
  }

  for (const id of ids) visit(id)
  return result
}
