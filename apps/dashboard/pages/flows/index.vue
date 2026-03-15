<template>
  <div class="p-8">
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Flows</h1>
        <p class="mt-1 text-surface-500">Manage and run your workflows on Cloudflare Workers.</p>
      </div>
      <NuxtLink to="/flows/new" class="btn-primary no-underline">
        <AppIcon name="lucide:plus" class="h-4 w-4" />
        New flow
      </NuxtLink>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="card flex animate-pulse items-center gap-4 p-6">
        <div class="h-12 w-12 rounded-xl bg-surface-200" />
        <div class="flex-1 space-y-2">
          <div class="h-4 w-40 rounded bg-surface-200" />
          <div class="h-3 w-56 rounded bg-surface-100" />
        </div>
      </div>
    </div>

    <div v-else-if="error" class="card rounded-2xl border-red-200 bg-red-50 p-6 text-red-600">
      {{ error }}
    </div>

    <div v-else class="space-y-3">
      <NuxtLink
        v-for="flow in flows"
        :key="flow.id"
        :to="`/flows/${flow.id}`"
        class="group card block p-6 no-underline transition-all hover:border-accent-200"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600 transition-colors group-hover:bg-accent-100">
              <AppIcon name="lucide:workflow" class="h-6 w-6" />
            </div>
            <div>
              <p class="font-semibold text-surface-900 group-hover:text-accent-600">{{ flow.name }}</p>
              <p class="mt-0.5 font-mono text-sm text-surface-500">{{ flow.id }}</p>
            </div>
          </div>
          <AppIcon name="lucide:chevron-right" class="h-5 w-5 text-surface-400 transition-all group-hover:translate-x-1 group-hover:text-accent-500" />
        </div>
      </NuxtLink>

      <!-- Empty state -->
      <div
        v-if="flows.length === 0"
        class="card flex flex-col items-center justify-center rounded-2xl border-dashed border-surface-200 p-16 text-center"
      >
        <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100 text-surface-400">
          <AppIcon name="lucide:workflow" class="h-8 w-8" />
        </div>
        <p class="text-lg font-medium text-surface-600">No flows yet</p>
        <p class="mt-2 text-surface-500">Create your first flow to get started.</p>
        <NuxtLink to="/flows/new" class="btn-primary mt-6 no-underline">
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
