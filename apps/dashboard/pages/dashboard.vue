<template>
  <div class="min-h-full w-full p-5">
    <div class="mb-6 flex items-start justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-surface-900">Dashboard</h1>
        <p class="mt-0.5 text-xs text-surface-500">Automation workflows on the Cloudflare edge.</p>
      </div>
      <div class="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
        <span class="h-1 w-1 animate-pulse rounded-full bg-emerald-500" />
        Live
      </div>
    </div>

    <!-- Stats -->
    <div class="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(stat, i) in stats"
        :key="stat.label"
        class="card card-interactive animate-count-in p-4"
        :style="`animation-delay: ${i * 0.06}s`"
      >
        <p class="text-xs font-medium text-surface-500">{{ stat.label }}</p>
        <p class="mt-1.5 text-2xl font-bold tabular-nums text-surface-900">{{ stat.value }}</p>
        <p v-if="stat.trend" class="mt-0.5 text-xs" :class="stat.trendUp ? 'text-emerald-600' : 'text-surface-400'">
          {{ stat.trend }}
        </p>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="mb-6">
      <h2 class="mb-3 text-sm font-semibold text-surface-900">Quick actions</h2>
      <div class="flex flex-wrap gap-2">
        <NuxtLink to="/flows/new" class="btn-primary no-underline">
          <AppIcon name="lucide:plus" class="h-3.5 w-3.5" />
          New flow
        </NuxtLink>
        <NuxtLink to="/flows" class="btn-secondary no-underline">
          View all flows
          <AppIcon name="lucide:arrow-right" class="h-3.5 w-3.5" />
        </NuxtLink>
      </div>
    </div>

    <!-- Recent runs -->
    <div v-if="runs.length > 0" class="mb-6">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-surface-900">Recent runs</h2>
        <NuxtLink to="/executions" class="text-xs font-medium text-accent-600 transition-colors hover:text-accent-700 no-underline">
          View all
        </NuxtLink>
      </div>
      <div class="space-y-1.5">
        <NuxtLink
          v-for="(run, i) in runs.slice(0, 5)"
          :key="run.id"
          :to="`/runs/${run.id}`"
          class="group card card-interactive flex items-center justify-between gap-3 p-3 no-underline transition-all"
          :style="`animation: countUp 0.35s ease-out ${i * 0.04}s both`"
        >
          <div class="flex min-w-0 items-center gap-2.5">
            <span
              class="h-1.5 w-1.5 shrink-0 rounded-full"
              :class="runStatusClass(run.status)"
            />
            <span class="truncate font-mono text-xs text-surface-700">{{ run.id.slice(0, 8) }}</span>
            <span class="text-[11px] text-surface-500">{{ run.flow_id?.slice(0, 8) }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span
              class="rounded-full px-1.5 py-0.5 text-[11px] font-medium"
              :class="runStatusBadgeClass(run.status)"
            >
              {{ run.status }}
            </span>
            <AppIcon name="lucide:chevron-right" class="h-3.5 w-3.5 text-surface-400 transition-transform group-hover:translate-x-0.5" />
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Recent flows -->
    <div>
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-surface-900">Recent flows</h2>
        <NuxtLink to="/flows" class="text-xs font-medium text-accent-600 transition-colors hover:text-accent-700 no-underline">
          View all
        </NuxtLink>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="space-y-2">
        <div v-for="i in 3" :key="i" class="card flex animate-pulse items-center gap-3 p-4">
          <div class="h-9 w-9 rounded-lg bg-surface-200" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3.5 w-28 rounded bg-surface-200" />
            <div class="h-2.5 w-40 rounded bg-surface-100" />
          </div>
        </div>
      </div>

      <div v-else-if="error" class="card rounded-xl border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {{ error }}
      </div>

      <div v-else-if="flows.length === 0" class="card flex flex-col items-center justify-center rounded-xl border-dashed border-surface-200 p-10 text-center">
        <div class="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-surface-100 text-surface-400">
          <AppIcon name="lucide:workflow" class="h-5 w-5" />
        </div>
        <p class="text-sm font-medium text-surface-600">No flows yet</p>
        <p class="mt-1 text-xs text-surface-500">Create your first flow to get started.</p>
        <NuxtLink to="/flows/new" class="btn-primary mt-4 no-underline">
          Create flow
        </NuxtLink>
      </div>

      <div v-else class="space-y-2">
        <NuxtLink
          v-for="(flow, i) in flows"
          :key="flow.id"
          :to="`/flows/${flow.id}`"
          class="group card card-interactive block p-3.5 no-underline transition-all hover:border-accent-200"
          :style="`animation: countUp 0.4s cubic-bezier(0.4,0,0.2,1) ${i * 0.05}s both`"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600 transition-colors group-hover:bg-accent-100">
                <AppIcon name="lucide:workflow" class="h-4 w-4" />
              </div>
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-surface-900 group-hover:text-accent-600">{{ flow.name }}</p>
                <p class="mt-0.5 font-mono text-[11px] text-surface-500">{{ flow.id }}</p>
              </div>
            </div>
            <AppIcon name="lucide:chevron-right" class="h-4 w-4 shrink-0 text-surface-400 transition-all group-hover:translate-x-0.5 group-hover:text-accent-500" />
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: "default" })

const config = useRuntimeConfig()
const flows = ref([])
const runs = ref([])
const loading = ref(true)
const error = ref("")

const stats = computed(() => [
  { label: "Total flows", value: flows.value.length },
  { label: "Recent runs", value: runs.value.length, trend: runs.value.length ? "Last 24h" : null },
  { label: "Success rate", value: successRate, trend: runs.value.length ? "of recent" : null },
  { label: "Active", value: flows.value.length },
])

const successRate = computed(() => {
  if (!runs.value.length) return "—"
  const ok = runs.value.filter((r) => ["completed", "success"].includes((r.status || "").toLowerCase())).length
  return `${Math.round((ok / runs.value.length) * 100)}%`
})

function runStatusClass(status) {
  const s = (status || "").toLowerCase()
  if (["completed", "success"].includes(s)) return "bg-emerald-500"
  if (["running", "pending", "active"].includes(s)) return "animate-pulse bg-amber-500"
  if (["failed", "error"].includes(s)) return "bg-red-500"
  return "bg-surface-400"
}

function runStatusBadgeClass(status) {
  const s = (status || "").toLowerCase()
  if (["completed", "success"].includes(s)) return "bg-emerald-100 text-emerald-700"
  if (["running", "pending", "active"].includes(s)) return "bg-amber-100 text-amber-700"
  if (["failed", "error"].includes(s)) return "bg-red-100 text-red-700"
  return "bg-surface-100 text-surface-600"
}

async function fetchData() {
  try {
    const [flowsRes, runsRes] = await Promise.all([
      fetch(`${config.public.apiUrl}/flows`),
      fetch(`${config.public.apiUrl}/runs?limit=10`),
    ])
    flows.value = await flowsRes.json()
    runs.value = await runsRes.json()
    error.value = ""
  } catch (e) {
    error.value = String(e)
  } finally {
    loading.value = false
  }
}

let refreshInterval
onMounted(() => {
  fetchData()
  refreshInterval = setInterval(fetchData, 15000)
})
onBeforeUnmount(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>
