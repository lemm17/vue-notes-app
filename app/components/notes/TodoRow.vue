<script setup lang="ts">
import type { TodoItem } from '~/types/note'

const props = defineProps<{ todo: TodoItem }>()
const emit = defineEmits<{
  toggle: []
  remove: []
  'update:text': [value: string]
  'commit-text': [from: string, to: string]
}>()

const text = computed({
  get: () => props.todo.text,
  set: (value: string) => emit('update:text', value)
})

const appConfig = useAppConfig()
const { handleFocus, handleBlur } = useCommittedTextField(
  () => props.todo.text,
  appConfig.history.inputIdleDelay,
  (from, to) => emit('commit-text', from, to)
)
</script>

<template>
  <li class="todo-row">
    <input
      type="checkbox"
      class="todo-row__checkbox"
      :checked="todo.done"
      aria-label="Отметить как выполненный"
      @change="emit('toggle')"
    />
    <BaseInput
      v-model="text"
      class="todo-row__text"
      :class="{ 'todo-row__text--done': todo.done }"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <BaseButton variant="ghost" aria-label="Удалить пункт" @click="emit('remove')">✕</BaseButton>
  </li>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as v;

.todo-row {
  display: flex;
  align-items: center;
  gap: v.$space-sm;
}

.todo-row__checkbox {
  accent-color: v.$color-primary;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.todo-row__text {
  flex: 1;
}

.todo-row__text--done {
  color: v.$color-text-muted;
  text-decoration: line-through;
}
</style>
