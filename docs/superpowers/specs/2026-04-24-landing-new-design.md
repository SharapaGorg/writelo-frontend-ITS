# Landing v2 — `/landing-new`

**Date:** 2026-04-24
**Brief source:** `.claude/landing-brief.md`
**Status:** Approved, ready for implementation

---

## Goal

Build a new marketing landing page at the route `/landing-new` that positions Writelo as a research-and-planning platform for SMM professionals — explicitly *not* an "AI writes your posts" tool. Page must be self-contained: it shares **only** the existing `ContentCalendarPage` showcase component with the rest of the project. Everything else (fonts, colors, components, copy) is independent and does not leak into the main app theme.

The current landing at `pages/index.vue` stays untouched. This is a parallel page for evaluation.

## Scope

**In scope:**
- New route `pages/landing-new.vue` (prerendered).
- New module `lib-modules/landing-new/` with all UI for the page.
- Russian-only copy, written through `useI18n()` keys under a new top-level namespace `landingNew.*` in `i18n/locales/ru.json`. EN file is not touched.
- Dark mode only.
- Reuse of `ContentCalendarPage` from `~/lib-modules/content-calendar` with `:showcase-mode="true"`.

**Out of scope (v1):**
- Real product screenshots — placeholders for editor / brief form / Reels analysis. Owner provides them later.
- EN translation.
- Light mode.
- Demo-call modal / Calendly integration. Business pricing CTA is a `mailto:` or anchor — final destination decided at implementation time, defaults to `mailto:` to support email.
- Analytics events beyond `$trackGoal('landing_new_cta_click', { button })` on primary buttons.

## Routing & Nuxt config

- New page file: `pages/landing-new.vue`. Sets `definePageMeta({ layout: false, auth: false })`.
- Add `'/landing-new': { ssr: true, prerender: true }` to `routeRules` in `nuxt.config.ts`.
- Add `'/landing-new'` to `nitro.prerender.routes`.
- No other Nuxt config changes. No new Nuxt modules. No `@nuxt/fonts`.

## Module layout

Per the project convention in `CLAUDE.md`:

```
lib-modules/landing-new/
├── components/
│   ├── LandingNewPage.vue              # root: header + main + footer (header & footer inline)
│   ├── HeroSection.vue
│   ├── AudienceSection.vue
│   ├── TrendsSection.vue
│   ├── CalendarSection.vue             # wraps ContentCalendarPage in browser mockup
│   ├── BriefSection.vue
│   ├── ReelsSection.vue                # marked "В разработке"
│   ├── EditorSection.vue
│   ├── PublishSection.vue              # one-line block, no own hero
│   ├── PricingSection.vue
│   ├── FinalCtaSection.vue
│   ├── SectionHeader.vue               # editorial mono label + h2 (reused across sections)
│   ├── PrimaryButton.vue
│   ├── GhostButton.vue
│   └── PriceCard.vue
├── composables/
│   └── useScrollReveal.ts              # IntersectionObserver-based fade-in, independent of existing useScrollAnimation
├── helpers/
│   └── fonts.ts                        # exports the Google Fonts <link href="..."> URL constant
├── types/
│   └── index.ts                        # PriceCardProps, SectionHeaderProps, etc.
└── index.ts                            # public surface: export { LandingNewPage }
```

No `stores/` — landing has no shared state. Add only if a future demo-modal needs one.

No `ui/` subdirectory — that name is reserved for shadcn primitives at the project root.

## Page wiring

```vue
<!-- pages/landing-new.vue -->
<script setup lang="ts">
import { LandingNewPage } from '~/lib-modules/landing-new'
import { GOOGLE_FONTS_HREF } from '~/lib-modules/landing-new/helpers/fonts'

definePageMeta({ layout: false, auth: false })

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: GOOGLE_FONTS_HREF },
  ],
})

useSeoMeta({
  robots: 'index, follow',
  title: 'Writelo — платформа для SMM, без обещаний, что AI напишет за вас',
  description: 'Ресёрч трендов Instagram, инфоповоды под бренд и календарь, где это собирается в план. Платформа для SMM-фрилансеров, команд и агентств.',
})
</script>

<template><LandingNewPage /></template>
```

## Visual system

All values are inlined as Tailwind arbitrary values (`bg-[#0a0a0a]`, etc.). No `tailwind.config.js` changes. No new CSS files (theme tokens live as inline classes; if repetition becomes painful during implementation, move to `lib-modules/landing-new/components/styles.css` scoped to the page).

