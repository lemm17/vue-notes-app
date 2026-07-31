import { describe, expect, it } from 'vitest'
import type { Note } from '~/types/note'
import { cloneNote, isDraftWorthRestoring, noteBodyEqual } from './noteDraft'

function note(partial: Partial<Note> = {}): Note {
  return {
    id: '1',
    title: '',
    todos: [],
    updatedAt: 0,
    ...partial
  }
}

describe('noteBodyEqual', () => {
  it('игнорирует различия в id и updatedAt', () => {
    expect(
      noteBodyEqual(
        note({ id: 'a', updatedAt: 1, title: 'A' }),
        note({ id: 'b', updatedAt: 2, title: 'A' })
      )
    ).toBe(true)
  })

  it('замечает изменение заголовка или пунктов', () => {
    expect(noteBodyEqual(note({ title: 'A' }), note({ title: 'B' }))).toBe(false)
    expect(
      noteBodyEqual(note({ todos: [{ id: 't', text: 'x', done: false }] }), note({ todos: [] }))
    ).toBe(false)
  })
})

describe('isDraftWorthRestoring', () => {
  it('для новой заметки предлагает восстановление только при непустом содержимом', () => {
    expect(isDraftWorthRestoring(note(), null)).toBe(false)
    expect(isDraftWorthRestoring(note({ title: 'Черновик' }), null)).toBe(true)
    expect(
      isDraftWorthRestoring(note({ todos: [{ id: 't', text: 'x', done: false }] }), null)
    ).toBe(true)
  })

  it('для существующей заметки предлагает восстановление при отличии от сохранённой версии', () => {
    const baseline = note({ title: 'Сохранено' })
    expect(isDraftWorthRestoring(note({ title: 'Сохранено' }), baseline)).toBe(false)
    expect(isDraftWorthRestoring(note({ title: 'Изменено' }), baseline)).toBe(true)
  })
})

describe('cloneNote', () => {
  it('возвращает глубокую копию без сохранения ссылок на вложенные объекты', () => {
    const source = note({
      title: 'A',
      todos: [{ id: 't', text: 'x', done: false }]
    })
    const cloned = cloneNote(source)

    expect(cloned).toEqual(source)
    expect(cloned).not.toBe(source)
    expect(cloned.todos).not.toBe(source.todos)
    expect(cloned.todos[0]).not.toBe(source.todos[0])
  })
})
