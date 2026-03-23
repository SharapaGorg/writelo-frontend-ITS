# Landing Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign landing page with Linear/Vercel dark theme, scroll animations, and feature showcase sections.

**Architecture:** Replace current landing.vue with modular components. Each feature section is a reusable component with intersection observer for scroll animations. Dark theme with gradient glows.

**Tech Stack:** Vue 3, Nuxt 3, Tailwind CSS, @vueuse/core (useIntersectionObserver), CSS animations

---

## Task 1: Create Animation Composable

**Files:**
- Create: `composables/useScrollAnimation.ts`

**Step 1: Create the composable**

```typescript
// composables/useScrollAnimation.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollAnimation(threshold = 0.1) {
  const elementRef = ref<HTMLElement | null>(null)
  const isVisible = ref(false)

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!elementRef.value) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible.value = true
            // Once visible, stop observing
            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold }
    )

    observer.observe(elementRef.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return {
    elementRef,
    isVisible
  }
}
```

**Step 2: Commit**

```bash
git add composables/useScrollAnimation.ts
git commit -m "feat(landing): add scroll animation composable"
```

---

## Task 2: Create LandingHero Component

**Files:**
- Create: `components/landing/LandingHero.vue`

**Step 1: Create the hero component**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '~/components/ui/button'

const { t } = useI18n()

const showFirstLine = ref(false)
const showSecondLine = ref(false)
const showContent = ref(false)

onMounted(() => {
  setTimeout(() => {
    showFirstLine.value = true
  }, 100)
  setTimeout(() => {
    showSecondLine.value = true
  }, 400)
  setTimeout(() => {
    showContent.value = true
  }, 700)
})
</script>

<template>
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <!-- Background gradient glow -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-gradient-to-br from-purple-600/30 to-indigo-600/20 rounded-full blur-[150px] animate-pulse-slow"
      />
    </div>

    <!-- Grid overlay -->
    <div
      class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none"
    />

    <div class="relative z-10 text-center px-4 max-w-4xl mx-auto">
      <!-- Main slogan -->
      <h1 class="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
        <span
          class="block transition-all duration-700 ease-out"
          :class="showFirstLine ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >
          {{ t('landing.hero.slogan1') }}
        </span>
        <span
          class="block bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent transition-all duration-700 ease-out"
          :class="showSecondLine ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >
          {{ t('landing.hero.slogan2') }}
        </span>
      </h1>

      <!-- Subtitle -->
      <p
        class="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 transition-all duration-700 ease-out"
        :class="showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        {{ t('landing.hero.description') }}
      </p>

      <!-- CTA -->
      <div
        class="flex flex-col items-center gap-4 transition-all duration-700 ease-out"
        :class="showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <Button
          size="lg"
          class="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 border-0 shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:scale-[1.02] transition-all duration-300"
          @click="navigateTo('/auth')"
        >
          {{ t('landing.hero.cta') }}
        </Button>
        <span class="text-sm text-zinc-500">
          {{ t('landing.hero.ctaSubtext') }}
        </span>
      </div>

      <!-- Scroll indicator -->
      <div
        class="absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 delay-1000"
        :class="showContent ? 'opacity-100' : 'opacity-0'"
      >
        <div class="w-6 h-10 rounded-full border-2 border-zinc-700 flex items-start justify-center p-2">
          <div class="w-1 h-2 bg-zinc-500 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  </section>
</template>
```

**Step 2: Add i18n keys to ru.json**

In `i18n/locales/ru.json`, update the landing.hero section:

```json
{
  "landing": {
    "hero": {
      "slogan1": "Ваши идеи.",
      "slogan2": "Наш темп.",
      "description": "AI-инструменты для SMM-специалистов. Клиенты, тренды, картинки — всё в одном месте",
      "cta": "Попробовать бесплатно",
      "ctaSubtext": "Без карты • 50 запросов бесплатно"
    }
  }
}
```

**Step 3: Add i18n keys to en.json**

In `i18n/locales/en.json`, update the landing.hero section:

```json
{
  "landing": {
    "hero": {
      "slogan1": "Your ideas.",
      "slogan2": "Our pace.",
      "description": "AI tools for SMM professionals. Clients, trends, images — all in one place",
      "cta": "Try for free",
      "ctaSubtext": "No card required • 50 free requests"
    }
  }
}
```

**Step 4: Commit**

```bash
git add components/landing/LandingHero.vue i18n/locales/ru.json i18n/locales/en.json
git commit -m "feat(landing): add LandingHero component with animations"
```

---

## Task 3: Create LandingFeature Component

**Files:**
- Create: `components/landing/LandingFeature.vue`

**Step 1: Create reusable feature component**

```vue
<script setup lang="ts">
import { useScrollAnimation } from '~/composables/useScrollAnimation'

