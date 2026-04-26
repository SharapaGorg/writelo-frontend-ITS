# Landing-new — кастомный скроллбар

## Проблема

На новом лендинге (`pages/landing-new.vue` → `lib-modules/landing-new/components/LandingNewPage.vue`) скролл происходит внутри контейнера `.landing-new-root` (`h-screen overflow-y-auto`). Глобальное правило в `assets/css/main.css`:

```css
*::-webkit-scrollbar { width: 0 !important; }
```

скрывает скроллбар. Это норм для остального приложения, но на длинном лендинге пользователю не видно прогресса по странице — хочется тонкий, типографский скроллбар, попадающий в editorial-стиль страницы.

## Решение

Editorial-минимализм: тонкая parchment-полоска thumb на прозрачном треке, чуть ярче при hover. Только WebKit + Firefox, чистый CSS, скоуп — только `.landing-new-root`. Остальное приложение не трогаем.

## Параметры

| Параметр | Значение |
|---|---|
| Ширина | `8px` |
| Track | `transparent` |
| Thumb (idle) | `rgba(237, 232, 222, 0.12)` |
| Thumb (hover) | `rgba(237, 232, 222, 0.24)` |
| Thumb radius | `9999px` (pill) |
| Transition | `background-color 200ms` |
| Firefox | `scrollbar-width: thin; scrollbar-color: rgba(237,232,222,0.12) transparent` |

`#ede8de` (237, 232, 222) — это `--font-display`-цвет лендинга, parchment.

## Где живёт CSS

В существующем `<style>` блоке `lib-modules/landing-new/components/LandingNewPage.vue` (рядом с `.lnf-display`, `lnu-fade-up`, keyframes). Это стандартное место для стилей лендинга и оно уже скоупит правила через префикс `.landing-new-root`.

## Почему не Tailwind / не tailwind-scrollbar

Глобальное правило `*::-webkit-scrollbar { width: 0 !important }` бьёт по специфичности любые правила без `!important`. Плагин `tailwind-scrollbar` генерирует утилиты без `!important` — значит классы вида `scrollbar-thin scrollbar-thumb-...` не сработают на лендинге без bump'а специфичности. Проще написать ~10 строк CSS с `!important` в скоупе `.landing-new-root`, чем обходить глобальное правило через layer-конфиги.

## Скоуп изменений

**Меняем:**
- `lib-modules/landing-new/components/LandingNewPage.vue` — добавляем CSS-блок в существующий `<style>`.

**Не трогаем:**
- `assets/css/main.css` (глобальный hide остаётся для остального приложения).
- Старый `pages/landing.vue` и `components/landing/` (не на новом дизайне).
- Любые другие модули.

## Acceptance

- На десктопе видна тонкая (8px) parchment-полоска справа на лендинге, на тёмном `#0a0a0a` фоне.
- Thumb еле заметен в покое, заметно ярче при наведении — плавный переход.
- Скроллится `.landing-new-root` (внутренний контейнер), не html/body — это уже текущее поведение.
- В Firefox скроллбар тоже стилизован (`scrollbar-width: thin`, `scrollbar-color`).
- На мобайле скроллбар системный (WebKit на iOS не показывает overlay-scrollbar постоянно — это OK, не задача).
- Остальное приложение (`/app/*`, `/auth`, старый `/landing`) — без изменений, скроллбары остаются как были.

## Из скоупа исключено

- Auto-hide / fade-out behaviour (нужен JS — отдельная история, если захочется потом).
- Стилизация скроллбара в других местах приложения.
- Изменение глобального `*::-webkit-scrollbar` правила.
- Custom-скроллбар на горизонтальных скроллах внутри секций (если такие появятся).
