# Analytics Events (Yandex Metrica)

Metrica ID: `107274460`

Plugin: `plugins/yandex-metrika.client.ts`

## Настройка целей в Метрике

1. Настройки → Цели → Добавить цель
2. Тип: "JavaScript-событие"
3. Идентификатор: название события из таблицы ниже

## События

### Landing Page — CTA клики

Событие: `landing_cta_click`

| Параметр `button` | Описание | Компонент |
|-------------------|----------|-----------|
| `hero_try_free` | Главная кнопка "Попробовать бесплатно" | `LandingHero.vue` |
| `feature_clients` | "Попробовать" у фичи "Клиенты" | `LandingFeature.vue` |
| `feature_content` | "Попробовать" у фичи "Контент-план" | `LandingFeature.vue` |
| `feature_prompt` | "Попробовать" у фичи "Промпты" | `LandingFeature.vue` |
| `feature_trends` | "Попробовать" у фичи "Тренды" | `LandingFeature.vue` |
| `feature_images` | "Попробовать" у фичи "Картинки" | `LandingFeature.vue` |
| `calculator_start_saving` | "Начать экономить" в калькуляторе | `TimeCalculator.vue` |
| `pricing_free` | Кнопка тарифа Free | `LandingPricing.vue` |
| `pricing_pro` | Кнопка тарифа Pro (покупка!) | `LandingPricing.vue` |

### Landing Page — Прочие события

| Событие | Параметры | Описание | Компонент |
|---------|-----------|----------|-----------|
| `landing_video_play` | `video: 'promo'` | Запуск промо-видео | `LandingPromoVideo.vue` |
| `calculator_slider_used` | `posts: number` | Использование калькулятора (первое взаимодействие) | `TimeCalculator.vue` |

### Глобальные события

| Событие | Параметры | Описание | Компонент |
|---------|-----------|----------|-----------|
| `language_switch` | `from`, `to` | Переключение языка | `LanguageSelector.vue` |

## Использование в коде

```typescript
const { $trackGoal } = useNuxtApp()

// Простое событие
$trackGoal('event_name')

// Событие с параметрами
$trackGoal('landing_cta_click', { button: 'hero_try_free' })

// Низкоуровневый API (для специфичных случаев)
const { $ym } = useNuxtApp()
$ym('reachGoal', 'goal_name', { param: 'value' })
```

## Что добавить в будущем

### Регистрация / Авторизация
- [ ] `signup_start` — открыл форму регистрации
- [ ] `signup_complete` — успешно зарегистрировался
- [ ] `login_success` — успешный вход

### Продукт
- [ ] `first_message` — отправил первое сообщение
- [ ] `image_generated` — сгенерировал картинку
- [ ] `project_created` — создал проект

### Монетизация
- [ ] `subscription_view` — открыл страницу тарифов
- [ ] `payment_started` — начал оплату
- [ ] `payment_success` — успешная оплата