### Colors

| Token       | Hex                     | Usage                                            |
|-------------|-------------------------|--------------------------------------------------|
| bg          | `#0a0a0a`               | Page background                                  |
| text        | `#ede8de`               | Main text (warm cream)                           |
| muted       | `#5a5550`               | Mono labels, footnotes, secondary text           |
| accent      | `#d4683f`               | Primary CTA fill, italic accents in headlines    |
| accent-deep | `#b9542d`               | Hover state for primary CTA                      |
| rule        | `rgba(237,232,222,0.3)` | Horizontal dividers and 1px borders              |

### Typography

Three fonts, loaded once via Google Fonts CSS link in `useHead()`:

- **Unbounded** — display only (h1, h2, h3, brand wordmark). Weights: 400, 500, 700, 800.
- **IBM Plex Sans** — body text, buttons, nav links, captions. Weights: 400, 500, 700.
- **JetBrains Mono** — editorial mono labels (e.g., `N°02 / TRENDS`), section meta. Weights: 400, 700.

Apply via CSS variables on `LandingNewPage.vue` root:

```css
.landing-new-root {
  --font-display: 'Unbounded', system-ui, sans-serif;
  --font-body: 'IBM Plex Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}
```

Tailwind via `font-[var(--font-display)]` etc. Default body inherits `--font-body`.

| Role            | Font           | Mobile  | Desktop | line-height | tracking  |
|-----------------|----------------|---------|---------|-------------|-----------|
| Hero h1         | Unbounded 800  | 48 px   | 88 px   | 0.98        | -0.04em   |
| Section h2      | Unbounded 700  | 36 px   | 64 px   | 1.05        | -0.03em   |
| Sub-h3          | Unbounded 500  | 22 px   | 28 px   | 1.1         | -0.02em   |
| Body            | IBM Plex Sans  | 15 px   | 17 px   | 1.55        | normal    |
| Mono label      | JetBrains Mono | 11 px   | 12 px   | 1           | 0.1em UPR |
| Price (display) | Unbounded 700  | 32 px   | 40 px   | 1           | -0.02em   |

Body max-width: 60ch.

### Spacing & layout

- Section vertical padding: `py-20 md:py-32` (80 / 128 px).
- Inter-section margin: 0 (sections own their padding).
- Container: `max-w-[1200px] mx-auto px-6 md:px-12`.
- Hero allowed to widen to `max-w-[1400px]` for breathing room.

### Buttons

- **PrimaryButton.vue** — `bg-[#d4683f] text-[#0a0a0a] font-[var(--font-body)] font-medium px-8 py-4 hover:bg-[#b9542d] transition-colors`. No border-radius.
- **GhostButton.vue** — `border border-[#ede8de] text-[#ede8de] px-8 py-4 hover:bg-[#ede8de]/10 transition-colors`. No border-radius.

### SectionHeader.vue

Reusable atom for sections 2–7, 9.

```
[ N°02 / TRENDS ]                                ← mono label, muted
                                                 ← 24px gap
Большой заголовок секции                         ← h2 Unbounded 700
                                                 ← optional 1px rule below, full width of container
```

Props: `label: string` (e.g., `"N°02 / TRENDS"`), `title: string`, `withRule?: boolean = false`.

### Animations

`useScrollReveal()` — IntersectionObserver, threshold 0.15. Returns `{ elementRef, isVisible }`. Section root applies `transition-all duration-700 ease-out` and toggles `opacity-100 translate-y-0` ↔ `opacity-0 translate-y-2`.

No marquee tickers. No pulse-glow. No purple gradients. No glassmorphism (no `backdrop-blur` on cards).

## Section-by-section spec

All copy below is the **starting draft** — owner can edit at implementation time without changing layout. All strings live in `i18n/locales/ru.json` under `landingNew.*`.

### 1. Hero (`HeroSection.vue`)

Full-viewport-height (`min-h-screen`) centered content.

- Top mono label, centered: `WRITELO / N°00`
- h1 (Unbounded 800), 5 lines on desktop, allow natural reflow on mobile:

  > Мы не пишем посты *за вас.*
  > Мы делаем то,
  > на что нет
  > времени.

  The italic `за вас.` uses accent color `#d4683f` and `font-style: italic` (Unbounded italic). Italic accents in section h2s are reserved for Hero only — other sections use straight type.

