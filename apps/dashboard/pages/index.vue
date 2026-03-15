<script setup>
definePageMeta({ layout: "default" })

// Landing lives at the web app; redirect dashboard root to dashboard.
await navigateTo("/dashboard", { replace: true })
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-surface-50">
    <p class="text-surface-500">Redirecting…</p>
  </div>
</template>
