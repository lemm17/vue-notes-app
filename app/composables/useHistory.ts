import { ref, toRaw, type Ref } from 'vue'
import { HistoryManager, type HistoryCommand } from '~/lib/history/HistoryManager'

/**
 * Связывает HistoryManager с реактивным состоянием.
 */
export function useHistory<TState>(state: Ref<TState>, limit: number) {
  const manager = new HistoryManager<TState>(limit)
  const canUndo = ref(false)
  const canRedo = ref(false)

  /**
   * Синхронизирует состояние canUndo и canRedo с HistoryManager
   */
  function sync() {
    canUndo.value = manager.canUndo
    canRedo.value = manager.canRedo
  }

  /**
   * Применяет команду и сразу записывает её в историю
   */
  function perform(command: HistoryCommand<TState>) {
    state.value = command.apply(toRaw(state.value))
    manager.push(command)
    sync()
  }

  /**
   * Записывает уже применённое где-то ещё изменение.
   * Используется полями с фиксацией по blur/паузе,
   * их значение в состоянии обновляется сразу при вводе,
   * а не в момент попадания в историю
   */
  function record(command: HistoryCommand<TState>) {
    manager.push(command)
    sync()
  }

  function undo() {
    state.value = manager.undo(toRaw(state.value))
    sync()
  }

  function redo() {
    state.value = manager.redo(toRaw(state.value))
    sync()
  }

  function reset() {
    manager.reset()
    sync()
  }

  return { perform, record, undo, redo, reset, canUndo, canRedo }
}
