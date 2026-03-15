<template>
  <div class="p-8">
    <div class="mb-10 flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Dashboard</h1>
        <p class="mt-1 text-surface-500">Automation workflows running on the Cloudflare edge.</p>
      </div>
      <div class="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
        <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        Live
      </div>
    </div>

    <!-- Stats -->
    <div class="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(stat, i) in stats"
        :key="stat.label"
        class="card card-interactive animate-count-in p-6"
        :style="`animation-delay: ${i * 0.06}s`"
      >
        <p class="text-sm font-medium text-surface-500">{{ stat.label }}</p>
        <p class="mt-2 text-3xl font-bold tabular-nums text-surface-900">{{ stat.value }}</p>
        <p v-if="stat.trend" class="mt-1 text-sm" :class="stat.trendUp ? 'text-emerald-600' : 'text-surface-400'">
          {{ stat.trend }}
        </p>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="mb-10">
      <h2 class="mb-4 text-lg font-semibold text-surface-900">Quick actions</h2>
      <div class="flex flex-wrap gap-3">
        <NuxtLink to="/flows/new" class="btn-primary no-underline">
          <AppIcon name="lucide:plus" class="h-4 w-4" />
          New flow
        </NuxtLink>
        <NuxtLink to="/flows" class="btn-secondary no-underline">
          View all flows
          <AppIcon name="lucide:arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>
    </div>

    <!-- Recent runs -->
    <div v-if="runs.length > 0" class="mb-10">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-surface-900">Recent runs</h2>
        <NuxtLink to="/executions" class="text-sm font-medium text-accent-600 transition-colors hover:text-accent-700 no-underline">
          View all
        </NuxtLink>
      </div>
      <div class="space-y-2">
        <NuxtLink
          v-for="(run, i) in runs.slice(0, 5)"
          :key="run.id"
          :to="`/runs/${run.id}`"
          class="group card card-interactive flex items-center justify-between gap-4 p-4 no-underline transition-all"
          :style="`animation: countUp 0.35s ease-out ${i * 0.04}s both`"
        >
          <div class="flex min-w-0 items-center gap-3">
            <span
              class="h-2 w-2 shrink-0 rounded-full"
              :class="runStatusClass(run.status)"
            />
            <span class="truncate font-mono text-sm text-surface-700">{{ run.id.slice(0, 8) }}</span>
            <span class="text-xs text-surface-500">{{ run.flow_id?.slice(0, 8) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="rounded-full px-2 py-0.5 text-xs font-medium"
              :class="runStatusBadgeClass(run.status)"
            >
              {{ run.status }}
            </span>
            <AppIcon name="lucide:chevron-right" class="h-4 w-4 text-surface-400 transition-transform group-hover:translate-x-0.5" />
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Recent flows -->
    <div>
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-surface-900">Recent flows</h2>
        <NuxtLink to="/flows" class="text-sm font-medium text-accent-600 transition-colors hover:text-accent-700 no-underline">
          View all
        </NuxtLink>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="card flex animate-pulse items-center gap-4 p-6">
          <div class="h-12 w-12 rounded-xl bg-surface-200" />
          <div class="flex-1 space-y-2">
            <div class="h-4 w-32 rounded bg-surface-200" />
            <div class="h-3 w-48 rounded bg-surface-100" />
          </div>
        </div>
      </div>

      <div v-else-if="error" class="card rounded-2xl border-red-200 bg-red-50 p-6 text-red-600">
        {{ error }}
      </div>

      <div v-else-if="flows.length === 0" class="card flex flex-col items-center justify-center rounded-2xl border-dashed border-surface-200 p-16 text-center">
        <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100 text-surface-400">
          <AppIcon name="lucide:workflow" class="h-8 w-8" />
        </div>
        <p class="text-lg font-medium text-surface-600">No flows yet</p>
        <p class="mt-2 text-surface-500">Create your first flow to get started.</p>
        <NuxtLink to="/flows/new" class="btn-primary mt-6 no-underline">
          Create flow
        </NuxtLink>
      </div>

      <div v-else class="space-y-3">
        <NuxtLink
          v-for="(flow, i) in flows"
          :key="flow.id"
          :to="`/flows/${flow.id}`"
          class="group card card-interactive block p-5 no-underline transition-all hover:border-accent-200"
          :style="`animation: countUp 0.4s cubic-bezier(0.4,0,0.2,1) ${i * 0.05}s both`"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600 transition-colors group-hover:bg-accent-100">
                <AppIcon name="lucide:workflow" class="h-6 w-6" />
              </div>
              <div>
                <p class="font-medium text-surface-900 group-hover:text-accent-600">{{ flow.name }}</p>
                <p class="mt-0.5 font-mono text-xs text-surface-500">{{ flow.id }}</p>
              </div>
            </div>
            <AppIcon name="lucide:chevron-right" class="h-5 w-5 text-surface-400 transition-all group-hover:translate-x-1 group-hover:text-accent-500" />
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
