import { nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCommittedTextField } from './useCommittedTextField'

describe('useCommittedTextField', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('фиксирует одну запись после паузы во время ввода, а не на каждый символ', async () => {
    const value = ref('a')
    const onCommit = vi.fn()
    const { handleFocus } = useCommittedTextField(() => value.value, 500, onCommit)

    handleFocus()
    value.value = 'ab'
    await nextTick()
    value.value = 'abc'
    await nextTick()
    vi.advanceTimersByTime(500)

    expect(onCommit).toHaveBeenCalledOnce()
    expect(onCommit).toHaveBeenCalledWith('a', 'abc')
  })

  it('фиксирует запись по потере фокуса, не дожидаясь паузы', () => {
    const value = ref('a')
    const onCommit = vi.fn()
    const { handleFocus, handleBlur } = useCommittedTextField(() => value.value, 500, onCommit)

    handleFocus()
    value.value = 'ab'
    handleBlur()

    expect(onCommit).toHaveBeenCalledWith('a', 'ab')
  })

  it('не планирует фиксацию при изменении значения вне сессии редактирования (например, откатом истории)', async () => {
    const value = ref('123')
    const onCommit = vi.fn()
    useCommittedTextField(() => value.value, 500, onCommit)

    value.value = '12'
    await nextTick()
    vi.advanceTimersByTime(500)

    expect(onCommit).not.toHaveBeenCalled()
  })

  it('не вызывает onCommit, если значение за сессию не изменилось', () => {
    const value = ref('a')
    const onCommit = vi.fn()
    const { handleFocus, handleBlur } = useCommittedTextField(() => value.value, 500, onCommit)

    handleFocus()
    handleBlur()

    expect(onCommit).not.toHaveBeenCalled()
  })

  it('следующая сессия после фиксации по паузе отталкивается от уже сохранённого значения', async () => {
    const value = ref('a')
    const onCommit = vi.fn()
    const { handleFocus } = useCommittedTextField(() => value.value, 500, onCommit)

    handleFocus()
    value.value = 'ab'
    await nextTick()
    vi.advanceTimersByTime(500)
    expect(onCommit).toHaveBeenNthCalledWith(1, 'a', 'ab')

    value.value = 'abc'
    await nextTick()
    vi.advanceTimersByTime(500)
    expect(onCommit).toHaveBeenNthCalledWith(2, 'ab', 'abc')
  })
})
