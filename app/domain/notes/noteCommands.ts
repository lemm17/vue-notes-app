import { toRaw } from 'vue'
import type { HistoryCommand } from '~/lib/history/HistoryManager'
import type { Note, TodoItem } from '~/types/note'

function withTodo(note: Note, id: string, patch: Partial<TodoItem>): Note {
  return {
    ...note,
    todos: note.todos.map((todo) => (todo.id === id ? { ...todo, ...patch } : todo))
  }
}

export function setTitleCommand(from: string, to: string): HistoryCommand<Note> {
  return {
    apply: (note) => ({ ...note, title: to }),
    revert: (note) => ({ ...note, title: from })
  }
}

export function addTodoCommand(todo: TodoItem): HistoryCommand<Note> {
  // toRaw на случай, если вызывающий код передал пункт из реактивного черновика -
  // в истории и в заметке должны храниться только простые объекты.
  const snapshot = toRaw(todo)
  return {
    apply: (note) => ({ ...note, todos: [...note.todos, snapshot] }),
    revert: (note) => ({ ...note, todos: note.todos.filter((item) => item.id !== snapshot.id) })
  }
}

// index нужен, чтобы при повторном добавлении (redo) пункт вернулся на своё
// исходное место в списке, а не улетел в конец.
export function removeTodoCommand(todo: TodoItem, index: number): HistoryCommand<Note> {
  const snapshot = toRaw(todo)
  return {
    apply: (note) => ({ ...note, todos: note.todos.filter((item) => item.id !== snapshot.id) }),
    revert: (note) => {
      const todos = [...note.todos]
      todos.splice(index, 0, snapshot)
      return { ...note, todos }
    }
  }
}

export function toggleTodoCommand(id: string): HistoryCommand<Note> {
  const flip = (note: Note): Note =>
    withTodo(note, id, { done: !note.todos.find((todo) => todo.id === id)?.done })
  return { apply: flip, revert: flip }
}

export function editTodoTextCommand(id: string, from: string, to: string): HistoryCommand<Note> {
  return {
    apply: (note) => withTodo(note, id, { text: to }),
    revert: (note) => withTodo(note, id, { text: from })
  }
}
