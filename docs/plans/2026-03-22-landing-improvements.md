# Landing Page Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add social proof, header navigation, and contacts section to the landing page.

**Architecture:** Add social proof metrics to Hero, create responsive nav with burger menu for mobile, create new LandingContacts section with socials and feedback form, simplify footer.

**Tech Stack:** Vue 3, Nuxt 3, Tailwind CSS, lucide-vue-next, Yandex Metrika

---

## Task 1: Add Social Proof to Hero

**Files:**
- Modify: `components/landing/LandingHero.vue`
- Modify: `i18n/locales/ru.json`
- Modify: `i18n/locales/en.json`

**Step 1: Add i18n translations for social proof**

In `i18n/locales/ru.json`, inside `landing.hero`, add:
```json
"stats": {
  "users": "1000+ пользователей",
  "rating": "4.8",
  "contentPlans": "5000+ контент-планов",
  "posts": "10000+ постов"
}
```

In `i18n/locales/en.json`, inside `landing.hero`, add:
```json
"stats": {
  "users": "1000+ users",
  "rating": "4.8",
  "contentPlans": "5000+ content plans",
  "posts": "10000+ posts"
}
```

**Step 2: Add social proof block to LandingHero.vue**

After the CTA Button (line ~91), inside the same `<div>` with `flex flex-col items-center gap-4`, add:

```vue
<!-- Social proof -->
<div
  class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400 mt-6"
>
  <span>{{ t('landing.hero.stats.users') }}</span>
  <span class="text-zinc-300 dark:text-zinc-600">•</span>
  <span class="flex items-center gap-1">
    <span class="text-yellow-500">★</span>
    {{ t('landing.hero.stats.rating') }}
  </span>
  <span class="text-zinc-300 dark:text-zinc-600">•</span>
  <span>{{ t('landing.hero.stats.contentPlans') }}</span>
  <span class="text-zinc-300 dark:text-zinc-600">•</span>
  <span>{{ t('landing.hero.stats.posts') }}</span>
</div>
```

**Step 3: Test locally**

Run: `yarn dev`
Check: Hero section shows stats under CTA button, responsive on mobile.

**Step 4: Commit**

```bash
git add components/landing/LandingHero.vue i18n/locales/ru.json i18n/locales/en.json
git commit -m "feat(landing): add social proof stats to hero section"
```

---

## Task 2: Add Header Navigation (Desktop)

**Files:**
- Modify: `components/landing/LandingPage.vue`
- Modify: `i18n/locales/ru.json`
- Modify: `i18n/locales/en.json`

**Step 1: Add i18n translations for nav**

In `i18n/locales/ru.json`, inside `landing`, add:
```json
"nav": {
  "features": "Возможности",
  "pricing": "Цены",
  "contacts": "Контакты"
}
```

In `i18n/locales/en.json`, inside `landing`, add:
```json
"nav": {
  "features": "Features",
  "pricing": "Pricing",
  "contacts": "Contacts"
}
```

**Step 2: Add id attributes to sections**

In `LandingPage.vue`:
- First `<LandingFeature>` (line ~38): add `id="features"`
- `<LandingPricing>` (line ~86): add `id="pricing"`
- (LandingContacts will be added later with `id="contacts"`)

**Step 3: Add navigation links to header**

Replace the header `<div>` content (lines ~20-26) with:

```vue
<div class="flex items-center justify-between h-16">
  <span class="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
    Writelo
  </span>

  <!-- Desktop nav -->
  <nav class="hidden md:flex items-center gap-8">
    <a
      href="#features"
      class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
    >
      {{ t('landing.nav.features') }}
    </a>
    <a
      href="#pricing"
      class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
    >
      {{ t('landing.nav.pricing') }}
    </a>
    <a
      href="#contacts"
      class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
    >
      {{ t('landing.nav.contacts') }}
    </a>
  </nav>

  <div class="flex items-center gap-4">
    <LanguageSelector />
  </div>
</div>
```

**Step 4: Test locally**

Run: `yarn dev`
Check: Desktop shows nav links, they scroll to sections smoothly.

**Step 5: Commit**

```bash
git add components/landing/LandingPage.vue i18n/locales/ru.json i18n/locales/en.json
git commit -m "feat(landing): add desktop header navigation"
```

---

## Task 3: Add Mobile Burger Menu

**Files:**
- Modify: `components/landing/LandingPage.vue`

**Step 1: Add imports and state**

Add to script setup:
```typescript
import { Menu, X } from 'lucide-vue-next'

const mobileMenuOpen = ref(false)

function closeMobileMenu() {
  mobileMenuOpen.value = false
}
```

**Step 2: Add burger button to header**

In the header, inside the `<div class="flex items-center gap-4">`, add before `<LanguageSelector />`:

```vue
<!-- Mobile menu button -->
<button
  class="md:hidden p-2 text-zinc-600 dark:text-zinc-400"
  @click="mobileMenuOpen = !mobileMenuOpen"
>
  <Menu v-if="!mobileMenuOpen" class="w-6 h-6" />
  <X v-else class="w-6 h-6" />
</button>
```

