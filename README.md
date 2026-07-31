# Vue Notes App

SPA-приложение для заметок со встроенными списками задач (Todo).
Каждая заметка хранит заголовок и набор пунктов с чекбоксами;
редактирование поддерживает отмену/повтор изменений (undo/redo) и не теряет несохранённые правки при случайной перезагрузке страницы.

## Стек

- [Nuxt 4](https://nuxt.com/) (Composition API, TypeScript strict)
- [Pinia](https://pinia.vuejs.org/) — управление состоянием
- SCSS — своя вёрстка без UI-библиотек
- [Vitest](https://vitest.dev/) — юнит-тесты

## Разработка

```bash
npm install
npm run dev        # запуск дев-сервера на http://localhost:3000
npm run test        # юнит-тесты
npm run lint         # проверка кода
npm run typecheck    # проверка типов
npm run build        # production-сборка
```
