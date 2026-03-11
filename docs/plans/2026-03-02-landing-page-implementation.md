# Landing Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Создать продающий лендинг для SMM-щиков с калькулятором экономии времени.

**Architecture:** Одностраничный лендинг на Nuxt 3 без навбара. Три секции: Hero, Calculator, Pricing. Калькулятор — реактивный Vue-компонент. Стиль Linear-like минимализм.

**Tech Stack:** Nuxt 3, Vue 3, Tailwind CSS, Shadcn-vue (Button, Card), TypeScript

---

## Task 1: Create Landing Page Shell

**Files:**
- Create: `pages/landing.vue`

**Step 1: Create the landing page file**

```vue
<script setup lang="ts">
import { definePageMeta } from "#imports";

definePageMeta({
  layout: false,
  auth: false
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <main class="container mx-auto px-4 py-16 max-w-4xl">
      <!-- Sections will be added here -->
      <p class="text-center text-muted-foreground">Landing page shell</p>
    </main>
  </div>
</template>
```

**Step 2: Verify page loads**

Run: `yarn dev`
Navigate to: `http://localhost:3000/landing`
Expected: Empty page with "Landing page shell" text, no navbar

**Step 3: Commit**

```bash
git add pages/landing.vue
git commit -m "feat(landing): create landing page shell"
```

---

## Task 2: Add Hero Section

**Files:**
- Modify: `pages/landing.vue`

**Step 1: Add Hero section content**

Replace the template in `pages/landing.vue`:

```vue
<script setup lang="ts">
import { definePageMeta } from "#imports";
import { Button } from "~/components/ui/button";

definePageMeta({
  layout: false,
  auth: false
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <main class="container mx-auto px-4 max-w-5xl">

      <!-- Hero Section -->
      <section class="py-20 md:py-32 text-center">
        <h1 class="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Контент для соцсетей<br/>
          <span class="text-muted-foreground">за минуты, не часы</span>
        </h1>

        <p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          AI-ассистент, заточенный под SMM. Не нужно учиться промптить —
          выбери задачу и получи готовый результат
        </p>

        <div class="flex flex-col items-center gap-3">
          <Button size="lg" class="text-lg px-8 py-6" @click="navigateTo('/auth')">
            Попробовать бесплатно
          </Button>
          <span class="text-sm text-muted-foreground">
            Без карты • 50 запросов бесплатно
          </span>
        </div>
      </section>

    </main>
  </div>
</template>
```

**Step 2: Verify Hero displays correctly**

Run: `yarn dev`
Navigate to: `http://localhost:3000/landing`
Expected: Centered headline, subtext, CTA button

**Step 3: Commit**

```bash
git add pages/landing.vue
git commit -m "feat(landing): add hero section with headline and CTA"
```

---

## Task 3: Create Time Calculator Component

**Files:**
- Create: `components/landing/TimeCalculator.vue`

**Step 1: Create the calculator component**

```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

const postOptions = [5, 10, 20, 30] as const;
const selectedPosts = ref<number>(10);

// Time savings calculation
// Manual: ~40 min per post
// With AI: ~10 min per post
// Savings: 30 min per post
const MINUTES_SAVED_PER_POST = 30;

const weeklyHoursSaved = computed(() => {
  return Math.round((selectedPosts.value * MINUTES_SAVED_PER_POST) / 60);
});

const monthlyHoursSaved = computed(() => {
  return weeklyHoursSaved.value * 4;
});

const selectPosts = (count: number) => {
  selectedPosts.value = count;
};
</script>

<template>
  <Card class="border-border/50 bg-card/50 backdrop-blur">
    <CardContent class="p-8 md:p-12">
      <h2 class="text-2xl md:text-3xl font-semibold text-center mb-8">
        Сколько времени ты сэкономишь?
      </h2>

      <!-- Post selector -->
      <div class="mb-8">
        <p class="text-center text-muted-foreground mb-4">
          Сколько постов делаешь в неделю?
        </p>
        <div class="flex justify-center gap-3">
          <Button
            v-for="count in postOptions"
            :key="count"
            :variant="selectedPosts === count ? 'default' : 'outline'"
            size="lg"
            @click="selectPosts(count)"
          >
            {{ count }}{{ count === 30 ? '+' : '' }}
          </Button>
        </div>
      </div>

      <!-- Results -->
      <div class="text-center">
        <div class="text-4xl md:text-5xl font-bold mb-2">
          ≈ {{ weeklyHoursSaved }} часов в неделю
        </div>
        <div class="text-xl text-muted-foreground mb-4">
          → {{ monthlyHoursSaved }} часов в месяц
        </div>
        <p class="text-muted-foreground">
          Это как дополнительный рабочий день каждую неделю
        </p>
      </div>

      <!-- Mini CTA -->
      <div class="mt-8 text-center">
        <Button variant="link" class="text-lg" @click="navigateTo('/auth')">
          Попробовать бесплатно →
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
```

