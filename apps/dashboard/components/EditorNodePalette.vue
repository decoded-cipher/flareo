<template>
  <aside
    class="node-palette flex shrink-0 flex-col bg-[linear-gradient(180deg,var(--palette-bg-top)_0%,var(--palette-bg)_100%)] transition-[width] duration-300 ease-out"
    :class="collapsed ? 'w-14' : 'w-[300px]'"
  >
    <!-- Collapsed rail: show category icons -->
    <template v-if="collapsed">
      <div class="flex flex-col items-center gap-1 py-3">
        <div class="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-accent-500/15 text-accent-600">
          <AppIcon name="lucide:layers" class="h-3.5 w-3.5" />
        </div>
        <button
          v-for="(_, cat) in nodesByCategory"
          :key="cat"
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-white/80 hover:text-surface-700"
          :title="categoryLabel(cat)"
          @click="expandAndScrollTo(cat)"
        >
          <AppIcon :name="categoryIcons[cat] || 'lucide:box'" class="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        class="mt-auto flex shrink-0 flex-col items-center gap-0 py-3 text-surface-400 transition-colors hover:text-surface-600"
        title="Expand panel"
        @click="collapsed = false"
      >
        <AppIcon name="lucide:panel-right-open" class="h-4 w-4" />
      </button>
      <div class="h-px shrink-0 bg-surface-200/60" />
      <div class="min-h-0 flex-1" />
    </template>

    <template v-else>
      <!-- Header: minimal -->
      <div class="flex shrink-0 items-center justify-between gap-2 border-b border-surface-200/70 px-3 py-2.5">
        <div class="flex min-w-0 items-center gap-2">
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-500/12 text-accent-600">
            <AppIcon name="lucide:layers" class="h-3.5 w-3.5" />
          </div>
          <span class="truncate text-sm font-semibold tracking-tight text-surface-800">Nodes</span>
        </div>
        <button
          type="button"
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
          title="Collapse panel"
          @click="collapsed = true"
        >
          <AppIcon name="lucide:panel-right-close" class="h-3.5 w-3.5" />
        </button>
      </div>

      <!-- Search -->
      <div class="shrink-0 px-2.5 py-2">
        <div class="relative">
          <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400">
            <AppIcon name="lucide:search" class="h-3.5 w-3.5" />
          </span>
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="search"
            placeholder="Search..."
            class="node-palette-search w-full rounded-md border-0 bg-surface-100/90 py-2 pl-8 pr-2.5 text-[13px] text-surface-800 placeholder-surface-400 outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-accent-400/30"
          />
        </div>
      </div>

      <!-- Node list -->
      <div class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 pb-3">
        <template v-for="(group, cat) in nodesByCategory" :key="cat">
          <section class="node-category mb-3">
            <button
              type="button"
              class="category-trigger flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-100/80"
              @click="toggleCategory(cat)"
            >
              <span
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded"
                :class="[categoryIconBg(cat), categoryIconColor(cat)]"
              >
                <AppIcon :name="categoryIcons[cat] || 'lucide:box'" class="h-3 w-3" />
              </span>
              <span class="min-w-0 flex-1 truncate text-[11px] font-semibold uppercase tracking-wider text-surface-500">
                {{ categoryLabel(cat) }}
              </span>
              <span class="text-[10px] text-surface-400 tabular-nums">{{ group.length }}</span>
              <AppIcon
                name="lucide:chevron-down"
                class="h-3 w-3 shrink-0 text-surface-400 transition-transform duration-200"
                :class="collapsedCategories.has(cat) ? '-rotate-90' : ''"
              />
            </button>
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-1"
            >
              <div v-show="!collapsedCategories.has(cat)" class="space-y-0.5 pl-1">
                <button
                  v-for="node in group"
                  :key="node.type"
                  class="node-item group flex w-full items-center gap-3 rounded-lg border border-transparent px-2.5 py-2 text-left transition-all duration-150 hover:border-surface-200/80 hover:bg-white hover:shadow-sm"
                  draggable
                  :title="node.description || node.name"
                  @dragstart="onDragStart($event, node)"
                  @click="onNodeClick(node)"
                >
                  <span
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
                    :class="nodeIconBgClass(node)"
                  >
                    <AppIcon :name="nodeIconName(node)" class="h-4 w-4" :class="nodeIconColorClass(node)" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <span class="block truncate text-[13px] font-medium text-surface-800 group-hover:text-accent-700">
                      {{ node.name }}
                    </span>
                    <p v-if="node.description" class="mt-0.5 line-clamp-1 text-[11px] text-surface-500">
                      {{ node.description }}
                    </p>
                  </div>
                  <span class="shrink-0 text-surface-300 opacity-0 transition-opacity group-hover:opacity-100">
                    <AppIcon name="lucide:grip-vertical" class="h-3.5 w-3.5" />
                  </span>
                </button>
              </div>
            </Transition>
          </section>
        </template>

        <div
          v-if="!filteredNodeDefs.length"
          class="flex flex-col items-center justify-center py-10 text-center"
        >
          <div class="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-100 text-surface-400">
            <AppIcon name="lucide:search-x" class="h-5 w-5" />
          </div>
          <p class="text-[13px] font-medium text-surface-600">No matches</p>
          <p class="mt-0.5 text-[11px] text-surface-500">Try a different search</p>
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