**Step 3: Add mobile menu dropdown**

After the header `</div>` but still inside `<header>`, add:

```vue
<!-- Mobile menu -->
<Transition
  enter-active-class="transition duration-200 ease-out"
  enter-from-class="opacity-0 -translate-y-2"
  enter-to-class="opacity-100 translate-y-0"
  leave-active-class="transition duration-150 ease-in"
  leave-from-class="opacity-100 translate-y-0"
  leave-to-class="opacity-0 -translate-y-2"
>
  <div
    v-if="mobileMenuOpen"
    class="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md"
  >
    <nav class="container mx-auto px-4 py-4 flex flex-col gap-4">
      <a
        href="#features"
        class="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        @click="closeMobileMenu"
      >
        {{ t('landing.nav.features') }}
      </a>
      <a
        href="#pricing"
        class="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        @click="closeMobileMenu"
      >
        {{ t('landing.nav.pricing') }}
      </a>
      <a
        href="#contacts"
        class="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        @click="closeMobileMenu"
      >
        {{ t('landing.nav.contacts') }}
      </a>
    </nav>
  </div>
</Transition>
```

**Step 4: Test locally**

Run: `yarn dev`
Check: Mobile view shows burger, menu opens/closes, links scroll and close menu.

**Step 5: Commit**

```bash
git add components/landing/LandingPage.vue
git commit -m "feat(landing): add mobile burger menu"
```

---

## Task 4: Create LandingContacts Component

**Files:**
- Create: `components/landing/LandingContacts.vue`
- Modify: `i18n/locales/ru.json`
- Modify: `i18n/locales/en.json`

**Step 1: Add i18n translations**

In `i18n/locales/ru.json`, inside `landing`, add:
```json
"contacts": {
  "title": "Контакты",
  "email": "Написать на почту",
  "feedback": {
    "title": "Оставьте отзыв",
    "placeholder": "Ваш отзыв или предложение...",
    "emailPlaceholder": "Email (опционально)",
    "submit": "Отправить",
    "success": "Спасибо за отзыв!",
    "charCount": "{count}/600"
  }
}
```

In `i18n/locales/en.json`, inside `landing`, add:
```json
"contacts": {
  "title": "Contacts",
  "email": "Email us",
  "feedback": {
    "title": "Leave feedback",
    "placeholder": "Your feedback or suggestion...",
    "emailPlaceholder": "Email (optional)",
    "submit": "Submit",
    "success": "Thank you for your feedback!",
    "charCount": "{count}/600"
  }
}
```

**Step 2: Create LandingContacts.vue**

Create `components/landing/LandingContacts.vue`:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Input } from '~/components/ui/input'
import { useScrollAnimation } from '~/composables/useScrollAnimation'

const { t } = useI18n()
const { $trackGoal } = useNuxtApp()
const { elementRef, isVisible } = useScrollAnimation(0.1)

const feedbackText = ref('')
const feedbackEmail = ref('')
const isSubmitted = ref(false)

const charCount = computed(() => feedbackText.value.length)
const isOverLimit = computed(() => charCount.value > 600)

const socials = [
  { name: 'Telegram', url: 'https://t.me/writelo', icon: 'telegram' },
  { name: 'YouTube', url: 'https://youtube.com/@writelo-io', icon: 'youtube' },
  { name: 'Instagram', url: 'https://instagram.com/writelo.io', icon: 'instagram' },
  { name: 'VK', url: 'https://vk.ru/writelo', icon: 'vk' },
  { name: 'TikTok', url: 'https://tiktok.com/@writelo.io', icon: 'tiktok' },
]

function submitFeedback() {
  if (!feedbackText.value.trim() || isOverLimit.value) return

  $trackGoal('feedback_submitted', {
    text: feedbackText.value,
    email: feedbackEmail.value || undefined,
  })

  isSubmitted.value = true
  feedbackText.value = ''
  feedbackEmail.value = ''

  setTimeout(() => {
    isSubmitted.value = false
  }, 3000)
}
</script>

