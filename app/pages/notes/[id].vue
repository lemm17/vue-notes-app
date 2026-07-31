<script setup lang="ts">
import type { Note } from '~/types/note'

const route = useRoute()
const router = useRouter()
const store = useNotesStore()
const { confirm } = useConfirm()

const isCreating = route.params.id === 'new'
const sourceNote = computed(() =>
  isCreating ? null : store.getNoteById(route.params.id as string)
)
const notFound = computed(() => !isCreating && !sourceNote.value)

const createEmptyNote = (): Note => ({
  id: crypto.randomUUID(),
  title: '',
  todos: [],
  updatedAt: Date.now()
})

const draft = ref<Note>(structuredClone(toRaw(sourceNote.value) ?? createEmptyNote()))

function addTodo(text: string) {
  draft.value.todos.push({ id: crypto.randomUUID(), text, done: false })
}

function removeTodo(id: string) {
  draft.value.todos = draft.value.todos.filter((todo) => todo.id !== id)
}

function toggleTodo(id: string) {
  const todo = draft.value.todos.find((item) => item.id === id)
  if (todo) todo.done = !todo.done
}

function updateTodoText(id: string, text: string) {
  const todo = draft.value.todos.find((item) => item.id === id)
  if (todo) todo.text = text
}

function save() {
  store.reload()
  if (!isCreating && !store.getNoteById(draft.value.id)) {
    router.push('/')
    return
  }
  draft.value.updatedAt = Date.now()
  store.saveNote(draft.value)
  router.push('/')
}

async function cancelEditing() {
  const confirmed = await confirm({
    title: 'Отменить редактирование?',
    message: 'Несохранённые изменения будут потеряны.',
    confirmLabel: 'Не сохранять',
    danger: true
  })
  if (confirmed) router.push('/')
}

async function removeNote() {
  const confirmed = await confirm({
    title: 'Удалить заметку?',
    message: `«${draft.value.title || 'Без названия'}» будет удалена без возможности восстановления.`,
    confirmLabel: 'Удалить',
    danger: true
  })
  if (!confirmed) return
  store.deleteNote(draft.value.id)
  router.push('/')
}
</script>

<template>
  <main class="edit-page">
    <NuxtLink to="/" class="edit-page__back">← К списку заметок</NuxtLink>

    <p v-if="notFound" class="edit-page__not-found">
      Заметка не найдена - возможно, она уже удалена.
    </p>

    <template v-else>
      <BaseInput v-model="draft.title" class="edit-page__title" placeholder="Название заметки" />

      <TodoList
        :todos="draft.todos"
        @add="addTodo"
        @remove="removeTodo"
        @toggle="toggleTodo"
        @update:text="updateTodoText"
      />

      <footer class="edit-page__actions">
        <BaseButton v-if="!isCreating" variant="ghost" @click="removeNote">Удалить</BaseButton>
        <div class="edit-page__actions-right">
          <BaseButton variant="ghost" @click="cancelEditing">Отменить</BaseButton>
          <BaseButton @click="save">Сохранить</BaseButton>
        </div>
      </footer>
    </template>
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

.edit-page__title {
  font-size: v.$font-size-lg;
  margin-bottom: v.$space-lg;
}

.edit-page__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: v.$space-lg;
}

.edit-page__actions-right {
  display: flex;
  gap: v.$space-sm;
  margin-left: auto;
}
</style>
