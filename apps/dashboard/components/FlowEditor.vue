<template>
  <div class="flow-editor flex min-h-full h-full w-full min-w-full flex-col">
    <!-- Top bar -->
    <header class="editor-topbar flex shrink-0 items-center justify-between gap-3 border-b border-surface-200 bg-white px-4 py-2.5">
      <div class="flex min-w-0 flex-1 items-center gap-2.5">
        <NuxtLink
          to="/flows"
          class="flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900"
        >
          <AppIcon name="lucide:arrow-left" class="h-4 w-4" />
          <span class="hidden sm:inline">Back</span>
        </NuxtLink>
        <div class="h-5 w-px shrink-0 bg-surface-200" />
        <input
          v-model="flowName"
          type="text"
          placeholder="Untitled workflow"
          class="editor-name-input max-w-[240px] truncate rounded-lg border border-transparent bg-transparent px-2.5 py-1.5 text-sm font-semibold text-surface-900 outline-none placeholder:text-surface-400 focus:border-surface-300 focus:bg-surface-50"
        />
        <span
          v-if="hasUnsavedChanges"
          class="shrink-0 text-xs text-amber-600"
        >
          Unsaved
        </span>
        <span
          v-else-if="flowId"
          class="flex shrink-0 items-center gap-1.5 text-xs text-surface-500"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Saved
        </span>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <!-- Zoom controls (compact) -->
        <div class="editor-zoom-controls hidden items-center gap-0.5 rounded-lg border border-surface-200 bg-white p-1 shadow-soft md:flex">
          <button
            type="button"
            class="rounded-md p-1.5 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900"
            title="Zoom out"
            @click="vueFlowRef?.zoomOut()"
          >
            <AppIcon name="lucide:minus" class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="min-w-[3rem] rounded-md px-2 py-1 text-xs font-medium text-surface-500"
            title="Reset zoom"
            @click="vueFlowRef?.fitView({ padding: 0.25, duration: 200 })"
          >
            {{ Math.round((viewport?.zoom ?? 1) * 100) }}%
          </button>
          <button
            type="button"
            class="rounded-md p-1.5 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900"
            title="Zoom in"
            @click="vueFlowRef?.zoomIn()"
          >
            <AppIcon name="lucide:plus" class="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          class="btn-secondary py-2 px-3.5 text-sm"
          :disabled="saving"
          @click="save"
        >
          <span v-if="saving" class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-surface-400 border-t-transparent" />
          <span v-else>Save</span>
        </button>
        <button
          v-if="flowId"
          type="button"
          class="btn-primary py-2 px-3.5 text-sm"
          :disabled="running || !nodes.length"
          @click="run"
        >
          <span v-if="running" class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <AppIcon v-else name="lucide:play" class="h-4 w-4" />
          Run
        </button>
        <div class="relative" ref="menuTriggerRef">
          <button
            type="button"
            class="rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900"
            aria-label="More options"
            @click="showMoreMenu = !showMoreMenu"
          >
            <AppIcon name="lucide:more-vertical" class="h-4 w-4" />
          </button>
          <div
            v-if="showMoreMenu"
            class="editor-dropdown absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-xl border border-surface-200 bg-white py-1 shadow-soft-lg"
          >
            <NuxtLink
              to="/flows"
              class="block px-3.5 py-2 text-sm text-surface-700 transition-colors hover:bg-surface-50 hover:text-surface-900"
              @click="showMoreMenu = false"
            >
              All workflows
            </NuxtLink>
            <NuxtLink
              to="/executions"
              class="block px-3.5 py-2 text-sm text-surface-700 transition-colors hover:bg-surface-50 hover:text-surface-900"
              @click="showMoreMenu = false"
            >
              View executions
            </NuxtLink>
            <button
              type="button"
              class="block w-full px-3.5 py-2 text-left text-sm text-surface-700 transition-colors hover:bg-surface-50 hover:text-surface-900"
              @click="fitView(); showMoreMenu = false"
            >
              Fit to screen
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main: left palette | canvas (full width) -->
    <div class="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <EditorNodePalette
        ref="nodePaletteRef"
        :node-defs="nodeDefs"
        :is-empty-canvas="!nodes.length"
        :expand-trigger="addNodeTrigger"
        @add-node="onAddNodeFromPalette"
        @drag-start="onDragStartFromPalette"
      />
      <div class="relative min-w-0 flex-1 overflow-hidden" ref="containerRef">
        <VueFlow
          ref="vueFlowRef"
          v-model:nodes="nodes"
          v-model:edges="edges"
          class="flow-canvas"
          :default-viewport="defaultViewport"
          :translate-extent="infiniteExtent"
          :snap-to-grid="true"
          :snap-grid="[16, 16]"
          fit-view-on-init
          :fit-view-options="{ padding: 0.25, duration: 0 }"
          pan-on-drag
          zoom-on-scroll
          zoom-on-pinch
          :min-zoom="0.2"
          :max-zoom="2"
          :delete-key-code="['Backspace', 'Delete']"
          @drop="onDrop"
          @dragover="onDragOver"
          @connect="onConnect"
          @node-click="onNodeClick"
          @pane-click="selectedNode = null"
          @init="onFlowInit"
        >
          <!-- Infinite dotted background -->
          <template #zoom-pane>
            <div class="flow-infinite-bg" aria-hidden="true" />
          </template>
          <!-- Empty state overlay -->
          <Panel
            v-if="!nodes.length"
            position="top-center"
            class="!left-1/2 !right-auto !-translate-x-1/2 !bg-transparent !border-0"
          >
            <div class="editor-empty-state group rounded-xl border-2 border-dashed border-surface-300 bg-white/95 px-8 py-6 text-center shadow-soft-lg backdrop-blur-sm transition-all duration-300 hover:border-accent-300 hover:shadow-accent/20">
              <div class="editor-empty-icon relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-accent-50 transition-transform duration-300 group-hover:scale-105">
                <div class="editor-empty-float absolute inset-0 rounded-xl bg-accent-100/50" />
                <AppIcon name="lucide:plus" class="relative h-7 w-7 text-accent-600" />
              </div>
              <h3 class="mb-1 text-base font-semibold text-surface-900">Add your first step</h3>
              <p class="mb-4 max-w-sm text-sm text-surface-500">
                Pick a node from the left panel or drag one onto the canvas.
              </p>
              <p class="text-xs text-surface-400">
                <kbd class="rounded border border-surface-200 bg-surface-50 px-1.5 py-0.5 font-mono text-xs">Drag</kbd>,
                <kbd class="rounded border border-surface-200 bg-surface-50 px-1.5 py-0.5 font-mono text-xs">Click</kbd>, or
                <kbd class="rounded border border-surface-200 bg-surface-50 px-1.5 py-0.5 font-mono text-xs">N</kbd> to add
              </p>
            </div>
          </Panel>
          <!-- Add node FAB -->
          <Panel position="bottom-right" class="!m-3">
            <button
              type="button"
              class="editor-fab group flex h-10 w-10 items-center justify-center rounded-xl border border-surface-200 bg-white text-surface-600 shadow-soft transition-all duration-200 hover:border-accent-300 hover:bg-accent-50 hover:text-accent-600 hover:shadow-accent/20"
              title="Add node (N)"
              @click="focusAddNode"
            >
              <AppIcon name="lucide:plus" class="h-5 w-5 transition-transform group-hover:rotate-90" />
            </button>
          </Panel>
          <!-- Zoom / Fit controls on canvas -->
          <Panel position="bottom-left" class="!m-3">
            <div class="flex flex-col gap-1 rounded-xl border border-surface-200 bg-white p-1 shadow-soft">
              <button
                type="button"
                class="rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900"
                title="Zoom in"
                @click="vueFlowRef?.zoomIn()"
              >
                <AppIcon name="lucide:plus" class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900"
                title="Zoom out"
                @click="vueFlowRef?.zoomOut()"
              >
                <AppIcon name="lucide:minus" class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900"
                title="Fit view"
                @click="fitView()"
              >
                <AppIcon name="lucide:maximize-2" class="h-4 w-4" />
              </button>
            </div>
          </Panel>
        </VueFlow>
      </div>

      <!-- Config overlay -->
      <Teleport to="body">
        <Transition name="config-overlay">
          <div
            v-if="selectedNode && selectedNodeDef"
            class="config-overlay-root fixed inset-0 z-50 flex justify-end"
            @click.self="selectedNode = null"
          >
            <div class="absolute inset-0 bg-surface-900/20 backdrop-blur-sm" aria-hidden="true" />
            <div
              class="config-overlay-panel relative flex h-full w-full max-w-[300px] flex-col border-l border-surface-200 bg-white shadow-soft-lg"
              @click.stop
            >
              <EditorConfigPanel
                :selected-node-def="selectedNodeDef"
                :config="selectedNodeConfig"
                @update:config="onConfigUpdate"
                @deselect="selectedNode = null"
              />
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>

    <!-- Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div
          v-if="toastMessage"
          class="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 shadow-soft-lg"
        >
          {{ toastMessage }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { VueFlow, Panel } from "@vue-flow/core"
import "@vue-flow/core/dist/style.css"
import "@vue-flow/core/dist/theme-default.css"

const props = defineProps({ flowId: String })
const config = useRuntimeConfig()
const containerRef = ref(null)
const vueFlowRef = ref(null)
const menuTriggerRef = ref(null)

const nodeDefs = ref([])
const flowName = ref("New Flow")
const nodes = ref([])
const edges = ref([])
const selectedNode = ref(null)
const showMoreMenu = ref(false)
const saving = ref(false)
const running = ref(false)
const nodePaletteRef = ref(null)
const addNodeTrigger = ref(0)
const toastMessage = ref("")
let toastTimer
const defaultViewport = { x: 0, y: 0, zoom: 0.6 }
const infiniteExtent = [
  [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
  [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
]

const viewport = ref({ zoom: 1 })

const selectedNodeDef = computed(() => {
  const node = nodes.value.find((n) => n.id === selectedNode.value)
  const nodeType = node?.data?.nodeType
  return nodeDefs.value.find((n) => n.type === nodeType)
})

const selectedNodeConfig = computed(() => {
  const node = nodes.value.find((n) => n.id === selectedNode.value)
  return node?.data?.config ?? {}
})

const hasUnsavedChanges = ref(false)

function onConfigUpdate(updatedConfig) {
  const node = nodes.value.find((n) => n.id === selectedNode.value)
  if (node?.data) {
    node.data.config = { ...updatedConfig }
    hasUnsavedChanges.value = true
  }
}

function onNodeClick(e) {
  selectedNode.value = e.node.id
}

function onAddNodeFromPalette(nodeDef) {
  const flow = vueFlowRef.value
  const padding = 80
  let position = { x: 150, y: 150 }
  const selected = nodes.value.find((n) => n.id === selectedNode.value)
  if (selected && flow) {
    const selPos = selected.position
    position = { x: selPos.x + 280, y: selPos.y }
  } else if (flow) {
    const { x, y } = flow.viewport
    const rect = containerRef.value?.getBoundingClientRect()
    if (rect) {
      const centerX = rect.width / 2 - padding
      const centerY = rect.height / 2 - padding
      position = flow.screenToFlowCoordinate({ x: centerX, y: centerY })
    }
  }

  const cfg = {}
  for (const [k, v] of Object.entries(nodeDef.schema || {})) {
    cfg[k] = v?.default ?? (v?.type === "boolean" ? false : "")
  }

  const newNode = {
    id: crypto.randomUUID(),
    type: "default",
    position,
    data: { label: nodeDef.name, config: cfg, nodeType: nodeDef.type },
  }
  nodes.value.push(newNode)
  hasUnsavedChanges.value = true
  selectedNode.value = newNode.id

  if (selected && flow) {
    edges.value.push({ source: selected.id, target: newNode.id })
  }
}

function onDragStartFromPalette() {}

function onFlowInit(store) {
  viewport.value = store.viewport
  store.hooks.viewportChange.on((v) => { viewport.value = v })
}

function fitView() {
  vueFlowRef.value?.fitView({ padding: 0.4, duration: 200 })
}

function focusAddNode() {
  addNodeTrigger.value++
  nextTick(() => nodePaletteRef.value?.focusSearch?.())
}

function showToast(msg) {
  clearTimeout(toastTimer)
  toastMessage.value = msg
  toastTimer = setTimeout(() => { toastMessage.value = "" }, 2000)
}

onMounted(async () => {
  const res = await fetch(`${config.public.apiUrl}/nodes`)
  nodeDefs.value = await res.json()

  if (props.flowId) {
    const flowRes = await fetch(`${config.public.apiUrl}/flows/${props.flowId}`)
    const flow = await flowRes.json()
    flowName.value = flow.name ?? "Untitled"
    const defMap = new Map(nodeDefs.value.map((d) => [d.type, d]))
    nodes.value = (flow.nodes ?? []).map((n, i) => ({
      id: n.id ?? `n-${i}`,
      type: "default",
      position: n.position ?? { x: i * 200, y: 0 },
      data: {
        label: defMap.get(n.type)?.name ?? n.type,
        config: n.data?.config ?? {},
        nodeType: n.type,
      },
    }))
    edges.value = flow.edges ?? []
  } else {
    nodes.value = []
    edges.value = []
  }
})

watch([flowName, nodes, edges], () => { hasUnsavedChanges.value = true }, { deep: true })

function onDragOver(e) {
  e.preventDefault()
}

function onDrop(e) {
  e.preventDefault()
  const data = e.dataTransfer?.getData("application/json")
  if (!data) return
  const { type } = JSON.parse(data)
  const def = nodeDefs.value.find((n) => n.type === type)
  if (!def) return

  const flow = vueFlowRef.value
  const position = flow
    ? flow.screenToFlowCoordinate({ x: e.clientX ?? 0, y: e.clientY ?? 0 })
    : { x: (e.clientX ?? 0) - (containerRef.value?.getBoundingClientRect()?.left ?? 0) - 100, y: (e.clientY ?? 0) - (containerRef.value?.getBoundingClientRect()?.top ?? 0) - 25 }

  const cfg = {}
  for (const [k, v] of Object.entries(def.schema || {})) {
    cfg[k] = v?.default ?? (v?.type === "boolean" ? false : "")
  }

  nodes.value.push({
    id: crypto.randomUUID(),
    type: "default",
    position: { x: position.x - 50, y: position.y - 12 },
    data: { label: def.name, config: cfg, nodeType: type },
  })
  hasUnsavedChanges.value = true
}

function onConnect(params) {
  edges.value.push(params)
  hasUnsavedChanges.value = true
}

function save() {
  const payload = {
    id: props.flowId,
    name: flowName.value,
    nodes: nodes.value.map((n) => ({
      id: n.id,
      type: n.data?.nodeType ?? n.type,
      data: { config: n.data?.config ?? {} },
      position: n.position,
    })),
    edges: edges.value.map((e) => ({ source: e.source, target: e.target })),
  }
  const url = props.flowId
    ? `${config.public.apiUrl}/flows/${props.flowId}`
    : `${config.public.apiUrl}/flows`
  const method = props.flowId ? "PUT" : "POST"
  saving.value = true
  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((r) => r.json())
    .then((data) => {
      if (!props.flowId) navigateTo(`/flows/${data.id}`)
      else {
        hasUnsavedChanges.value = false
        showToast("Saved")
      }
    })
    .finally(() => { saving.value = false })
}

function run() {
  if (!props.flowId) return
  running.value = true
  fetch(`${config.public.apiUrl}/flows/${props.flowId}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  })
    .then((r) => r.json())
    .then(({ runId }) => navigateTo(`/runs/${runId}`))
    .finally(() => { running.value = false })
}

function onKeyDown(e) {
  const target = e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
  if (target) return
  if (e.key === "Escape") {
    selectedNode.value = null
  }
  if (e.key === "n" && !e.metaKey && !e.ctrlKey && !e.altKey) {
    focusAddNode()
  }
}

function closeMoreMenuIfOutside(e) {
  if (menuTriggerRef.value && !menuTriggerRef.value.contains(e.target)) showMoreMenu.value = false
}

onMounted(() => {
  window.addEventListener("keydown", onKeyDown)
  document.addEventListener("click", closeMoreMenuIfOutside)
})
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeyDown)
  document.removeEventListener("click", closeMoreMenuIfOutside)
})
</script>