**Step 2: Verify component renders in isolation**

Create a quick test by temporarily adding to landing page (next task).

**Step 3: Commit**

```bash
git add components/landing/TimeCalculator.vue
git commit -m "feat(landing): create TimeCalculator component with reactive calculations"
```

---

## Task 4: Integrate Calculator into Landing Page

**Files:**
- Modify: `pages/landing.vue`

**Step 1: Import and add calculator section**

Update `pages/landing.vue`:

```vue
<script setup lang="ts">
import { definePageMeta } from "#imports";
import { Button } from "~/components/ui/button";
import TimeCalculator from "~/components/landing/TimeCalculator.vue";

definePageMeta({
  layout: false,
  auth: false
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <main class="container mx-auto px-4 max-w-5xl">

      <!-- Hero Section -->
      <section class="py-20 md:py-32 text-center">
        <h1 class="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Контент для соцсетей<br/>
          <span class="text-muted-foreground">за минуты, не часы</span>
        </h1>

        <p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          AI-ассистент, заточенный под SMM. Не нужно учиться промптить —
          выбери задачу и получи готовый результат
        </p>

        <div class="flex flex-col items-center gap-3">
          <Button size="lg" class="text-lg px-8 py-6" @click="navigateTo('/auth')">
            Попробовать бесплатно
          </Button>
          <span class="text-sm text-muted-foreground">
            Без карты • 50 запросов бесплатно
          </span>
        </div>
      </section>

      <!-- Calculator Section -->
      <section class="py-16">
        <TimeCalculator />
      </section>

    </main>
  </div>
</template>
```

**Step 2: Verify calculator works**

Run: `yarn dev`
Navigate to: `http://localhost:3000/landing`
Expected: Calculator shows, clicking post buttons updates hours

**Step 3: Commit**

```bash
git add pages/landing.vue
git commit -m "feat(landing): integrate TimeCalculator into page"
```

---

## Task 5: Add Pricing Section

**Files:**
- Modify: `pages/landing.vue`

**Step 1: Add pricing cards section**

Add after Calculator section in `pages/landing.vue`:

```vue
<!-- Add to imports in script -->
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
```

```vue
<!-- Add after Calculator Section, before closing </main> -->

<!-- Pricing Section -->
<section class="py-16">
  <h2 class="text-2xl md:text-3xl font-semibold text-center mb-10">
    Начни экономить время сегодня
  </h2>

  <div class="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
    <!-- Free Tier -->
    <Card class="border-border/50">
      <CardHeader>
        <CardTitle class="text-xl">Бесплатно</CardTitle>
        <CardDescription>Попробуй без обязательств</CardDescription>
      </CardHeader>
      <CardContent>
        <ul class="space-y-3 text-muted-foreground mb-6">
          <li class="flex items-center gap-2">
            <span class="text-foreground">✓</span> 50 запросов
          </li>
          <li class="flex items-center gap-2">
            <span class="text-foreground">✓</span> 1 клиент
          </li>
          <li class="flex items-center gap-2">
            <span class="text-foreground">✓</span> Базовые модели AI
          </li>
        </ul>
        <Button variant="outline" class="w-full" @click="navigateTo('/auth')">
          Попробовать
        </Button>
      </CardContent>
    </Card>

    <!-- Pro Tier -->
    <Card class="border-primary/50 bg-primary/5">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="text-xl">Про</CardTitle>
          <span class="text-2xl font-bold">299₽<span class="text-sm font-normal text-muted-foreground">/мес</span></span>
        </div>
        <CardDescription>Для активных SMM-щиков</CardDescription>
      </CardHeader>
      <CardContent>
        <ul class="space-y-3 text-muted-foreground mb-6">
          <li class="flex items-center gap-2">
            <span class="text-foreground">✓</span> Безлимитные запросы
          </li>
          <li class="flex items-center gap-2">
            <span class="text-foreground">✓</span> До 10 клиентов
          </li>
          <li class="flex items-center gap-2">
            <span class="text-foreground">✓</span> Генерация картинок
          </li>
          <li class="flex items-center gap-2">
            <span class="text-foreground">✓</span> Премиум модели AI
          </li>
        </ul>
        <Button class="w-full" @click="navigateTo('/auth')">
          Купить
        </Button>
      </CardContent>
    </Card>
  </div>

  <p class="text-center text-sm text-muted-foreground mt-6">
    Отменить можно в любой момент
  </p>
</section>
```

