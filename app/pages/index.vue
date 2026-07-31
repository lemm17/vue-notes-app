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

.notes-page {
  max-width: v.$breakpoint-lg;
  margin: v.$space-xl auto;
  padding: 0 v.$space-md;
}

.notes-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: v.$space-lg;
}

.notes-page__empty {
  color: v.$color-text-muted;
}

.notes-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: v.$space-md;
}
</style>
