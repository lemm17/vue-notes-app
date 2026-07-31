import { getCurrentInstance, onUnmounted, watch } from 'vue'

/**
 * Фиксирует изменения текстового поля одной записью по потере фокуса или по паузе во время ввода.
 * Ничего не знает про историю изменений, просто вызывает onCommit(from, to) в конце сессии
 * редактирования поля.
 */
export function useCommittedTextField(
  source: () => string,
  delayMs: number,
  onCommit: (from: string, to: string) => void
) {
  let sessionStart: string | null = null
  let isEditing = false
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  function commit(currentValue: string) {
    clearTimeout(timeoutId)
    if (sessionStart !== null && sessionStart !== currentValue) onCommit(sessionStart, currentValue)
    sessionStart = currentValue
  }

  // Значение может измениться и не из-за ввода в поле - например, откатом
  // истории. В таком случае просто подхватываем новую точку отсчёта,
  // без постановки записи на паузу: пользователь это поле не редактирует.
  watch(source, (value) => {
    clearTimeout(timeoutId)
    if (isEditing) timeoutId = setTimeout(() => commit(value), delayMs)
    else sessionStart = value
  })

  function handleFocus() {
    isEditing = true
    sessionStart = source()
  }

  function handleBlur() {
    commit(source())
    isEditing = false
  }

  // Вне активного компонента (например, в тестах) хук регистрировать не на чём.
  if (getCurrentInstance()) onUnmounted(() => clearTimeout(timeoutId))

  return { handleFocus, handleBlur }
}
