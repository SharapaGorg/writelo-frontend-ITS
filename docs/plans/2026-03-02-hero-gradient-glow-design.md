# Hero Section: Gradient Glow Design

**Date:** 2026-03-02
**Status:** Approved
**Style:** Linear-like with purple→indigo gradients

## Overview

Улучшение Hero-секции лендинга для создания более визуально привлекательного первого впечатления. Стиль вдохновлён Linear/Vercel — тёмный фон, градиентные акценты, glow-эффекты.

## Design Elements

### 1. Gradient Text Headline

Вторая строка заголовка ("за минуты, не часы") получает градиентный текст:

```css
background: linear-gradient(to right, #a855f7, #6366f1);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

Tailwind: `bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent`

### 2. Glowing CTA Button

Кнопка "Попробовать бесплатно":
- Background: gradient purple-600 → indigo-600
- Box-shadow: `0 0 20px rgba(139, 92, 246, 0.5)`
- Hover: увеличение blur до 30px, scale(1.02)
- Transition: smooth 200ms

### 3. Background Blob

Размытый градиентный орб за контентом:
- Size: ~400px
- Position: absolute, top-right offset
- Colors: purple-500/indigo-500 с opacity 20-30%
- Filter: blur(100px)
- Optional: subtle float animation (transform translateY)

### 4. Background Pattern (optional)

Dot grid pattern:
- Radial gradient dots
- Opacity: 5-10%
- Adds depth without distraction

## Technical Approach

- Pure CSS/Tailwind — no JS libraries
- CSS custom properties for gradient colors (reusability)
- Responsive: blob scales down on mobile
- Performance: GPU-accelerated transforms for animations

## Files to Modify

- `pages/landing.vue` — Hero section markup and styles

## Success Criteria

- Заголовок с градиентом читается чётко
- Кнопка привлекает внимание свечением
- Blob добавляет глубину, не отвлекая от текста
- Работает на мобильных устройствах
