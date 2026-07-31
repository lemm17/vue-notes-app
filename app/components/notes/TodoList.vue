<script setup lang="ts">
import type { TodoItem } from '~/types/note'

const props = defineProps<{ todos: TodoItem[] }>()
const emit = defineEmits<{
  add: [text: string]
  remove: [id: string]
  toggle: [id: string]
  'update:text': [id: string, text: string]
  'commit-text': [id: string, from: string, to: string]
}>()

const newTodoText = ref('')
const scrollerRef = ref<HTMLElement | null>(null)
const canScrollUp = ref(false)
const canScrollDown = ref(false)
const thumbHeight = ref(0)
const thumbOffset = ref(0)
const hasOverflow = ref(false)

function addTodo() {
  const text = newTodoText.value.trim()
  if (!text) return
  emit('add', text)
  newTodoText.value = ''
}

function updateScrollState() {
  const el = scrollerRef.value
  if (!el) return

  const { scrollTop, scrollHeight, clientHeight } = el
  canScrollUp.value = scrollTop > 1
  canScrollDown.value = scrollTop + clientHeight < scrollHeight - 1
  hasOverflow.value = scrollHeight > clientHeight + 1

  if (!hasOverflow.value) {
    thumbHeight.value = 0
    thumbOffset.value = 0
    return
  }

  const track = clientHeight
  const size = Math.max((clientHeight / scrollHeight) * track, 24)
  const maxOffset = track - size
  const progress = scrollTop / (scrollHeight - clientHeight)

  thumbHeight.value = size
  thumbOffset.value = progress * maxOffset
}

// Новый пункт появляется внизу списка - прокручиваем к нему,
// чтобы он не остался скрытым за пределами скролл-области.
watch(
  () => props.todos.length,
  async (length, previousLength = 0) => {
    await nextTick()
    const scroller = scrollerRef.value
    if (!scroller) return
    if (length > previousLength) scroller.scrollTop = scroller.scrollHeight
    updateScrollState()
  }
)

onMounted(() => {
  updateScrollState()
  window.addEventListener('resize', updateScrollState)
})

onUnmounted(() => window.removeEventListener('resize', updateScrollState))
</script>

<template>
  <div class="todo-list">
    <div
      v-if="todos.length"
      class="todo-list__frame"
      :class="{
        'todo-list__frame--shadow-top': canScrollUp,
        'todo-list__frame--shadow-bottom': canScrollDown,
        'todo-list__frame--scrollable': hasOverflow
      }"
    >
      <div ref="scrollerRef" class="todo-list__scroller" @scroll="updateScrollState">
        <ul class="todo-list__items">
          <TodoRow
            v-for="todo in todos"
            :key="todo.id"
            :todo="todo"
            @toggle="emit('toggle', todo.id)"
            @remove="emit('remove', todo.id)"
            @update:text="emit('update:text', todo.id, $event)"
            @commit-text="(from, to) => emit('commit-text', todo.id, from, to)"
          />
        </ul>
      </div>

      <div v-show="hasOverflow" class="todo-list__scrollbar" aria-hidden="true">
        <div
          class="todo-list__thumb"
          :style="{ height: `${thumbHeight}px`, transform: `translateY(${thumbOffset}px)` }"
        />
      </div>
    </div>

    <form class="todo-list__add" @submit.prevent="addTodo">
      <BaseInput v-model="newTodoText" placeholder="Новый пункт" />
      <BaseButton variant="ghost" type="submit">Добавить</BaseButton>
    </form>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as v;
@use '~/assets/styles/mixins' as m;

.todo-list {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.todo-list__frame {
  @include m.card;
  position: relative;
  // По контенту, но не выше доступного места на странице — дальше скролл внутри.
  flex: 0 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-bottom: v.$space-md;
  overflow: hidden;

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 18px;
    pointer-events: none;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  &::before {
    top: 0;
    border-radius: v.$radius-md v.$radius-md 0 0;
    background: linear-gradient(to bottom, rgba(31, 36, 48, 0.1), transparent);
  }

  &::after {
    bottom: 0;
    border-radius: 0 0 v.$radius-md v.$radius-md;
    background: linear-gradient(to top, rgba(31, 36, 48, 0.1), transparent);
  }

  &--shadow-top::before,
  &--shadow-bottom::after {
    opacity: 1;
  }
}

.todo-list__scroller {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: v.$space-sm;
  // Нативный скроллбар скрыт: место под него не резервируется, пункты не прыгают по ширине.
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.todo-list__scrollbar {
  position: absolute;
  top: v.$space-xs;
  right: v.$space-xs;
  bottom: v.$space-xs;
  width: 4px;
  border-radius: v.$radius-sm;
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: none;
  z-index: 2;
}

.todo-list__frame--scrollable:hover .todo-list__scrollbar,
.todo-list__frame--scrollable:focus-within .todo-list__scrollbar {
  opacity: 1;
}

.todo-list__thumb {
  width: 100%;
  border-radius: inherit;
  background: rgba(31, 36, 48, 0.28);
}

.todo-list__items {
  display: flex;
  flex-direction: column;
  gap: v.$space-sm;
}

.todo-list__add {
  flex-shrink: 0;
  display: flex;
  gap: v.$space-sm;
}
</style>
