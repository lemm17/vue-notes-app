import { LocalStorageRepository } from '~/lib/storage/LocalStorageRepository'
import type { Note } from '~/types/note'

export const useNotesStore = defineStore('notes', () => {
  const config = useAppConfig()
  const repository = new LocalStorageRepository<Note[]>(
    config.storage.notesKey,
    config.storage.schemaVersion
  )

  const notes = ref<Note[]>(repository.load() ?? [])

  const getNoteById = (id: string) => notes.value.find((note) => note.id === id)

  const saveNote = (note: Note) => {
    const index = notes.value.findIndex((existing) => existing.id === note.id)
    if (index === -1) notes.value.push(note)
    else notes.value.splice(index, 1, note)

    repository.save(notes.value)
  }

  const deleteNote = (id: string) => {
    notes.value = notes.value.filter((note) => note.id !== id)
    repository.save(notes.value)
  }

  const reload = () => {
    notes.value = repository.load() ?? []
  }

  return { notes, getNoteById, saveNote, deleteNote, reload }
})
