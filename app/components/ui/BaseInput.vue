<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const model = defineModel<string>({ required: true })
</script>

<template>
  <input v-model="model" class="base-input" v-bind="$attrs" />
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as v;

.base-input {
  width: 100%;
  padding: v.$space-sm;
  border: 1px solid v.$color-border;
  border-radius: v.$radius-sm;
  background: v.$color-surface;
}
</style>
