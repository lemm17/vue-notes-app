<script setup lang="ts">
import {
  addTodoCommand,
  editTodoTextCommand,
  removeTodoCommand,
  setTitleCommand,
  toggleTodoCommand
} from '~/domain/notes/noteCommands'
import { isDraftWorthRestoring, cloneNote } from '~/domain/notes/noteDraft'
import type { Note } from '~/types/note'

const route = useRoute()
const router = useRouter()
const store = useNotesStore()
const appConfig = useAppConfig()
const { confirm } = useConfirm()

const isCreating = route.params.id === 'new'
const noteId = route.params.id as string
const sourceNote = computed(() => (isCreating ? null : store.getNoteById(noteId)))
const notFound = computed(() => !isCreating && !sourceNote.value)

const draftStorageKey = `${appConfig.storage.draftKeyPrefix}${isCreating ? 'new' : noteId}`

const createEmptyNote = (): Note => ({
  id: crypto.randomUUID(),
  title: '',
  todos: [],
  updatedAt: Date.now()
})

const draft = ref<Note>(cloneNote(sourceNote.value ?? createEmptyNote()))
const history = useHistory(draft, appConfig.history.limit)
useUndoRedoShortcuts(history.undo, history.redo)

// Пока разбираемся с диалогом восстановления - в хранилище ничего не пишем.
const draftPersistenceEnabled = ref(false)
const persistedDraft = usePersistedNoteDraft(draftStorageKey, draft, {
  schemaVersion: appConfig.storage.schemaVersion,
  delayMs: appConfig.storage.persistDelay,
  enabled: draftPersistenceEnabled,
  getBaseline: () => (sourceNote.value ? toRaw(sourceNote.value) : null),
  onRemoteUpdate: (note) => {
    draft.value = note
    history.reset()
  }
})

const { handleFocus: handleTitleFocus, handleBlur: handleTitleBlur } = useCommittedTextField(
  () => draft.value.title,
  appConfig.history.inputIdleDelay,
  (from, to) => history.record(setTitleCommand(from, to))
)

async function resolveDraftOnOpen() {
  if (notFound.value) {
    persistedDraft.clear()
    return
  }

  const saved = persistedDraft.load()
  const baseline = sourceNote.value ? toRaw(sourceNote.value) : null

  if (saved && isDraftWorthRestoring(saved, baseline)) {
    const restore = await confirm({
      title: 'Восстановить черновик?',
      message: 'Найдены несохранённые изменения. Восстановить их или начать заново?',
      confirmLabel: 'Восстановить',
      cancelLabel: 'Отбросить'
    })

    if (restore) {
      draft.value = cloneNote(saved)
      history.reset()
    } else {
      persistedDraft.clear()
    }
  }

  draftPersistenceEnabled.value = true
}

onMounted(() => {
  void resolveDraftOnOpen()
})

function addTodo(text: string) {
  history.perform(addTodoCommand({ id: crypto.randomUUID(), text, done: false }))
}

function removeTodo(id: string) {
  const index = draft.value.todos.findIndex((todo) => todo.id === id)
  const todo = draft.value.todos[index]
  if (todo) history.perform(removeTodoCommand(todo, index))
}

function toggleTodo(id: string) {
  history.perform(toggleTodoCommand(id))
}

// Текст пункта обновляется в черновике сразу при вводе (для отзывчивости
// поля), а в историю попадает отдельно - по blur/паузе, через commit-text.
function updateTodoText(id: string, text: string) {
  const todo = draft.value.todos.find((item) => item.id === id)
  if (todo) todo.text = text
}

function commitTodoText(id: string, from: string, to: string) {
  history.record(editTodoTextCommand(id, from, to))
}

function leaveEditor() {
  persistedDraft.clear()
  history.reset()
  router.push('/')
}

function save() {
  store.reload()
  if (!isCreating && !store.getNoteById(draft.value.id)) {
    leaveEditor()
    return
  }
  draft.value.updatedAt = Date.now()
  store.saveNote(cloneNote(draft.value))
  leaveEditor()
}

async function cancelEditing() {
  const confirmed = await confirm({
    title: 'Отменить редактирование?',
    message: 'Несохранённые изменения будут потеряны.',
    confirmLabel: 'Не сохранять',
    danger: true
  })
  if (!confirmed) return
  leaveEditor()
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
  // Для новой заметки ключ черновика - «...:new», его deleteNote не трогает.
  leaveEditor()
}

// Заметку удалили в другой вкладке - локальный черновик уже бесполезен.
watch(notFound, (isMissing) => {
  if (isMissing) persistedDraft.clear()
})
</script>

<template>
  <main class="edit-page">
    <NuxtLink to="/" class="edit-page__back">← К списку заметок</NuxtLink>

    <p v-if="notFound" class="edit-page__not-found">
      Заметка не найдена - возможно, она уже удалена.
    </p>

    <template v-else>
      <BaseInput
        v-model="draft.title"
        class="edit-page__title"
        placeholder="Название заметки"
        @focus="handleTitleFocus"
        @blur="handleTitleBlur"
      />

      <TodoList
        :todos="draft.todos"
        @add="addTodo"
        @remove="removeTodo"
        @toggle="toggleTodo"
        @update:text="updateTodoText"
        @commit-text="commitTodoText"
      />

      <footer class="edit-page__actions">
        <div class="edit-page__actions-inner">
          <div class="edit-page__actions-left">
            <BaseButton v-if="!isCreating" variant="ghost" @click="removeNote">Удалить</BaseButton>
            <BaseButton variant="ghost" :disabled="!history.canUndo.value" @click="history.undo">
              ↩ Отменить действие
            </BaseButton>
            <BaseButton variant="ghost" :disabled="!history.canRedo.value" @click="history.redo">
              ↪ Повторить действие
            </BaseButton>
          </div>
          <div class="edit-page__actions-right">
            <BaseButton variant="ghost" @click="cancelEditing">Отменить</BaseButton>
            <BaseButton @click="save">Сохранить</BaseButton>
          </div>
        </div>
      </footer>
    </template>
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as v;
@use '~/assets/styles/mixins' as m;

.edit-page {
  height: 100%;
  max-width: v.$breakpoint-md;
  margin: 0 auto;
  padding: v.$space-md v.$space-md;
  // Место под плавающую панель: список занимает оставшуюся высоту, страница не скроллится.
  padding-bottom: calc(#{v.$space-lg * 3} + 4.5rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;

  :deep(.todo-list) {
    flex: 1;
    min-height: 0;
  }
}

.edit-page__back {
  flex-shrink: 0;
  display: inline-block;
  margin-bottom: v.$space-md;
  color: v.$color-text-muted;
}

.edit-page__not-found {
  color: v.$color-text-muted;
}

.edit-page__title {
  flex-shrink: 0;
  font-size: v.$font-size-lg;
  margin-bottom: v.$space-md;
}

// Панель действий плавает над низом экрана с отступом: список пунктов может
// расти и сжиматься, но кнопки undo/redo не должны прыгать под курсором.
.edit-page__actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: v.$space-lg * 3;
  display: flex;
  justify-content: center;
  // Пустое место вокруг плавающей панели не должно перехватывать клики.
  pointer-events: none;
}

.edit-page__actions-inner {
  @include m.card;
  width: min(v.$breakpoint-md, 100% - v.$space-lg * 2);
  padding: v.$space-sm v.$space-md;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: v.$space-sm;
  pointer-events: auto;
}

.edit-page__actions-left,
.edit-page__actions-right {
  display: flex;
  gap: v.$space-sm;
}

.edit-page__actions-right {
  margin-left: auto;
}
</style>
