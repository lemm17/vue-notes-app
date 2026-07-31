export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Чистое SPA без SSR. Используем LocalStorage.
  ssr: false,

  modules: ['@pinia/nuxt', '@nuxt/eslint'],
  typescript: {
    strict: true,
    typeCheck: true
  },
  css: ['~/assets/styles/main.scss'],
  components: [{ path: '~/components', pathPrefix: false }]
})
