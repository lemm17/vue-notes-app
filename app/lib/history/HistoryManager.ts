/**
 * Команда примененная на состояние.
 * Умеет применять и откатывать состояние.
 */
export interface HistoryCommand<TState> {
  /**
   * Применить команду на состояние.
   * @param state - Текущее состояние.
   * @returns - Новое состояние.
   */
  apply: (state: TState) => TState

  /**
   * Откатить команду на состояние.
   * @param state - Текущее состояние.
   * @returns - Предыдущее состояние.
   */
  revert: (state: TState) => TState
}

/**
 * Независимый переиспользуемый класс для работы с историей изменений.
 * Работает на action-паттерне: в стеках хранятся сами команды (небольшие описания изменения).
 */
export class HistoryManager<TState> {
  private past: HistoryCommand<TState>[] = []
  private future: HistoryCommand<TState>[] = []

  constructor(private readonly limit: number) {}

  get canUndo(): boolean {
    return this.past.length > 0
  }

  get canRedo(): boolean {
    return this.future.length > 0
  }

  push(command: HistoryCommand<TState>): void {
    this.past.push(command)

    // Вытесняем наиболее старую команду, если превышен лимит.
    if (this.past.length > this.limit) {
      this.past.shift()
    }

    // Будущие команды сбрасываются при добавлении новой команды.
    this.future = []
  }

  undo(state: TState): TState {
    const command = this.past.pop()
    if (!command) {
      return state
    }

    this.future.push(command)

    return command.revert(state)
  }

  redo(state: TState): TState {
    const command = this.future.pop()
    if (!command) {
      return state
    }

    this.past.push(command)

    return command.apply(state)
  }

  reset(): void {
    this.past = []
    this.future = []
  }
}