interface Props {
  title: string
  description: string
  icon?: string
  direction?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'left'
})

const { elementRef, isVisible } = useScrollAnimation(0.2)

const slideClass = computed(() => {
  if (!isVisible.value) {
    return props.direction === 'left' ? '-translate-x-16 opacity-0' : 'translate-x-16 opacity-0'
  }
  return 'translate-x-0 opacity-100'
})
</script>

<template>
  <section
    ref="elementRef"
    class="min-h-screen flex items-center justify-center px-4 py-20"
  >
    <div
      class="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12 transition-all duration-700 ease-out"
      :class="[slideClass, direction === 'right' ? 'md:flex-row-reverse' : '']"
    >
      <!-- Icon/Visual -->
      <div class="flex-shrink-0">
        <div class="w-32 h-32 md:w-48 md:h-48 rounded-3xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/20 flex items-center justify-center">
          <slot name="icon">
            <div class="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 opacity-50" />
          </slot>
        </div>
      </div>

      <!-- Text -->
      <div class="text-center md:text-left">
        <h2 class="text-3xl md:text-5xl font-bold mb-6 text-white">
          {{ title }}
        </h2>
        <p class="text-lg md:text-xl text-zinc-400 max-w-xl">
          {{ description }}
        </p>
      </div>
    </div>
  </section>
</template>
```

**Step 2: Commit**

```bash
git add components/landing/LandingFeature.vue
git commit -m "feat(landing): add LandingFeature component with scroll animation"
```

---

## Task 4: Redesign Calculator Component

**Files:**
- Modify: `components/landing/TimeCalculator.vue`

**Step 1: Replace calculator with Apple-style design**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useScrollAnimation } from '~/composables/useScrollAnimation'

const { t } = useI18n()
const { elementRef, isVisible } = useScrollAnimation(0.3)

const posts = ref(10)
const minPosts = 5
const maxPosts = 30

const MINUTES_SAVED_PER_POST = 30

const weeklyHours = computed(() => Math.round((posts.value * MINUTES_SAVED_PER_POST) / 60))
const monthlyHours = computed(() => weeklyHours.value * 4)

const sliderPercent = computed(() => ((posts.value - minPosts) / (maxPosts - minPosts)) * 100)
</script>

<template>
  <section
    ref="elementRef"
    class="min-h-screen flex items-center justify-center px-4 py-20"
  >
    <div
      class="max-w-2xl mx-auto text-center transition-all duration-700 ease-out"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'"
    >
      <h2 class="text-3xl md:text-4xl font-bold mb-12 text-white">
        {{ t('landing.calculator.title') }}
      </h2>

      <!-- Slider -->
      <div class="mb-12">
        <p class="text-zinc-400 mb-6">{{ t('landing.calculator.question') }}</p>

        <div class="relative px-4">
          <!-- Track -->
          <div class="h-2 bg-zinc-800 rounded-full relative">
            <!-- Fill -->
            <div
              class="absolute h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-150"
              :style="{ width: `${sliderPercent}%` }"
            />
          </div>

          <!-- Input -->
          <input
            v-model.number="posts"
            type="range"
            :min="minPosts"
            :max="maxPosts"
            class="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
          />

          <!-- Thumb indicator -->
          <div
            class="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg shadow-purple-500/30 pointer-events-none transition-all duration-150"
            :style="{ left: `calc(${sliderPercent}% - 12px)` }"
          />
        </div>

        <!-- Labels -->
        <div class="flex justify-between mt-4 text-sm text-zinc-600">
          <span>{{ minPosts }}</span>
          <span class="text-zinc-400 font-medium">{{ posts }} {{ t('landing.calculator.posts') }}</span>
          <span>{{ maxPosts }}+</span>
        </div>
      </div>

      <!-- Result -->
      <div class="space-y-2">
        <div class="text-6xl md:text-8xl font-bold">
          <span class="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            ~{{ weeklyHours }}
          </span>
          <span class="text-2xl md:text-3xl text-zinc-500 ml-2">{{ t('landing.calculator.hoursPerWeekShort') }}</span>
        </div>
        <p class="text-xl text-zinc-500">
          → {{ monthlyHours }} {{ t('landing.calculator.hoursPerMonthShort') }}
        </p>
      </div>

      <!-- Benefit text -->
      <p class="mt-8 text-zinc-400">
        {{ t('landing.calculator.benefit') }}
      </p>
    </div>
  </section>
</template>
```

