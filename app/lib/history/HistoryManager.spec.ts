import { describe, expect, it } from 'vitest'
import { HistoryManager, type HistoryCommand } from './HistoryManager'

function add(amount: number): HistoryCommand<number> {
  return {
    apply: (state) => state + amount,
    revert: (state) => state - amount
  }
}

describe('HistoryManager', () => {
  it('изначально не даёт ни отменить, ни повторить', () => {
    const history = new HistoryManager<number>(50)

    expect(history.canUndo).toBe(false)
    expect(history.canRedo).toBe(false)
  })

  it('undo откатывает последнюю команду', () => {
    const history = new HistoryManager<number>(50)
    history.push(add(5))

    expect(history.undo(5)).toBe(0)
    expect(history.canUndo).toBe(false)
  })

  it('redo повторно применяет отменённую команду', () => {
    const history = new HistoryManager<number>(50)
    history.push(add(5))

    const afterUndo = history.undo(5)
    const afterRedo = history.redo(afterUndo)

    expect(afterRedo).toBe(5)
    expect(history.canRedo).toBe(false)
  })

  it('новая команда после undo стирает ветку redo', () => {
    const history = new HistoryManager<number>(50)
    history.push(add(5))
    const afterUndo = history.undo(5)

    history.push(add(2))

    expect(history.canRedo).toBe(false)
    expect(history.undo(afterUndo + 2)).toBe(afterUndo)
  })

  it('undo и redo без истории не меняют состояние', () => {
    const history = new HistoryManager<number>(50)

    expect(history.undo(10)).toBe(10)
    expect(history.redo(10)).toBe(10)
  })

  it('не хранит больше команд, чем задано лимитом', () => {
    const history = new HistoryManager<number>(3)

    for (let i = 0; i < 5; i += 1) history.push(add(1))

    let state = 5
    for (let i = 0; i < 3; i += 1) state = history.undo(state)
    expect(state).toBe(2)

    // Четвёртый undo уже не влияет на состояние - старые команды вытеснены лимитом.
    expect(history.undo(state)).toBe(2)
  })
})
