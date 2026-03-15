<template>
  <div class="mx-auto max-w-3xl px-6 py-24">
    <div class="mb-16 text-center">
      <h1 class="text-4xl font-bold text-surface-900 md:text-5xl">One-click deploy to Cloudflare</h1>
      <p class="mt-4 text-lg text-surface-500">
        Connect your Cloudflare account and we'll provision Workers, D1, R2, and Workflows automatically.
      </p>
    </div>

    <div class="space-y-6">
      <div
        v-for="(step, i) in steps"
        :key="step.title"
        class="card group flex gap-6 p-8"
      >
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-100 font-bold text-accent-600">
          {{ i + 1 }}
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-semibold text-surface-900">{{ step.title }}</h2>
          <p class="mt-2 text-surface-500">{{ step.desc }}</p>
          <NuxtLink
            v-if="step.cta"
            :to="step.cta.to"
            class="btn-primary mt-4 inline-flex gap-2 no-underline"
          >
            {{ step.cta.label }}
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="mt-16 text-center">
      <NuxtLink to="/signup" class="btn-primary inline-flex gap-2 no-underline">
        Get started
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: "default" })

const steps = [
  {
    title: "Sign up for Flareo",
    desc: "Create your free account. No credit card required.",
    cta: { to: "/signup", label: "Create account" },
  },
  {
    title: "Connect Cloudflare",
    desc: "Authorize Flareo with your Cloudflare account via OAuth. We request minimal permissions—only what's needed to deploy Workers, create D1 databases, and configure R2 buckets.",
  },
  {
    title: "We deploy everything",
    desc: "Flareo provisions your Cloudflare resources: a Worker for the API, a D1 database for flow state, an R2 bucket for storage, and Workflows for durable execution. You're live in under 2 minutes.",
  },
  {
    title: "Build and run",
    desc: "Use the visual flow editor to create workflows. Deploy changes instantly. Your automations run at the edge, globally.",
  },
]
</script>