- Sub (IBM Plex Sans 17 px, `text-[#a8a094]`, max-w-2xl, centered):

  > Платформа для SMM-специалистов, которые ведут несколько брендов. Тренды Instagram, инфоповоды под каждый бренд и один календарь, где всё собирается в план.

- Primary CTA: `Попробовать бесплатно →` → routes to `/app` (demo mode kicks in if not logged in, same behavior as old hero CTA).
- Below CTA: scroll-cue arrow (`lucide-vue-next ArrowDown`), bouncing slowly. No secondary CTA button.
- Bottom mono caption (centered, `muted`): `↓ Что внутри`.

No background gradient. No grid overlay. No marquee stats ticker.

### 2. Audience (`AudienceSection.vue`)

- `SectionHeader` with `N°01 / AUDIENCE`, title `Для тех, кто на этом зарабатывает.`
- Three cards in a row (1 col mobile, 3 cols desktop). Each card:
  - Mono caption top: `01 — SMM-фрилансер` / `02 — Контент-команда` / `03 — Агентство`.
  - h3 Unbounded 500: `Один человек, пять брендов.` / `Команда внутри бренда.` / `Десятки клиентов одновременно.`
  - 2-line body description.
- Card style: 1px border `rule`, padding 32px, no background fill, no hover lift. The point is editorial spread, not interactive cards.

### 3. Trends (`TrendsSection.vue`)

`SectionHeader` with `N°02 / TRENDS`, title `Тренды Instagram. Без чужого опыта в подписи.`

Two-column on desktop (`grid-cols-1 md:grid-cols-2 gap-16 items-start`):

- **Left:** body copy (3–4 sentences). Emphasizes that this is a *research* tool — surfacing what's working in the niche right now, with links to sources, so the creator decides what to do with it. Does *not* write captions automatically.
- **Right:** abstract typographic visual (NOT a screenshot). A tall card with mock trend rows — each row: `#hashtag` (Unbounded 500, big), reach number (mono, muted), trend arrow (`lucide ArrowUpRight` accent). 4–5 rows, varied widths, asymmetric. Hand-tuned, looks like a content sample but not pretending to be a real screenshot.

### 4. Calendar (`CalendarSection.vue`)

`SectionHeader` with `N°03 / CALENDAR`, title `Инфоповоды под бренд. Сразу в план.`

Body sub (max-w-3xl): one paragraph explaining that news from Grok and Google are filtered through the brand brief — so the calendar surfaces ideas that fit *this* brand, not a generic news feed.

Below: full-width browser-mockup wrapper.

```
┌─────────────────────────────────────────────────┐
│ ● ● ●        writelo.app/calendar               │  ← mockup chrome, muted text
├─────────────────────────────────────────────────┤
│                                                 │
│  <ContentCalendarPage :showcase-mode="true" />  │
│                                                 │
└─────────────────────────────────────────────────┘
```

