import { isProxy, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import type { HistoryCommand } from '~/lib/history/HistoryManager'
import { useHistory } from './useHistory'

function add(amount: number): HistoryCommand<number> {
  return {
    apply: (state) => state + amount,
    revert: (state) => state - amount
  }
}

describe('useHistory', () => {
  it('perform применяет команду к состоянию и делает undo доступным', () => {
    const state = ref(0)
    const history = useHistory(state, 50)

    history.perform(add(5))

    expect(state.value).toBe(5)
    expect(history.canUndo.value).toBe(true)
  })

  it('record только запоминает команду, не трогая текущее состояние', () => {
    const state = ref(5)
    const history = useHistory(state, 50)

    history.record(add(5))

    expect(state.value).toBe(5)
    expect(history.canUndo.value).toBe(true)
  })

  it('undo/redo переключают состояние и флаги canUndo/canRedo', () => {
    const state = ref(0)
    const history = useHistory(state, 50)
    history.perform(add(5))

    history.undo()
    expect(state.value).toBe(0)
    expect(history.canUndo.value).toBe(false)
    expect(history.canRedo.value).toBe(true)

    history.redo()
    expect(state.value).toBe(5)
    expect(history.canRedo.value).toBe(false)
  })

  it('передаёт командам сырое состояние, а не реактивную обёртку черновика', () => {
    const state = ref({ items: [] as number[] })
    const history = useHistory(state, 50)

    history.perform({
      apply: (value) => {
        expect(isProxy(value)).toBe(false)
        return { items: [...value.items, 1] }
      },
      revert: (value) => ({ items: value.items.slice(0, -1) })
    })

    expect(state.value.items).toEqual([1])
  })

  it('reset очищает историю целиком', () => {
    const state = ref(0)
    const history = useHistory(state, 50)
    history.perform(add(5))

    history.reset()

    expect(history.canUndo.value).toBe(false)
    expect(history.canRedo.value).toBe(false)
  })
})