const iconFallbackByType = {
  http: 'lucide:globe',
  webhook: 'lucide:webhook',
  transform: 'lucide:arrow-left-right',
  trigger: 'lucide:zap',
  ai: 'lucide:cpu',
  utility: 'lucide:puzzle',
}

function nodeIconName(node) {
  const name = node.icon || iconFallbackByType[node.type] || iconFallbackByType[node.category] || 'lucide:box'
  return name.startsWith('lucide:') ? name : `lucide:${name}`
}

function nodeIconBgClass(node) {
  const cat = (node.category || 'core').toLowerCase()
  const map = {
    trigger: 'bg-amber-100/90 group-hover:bg-amber-200/90',
    core: 'bg-indigo-100/90 group-hover:bg-indigo-200/90',
    utility: 'bg-emerald-100/90 group-hover:bg-emerald-200/90',
    transform: 'bg-violet-100/90 group-hover:bg-violet-200/90',
    ai: 'bg-sky-100/90 group-hover:bg-sky-200/90',
  }
  return map[cat] || 'bg-accent-100/90 group-hover:bg-accent-200/90'
}

function nodeIconColorClass(node) {
  const cat = (node.category || 'core').toLowerCase()
  const map = {
    trigger: 'text-amber-600',
    core: 'text-indigo-600',
    utility: 'text-emerald-600',
    transform: 'text-violet-600',
    ai: 'text-sky-600',
  }
  return map[cat] || 'text-accent-600'
}

const categoryLabels = {
  trigger: 'Trigger',
  core: 'Core',
  utility: 'Utility',
  transform: 'Transform',
  ai: 'AI',
}

function categoryLabel(cat) {
  return categoryLabels[cat] || cat
}

const categoryIcons = {
  trigger: 'lucide:zap',
  core: 'lucide:box',
  utility: 'lucide:puzzle',
  transform: 'lucide:arrow-left-right',
  ai: 'lucide:cpu',
}

function categoryIconBg(cat) {
  const map = {
    trigger: 'bg-amber-100',
    core: 'bg-indigo-100',
    utility: 'bg-emerald-100',
    transform: 'bg-violet-100',
    ai: 'bg-sky-100',
  }
  return map[cat] || 'bg-surface-100'
}

function categoryIconColor(cat) {
  const map = {
    trigger: 'text-amber-600',
    core: 'text-indigo-600',
    utility: 'text-emerald-600',
    transform: 'text-violet-600',
    ai: 'text-sky-600',
  }
  return map[cat] || 'text-surface-600'
}

function toggleCategory(cat) {
  const next = new Set(collapsedCategories.value)
  if (next.has(cat)) next.delete(cat)
  else next.add(cat)
  collapsedCategories.value = next
}

function expandAndScrollTo(cat) {
  collapsed.value = false
  collapsedCategories.value = new Set(collapsedCategories.value)
  collapsedCategories.value.delete(cat)
  nextTick(() => {
    searchInputRef.value?.focus()
  })
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

<style scoped>
.node-palette {
  --palette-bg-top: #fafafa;
  --palette-bg: #f5f5f5;
  border-right: 1px solid var(--color-border, #e5e5e5);
}

.node-palette-search::placeholder {
  color: inherit;
  opacity: 0.6;
}

.node-item:active {
  transform: scale(0.99);
}
</style>
