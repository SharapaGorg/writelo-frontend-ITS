### Architecture


# Модульная архитектура проекта

## 📋 Обязательные правила архитектуры

### Структура проекта
```
project/
├── pages/                    # Страницы приложения (только роутинг и композиция)
├── modules/                  # Бизнес-модули
│   └── [module-name]/
│       ├── components/       # Компоненты модуля
│       ├── composables/      # Логика модуля
│       ├── services/         # API клиенты, внешние интеграции
│       ├── stores/          # Состояние модуля
│       ├── types/           # TypeScript типы
│       └── index.ts         # Экспорты модуля
├── components/
│   └── UI/                  # Переиспользуемые UI компоненты
├── shared/                  # Общие утилиты, константы, базовые классы
│   └── services/            # Базовые классы для API (ApiClient и т.д.)
├── assets/                  # Статические файлы
└── stores/                  # Глобальные stores
```

## 🚨 Строгие правила

### 1. Импорты и зависимости

**❌ ЗАПРЕЩЕНО:**
```js
// Прямые импорты из модулей
import RegistrationForm from '~/modules/auth/components/RegistrationForm.vue'

// Импорты "наверх" по иерархии
import something from '~/pages/...' // из modules
import something from '~/modules/...' // из components/UI
```

**✅ РАЗРЕШЕНО:**
```js
// Только через index.ts модуля
import { RegistrationForm, useAuth } from '~/modules/auth'

// UI компоненты можно импортировать везде
import { Button, Input } from '~/components/UI'
```

### 2. Структура модуля

**Каждый модуль ОБЯЗАН содержать `index.ts`:**
```ts
// modules/auth/index.ts
export { default as LoginForm } from './components/LoginForm.vue'
export { default as RegistrationForm } from './components/RegistrationForm.vue'
export { useAuth } from './composables/useAuth'
export { authStore } from './stores/authStore'
export { authApi } from './services/AuthApiClient'
export type { User, AuthState } from './types'
```

### 3. Компоненты

**Страницы (`pages/`):**
- Только композиция модулей
- Никакой бизнес-логики
- Только роутинг и SEO

```vue
<!-- pages/auth/register.vue -->
<template>
  <AuthLayout>
    <RegistrationForm />
  </AuthLayout>
</template>

<script setup>
import { RegistrationForm } from '~/modules/auth'
import { AuthLayout } from '~/components/UI'

definePageMeta({
  title: 'Регистрация'
})
</script>
```

**Модули (`modules/`):**
- Самодостаточные бизнес-блоки
- Могут использовать другие модули только через их `index.ts`
- Содержат всю логику домена

**UI компоненты (`components/UI/`):**
- Только презентационные компоненты
- Никакой бизнес-логики
- Максимальная переиспользуемость

### 4. Naming Convention

```
modules/
├── user-profile/           # kebab-case для папок
│   ├── components/
│   │   ├── ProfileForm.vue      # PascalCase для компонентов
│   │   └── ProfileAvatar.vue
│   ├── composables/
│   │   └── useProfile.ts        # camelCase с префиксом 'use'
│   ├── services/
│   │   └── ProfileApiClient.ts  # PascalCase для классов API
│   ├── stores/
│   │   └── profileStore.ts      # camelCase с суффиксом 'Store'
│   └── types/
│       └── index.ts
```

### 5. TypeScript

**ОБЯЗАТЕЛЬНО типизировать:**
```ts
// modules/auth/types/index.ts
export interface User {
  id: string
  email: string
  name: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
}
```

### 6. Composables

**Один composable = одна ответственность:**
```ts
// modules/auth/composables/useAuth.ts
export const useAuth = () => {
  const login = async (credentials: LoginCredentials) => {
    // логика авторизации
  }
  
  const logout = () => {
    // логика выхода
  }
  
  return {
    login,
    logout,
    user: readonly(user)
  }
}
```

### 7. Services

**API клиенты и внешние интеграции:**
```ts
// shared/services/ApiClient.ts
export abstract class ApiClient {
  protected readonly baseURL: string
  protected async request<T>(endpoint: string, options?: any): Promise<T>
  // базовые методы для HTTP запросов
}

// modules/auth/services/AuthApiClient.ts
import { ApiClient } from '~/shared/services/ApiClient'

export class AuthApiClient extends ApiClient {
  async login(credentials: LoginCredentials) {
    return this.post<AuthResponse>('/auth/login', credentials)
  }
}

export const authApi = new AuthApiClient()
```

## 🔄 Workflow разработки

### Создание нового модуля

1. **Создай структуру:**
```bash
mkdir -p modules/my-module/{components,composables,services,stores,types}
touch modules/my-module/index.ts
```

2. **Заполни `index.ts`:**
```ts
export { default as MyComponent } from './components/MyComponent.vue'
export { useMyModule } from './composables/useMyModule'
export type { MyType } from './types'
```

3. **Создавай компоненты и логику**

4. **Тестируй модуль изолированно**

### Code Review Checklist

- [ ] Модуль экспортирует все через `index.ts`
- [ ] Нет прямых импортов в обход `index.ts`
- [ ] Компоненты страниц содержат только композицию
- [ ] UI компоненты не содержат бизнес-логики
- [ ] Все типы описаны в TypeScript
- [ ] Naming convention соблюден
- [ ] Нет циклических зависимостей

## 🚫 Частые ошибки

1. **Бизнес-логика в pages/**
2. **Прямые импорты из модулей**
3. **UI компоненты с бизнес-логикой**
4. **Отсутствие типизации**
5. **Нарушение иерархии зависимостей**

## 📖 Примеры

### Правильная организация модуля
```
modules/product-catalog/
├── components/
│   ├── ProductList.vue
│   ├── ProductCard.vue
│   └── ProductFilter.vue
├── composables/
│   ├── useProducts.ts
│   └── useProductFilter.ts
├── services/
│   └── ProductApiClient.ts
├── stores/
│   └── productStore.ts
├── types/
│   └── index.ts
└── index.ts
```

### Использование в странице
```vue
<!-- pages/catalog/index.vue -->
<template>
  <div>
    <ProductFilter />
    <ProductList />
  </div>
</template>

<script setup>
import { ProductFilter, ProductList } from '~/modules/product-catalog'
</script>
```

---

**⚠️ Любые отклонения от этой архитектуры должны быть согласованы с тимлидом!**