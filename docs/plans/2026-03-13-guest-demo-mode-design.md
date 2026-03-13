# Guest Demo Mode Design

**Дата:** 2026-03-13
**Статус:** Утверждён

## Цель

Убрать стену авторизации — пускать неавторизованных пользователей в интерфейс приложения в демо-режиме. Пользователь видит статичные диалоги, может исследовать интерфейс, но реальные действия требуют авторизации.

## Решение

Расширить существующий `lib-modules/demo-mode/` — добавить автоактивацию для неавторизованных пользователей, демо-данные, UI-компоненты для побуждения к авторизации.

## Архитектура

```
Пользователь заходит на /app → middleware пропускает всех
  ├─ Авторизован → обычный режим
  └─ Не авторизован → useDemoMode() активирует demo mode
       ├─ Загружаются демо-диалоги (2 существующих)
       ├─ Загружается демо-клиент
       ├─ Показывается баннер сверху
       └─ Navbar показывает «Войти» вместо Premium
```

### Изменение в useDemoMode()

```typescript
const isDemoMode = computed(() => {
  // Ручная активация (для промо-роликов)
  if (route.query.demo === 'true') return true
  // Автоматическая активация для неавторизованных
  if (!userController.isLoggedIn.value) return true
  return false
})
```

## Auth Middleware

**Текущее:** `/app/*` требует авторизацию → редирект на `/auth`

**Новое:** Удаляем `middleware/auth.global.ts` и `middleware/auth.ts`. Любой пользователь может зайти на `/app/*`. Защита чужих диалогов — на уровне API/страницы.

## Демо-данные

### Диалоги

Новый файл `lib-modules/demo-mode/content/conversations.ts`:

```typescript
export const demoConversations: ShortConversationType[] = [
  {
    id: 'demo-content-plan',
    title: 'Контент-план Кофейни Зерно',
    datetime: new Date().toISOString(),
  },
  {
    id: 'demo-reels-ideas',
    title: '10 идей для Reels',
    datetime: new Date().toISOString(),
  }
]
```

### Демо-клиент

Новый файл `lib-modules/demo-mode/content/client.ts`:

```typescript
export const demoClient = {
  name: 'Кофейня «Зерно»',
  description: 'Уютная кофейня в центре города. Specialty кофе, авторские десерты, завтраки весь день. Целевая аудитория: 25-40 лет, ценители качественного кофе.',
}
```

### Интеграция

- `stores/conversations.ts` → при `isDemoMode` возвращает `demoConversations` вместо API-запроса
- Профиль/настройки → при `isDemoMode` показывает `demoClient`

## UI-компоненты

### 1. DemoBanner

Баннер сверху страницы:

```vue
<!-- lib-modules/demo-mode/components/DemoBanner.vue -->
<template>
  <div class="fixed top-0 left-0 right-0 z-50 bg-primary/90 text-white text-center py-2 px-4">
    <span>Вы в демо-режиме.</span>
    <NuxtLink to="/auth" class="underline ml-2 font-medium">
      Войдите для полного доступа
    </NuxtLink>
  </div>
</template>
```

- Показывается когда `isDemoMode && !isLoggedIn`
- Layout получает padding-top для сдвига контента

### 2. DemoAuthModal

Модальное окно при попытке действия:

```vue
<!-- lib-modules/demo-mode/components/DemoAuthModal.vue -->
<template>
  <Dialog v-model:open="isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Войдите, чтобы продолжить</DialogTitle>
        <DialogDescription>
          Создайте аккаунт или войдите, чтобы использовать все возможности сервиса
        </DialogDescription>
      </DialogHeader>
      <Button @click="navigateTo('/auth')" class="w-full">
        Войти
      </Button>
    </DialogContent>
  </Dialog>
</template>
```

### 3. Кнопка «Войти» в Navbar

```vue
<!-- В Navbar.vue, вместо Premium кнопки -->
<template v-if="isDemoMode">
  <Button @click="navigateTo('/auth')">Войти</Button>
</template>
<template v-else-if="!isPaidUser">
  <!-- Текущая Premium кнопка -->
</template>
```

## Перехват действий

### Действия, требующие авторизации

| Раздел | Действие |
|--------|----------|
| Чаты | Отправить сообщение |
| Чаты | Создать новый чат |
| Чаты | Удалить/переименовать чат |
| Генератор | Сгенерировать картинку |
| Профиль | Изменить данные |
| Роли | Выбрать/создать роль |

### Composable useDemoGuard

```typescript
// lib-modules/demo-mode/composables/useDemoGuard.ts
export function useDemoGuard() {
  const { isDemoMode } = useDemoMode()
  const showAuthModal = ref(false)

  function guardAction(action: () => void) {
    if (isDemoMode.value) {
      showAuthModal.value = true
      return
    }
    action()
  }

  return { guardAction, showAuthModal }
}
```

### Использование

```typescript
const { guardAction, showAuthModal } = useDemoGuard()

function sendMessage() {
  guardAction(() => {
    // реальная отправка
  })
}
```

## Landing CTA

Кнопка на лендинге ведёт сразу в `/app` — пользователь попадает в демо-режим без авторизации.
