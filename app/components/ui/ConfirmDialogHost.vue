<script setup lang="ts">
const { request, respond } = useConfirm()
</script>

<template>
  <ModalDialog :open="!!request" :label="request?.title ?? ''" @close="respond(false)">
    <template v-if="request">
      <h2 class="confirm-dialog__title">{{ request.title }}</h2>
      <p class="confirm-dialog__message">{{ request.message }}</p>

      <div class="confirm-dialog__actions">
        <BaseButton variant="ghost" @click="respond(false)">
          {{ request.cancelLabel ?? 'Отмена' }}
        </BaseButton>
        <BaseButton :variant="request.danger ? 'danger' : 'primary'" @click="respond(true)">
          {{ request.confirmLabel ?? 'Подтвердить' }}
        </BaseButton>
      </div>
    </template>
  </ModalDialog>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as v;

.confirm-dialog__title {
  margin: 0 0 v.$space-sm;
}

.confirm-dialog__message {
  margin: 0 0 v.$space-lg;
  color: v.$color-text-muted;
}

.confirm-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: v.$space-sm;
}
</style>
