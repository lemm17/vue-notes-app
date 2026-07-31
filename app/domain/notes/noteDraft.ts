import type { Note } from '~/types/note'
import { toRaw } from 'vue'

/**
 * Сравнивает содержимое заметки без служебных полей (id / updatedAt).
 * Нужно, чтобы понять, есть ли реальные несохранённые правки относительно эталона.
 */
export function noteBodyEqual(a: Note, b: Note): boolean {
  return (
    JSON.stringify({ title: a.title, todos: a.todos }) ===
    JSON.stringify({ title: b.title, todos: b.todos })
  )
}

/**
 * Черновик стоит предлагать к восстановлению, только если в нём есть
 * отличия от сохранённой заметки (или любое содержимое при создании новой).
 */
export function isDraftWorthRestoring(draft: Note, baseline: Note | null): boolean {
  if (!baseline) return draft.title !== '' || draft.todos.length > 0
  return !noteBodyEqual(draft, baseline)
}

/**
 * Глубокая копия заметки без Vue-прокси: structuredClone на вложенных
 * reactive-обёртках падает, а JSON-сериализация даёт обычные объекты.
 */
export function cloneNote(note: Note): Note {
  return JSON.parse(JSON.stringify(toRaw(note))) as Note
}