<template>
  <section
    id="contacts"
    ref="elementRef"
    class="py-24 bg-zinc-50 dark:bg-zinc-900/50"
  >
    <div class="container mx-auto px-4 max-w-4xl">
      <h2
        class="text-3xl md:text-4xl font-bold text-center mb-12 transition-all duration-700"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        {{ t('landing.contacts.title') }}
      </h2>

      <!-- Social links -->
      <div
        class="flex flex-wrap justify-center gap-6 mb-12 transition-all duration-700 delay-100"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <a
          v-for="social in socials"
          :key="social.name"
          :href="social.url"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-600 transition-all"
        >
          <!-- Inline SVG icons -->
          <svg v-if="social.icon === 'telegram'" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          <svg v-else-if="social.icon === 'youtube'" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <svg v-else-if="social.icon === 'instagram'" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
          </svg>
          <svg v-else-if="social.icon === 'vk'" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
          </svg>
          <svg v-else-if="social.icon === 'tiktok'" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
          <span>{{ social.name }}</span>
        </a>
      </div>

      <!-- Email -->
      <div
        class="text-center mb-12 transition-all duration-700 delay-200"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <a
          href="mailto:dushin.egor.dm@yandex.ru"
          class="text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          dushin.egor.dm@yandex.ru
        </a>
      </div>

      <!-- Feedback form -->
      <div
        class="max-w-xl mx-auto transition-all duration-700 delay-300"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <h3 class="text-xl font-semibold text-center mb-6">
          {{ t('landing.contacts.feedback.title') }}
        </h3>

        <div v-if="isSubmitted" class="text-center text-green-600 dark:text-green-400 py-8">
          {{ t('landing.contacts.feedback.success') }}
        </div>

        <form v-else class="space-y-4" @submit.prevent="submitFeedback">
          <div>
            <Textarea
              v-model="feedbackText"
              :placeholder="t('landing.contacts.feedback.placeholder')"
              class="min-h-[120px] resize-none"
              :class="{ 'border-red-500': isOverLimit }"
            />
            <div
              class="text-right text-sm mt-1"
              :class="isOverLimit ? 'text-red-500' : 'text-zinc-400'"
            >
              {{ t('landing.contacts.feedback.charCount', { count: charCount }) }}
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-4">
            <Input
              v-model="feedbackEmail"
              type="email"
              :placeholder="t('landing.contacts.feedback.emailPlaceholder')"
              class="flex-1"
            />
            <Button
              type="submit"
              :disabled="!feedbackText.trim() || isOverLimit"
              class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
            >
              {{ t('landing.contacts.feedback.submit') }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
```

**Step 3: Test locally**

Run: `yarn dev`
Check: Section renders, social links work, form submits to Metrika.

**Step 4: Commit**

```bash
git add components/landing/LandingContacts.vue i18n/locales/ru.json i18n/locales/en.json
git commit -m "feat(landing): create contacts section with socials and feedback form"
```

---

## Task 5: Add LandingContacts to Page

**Files:**
- Modify: `components/landing/LandingPage.vue`

**Step 1: Import and add component**

Add import:
```typescript
import LandingContacts from '~/components/landing/LandingContacts.vue'
```

Add component between `<LandingPricing />` and `<LandingFooter />`:
```vue
<!-- Contacts -->
<LandingContacts />
```

**Step 2: Test locally**

Run: `yarn dev`
Check: Contacts section appears, nav link scrolls to it.

**Step 3: Commit**

```bash
git add components/landing/LandingPage.vue
git commit -m "feat(landing): add contacts section to page"
```

---

## Task 6: Simplify Footer

**Files:**
- Modify: `components/landing/LandingFooter.vue`

**Step 1: Remove duplicate links**

Replace entire template with:

```vue
<template>
  <footer class="border-t border-zinc-200 dark:border-zinc-800 py-12">
    <div class="container mx-auto px-4 max-w-5xl">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
        <div class="font-bold text-xl bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Writelo
        </div>

        <nav class="flex gap-8">
          <NuxtLink
            to="/start"
            class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            {{ t('landing.footer.start') }}
          </NuxtLink>
          <NuxtLink
            to="/auth"
            class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            {{ t('landing.footer.login') }}
          </NuxtLink>
        </nav>

        <div class="text-zinc-400 dark:text-zinc-500">
          © 2026
        </div>
      </div>
    </div>
  </footer>
</template>
```

**Step 2: Add i18n keys if missing**

Check if `landing.footer.start` and `landing.footer.login` exist. If not, add:

In `i18n/locales/ru.json`:
```json
"footer": {
  "start": "Начать работу",
  "login": "Вход"
}
```

In `i18n/locales/en.json`:
```json
"footer": {
  "start": "Get started",
  "login": "Login"
}
```

**Step 3: Test locally**

Run: `yarn dev`
Check: Footer is simplified, no duplicate links.

**Step 4: Commit**

```bash
git add components/landing/LandingFooter.vue i18n/locales/ru.json i18n/locales/en.json
git commit -m "refactor(landing): simplify footer, remove duplicate links"
```

---

## Task 7: Final Testing

**Step 1: Full test pass**

Run: `yarn dev`

Verify:
- [ ] Hero shows social proof stats
- [ ] Desktop nav shows links, smooth scroll works
- [ ] Mobile burger menu opens/closes, links work
- [ ] Contacts section renders with all socials
- [ ] Feedback form submits (check Network tab for Metrika call)
- [ ] Footer is clean with only essential links
- [ ] All responsive breakpoints work

**Step 2: Build check**

Run: `yarn build`
Expected: No errors.

**Step 3: Final commit if any fixes**

```bash
git add -A
git commit -m "fix(landing): address review feedback"
```
