import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDebouncedDraftSaver } from './createDebouncedDraftSaver'

describe('createDebouncedDraftSaver', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  function createRepo() {
    let stored: string | null = null
    return {
      load: () => (stored === null ? null : (JSON.parse(stored) as { value: string })),
      save: (data: { value: string }) => {
        stored = JSON.stringify(data)
      },
      clear: () => {
        stored = null
      },
      getRaw: () => stored
    }
  }

  it('схлопывает несколько schedule в одно сохранение после паузы', () => {
    const repo = createRepo()
    const saver = createDebouncedDraftSaver(repo, 400)

    saver.schedule({ value: 'a' })
    saver.schedule({ value: 'ab' })
    saver.schedule({ value: 'abc' })
    expect(repo.getRaw()).toBeNull()

    vi.advanceTimersByTime(400)
    expect(repo.load()).toEqual({ value: 'abc' })
  })

  it('flush пишет сразу, не дожидаясь таймера', () => {
    const repo = createRepo()
    const saver = createDebouncedDraftSaver(repo, 400)

    saver.schedule({ value: 'черновик' })
    saver.flush({ value: 'готово' })

    expect(repo.load()).toEqual({ value: 'готово' })
    vi.advanceTimersByTime(400)
    expect(repo.load()).toEqual({ value: 'готово' })
  })

  it('schedule(null) и clear удаляют запись', () => {
    const repo = createRepo()
    const saver = createDebouncedDraftSaver(repo, 400)

    saver.flush({ value: 'есть' })
    saver.schedule(null)
    vi.advanceTimersByTime(400)

    expect(repo.load()).toBeNull()

    saver.flush({ value: 'снова' })
    saver.clear()
    expect(repo.load()).toBeNull()
  })
})
