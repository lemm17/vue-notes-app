import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { LocalStorageRepository, type KeyValueStorage } from '~/lib/storage/LocalStorageRepository'
import type { Note } from '~/types/note'
import { createNotesActions } from './notes'

function createMemoryStorage(): KeyValueStorage {
  const store = new Map<string, string>()
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => void store.set(key, value),
    removeItem: (key) => void store.delete(key)
  }
}

function createNote(id: string): Note {
  return { id, title: `Заметка ${id}`, todos: [], updatedAt: 0 }
}

describe('createNotesActions', () => {
  it('saveNote добавляет новую заметку и сохраняет список в хранилище', () => {
    const repository = new LocalStorageRepository<Note[]>('key', 1, [], createMemoryStorage())
    const notes = ref<Note[]>([])
    const actions = createNotesActions(notes, repository)

    actions.saveNote(createNote('1'))

    expect(notes.value).toHaveLength(1)
    expect(repository.load()).toEqual(notes.value)
  })

  it('saveNote с существующим id обновляет заметку, а не дублирует её', () => {
    const repository = new LocalStorageRepository<Note[]>('key', 1, [], createMemoryStorage())
    const notes = ref<Note[]>([createNote('1')])
    const actions = createNotesActions(notes, repository)

    actions.saveNote({ ...createNote('1'), title: 'Обновлённая' })

    expect(notes.value).toHaveLength(1)
    expect(notes.value[0]?.title).toBe('Обновлённая')
  })

  it('deleteNote удаляет заметку и сохраняет изменение в хранилище', () => {
    const repository = new LocalStorageRepository<Note[]>('key', 1, [], createMemoryStorage())
    const notes = ref<Note[]>([createNote('1'), createNote('2')])
    const actions = createNotesActions(notes, repository)

    actions.deleteNote('1')

    expect(notes.value.map((note) => note.id)).toEqual(['2'])
    expect(repository.load()?.map((note) => note.id)).toEqual(['2'])
  })

  it('reload перечитывает заметки из хранилища, даже если они изменились извне', () => {
    const repository = new LocalStorageRepository<Note[]>('key', 1, [], createMemoryStorage())
    const notes = ref<Note[]>([createNote('1')])
    const actions = createNotesActions(notes, repository)

    repository.save([createNote('2')])
    actions.reload()

    expect(notes.value.map((note) => note.id)).toEqual(['2'])
  })

  it('getNoteById возвращает undefined для отсутствующей заметки', () => {
    const repository = new LocalStorageRepository<Note[]>('key', 1, [], createMemoryStorage())
    const notes = ref<Note[]>([createNote('1')])
    const actions = createNotesActions(notes, repository)

    expect(actions.getNoteById('missing')).toBeUndefined()
  })
})
