<script setup lang="ts">
const route = useRoute()
const store = useNotesStore()

const isCreating = computed(() => route.params.id === 'new')
const note = computed(() =>
  isCreating.value ? null : store.getNoteById(route.params.id as string)
)
const notFound = computed(() => !isCreating.value && !note.value)
</script>

<template>
  <main class="edit-page">
    <NuxtLink to="/" class="edit-page__back">← К списку заметок</NuxtLink>

    <p v-if="notFound" class="edit-page__not-found">
      Заметка не найдена - возможно, она уже удалена.
    </p>
    <h1 v-else>{{ isCreating ? 'Новая заметка' : note!.title || 'Без названия' }}</h1>
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as v;

.edit-page {
  max-width: v.$breakpoint-md;
  margin: v.$space-xl auto;
  padding: 0 v.$space-md;
}

.edit-page__back {
  display: inline-block;
  margin-bottom: v.$space-md;
  color: v.$color-text-muted;
}

.edit-page__not-found {
  color: v.$color-text-muted;
}
</style>
