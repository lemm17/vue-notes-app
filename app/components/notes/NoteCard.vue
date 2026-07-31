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
    <NuxtLink :to="`/notes/${note.id}`" class="note-card__link">
      <h2 class="note-card__title">{{ note.title || 'Без названия' }}</h2>

      <ul v-if="previewTodos.length" class="note-card__todos">
        <li v-for="todo in previewTodos" :key="todo.id" class="note-card__todo">
          <input type="checkbox" :checked="todo.done" disabled tabindex="-1" />
          <span :class="{ 'note-card__todo-text--done': todo.done }">
            {{ todo.text || 'Без текста' }}
          </span>
        </li>
      </ul>

      <p v-if="hiddenTodosCount > 0" class="note-card__more">и ещё {{ hiddenTodosCount }}</p>
    </NuxtLink>

    <BaseButton
      class="note-card__delete"
      variant="ghost"
      aria-label="Удалить заметку"
      @click="$emit('delete')"
    >
      Удалить
    </BaseButton>
  </article>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as v;
@use '~/assets/styles/mixins' as m;

.note-card {
  @include m.card;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;

  &:hover,
  &:focus-within {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 10px 28px rgba(31, 36, 48, 0.12);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: box-shadow 0.18s ease;

    &:hover,
    &:focus-within {
      transform: none;
    }
  }
}

.note-card__link {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: v.$space-sm;
  padding: v.$space-md;
  padding-bottom: v.$space-sm;
  color: inherit;
  text-decoration: none;
  border-radius: v.$radius-md;

  &:focus-visible {
    outline: none;
  }
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

.note-card__delete {
  align-self: flex-end;
  margin: 0 v.$space-sm v.$space-sm;
}
</style>
