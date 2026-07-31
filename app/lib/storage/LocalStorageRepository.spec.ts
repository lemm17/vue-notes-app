import { describe, expect, it } from 'vitest'
import { LocalStorageRepository, type KeyValueStorage } from './LocalStorageRepository'

function createMemoryStorage(): KeyValueStorage {
  const store = new Map<string, string>()

  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => void store.set(key, value),
    removeItem: (key) => void store.delete(key)
  }
}

describe('LocalStorageRepository', () => {
  it('возвращает null, если данных ещё нет', () => {
    const storage = createMemoryStorage()
    const repository = new LocalStorageRepository<string[]>('key', 1, [], storage)

    expect(repository.load()).toBeNull()
  })

  it('сохраняет данные и читает их обратно без изменений', () => {
    const storage = createMemoryStorage()
    const repository = new LocalStorageRepository<{ title: string }>('key', 1, [], storage)

    repository.save({ title: 'Список покупок' })

    expect(repository.load()).toEqual({ title: 'Список покупок' })
  })

  it('clear удаляет запись из хранилища', () => {
    const storage = createMemoryStorage()
    const repository = new LocalStorageRepository<number>('key', 1, [], storage)

    repository.save(42)
    repository.clear()

    expect(repository.load()).toBeNull()
  })

  it('возвращает null при повреждённом JSON вместо падения', () => {
    const storage = createMemoryStorage()
    storage.setItem('key', '{некорректный json')
    const repository = new LocalStorageRepository<number>('key', 1, [], storage)

    expect(repository.load()).toBeNull()
  })

  it('прогоняет данные через цепочку миграций до текущей версии', () => {
    const storage = createMemoryStorage()
    storage.setItem('key', JSON.stringify({ version: 1, data: { name: 'Заметка' } }))

    const repository = new LocalStorageRepository<{ title: string }>(
      'key',
      3,
      [
        { fromVersion: 1, migrate: (data) => ({ title: (data as { name: string }).name }) },
        { fromVersion: 2, migrate: (data) => data }
      ],
      storage
    )

    expect(repository.load()).toEqual({ title: 'Заметка' })
  })

  it('падает с понятной ошибкой, если миграция для версии не найдена', () => {
    const storage = createMemoryStorage()
    storage.setItem('key', JSON.stringify({ version: 1, data: {} }))
    const repository = new LocalStorageRepository('key', 2, [], storage)

    expect(() => repository.load()).toThrow(/миграция/)
  })
})
