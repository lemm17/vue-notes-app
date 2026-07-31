<script setup lang="ts">
const props = defineProps<{ open: boolean; label: string }>()
const emit = defineEmits<{ close: [] }>()

const dialogRef = ref<HTMLElement | null>(null)
const isOpen = toRef(props, 'open')
useFocusTrap(dialogRef, isOpen)

const closeOnOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-overlay"
      @click="closeOnOverlayClick"
      @keydown.esc="emit('close')"
    >
      <div
        ref="dialogRef"
        class="modal-dialog"
        role="dialog"
        aria-modal="true"
        :aria-label="label"
        tabindex="-1"
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as v;

.modal-overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: v.$space-md;
  background: rgba(0, 0, 0, 0.4);
  z-index: v.$z-modal;
}

.modal-dialog {
  width: min(420px, 100%);
  padding: v.$space-lg;
  background: v.$color-surface;
  border-radius: v.$radius-md;
  box-shadow: v.$shadow-modal;

  &:focus {
    outline: none;
  }
}
</style>
