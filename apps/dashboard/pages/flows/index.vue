<template>
  <div class="min-h-full w-full p-5">
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-semibold text-surface-900">Flows</h1>
        <p class="mt-0.5 text-xs text-surface-500">Manage and run your workflows on Cloudflare Workers.</p>
      </div>
      <NuxtLink to="/flows/new" class="btn-primary no-underline">
        <AppIcon name="lucide:plus" class="h-3.5 w-3.5" />
        New flow
      </NuxtLink>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-2">
      <div v-for="i in 4" :key="i" class="card flex animate-pulse items-center gap-3 p-4">
        <div class="h-9 w-9 rounded-lg bg-surface-200" />
        <div class="flex-1 space-y-1.5">
          <div class="h-3.5 w-36 rounded bg-surface-200" />
          <div class="h-2.5 w-48 rounded bg-surface-100" />
        </div>
      </div>
    </div>

    <div v-else-if="error" class="card rounded-xl border-red-200 bg-red-50 p-4 text-sm text-red-600">
      {{ error }}
    </div>

    <div v-else class="space-y-2">
      <NuxtLink
        v-for="flow in flows"
        :key="flow.id"
        :to="`/flows/${flow.id}`"
        class="group card block p-3.5 no-underline transition-all hover:border-accent-200"
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

      <!-- Empty state -->
      <div
        v-if="flows.length === 0"
        class="card flex flex-col items-center justify-center rounded-xl border-dashed border-surface-200 p-10 text-center"
      >
        <div class="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-surface-100 text-surface-400">
          <AppIcon name="lucide:workflow" class="h-5 w-5" />
        </div>
        <p class="text-sm font-medium text-surface-600">No flows yet</p>
        <p class="mt-1 text-xs text-surface-500">Create your first flow to get started.</p>
        <NuxtLink to="/flows/new" class="btn-primary mt-4 no-underline">
          Create flow
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: "default" })

const config = useRuntimeConfig()
const flows = ref([])
const loading = ref(true)
const error = ref("")

onMounted(async () => {
  try {
    const res = await fetch(`${config.public.apiUrl}/flows`)
    flows.value = await res.json()
  } catch (e) {
    error.value = String(e)
  } finally {
    loading.value = false
  }
})
</script>
