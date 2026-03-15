<template>
  <aside
    class="editor-node-palette flex shrink-0 flex-col border-r border-surface-200 bg-white transition-[width] duration-200"
    :class="collapsed ? 'w-14' : 'w-[280px]'"
  >
    <div class="flex shrink-0 items-center justify-between border-b border-surface-200 px-3 py-2.5">
      <h2 v-show="!collapsed" class="text-sm font-semibold text-surface-900">Nodes</h2>
      <button
        type="button"
        class="rounded-xl p-1.5 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700"
        :title="collapsed ? 'Expand panel' : 'Collapse panel'"
        @click="collapsed = !collapsed"
      >
        <AppIcon name="lucide:chevron-right" class="h-4 w-4 transition-transform" :class="collapsed ? '-rotate-90' : 'rotate-90'" />
      </button>
    </div>
    <template v-if="!collapsed">
      <div class="relative shrink-0 p-2">
        <span class="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400">
          <AppIcon name="lucide:search" class="h-4 w-4" />
        </span>
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="search"
          placeholder="Search nodes..."
          class="input-base w-full rounded-xl py-2 pl-9 pr-3 text-sm"
        />
      </div>
      <div class="min-h-0 flex-1 overflow-y-auto p-2">
        <div v-for="(group, cat) in nodesByCategory" :key="cat" class="mb-3">
          <button
            type="button"
            class="category-header flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700"
            @click="toggleCategory(cat)"
          >
            {{ categoryLabel(cat) }}
            <AppIcon name="lucide:chevron-down" class="h-3.5 w-3.5 transition-transform" :class="collapsedCategories.has(cat) ? '-rotate-90' : ''" />
          </button>
          <div v-show="!collapsedCategories.has(cat)" class="mt-1 space-y-0.5">
            <button
              v-for="node in group"
              :key="node.type"
              class="editor-node-item flex w-full items-center gap-2.5 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2.5 text-left text-sm font-medium text-surface-700 transition-all duration-200 hover:border-accent-200 hover:bg-accent-50 hover:text-accent-700 hover:shadow-sm active:scale-[0.98]"
              draggable
              @dragstart="onDragStart($event, node)"
              @click="onNodeClick(node)"
            >
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-100 text-accent-600">
                <AppIcon name="lucide:box" class="h-4 w-4" />
              </span>
              <span class="min-w-0 flex-1 truncate">{{ node.name }}</span>
            </button>
          </div>
        </div>
        <div v-if="!filteredNodeDefs.length" class="py-8 text-center text-sm text-surface-500">
          No nodes match "{{ searchQuery }}"
        </div>
      </div>
    </template>
  </aside>
</template>

<script setup>
const props = defineProps({
  nodeDefs: { type: Array, default: () => [] },
  isEmptyCanvas: { type: Boolean, default: true },
  expandTrigger: { type: Number, default: 0 },
})

const searchInputRef = ref(null)

const emit = defineEmits(['add-node', 'drag-start'])

const searchQuery = ref('')
const collapsed = ref(false)
const collapsedCategories = ref(new Set())

const filteredNodeDefs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.nodeDefs
  return props.nodeDefs.filter(
    (n) =>
      n.name.toLowerCase().includes(q) ||
      (n.type || '').toLowerCase().includes(q) ||
      (n.provider || '').toLowerCase().includes(q) ||
      (n.description || '').toLowerCase().includes(q) ||
      (n.tags || []).some((t) => t.toLowerCase().includes(q))
  )
})

const nodesByCategory = computed(() => {
  const map = {}
  for (const node of filteredNodeDefs.value) {
    const cat = node.category || 'core'
    if (!map[cat]) map[cat] = []
    map[cat].push(node)
  }
  return map
})

function categoryLabel(cat) {
  const labels = {
    trigger: 'Trigger',
    core: 'Core',
    utility: 'Utility',
    transform: 'Transform',
    ai: 'AI',
  }
  return labels[cat] || cat
}

function toggleCategory(cat) {
  const next = new Set(collapsedCategories.value)
  if (next.has(cat)) next.delete(cat)
  else next.add(cat)
  collapsedCategories.value = next
}

function onDragStart(e, node) {
  e.dataTransfer?.setData('application/json', JSON.stringify({ type: node.type }))
  emit('drag-start', node)
}

function onNodeClick(node) {
  emit('add-node', node)
}

function focusSearch() {
  collapsed.value = false
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

watch(() => props.expandTrigger, () => {
  if (props.expandTrigger > 0) focusSearch()
})

defineExpose({ focusSearch })
</script>