Mockup chrome:
- Outer wrapper: `border border-[#ede8de]/20 rounded-lg overflow-hidden` (small radius here is the *only* place we use radius — it's a window-chrome convention).
- Top bar: `bg-[#1a1a1a] px-4 py-3 flex items-center gap-4 border-b border-[#ede8de]/15`. Three traffic-light dots (`#d4683f / #5a5550 / #5a5550` — desaturated, not colorful), centered fake URL pill `writelo.app/calendar` in mono.
- Body: `bg-[#0a0a0a]` directly hosting `<ContentCalendarPage :showcase-mode="true" />` (the calendar component owns its own internal styling).

This section is `hidden md:block` — same as the old `LandingCalendarShowcase`, calendar is desktop-only because the component does not adapt to small screens.

### 5. Brief / multi-brand (`BriefSection.vue`)

`SectionHeader` with `N°04 / BRANDS`, title `Каждый бренд — отдельное пространство.`

Two-column layout, same grid as Trends:

- **Left:** body — explains that each brand gets its own workspace with brief, voice guidelines, and instructions for the AI tools. AI works in *that* brand's context, not generic. Analogy in copy: «как проекты в Claude — но для SMM».
- **Right:** placeholder `<div>` styled as a screenshot frame (same browser chrome as calendar, but smaller). Inside: `<div class="aspect-[4/3] bg-[#1a1a1a] flex items-center justify-center text-[#5a5550] text-sm">[ Скриншот формы брифа добавит owner ]</div>`. Easy to swap for a real `<NuxtImg src="/landing-new/brief.png" />` later.

### 6. Reels (`ReelsSection.vue`)

`SectionHeader` with `N°05 / REELS`, title `Анализ Reels.`

Inline next to the title (same line on desktop, below on mobile): badge `В разработке` — small pill with `border border-[#d4683f] text-[#d4683f] px-3 py-1 font-[var(--font-mono)] text-xs uppercase tracking-wider`.

Body (one paragraph): explains the upcoming feature briefly — pulls Reels from competitors / niche, breaks them down, surfaces what's working.

Visual: an abstract typographic stack — three "reel cards" stacked at slight angle, each with a `lucide Play` icon, mock view counts, all rendered in muted `#5a5550` to read as upcoming/preview.

No CTA in this section.

### 7. Editor (`EditorSection.vue`)

`SectionHeader` with `N°06 / EDITOR`, title `Редактор под каждую соцсеть.`

Two-column:
- **Left:** body — short, factual. Lists supported networks inline (Instagram, Telegram, VK), mentions per-platform formatting (caption length, link rules, hashtag handling) without being exhaustive. One sentence on cross-posting.
- **Right:** screenshot placeholder, same pattern as brief section.

### 8. Publish (`PublishSection.vue`)

No `SectionHeader`. No screenshot. Just one centered editorial block in a slim section (`py-16 md:py-24`):

```
INLINE / N°06½
И публикация прямо из редактора.
Без копи-паста между приложениями.
```

- Mono caption top (centered) — same format as `SectionHeader` labels (`UPPERCASE / N°XX`).
- Two h3 lines (Unbounded 500), second line in `muted` color. That's it.

### 9. Pricing (`PricingSection.vue`)

`SectionHeader` with `N°07 / PRICING`, title `Тарифы.`

Three `PriceCard`s (1 col mobile, 3 cols desktop, equal height).

`PriceCardProps`:
```ts
interface PriceCardProps {
  name: string                  // 'Free' | 'Pro' | 'Business'
  description: string
  price: string                 // '0 ₽' | '990 ₽' | 'По запросу'
  period?: string               // '/мес'
  features: string[]
  cta: { label: string; action: 'signup' | 'demo' }
  highlighted?: boolean         // true for Pro
}
```

Card style:
- 1px border `rule`, padding 40px, no fill on Free/Business.
- Pro: 1px border `accent` (`#d4683f`), thin top accent rule (4px solid `#d4683f`). No glow, no gradient ribbon.
- Layout: name (Unbounded 500, 24px) + price (Unbounded 700, big) row at top, description (body, muted) below, feature list (`lucide Check` icons in `accent`, body text), CTA button at bottom (PrimaryButton on Pro & Business, GhostButton on Free).

Business CTA `action: 'demo'` opens `mailto:` with subject (final destination TBD with owner — sane default: `mailto:hello@writelo.io?subject=Демо%20Writelo%20Business`). Other CTAs route to `/auth` if not logged in else `/app`.

Copy:
- **Free** — «Чтобы попробовать.» 4 features. CTA: «Начать».
- **Pro** — «Для активных SMM-специалистов.» 6 features incl. multi-brand and unlimited. CTA: «Попробовать Pro».
- **Business** — «Для агентств и команд.» Lists: «Всё из Pro», «Командные роли», «Брендирование», «Приоритетная поддержка». CTA: «Записаться на демо».

No countdown timer. No discount ribbon. The page sells the product, not urgency.

### 10. Final CTA (`FinalCtaSection.vue`)

Full-viewport-height block, centered.

- Single h2 (Unbounded 800, similar size to hero on desktop, smaller on mobile):
  > Хватит притворяться, что AI делает работу за вас.
- Sub line (body 17 px, muted): «Попробуйте инструмент, который этого не обещает.»
- PrimaryButton: «Попробовать бесплатно →»

### 11. Footer (inline in `LandingNewPage.vue`)

`border-t border-[#ede8de]/15 py-10`.

- Left: brand wordmark `Writelo` (Unbounded 700, 18px, no gradient).
- Center: nav links (`Возможности` / `Тарифы` / `Войти` / `Старт`), body 14px muted.
- Right: copyright `© 2026 Writelo`.

Mobile: stacked vertically with 16px gap, all centered.

### Header (inline in `LandingNewPage.vue`)

Sticky at top, `bg-[#0a0a0a]/85 backdrop-blur-sm border-b border-[#ede8de]/10`.

- Left: brand wordmark `Writelo` (Unbounded 700, 18px), clickable scrolls to top.
- Center (desktop only): nav anchors `Возможности` (#trends) / `Тарифы` (#pricing) / `Контакты` (mailto), body 14px text, hover accent.
- Right: PrimaryButton `Попробовать` (smaller variant — `px-5 py-2.5 text-sm`).
- Mobile: hamburger (`lucide Menu/X`), opens dropdown menu under header.

## Reused parts

- `ContentCalendarPage` from `~/lib-modules/content-calendar` — used inside `CalendarSection` with `:showcase-mode="true"`. Component is treated as a black box — no styling overrides reach into it. The wrapper provides browser chrome and that's it.
- `lucide-vue-next` icons — already a project dependency, used for `ArrowDown`, `ArrowUpRight`, `Check`, `Play`, `Menu`, `X`.

Nothing else from existing landing components is reused. Old `pages/index.vue` is untouched.

## i18n

All copy under `landingNew.*`:

```jsonc
{
  "landingNew": {
    "header": { "nav": { "features": "Возможности", "pricing": "Тарифы", "contacts": "Контакты" }, "cta": "Попробовать" },
    "hero": { "label": "WRITELO / N°00", "title": ["Мы не пишем посты", "за вас.", "Мы делаем то,", "на что нет", "времени."], "sub": "...", "cta": "Попробовать бесплатно", "scrollHint": "Что внутри" },
    "audience": { /* ... */ },
    "trends": { /* ... */ },
    "calendar": { /* ... */ },
    "brief": { /* ... */ },
    "reels": { "badge": "В разработке", /* ... */ },
    "editor": { /* ... */ },
    "publish": { "label": "INLINE / N°06½", "line1": "И публикация прямо из редактора.", "line2": "Без копи-паста между приложениями." },
    "pricing": { /* ... */ },
    "finalCta": { /* ... */ },
    "footer": { /* ... */ }
  }
}
```

`en.json` is not edited in this iteration. When EN is added later, the English file mirrors the structure — sections lay out the same; only string values change.

## Anti-patterns to enforce in implementation

These come straight from the brief — implementation reviewer should catch any of these:

- ❌ Purple gradients (no `from-purple-*`, no `to-indigo-*` anywhere in this module).
- ❌ Glassmorphism (no `backdrop-blur-*` on cards; the only `backdrop-blur-sm` allowed is on the sticky header, which is a different pattern).
- ❌ Generic SaaS hero (left text + right product screenshot). Hero is centered editorial, no screenshot.
- ❌ System or generic fonts. Tailwind's `font-sans`/`font-serif` defaults are not used; everything routes through the CSS variables `--font-display`/`--font-body`/`--font-mono`.
- ❌ Emoji icons in feature lists. Use `lucide` icons.
- ❌ Copy like «Revolutionize your SMM workflow», «Unlock your creativity», «AI-powered everything». If you find yourself writing in this register, stop.
- ❌ "Записаться на демо" anywhere except the Business pricing card. Hero, header, and final CTA all push to free trial.
- ❌ Marquee/ticker animations. Pulse-glow shadows. Countdown timers.

## Testing & verification

- `yarn dev` is held by user on :3000 — do not start a duplicate. Ask user to navigate to `http://localhost:3000/landing-new` to verify, or `curl -I http://localhost:3000/landing-new` for a smoke check.
- Verify visually at three breakpoints: 375 (mobile), 768 (tablet), 1440 (desktop).
- Verify SEO meta renders by view-source (since route is prerendered).
- Confirm no Tailwind classes from this module reference `purple` or `indigo`.
- Confirm `useHead` font link only loads on this page (it's inside `pages/landing-new.vue`, so it's scoped to the route — verify by visiting another page and inspecting `<head>`).

## Risk & open questions

- **Calendar showcase visual fit** — the calendar component has its own internal styling (purples, etc., depending on its current state). If it clashes with the editorial dark palette, we may need to either (a) accept the contrast as a "live demo" feel, or (b) add a per-showcase-mode style override in the calendar module. This is decided after first render — not solved upfront.
- **Business CTA destination** — `mailto:` is the safe default. If owner has a Calendly / Tally / form preference, swap the href. Single-line change.
- **Reels & Brief screenshots** — placeholders ship with v1; owner provides real assets later. The placeholder `<div>` is replaced with `<NuxtImg>` without other layout changes.