**Step 2: Verify pricing section displays**

Run: `yarn dev`
Navigate to: `http://localhost:3000/landing`
Expected: Two pricing cards, side by side on desktop, stacked on mobile

**Step 3: Commit**

```bash
git add pages/landing.vue
git commit -m "feat(landing): add pricing section with free and pro tiers"
```

---

## Task 6: Add Footer

**Files:**
- Modify: `pages/landing.vue`

**Step 1: Add minimal footer**

Add before closing `</div>` (after `</main>`):

```vue
<!-- Footer -->
<footer class="border-t border-border/50 py-8 mt-16">
  <div class="container mx-auto px-4 max-w-5xl">
    <div class="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
      <div class="font-medium text-foreground">
        AIHubGPT
      </div>
      <div class="flex gap-6">
        <a href="https://t.me/aihubgpt" target="_blank" class="hover:text-foreground transition-colors">
          Telegram
        </a>
        <a href="mailto:support@example.com" class="hover:text-foreground transition-colors">
          Поддержка
        </a>
      </div>
      <div>
        © 2025
      </div>
    </div>
  </div>
</footer>
```

**Step 2: Verify footer displays**

Run: `yarn dev`
Expected: Footer at bottom with links

**Step 3: Commit**

```bash
git add pages/landing.vue
git commit -m "feat(landing): add minimal footer with links"
```

---

## Task 7: Add Auth Middleware Exception

**Files:**
- Modify: `middleware/auth.global.ts`

**Step 1: Check current middleware logic**

Read the file to understand structure.

**Step 2: Add landing to allowed routes**

Find the array/condition that allows unauthenticated access and add `/landing`:

```typescript
// Add 'landing' to the list of public routes
// Example: if there's an array like publicRoutes = ['/auth', '/verify-email']
// Add '/landing' to it
```

**Step 3: Verify unauthenticated access works**

- Clear cookies/localStorage
- Navigate to: `http://localhost:3000/landing`
- Expected: Page loads without redirect to /auth

**Step 4: Commit**

```bash
git add middleware/auth.global.ts
git commit -m "feat(landing): allow unauthenticated access to landing page"
```

---

## Task 8: Polish & Responsive Fixes

**Files:**
- Modify: `pages/landing.vue`
- Modify: `components/landing/TimeCalculator.vue`

**Step 1: Test on mobile viewport**

Use browser devtools to test 375px width.

**Step 2: Fix any responsive issues**

Common fixes:
- Reduce font sizes on mobile (`text-3xl md:text-6xl`)
- Stack elements vertically (`flex-col md:flex-row`)
- Adjust padding (`p-4 md:p-8`)

**Step 3: Verify on multiple viewports**

- Mobile: 375px
- Tablet: 768px
- Desktop: 1280px

**Step 4: Commit**

```bash
git add pages/landing.vue components/landing/TimeCalculator.vue
git commit -m "fix(landing): responsive adjustments for mobile"
```

---

## Task 9: Final Review & Deploy Test

**Step 1: Run production build**

```bash
yarn build
```

Expected: No build errors

**Step 2: Preview production build**

```bash
yarn preview
```

Navigate to: `http://localhost:3000/landing`
Expected: Page works in production mode

**Step 3: Final commit (if any changes)**

```bash
git add -A
git commit -m "chore(landing): final polish"
```

---

## Summary

После выполнения всех задач будет готов:
- `/landing` — продающий лендинг для SMM-щиков
- Интерактивный калькулятор экономии времени
- Ценовые карточки с CTA
- Минимальный footer
- Mobile-responsive дизайн в стиле Linear
