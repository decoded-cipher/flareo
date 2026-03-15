<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-surface-50 px-4">
    <!-- Subtle gradient -->
    <div class="pointer-events-none fixed inset-0 overflow-hidden">
      <div class="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-accent-100/30 blur-[100px]" />
      <div class="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent-50/50 blur-[100px]" />
    </div>

    <NuxtLink to="/" class="relative mb-10 flex flex-col items-center gap-1 no-underline">
      <span class="text-2xl font-bold tracking-tight text-surface-900">Flareo</span>
      <span class="text-xs font-medium text-surface-500">Edge workflow automation</span>
    </NuxtLink>

    <div class="relative w-full max-w-[420px] animate-fade-in-up">
      <slot />
    </div>

    <p class="relative mt-8 text-center text-sm text-surface-500">
      <NuxtLink to="/" class="text-surface-600 transition-colors hover:text-surface-900 no-underline">
        ← Back to home
      </NuxtLink>
    </p>
  </div>
</template>
