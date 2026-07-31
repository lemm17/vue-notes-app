# Vue Notes App

SPA-приложение для заметок со встроенными списками задач (Todo).
Каждая заметка хранит заголовок и набор пунктов с чекбоксами;
редактирование поддерживает отмену/повтор изменений (undo/redo) и не теряет несохранённые правки при случайной перезагрузке страницы.

## Стек

- [Nuxt 4](https://nuxt.com/) (Composition API, TypeScript strict)
- [Pinia](https://pinia.vuejs.org/) - управление состоянием
- SCSS - своя вёрстка без UI-библиотек
- [Vitest](https://vitest.dev/) - юнит-тесты
- Docker + nginx - production-сборка в контейнере

## Разработка без Docker

```bash
npm install
npm run dev        # http://localhost:3000
npm run test
npm run lint
npm run typecheck
npm run build
```

## Запуск через Docker

Контейнер собирает production-версию приложения и отдаёт её через nginx.

```bash
# Собрать образ и поднять контейнер
docker compose up --build

# Остановить
docker compose down
```

Приложение будет доступно по адресу: **http://localhost:8080**
