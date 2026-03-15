<template>
  <div class="p-8">
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Executions</h1>
        <p class="mt-1 text-surface-500">All workflow runs and their status.</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Live
        </div>
        <select
          v-model="statusFilter"
          class="input-base w-auto min-w-[140px] py-2"
        >
          <option value="">All statuses</option>
          <option value="running">Running</option>
          <option value="complete">Complete</option>
          <option value="errored">Errored</option>
          <option value="queued">Queued</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-2">
      <div v-for="i in 8" :key="i" class="card flex animate-pulse items-center gap-4 p-4">
        <div class="h-10 w-10 rounded-xl bg-surface-200" />
        <div class="flex-1 space-y-2">
          <div class="h-4 w-48 rounded bg-surface-200" />
          <div class="h-3 w-32 rounded bg-surface-100" />
        </div>
      </div>
    </div>

    <div v-else-if="error" class="card rounded-2xl border-red-200 bg-red-50 p-6 text-red-600">
      {{ error }}
    </div>

    <div v-else-if="executions.length === 0" class="card flex flex-col items-center justify-center rounded-2xl border-dashed border-surface-200 p-16 text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100 text-surface-400">
        <AppIcon name="lucide:zap" class="h-8 w-8" />
      </div>
      <p class="text-lg font-medium text-surface-600">No executions yet</p>
      <p class="mt-2 text-surface-500">Run a workflow from the editor to see executions here.</p>
      <NuxtLink to="/flows" class="btn-primary mt-6 no-underline">
        Open flows
      </NuxtLink>
    </div>

    <div v-else class="space-y-2">
      <NuxtLink
        v-for="(run, i) in executions"
        :key="run.id"
        :to="`/runs/${run.id}`"
        class="group card card-interactive flex items-center justify-between gap-4 p-4 no-underline transition-all"
        :style="`animation: countUp 0.3s ease-out ${Math.min(i * 0.03, 0.2)}s both`"
      >
        <div class="flex min-w-0 flex-1 items-center gap-4">
          <span
            class="h-2.5 w-2.5 shrink-0 rounded-full"
            :class="statusDotClass(run.status)"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium text-surface-900">
              {{ run.flow_id?.slice(0, 8) || "Unknown flow" }}
            </p>
            <p class="mt-0.5 font-mono text-xs text-surface-500">
              {{ run.id }}
            </p>
          </div>
          <span class="shrink-0 text-sm text-surface-500">
            {{ formatDate(run.created_at) }}
          </span>
        </div>
        <div class="flex shrink-0 items-center gap-3">
          <span
            class="rounded-full px-2.5 py-1 text-xs font-medium"
            :class="statusBadgeClass(run.status)"
          >
            {{ run.status }}
          </span>
          <AppIcon name="lucide:chevron-right" class="h-4 w-4 text-surface-400 transition-transform group-hover:translate-x-0.5" />
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: "default" })

const config = useRuntimeConfig()
const executions = ref([])
const loading = ref(true)
const error = ref("")
const statusFilter = ref("")

function statusDotClass(status) {
  const s = (status || "").toLowerCase()
  if (["completed", "success", "complete"].includes(s)) return "bg-emerald-500"
  if (["running", "pending", "active"].includes(s)) return "animate-pulse bg-amber-500"
  if (["failed", "error", "errored"].includes(s)) return "bg-red-500"
  return "bg-surface-400"
}

function statusBadgeClass(status) {
  const s = (status || "").toLowerCase()
  if (["completed", "success", "complete"].includes(s)) return "bg-emerald-100 text-emerald-700"
  if (["running", "pending", "active"].includes(s)) return "bg-amber-100 text-amber-700"
  if (["failed", "error", "errored"].includes(s)) return "bg-red-100 text-red-700"
  if (["queued"].includes(s)) return "bg-surface-100 text-surface-600"
  return "bg-surface-100 text-surface-600"
}

function formatDate(iso) {
  if (!iso) return "—"
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now - d
  if (diffMs < 60000) return "Just now"
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`
  return d.toLocaleDateString()
}

async function fetchExecutions() {
  loading.value = true
  try {
    const params = new URLSearchParams({ limit: "50" })
    if (statusFilter.value) params.set("status", statusFilter.value)
    const res = await fetch(`${config.public.apiUrl}/runs?${params}`)
    executions.value = await res.json()
    error.value = ""
  } catch (e) {
    error.value = String(e)
    executions.value = []
  } finally {
    loading.value = false
  }
}

watch(statusFilter, fetchExecutions)

let refreshInterval
onMounted(() => {
  fetchExecutions()
  refreshInterval = setInterval(fetchExecutions, 8000)
})
onBeforeUnmount(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>
