<script setup lang="ts">
import type { TodoItem } from '~/types/note'

defineProps<{ todos: TodoItem[] }>()
const emit = defineEmits<{
  add: [text: string]
  remove: [id: string]
  toggle: [id: string]
  'update:text': [id: string, text: string]
}>()

const newTodoText = ref('')

function addTodo() {
  const text = newTodoText.value.trim()
  if (!text) return
  emit('add', text)
  newTodoText.value = ''
}
</script>

<template>
  <div class="todo-list">
    <ul class="todo-list__items">
      <TodoRow
        v-for="todo in todos"
        :key="todo.id"
        :todo="todo"
        @toggle="emit('toggle', todo.id)"
        @remove="emit('remove', todo.id)"
        @update:text="emit('update:text', todo.id, $event)"
      />
    </ul>

    <form class="todo-list__add" @submit.prevent="addTodo">
      <BaseInput v-model="newTodoText" placeholder="Новый пункт" />
      <BaseButton variant="ghost" type="submit">Добавить</BaseButton>
    </form>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as v;

.todo-list__items {
  display: flex;
  flex-direction: column;
  gap: v.$space-sm;
  margin-bottom: v.$space-md;
}

.todo-list__add {
  display: flex;
  gap: v.$space-sm;
}
</style>