**Step 2: Update i18n keys in ru.json**

```json
{
  "landing": {
    "calculator": {
      "title": "Сколько времени ты сэкономишь?",
      "question": "Сколько постов делаешь в неделю?",
      "posts": "постов",
      "hoursPerWeekShort": "ч/нед",
      "hoursPerMonthShort": "часов в месяц",
      "benefit": "Это как дополнительный рабочий день каждую неделю"
    }
  }
}
```

**Step 3: Update i18n keys in en.json**

```json
{
  "landing": {
    "calculator": {
      "title": "How much time will you save?",
      "question": "How many posts do you make per week?",
      "posts": "posts",
      "hoursPerWeekShort": "hrs/week",
      "hoursPerMonthShort": "hours per month",
      "benefit": "That's like an extra workday every week"
    }
  }
}
```

**Step 4: Commit**

```bash
git add components/landing/TimeCalculator.vue i18n/locales/ru.json i18n/locales/en.json
git commit -m "feat(landing): redesign calculator with Apple-style slider"
```

---

## Task 5: Create LandingPricing Component

**Files:**
- Create: `components/landing/LandingPricing.vue`

**Step 1: Create pricing component**

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useScrollAnimation } from '~/composables/useScrollAnimation'
import { Button } from '~/components/ui/button'

const { t } = useI18n()
const { elementRef, isVisible } = useScrollAnimation(0.2)
</script>

