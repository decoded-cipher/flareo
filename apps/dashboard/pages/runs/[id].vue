<template>
  <div class="p-8">
    <div class="mb-8">
      <NuxtLink to="/executions" class="mb-4 inline-flex items-center gap-2 text-sm text-surface-500 transition-colors hover:text-surface-900 no-underline">
        <AppIcon name="lucide:arrow-left" class="h-4 w-4" />
        Back to executions
      </NuxtLink>
      <h1 class="text-2xl font-bold text-surface-900">Run {{ runId }}</h1>
      <p class="mt-1 text-surface-500">Execution details and output.</p>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-6">
      <div class="card overflow-hidden p-6">
        <div class="mb-4 h-4 w-24 rounded bg-surface-200 animate-shimmer" />
        <div class="space-y-2">
          <div class="h-6 w-32 rounded bg-surface-200 animate-shimmer" />
          <div class="h-4 w-full rounded bg-surface-100 animate-shimmer" />
        </div>
      </div>
    </div>

    <div v-else-if="error" class="card rounded-2xl border-red-200 bg-red-50 p-6 text-red-600">
      {{ error }}
    </div>

    <div v-else-if="run" class="space-y-6">
      <div class="card card-interactive p-6 animate-count-in">
        <h2 class="mb-4 text-xs font-semibold uppercase tracking-wider text-surface-500">Status</h2>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span
              class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium"
              :class="statusClasses"
            >
              <span
                v-if="isLive"
                class="h-2 w-2 animate-pulse rounded-full"
                :class="run.status === 'running' ? 'bg-amber-500' : 'bg-surface-400'"
              />
              {{ run.status }}
            </span>
          </div>
          <p v-if="run.workflow_instance_id" class="font-mono text-sm text-surface-600">
            <span class="text-surface-500">Instance:</span> {{ run.workflow_instance_id }}
          </p>
          <p v-if="run.error" class="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 font-mono text-sm text-red-600">
            {{ run.error }}
          </p>
        </div>
      </div>

      <div v-if="run.output" class="card card-interactive p-6 animate-count-in" style="animation-delay: 0.05s">
        <h2 class="mb-4 text-xs font-semibold uppercase tracking-wider text-surface-500">Output</h2>
        <pre class="run-output overflow-auto rounded-xl border border-surface-200 bg-surface-50 p-4 font-mono text-sm text-surface-700">{{ formatOutput(run.output) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: "default" })

const route = useRoute()
const runId = computed(() => route.params.id)
const config = useRuntimeConfig()
const run = ref(null)
const loading = ref(true)
const error = ref("")

const isLive = computed(() => {
  const s = run.value?.status?.toLowerCase()
  return s === "running" || s === "pending" || s === "active"
})

const statusClasses = computed(() => {
  const s = run.value?.status?.toLowerCase()
  if (s === "completed" || s === "success") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (s === "running" || s === "pending" || s === "active") return "border-amber-200 bg-amber-50 text-amber-700"
  if (s === "failed" || s === "error") return "border-red-200 bg-red-50 text-red-700"
  return "border-surface-200 bg-surface-50 text-surface-700"
})

function formatOutput(output) {
  try {
    return JSON.stringify(JSON.parse(output), null, 2)
  } catch {
    return output
  }
}

async function fetchRun() {
  try {
    const res = await fetch(`${config.public.apiUrl}/runs/${runId.value}`)
    run.value = await res.json()
    error.value = ""
  } catch (e) {
    error.value = String(e)
  } finally {
    loading.value = false
  }
}

let pollInterval = null

onMounted(fetchRun)

watch(isLive, (live) => {
  if (live && !pollInterval) {
    pollInterval = setInterval(fetchRun, 2000)
  } else if (!live && pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}, { immediate: true })

onBeforeUnmount(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>
