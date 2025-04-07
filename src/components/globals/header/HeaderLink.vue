<script setup>
defineProps({
  to: String,
})
</script>

<template>
  <RouterLink :to="to">
    <slot></slot>
  </RouterLink>
</template>
