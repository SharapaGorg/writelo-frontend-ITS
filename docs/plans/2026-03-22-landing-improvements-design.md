# Landing Page Improvements Design

## Overview

Добавление social proof, навигации и секции контактов на лендинг.

## Изменения

### 1. Social Proof в Hero

**Файл:** `components/landing/LandingHero.vue`

Добавить блок под CTA-кнопкой с метриками:
- 1000+ пользователей
- Рейтинг 4.8★
- 5000+ контент-планов
- 10000+ постов

Стиль: мелкий приглушённый текст, разделители "•".

### 2. Навигация в хедере

**Файл:** `components/landing/LandingPage.vue`

**Десктоп:**
- Якорные ссылки: Возможности, Цены, Контакты
- Расположение: между logo и language selector

**Мобилка:**
- Бургер-меню справа
- При клике — выпадающий список с теми же ссылками

Якоря:
- Возможности → `#features` (первая LandingFeature)
- Цены → `#pricing` (LandingPricing)
- Контакты → `#contacts` (LandingContacts)

### 3. Секция "Контакты"

**Новый файл:** `components/landing/LandingContacts.vue`

**Расположение:** между LandingPricing и LandingFooter

**Содержимое:**
1. Заголовок "Контакты"
2. Иконки соцсетей:
   - Telegram: https://t.me/writelo
   - YouTube: https://youtube.com/@writelo-io
   - Instagram: https://instagram.com/writelo.io
   - VK: https://vk.ru/writelo
   - TikTok: https://tiktok.com/@writelo.io
3. Email: dushin.egor.dm@yandex.ru
4. Форма фидбека:
   - Textarea (max 600 символов)
   - Input email (опциональный)
   - Кнопка "Отправить"
   - При отправке: `ym(ID, 'reachGoal', 'feedback_submitted', {text, email})`

### 4. Упрощение футера

**Файл:** `components/landing/LandingFooter.vue`

Убрать:
- Ссылку на Telegram (теперь в секции Контакты)
- Ссылку на email поддержки (теперь в секции Контакты)

Оставить:
- Logo "Writelo"
- Ссылки: "Начать работу", "Вход"
- Copyright © 2026

## Технические детали

- Числа social proof захардкожены в компоненте
- Иконки соцсетей: Lucide icons или inline SVG
- Форма фидбека отправляет данные только в Яндекс.Метрику
- Навигация использует smooth scroll к якорям
