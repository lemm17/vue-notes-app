/**
 * Настраиваемые параметры приложения: лимиты, задержки, ключи хранилища
 */
export default defineAppConfig({
  history: {
    limit: 50,
    inputIdleDelay: 600
  },
  storage: {
    notesKey: 'vue-notes-app:notes',
    draftKeyPrefix: 'vue-notes-app:draft:',
    schemaVersion: 1,
    persistDelay: 400
  },
  notePreview: {
    maxTodoItems: 3
  }
})
