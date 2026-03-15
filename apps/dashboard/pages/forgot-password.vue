<template>
  <div class="card-elevated p-8">
    <h1 class="text-2xl font-bold text-surface-900">Reset password</h1>
    <p class="mt-2 text-surface-500">Enter your email and we'll send you a reset link.</p>

    <form class="mt-8 space-y-5" @submit.prevent="onSubmit">
      <div>
        <label for="email" class="block text-sm font-medium text-surface-600">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          placeholder="you@example.com"
          class="input-base mt-2"
        />
      </div>
      <button type="submit" class="btn-primary w-full py-3">
        Send reset link
      </button>
    </form>

    <p class="mt-8 text-center text-sm text-surface-500">
      <NuxtLink to="/login" class="font-medium text-accent-600 transition-colors hover:text-accent-700 no-underline">
        ← Back to sign in
      </NuxtLink>
    </p>
  </div>
</template>

<script setup>
definePageMeta({ layout: "auth" })

const email = ref("")

function onSubmit() {
  alert("Reset link sent! (Demo)")
}
</script>
