import { getCurrentInstance, onUnmounted } from 'vue'

function isTextInput(element: Element | null): boolean {
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
}

/**
 * Ctrl+Z/Ctrl+Shift+Z работают глобально на странице, но не трогают
 * нативный undo внутри текстовых полей - пока фокус там, решает браузер.
 */
export function useUndoRedoShortcuts(undo: () => void, redo: () => void) {
  function handleKeydown(event: KeyboardEvent) {
    if (!event.ctrlKey || isTextInput(document.activeElement)) return
    if (event.code !== 'KeyZ' && event.code !== 'KeyY') return

    event.preventDefault()
    if (event.code === 'KeyY' || event.shiftKey) redo()
    else undo()
  }

  window.addEventListener('keydown', handleKeydown)

  // Вне активного компонента (например, в тестах) хук отписки регистрировать не на чём.
  if (getCurrentInstance()) {
    onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
  }
}
