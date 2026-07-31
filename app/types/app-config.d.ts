declare module 'nuxt/schema' {
  interface AppConfig {
    history: {
      limit: number
      inputIdleDelay: number
    }
    storage: {
      notesKey: string
      draftKeyPrefix: string
      schemaVersion: number
      persistDelay: number
    }
    notePreview: {
      maxTodoItems: number
    }
  }
}

export {}
