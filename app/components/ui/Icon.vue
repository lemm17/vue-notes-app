<script setup lang="ts">
withDefaults(
  defineProps<{
    name: 'trash' | 'undo' | 'redo' | 'close' | 'check'
    size?: number
  }>(),
  { size: 18 }
)
</script>

<template>
  <svg
    class="icon"
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="name === 'trash'">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </template>
    <template v-else-if="name === 'undo'">
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h10a6 6 0 1 1 0 12h-3" />
    </template>
    <template v-else-if="name === 'redo'">
      <path d="M15 14l5-5-5-5" />
      <path d="M20 9H10a6 6 0 1 0 0 12h3" />
    </template>
    <template v-else-if="name === 'close'">
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </template>
    <template v-else-if="name === 'check'">
      <path d="M20 6L9 17l-5-5" />
    </template>
  </svg>
</template>

<style scoped lang="scss">
.icon {
  display: block;
  flex-shrink: 0;
}
</style>
