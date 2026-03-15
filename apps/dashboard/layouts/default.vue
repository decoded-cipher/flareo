<template>
  <div class="flex min-h-screen bg-surface-50">
    <!-- Sidebar -->
    <aside class="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-surface-200 bg-white">
      <div class="flex h-12 items-center gap-2 border-b border-surface-200 px-4">
        <NuxtLink to="/" class="flex items-center gap-2 no-underline">
          <span class="text-base font-bold tracking-tight text-surface-900">Flareo</span>
          <span class="rounded-md bg-accent-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent-600">
            Edge
          </span>
        </NuxtLink>
      </div>

      <nav class="flex-1 space-y-0.5 p-3">
        <NuxtLink
          to="/dashboard"
          class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all no-underline"
          :class="isActive('/dashboard') ? 'bg-accent-50 text-accent-600' : 'text-surface-500 hover:bg-surface-100 hover:text-surface-900'"
        >
          <AppIcon name="lucide:layout-dashboard" class="h-4 w-4 shrink-0 opacity-70" />
          Dashboard
        </NuxtLink>
        <NuxtLink
          to="/flows"
          class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all no-underline"
          :class="isActive('/flows') && !isActive('/flows/new') ? 'bg-accent-50 text-accent-600' : 'text-surface-500 hover:bg-surface-100 hover:text-surface-900'"
        >
          <AppIcon name="lucide:workflow" class="h-4 w-4 shrink-0 opacity-70" />
          Flows
        </NuxtLink>
        <NuxtLink
          to="/executions"
          class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all no-underline"
          :class="isActive('/executions') ? 'bg-accent-50 text-accent-600' : 'text-surface-500 hover:bg-surface-100 hover:text-surface-900'"
        >
          <AppIcon name="lucide:zap" class="h-4 w-4 shrink-0 opacity-70" />
          Executions
        </NuxtLink>
      </nav>

      <div class="space-y-0.5 border-t border-surface-200 p-3">
        <div class="flex items-center gap-2 rounded-lg px-3 py-2">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
          <span class="text-xs text-surface-500">Cloudflare Workers</span>
        </div>
        <NuxtLink
          to="/"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 no-underline"
        >
          <AppIcon name="lucide:arrow-left" class="h-4 w-4" />
          Back to home
        </NuxtLink>
      </div>
    </aside>

    <main class="relative ml-72 flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup>
const route = useRoute()

function isActive(path) {
  if (path === "/dashboard") return route.path === "/dashboard"
  if (path === "/flows/new") return route.path === "/flows/new"
  if (path === "/flows") return route.path.startsWith("/flows") && !route.path.startsWith("/flows/new")
  if (path === "/executions") return route.path.startsWith("/executions")
  return route.path.startsWith(path)
}
</script>
