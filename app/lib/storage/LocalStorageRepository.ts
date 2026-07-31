export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface SchemaMigration {
  fromVersion: number
  migrate: (data: unknown) => unknown
}

interface StoredPayload {
  version: number
  data: unknown
}

/**
 * Независимый переиспользуемый класс для работы с версионированными данными в key-value хранилище.
 * localStorage по умолчанию.
 */
export class LocalStorageRepository<TData> {
  constructor(
    private readonly key: string,
    private readonly currentVersion: number,
    private readonly migrations: SchemaMigration[] = [],
    private readonly storage: KeyValueStorage = globalThis.localStorage
  ) {}

  load(): TData | null {
    const rawItem = this.storage.getItem(this.key)
    if (!rawItem) return null

    const payload = this.parse(rawItem)
    if (!payload) return null

    return this.upgrade(payload.version, payload.data) as TData
  }

  save(data: TData): void {
    const payload: StoredPayload = { version: this.currentVersion, data }
    this.storage.setItem(this.key, JSON.stringify(payload))
  }

  clear(): void {
    this.storage.removeItem(this.key)
  }

  private parse(raw: string): StoredPayload | null {
    try {
      return JSON.parse(raw) as StoredPayload
    } catch {
      return null
    }
  }

  private upgrade(fromVersion: number, data: unknown): unknown {
    let version = fromVersion
    let result = data

    while (version < this.currentVersion) {
      const step = this.migrations.find((migration) => migration.fromVersion === version)
      if (!step) {
        throw new Error(`Отсутствует миграция схемы с версии ${version}`)
      }

      result = step.migrate(result)
      version += 1
    }

    return result
  }
}
