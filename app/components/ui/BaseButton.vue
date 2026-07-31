<script setup lang="ts">
defineOptions({ inheritAttrs: false })
withDefaults(defineProps<{ variant?: 'primary' | 'ghost' | 'danger' }>(), { variant: 'primary' })
</script>

<template>
  <button type="button" class="base-button" :class="`base-button--${variant}`" v-bind="$attrs">
    <slot />
  </button>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as v;

.base-button {
  padding: v.$space-sm v.$space-md;
  border: 1px solid transparent;
  border-radius: v.$radius-sm;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &--primary {
    background: v.$color-primary;
    color: #fff;

    &:hover {
      background: v.$color-primary-hover;
    }
  }

  &--danger {
    background: v.$color-danger;
    color: #fff;

    &:hover {
      background: v.$color-danger-hover;
    }
  }

  &--ghost {
    background: transparent;
    border-color: v.$color-border;
    color: v.$color-text;

    &:hover {
      background: v.$color-bg;
    }
  }
}
</style>
