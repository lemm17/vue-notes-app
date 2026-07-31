import { isProxy, reactive } from 'vue'
import { describe, expect, it } from 'vitest'
import { HistoryManager } from '~/lib/history/HistoryManager'
import type { Note, TodoItem } from '~/types/note'
import {
  addTodoCommand,
  editTodoTextCommand,
  removeTodoCommand,
  setTitleCommand,
  toggleTodoCommand
} from './noteCommands'

function createNote(todos: TodoItem[] = []): Note {
  return { id: 'note-1', title: 'Исходный заголовок', todos, updatedAt: 0 }
}

describe('setTitleCommand', () => {
  it('apply меняет заголовок, revert возвращает исходный', () => {
    const command = setTitleCommand('Исходный заголовок', 'Новый заголовок')
    const note = createNote()

    const applied = command.apply(note)
    expect(applied.title).toBe('Новый заголовок')
    expect(command.revert(applied).title).toBe('Исходный заголовок')
  })
})

describe('addTodoCommand / removeTodoCommand', () => {
  it('добавление и последующее удаление пункта возвращают заметку в исходное состояние', () => {
    const todo: TodoItem = { id: 'todo-1', text: 'Купить молоко', done: false }
    const note = createNote()

    const added = addTodoCommand(todo).apply(note)
    expect(added.todos).toEqual([todo])

    const removed = removeTodoCommand(todo, 0).apply(added)
    expect(removed.todos).toEqual([])
  })

  it('revert удаления возвращает пункт на прежнюю позицию', () => {
    const first: TodoItem = { id: 'todo-1', text: 'Первый', done: false }
    const second: TodoItem = { id: 'todo-2', text: 'Второй', done: false }
    const note = createNote([first, second])

    const command = removeTodoCommand(first, 0)
    const afterRemove = command.apply(note)
    expect(afterRemove.todos).toEqual([second])

    const afterRevert = command.revert(afterRemove)
    expect(afterRevert.todos).toEqual([first, second])
  })

  it('не сохраняет реактивную обёртку пункта, если он был передан из reactive-состояния', () => {
    const reactiveTodo = reactive<TodoItem>({ id: 'todo-1', text: 'Пункт', done: false })

    const removed = removeTodoCommand(reactiveTodo, 0).revert(createNote())
    expect(isProxy(removed.todos[0])).toBe(false)

    const added = addTodoCommand(reactiveTodo).apply(createNote())
    expect(isProxy(added.todos[0])).toBe(false)
  })
})

describe('toggleTodoCommand', () => {
  it('apply и revert одинаково переключают отметку выполнения', () => {
    const todo: TodoItem = { id: 'todo-1', text: 'Пункт', done: false }
    const note = createNote([todo])
    const command = toggleTodoCommand('todo-1')

    const toggled = command.apply(note)
    expect(toggled.todos[0]?.done).toBe(true)

    const toggledBack = command.revert(toggled)
    expect(toggledBack.todos[0]?.done).toBe(false)
  })
})

describe('editTodoTextCommand', () => {
  it('apply меняет текст пункта, revert возвращает исходный', () => {
    const todo: TodoItem = { id: 'todo-1', text: 'Черновик', done: false }
    const note = createNote([todo])
    const command = editTodoTextCommand('todo-1', 'Черновик', 'Готовый текст')

    const edited = command.apply(note)
    expect(edited.todos[0]?.text).toBe('Готовый текст')
    expect(command.revert(edited).todos[0]?.text).toBe('Черновик')
  })
})

describe('интеграция с HistoryManager', () => {
  it('последовательность добавить → отметить → отменить → отменить возвращает заметку в исходное состояние', () => {
    const history = new HistoryManager<Note>(50)
    let note = createNote()

    const todo: TodoItem = { id: 'todo-1', text: 'Пункт', done: false }
    const addCommand = addTodoCommand(todo)
    note = addCommand.apply(note)
    history.push(addCommand)

    const toggleCommand = toggleTodoCommand('todo-1')
    note = toggleCommand.apply(note)
    history.push(toggleCommand)

    note = history.undo(note)
    expect(note.todos[0]?.done).toBe(false)

    note = history.undo(note)
    expect(note.todos).toEqual([])
    expect(history.canUndo).toBe(false)
  })
})
