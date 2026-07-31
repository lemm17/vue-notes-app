<script setup lang="ts">
const store = useNotesStore()
const { confirm } = useConfirm()

async function removeNote(id: string, title: string) {
  const confirmed = await confirm({
    title: 'Удалить заметку?',
    message: `«${title || 'Без названия'}» будет удалена без возможности восстановления.`,
    confirmLabel: 'Удалить',
    danger: true
  })
  if (confirmed) store.deleteNote(id)
}
</script>

<template>
  <main class="notes-page">
    <header class="notes-page__header">
      <h1>Заметки</h1>
      <NuxtLink to="/notes/new"><BaseButton>Новая заметка</BaseButton></NuxtLink>
    </header>

    <p v-if="!store.notes.length" class="notes-page__empty">Заметок пока нет - создайте первую.</p>

    <ul v-else class="notes-page__grid">
      <li v-for="note in store.notes" :key="note.id">
        <NoteCard :note="note" @delete="removeNote(note.id, note.title)" />
      </li>
    </ul>
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as v;
@use '~/assets/styles/mixins' as m;

.notes-page {
  max-width: v.$breakpoint-lg;
  margin: v.$space-lg auto;
  padding: 0 v.$space-md v.$space-xl;

  @include m.from(v.$breakpoint-md) {
    margin: v.$space-xl auto;
  }
}

.notes-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: v.$space-md;
  margin-bottom: v.$space-lg;

  h1 {
    margin: 0;
    font-size: v.$font-size-lg;

    @include m.from(v.$breakpoint-sm) {
      font-size: 1.75rem;
    }
  }
}

.notes-page__empty {
  color: v.$color-text-muted;
}

.notes-page__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: v.$space-md;
  // Карточки на hover чуть увеличиваются - не обрезаем эффект.
  padding: v.$space-xs;

  @include m.from(v.$breakpoint-sm) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }

  @include m.from(v.$breakpoint-md) {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: v.$space-lg;
  }
}
</style>
