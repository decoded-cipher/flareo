<template>
  <FlowEditor :flow-id="route.params.id" />
</template>

<script setup>
definePageMeta({ layout: "editor" })

const route = useRoute()
</script>
