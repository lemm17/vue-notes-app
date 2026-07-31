const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Composable, запирающий Tab-навигацию внутри контейнера, пока компонент активен.
 * При деактивации возвращает фокус элементу, с которого попап был открыт.
 * Не знает ничего о модальных окнах.
 * @param container - Контейнер, внутри которого запирается навигация.
 * @param active - Флаг активности компонента.
 */
export function useFocusTrap(container: Ref<HTMLElement | null>, active: Ref<boolean>) {
  let elementBeforeOpen: HTMLElement | null = null

  const getFocusable = () => {
    return Array.from(container.value?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [])
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return

    const focusable = getFocusable()
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) return

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  watch(active, (isActive) => {
    if (isActive) {
      elementBeforeOpen = document.activeElement as HTMLElement | null
      document.addEventListener('keydown', handleKeydown)
      nextTick(() => getFocusable()[0]?.focus())
    } else {
      document.removeEventListener('keydown', handleKeydown)
      elementBeforeOpen?.focus()
    }
  })

  onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
}
