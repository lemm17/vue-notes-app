<script setup lang="ts">
import type { Note } from '~/types/note'

const props = defineProps<{ note: Note }>()
defineEmits<{ delete: [] }>()

const appConfig = useAppConfig()
const previewTodos = computed(() => props.note.todos.slice(0, appConfig.notePreview.maxTodoItems))
const hiddenTodosCount = computed(() => props.note.todos.length - previewTodos.value.length)
</script>

<template>
  <article class="note-card">
    <h2 class="note-card__title">{{ note.title || 'Без названия' }}</h2>

    <ul v-if="previewTodos.length" class="note-card__todos">
      <li v-for="todo in previewTodos" :key="todo.id" class="note-card__todo">
        <input type="checkbox" :checked="todo.done" disabled />
        <span :class="{ 'note-card__todo-text--done': todo.done }">{{ todo.text }}</span>
      </li>
    </ul>

    <p v-if="hiddenTodosCount > 0" class="note-card__more">и ещё {{ hiddenTodosCount }}</p>

    <footer class="note-card__actions">
      <NuxtLink :to="`/notes/${note.id}`" class="note-card__edit-link">Изменить</NuxtLink>
      <BaseButton variant="ghost" @click="$emit('delete')">Удалить</BaseButton>
    </footer>
  </article>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as v;
@use '~/assets/styles/mixins' as m;

.note-card {
  @include m.card;
  display: flex;
  flex-direction: column;
  padding: v.$space-md;
  gap: v.$space-sm;
}

.note-card__title {
  margin: 0;
  font-size: v.$font-size-lg;
}

.note-card__todos {
  display: flex;
  flex-direction: column;
  gap: v.$space-xs;
}

.note-card__todo {
  display: flex;
  align-items: center;
  gap: v.$space-xs;
  font-size: v.$font-size-sm;
}

.note-card__todo-text--done {
  color: v.$color-text-muted;
  text-decoration: line-through;
}

.note-card__more {
  margin: 0;
  font-size: v.$font-size-sm;
  color: v.$color-text-muted;
}

.note-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: v.$space-sm;
}

.note-card__edit-link {
  font-size: v.$font-size-sm;
  color: v.$color-primary;
}
</style>