<template>
  <section
    ref="elementRef"
    class="min-h-screen flex items-center justify-center px-4 py-20"
  >
    <div
      class="max-w-4xl mx-auto transition-all duration-700 ease-out"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'"
    >
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
        {{ t('landing.pricing.title') }}
      </h2>

      <div class="grid md:grid-cols-2 gap-6">
        <!-- Free -->
        <div class="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50">
          <h3 class="text-2xl font-bold text-white mb-2">{{ t('landing.pricing.free.name') }}</h3>
          <p class="text-zinc-400 mb-6">{{ t('landing.pricing.free.description') }}</p>

          <ul class="space-y-3 mb-8">
            <li class="flex items-center gap-3 text-zinc-300">
              <span class="text-purple-400">✓</span>
              {{ t('landing.pricing.free.features.requests') }}
            </li>
            <li class="flex items-center gap-3 text-zinc-300">
              <span class="text-purple-400">✓</span>
              {{ t('landing.pricing.free.features.clients') }}
            </li>
            <li class="flex items-center gap-3 text-zinc-300">
              <span class="text-purple-400">✓</span>
              {{ t('landing.pricing.free.features.search') }}
            </li>
            <li class="flex items-center gap-3 text-zinc-300">
              <span class="text-purple-400">✓</span>
              {{ t('landing.pricing.free.features.models') }}
            </li>
          </ul>

          <Button
            variant="outline"
            class="w-full border-zinc-700 hover:bg-zinc-800"
            @click="navigateTo('/auth')"
          >
            {{ t('landing.pricing.free.cta') }}
          </Button>
        </div>

        <!-- Pro -->
        <div class="p-8 rounded-2xl border border-purple-500/50 bg-gradient-to-b from-purple-900/20 to-transparent relative overflow-hidden">
          <!-- Glow -->
          <div class="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-transparent pointer-events-none" />

          <div class="relative">
            <div class="flex items-baseline justify-between mb-2">
              <h3 class="text-2xl font-bold text-white">{{ t('landing.pricing.pro.name') }}</h3>
              <div>
                <span class="text-3xl font-bold text-white">{{ t('landing.pricing.pro.price') }}</span>
                <span class="text-zinc-400">{{ t('landing.pricing.pro.period') }}</span>
              </div>
            </div>
            <p class="text-zinc-400 mb-6">{{ t('landing.pricing.pro.description') }}</p>

            <ul class="space-y-3 mb-8">
              <li class="flex items-center gap-3 text-zinc-300">
                <span class="text-purple-400">✓</span>
                {{ t('landing.pricing.pro.features.requests') }}
              </li>
              <li class="flex items-center gap-3 text-zinc-300">
                <span class="text-purple-400">✓</span>
                {{ t('landing.pricing.pro.features.clients') }}
              </li>
              <li class="flex items-center gap-3 text-zinc-300">
                <span class="text-purple-400">✓</span>
                {{ t('landing.pricing.pro.features.search') }}
              </li>
              <li class="flex items-center gap-3 text-zinc-300">
                <span class="text-purple-400">✓</span>
                {{ t('landing.pricing.pro.features.images') }}
              </li>
              <li class="flex items-center gap-3 text-zinc-300">
                <span class="text-purple-400">✓</span>
                {{ t('landing.pricing.pro.features.models') }}
              </li>
            </ul>

            <Button
              class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
              @click="navigateTo('/auth')"
            >
              {{ t('landing.pricing.pro.cta') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
```

**Step 2: Commit**

```bash
git add components/landing/LandingPricing.vue
git commit -m "feat(landing): add LandingPricing component"
```

---

## Task 6: Create LandingFooter Component

**Files:**
- Create: `components/landing/LandingFooter.vue`

**Step 1: Create footer component**

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <footer class="border-t border-zinc-800 py-12">
    <div class="container mx-auto px-4 max-w-5xl">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
        <div class="font-bold text-xl bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Writelo
        </div>

        <div class="flex gap-8">
          <a
            href="https://t.me/writelo"
            target="_blank"
            class="text-zinc-400 hover:text-white transition-colors"
          >
            {{ t('landing.footer.telegram') }}
          </a>
          <a
            href="mailto:dushin.egor.dm@yandex.ru"
            class="text-zinc-400 hover:text-white transition-colors"
          >
            {{ t('landing.footer.support') }}
          </a>
        </div>

        <div class="text-zinc-600">
          © 2026
        </div>
      </div>
    </div>
  </footer>
</template>
```

**Step 2: Commit**

```bash
git add components/landing/LandingFooter.vue
git commit -m "feat(landing): add LandingFooter component"
```

---

## Task 7: Add Feature i18n Keys

**Files:**
- Modify: `i18n/locales/ru.json`
- Modify: `i18n/locales/en.json`

**Step 1: Add feature keys to ru.json**

Add to landing section:

```json
{
  "landing": {
    "features": {
      "clients": {
        "title": "Один раз настроил — всегда в контексте",
        "description": "Сохрани информацию о клиенте: ниша, tone of voice, ЦА. AI учитывает это в каждом запросе."
      },
      "content": {
        "title": "Контент-план, посты, стратегия — за минуты",
        "description": "Базовые задачи SMM теперь занимают минуты, не часы. AI берёт рутину на себя."
      },
      "trends": {
        "title": "Актуальные тренды в два клика",
        "description": "AI найдёт что обсуждают прямо сейчас. Не нужно мониторить вручную."
      },
      "images": {
        "title": "Референсы без дизайнера",
        "description": "Генерируй изображения с нуля или редактируй существующие."
      }
    }
  }
}
```

**Step 2: Add feature keys to en.json**

```json
{
  "landing": {
    "features": {
      "clients": {
        "title": "Set up once — always in context",
        "description": "Save client info: niche, tone of voice, target audience. AI considers this in every request."
      },
      "content": {
        "title": "Content plan, posts, strategy — in minutes",
        "description": "Basic SMM tasks now take minutes, not hours. AI handles the routine."
      },
      "trends": {
        "title": "Current trends in two clicks",
        "description": "AI finds what's being discussed right now. No manual monitoring needed."
      },
      "images": {
        "title": "References without a designer",
        "description": "Generate images from scratch or edit existing ones."
      }
    }
  }
}
```

**Step 3: Commit**

```bash
git add i18n/locales/ru.json i18n/locales/en.json
git commit -m "feat(landing): add feature section i18n keys"
```

---

## Task 8: Add Tailwind Animation

**Files:**
- Modify: `tailwind.config.ts` or `tailwind.config.js`

**Step 1: Add custom animation**

Find the tailwind config and add to theme.extend.animation:

```javascript
animation: {
  'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
}
```

**Step 2: Commit**

```bash
git add tailwind.config.*
git commit -m "feat(landing): add slow pulse animation"
```

---

## Task 9: Rewrite Landing Page

**Files:**
- Modify: `pages/landing.vue`

**Step 1: Replace landing page with new structure**

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LandingHero from '~/components/landing/LandingHero.vue'
import LandingFeature from '~/components/landing/LandingFeature.vue'
import TimeCalculator from '~/components/landing/TimeCalculator.vue'
import LandingPricing from '~/components/landing/LandingPricing.vue'
import LandingFooter from '~/components/landing/LandingFooter.vue'
import LanguageSelector from '~/components/atoms/LanguageSelector.vue'

definePageMeta({
  layout: false,
  auth: false
})

const { t, locale } = useI18n()

// SEO Meta Tags
useSeoMeta({
  title: () => t('landing.seo.title'),
  description: () => t('landing.seo.description'),
  keywords: 'ИИ для SMM, AI для SMM, нейросеть для соцсетей, AI-ассистент, генерация контента, SMM автоматизация',
  ogTitle: () => t('landing.seo.ogTitle'),
  ogDescription: () => t('landing.seo.ogDescription'),
  ogImage: '/og-image.svg',
  ogUrl: 'https://writelo.io/landing',
})

useHead({
  htmlAttrs: {
    lang: () => locale.value
  },
  link: [
    { rel: 'alternate', hreflang: 'ru', href: 'https://writelo.io/landing' },
    { rel: 'alternate', hreflang: 'en', href: 'https://writelo.io/landing?lang=en' },
    { rel: 'alternate', hreflang: 'x-default', href: 'https://writelo.io/landing' },
    { rel: 'canonical', href: 'https://writelo.io/landing' },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
      <div class="container mx-auto px-4 max-w-6xl">
        <div class="flex items-center justify-between h-16">
          <span class="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Writelo
          </span>
          <LanguageSelector />
        </div>
      </div>
    </header>

    <main>
      <!-- Hero -->
      <LandingHero />

      <!-- Feature: Clients -->
      <LandingFeature
        :title="t('landing.features.clients.title')"
        :description="t('landing.features.clients.description')"
        direction="left"
      />

      <!-- Feature: Content -->
      <LandingFeature
        :title="t('landing.features.content.title')"
        :description="t('landing.features.content.description')"
        direction="right"
      />

      <!-- Feature: Trends -->
      <LandingFeature
        :title="t('landing.features.trends.title')"
        :description="t('landing.features.trends.description')"
        direction="left"
      />

      <!-- Feature: Images -->
      <LandingFeature
        :title="t('landing.features.images.title')"
        :description="t('landing.features.images.description')"
        direction="right"
      />

      <!-- Calculator -->
      <TimeCalculator />

      <!-- Pricing -->
      <LandingPricing />
    </main>

    <!-- Footer -->
    <LandingFooter />
  </div>
</template>
```

**Step 2: Run dev server and verify**

```bash
yarn dev
```

Open http://localhost:3000/landing and verify:
- Dark theme applies
- Hero animations work
- Scroll animations trigger on features
- Calculator slider works
- All text displays correctly

**Step 3: Commit**

```bash
git add pages/landing.vue
git commit -m "feat(landing): complete redesign with feature showcase"
```

---

## Task 10: Final Testing & Cleanup

**Step 1: Test mobile responsiveness**

Open DevTools, test at 375px, 768px, 1024px widths.

**Step 2: Test language switching**

Switch between RU/EN, verify all text updates.

**Step 3: Remove old unused code if any**

Check for any unused imports or components.

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore(landing): cleanup and polish"
```

---

Plan complete and saved to `docs/plans/2026-03-07-landing-redesign-implementation.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** — I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** — Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
