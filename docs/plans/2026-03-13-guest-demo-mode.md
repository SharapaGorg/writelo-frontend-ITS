# Guest Demo Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove auth wall and allow unauthenticated users to explore the app in demo mode with static dialogs.

**Architecture:** Extend existing `lib-modules/demo-mode/` module. Auto-activate demo mode when user is not logged in. Provide static demo conversations and client data. Intercept actions with auth modal.

**Tech Stack:** Vue 3, Nuxt 3, Pinia, TypeScript, Tailwind CSS, shadcn-vue

---

## Task 1: Remove Auth Middleware

**Files:**
- Delete: `middleware/auth.global.ts`
- Delete: `middleware/auth.ts`

**Step 1: Delete auth.global.ts**

```bash
rm middleware/auth.global.ts
```

**Step 2: Delete auth.ts**

```bash
rm middleware/auth.ts
```

**Step 3: Commit**

```bash
git add -A && git commit -m "chore: remove auth middleware - allow unauthenticated access to /app"
```

---

## Task 2: Update useDemoMode to Auto-Activate

**Files:**
- Modify: `lib-modules/demo-mode/composables/useDemoMode.ts`
- Modify: `lib-modules/demo-mode/types/index.ts`

**Step 1: Update types to include isGuestDemo**

In `lib-modules/demo-mode/types/index.ts`, update `UseDemoModeReturn`:

```typescript
import type { ComputedRef } from 'vue'

export interface DemoTemplate {
  id: string
  match: (text: string) => boolean
  response: string
  title: string
}

export interface DemoStreamOptions {
  baseDelay: number
  variance: number
  punctuationDelay: number
}

export interface UseDemoModeReturn {
  isDemoMode: ComputedRef<boolean>
  isGuestDemo: ComputedRef<boolean>  // New: true when demo due to unauthenticated
  getDemoStream: (messageText: string) => ReadableStream<Uint8Array> | null
}
```

**Step 2: Update useDemoMode.ts**

Replace the `isDemoMode` computed and add `isGuestDemo`:

```typescript
// lib-modules/demo-mode/composables/useDemoMode.ts

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { DemoTemplate, DemoStreamOptions, UseDemoModeReturn } from '../types'
import { CONTENT_PLAN_RESPONSE, REELS_IDEAS_RESPONSE } from '../content/responses'

const DEMO_TEMPLATES: DemoTemplate[] = [
  {
    id: 'content-plan',
    match: (text: string) => text.startsWith('Вы — "GPT'),
    response: CONTENT_PLAN_RESPONSE,
    title: 'Контент-план Кофейни Зерно'
  },
  {
    id: 'reels-ideas',
    match: (text: string) => text.startsWith('Придумай 10 идей'),
    response: REELS_IDEAS_RESPONSE,
    title: '10 идей для Reels'
  }
]

const DEFAULT_OPTIONS: DemoStreamOptions = {
  baseDelay: 15,
  variance: 10,
  punctuationDelay: 80
}

function createDemoStream(
  response: string,
  title: string,
  options: DemoStreamOptions = DEFAULT_OPTIONS
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  const punctuation = new Set(['.', ',', '!', '?', '\n', ':', ';'])

  return new ReadableStream({
    async start(controller) {
      await sleep(300)

      for (const char of response) {
        const sseData = JSON.stringify({ action: 'text_chunk', dt: char })
        controller.enqueue(encoder.encode(`data: ${sseData}\n\n`))

        let delay = options.baseDelay + (Math.random() * options.variance * 2 - options.variance)
        if (punctuation.has(char)) {
          delay += options.punctuationDelay
        }
        await sleep(delay)
      }

      await sleep(200)
      const titleData = JSON.stringify({ action: 'set_title', title })
      controller.enqueue(encoder.encode(`data: ${titleData}\n\n`))

      await sleep(100)
      const endData = JSON.stringify({ action: 'response_end', success: true })
      controller.enqueue(encoder.encode(`data: ${endData}\n\n`))

      controller.close()
    }
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const DEMO_STORAGE_KEY = 'demo-mode-active'

export function useDemoMode(): UseDemoModeReturn {
  const route = useRoute()
  const userController = useUserController()

  // Save flag to sessionStorage on first detection (for promo video recording)
  if (import.meta.client && route.query.demo === 'true') {
    sessionStorage.setItem(DEMO_STORAGE_KEY, 'true')
  }

  // Guest demo: user is not logged in
  const isGuestDemo = computed(() => {
    if (!import.meta.client) return false
    return !userController.isLoggedIn.value
  })

  // Manual demo: ?demo=true or sessionStorage
  const isManualDemo = computed(() => {
    if (route.query.demo === 'true') return true
    if (import.meta.client) {
      return sessionStorage.getItem(DEMO_STORAGE_KEY) === 'true'
    }
    return false
  })

  // Combined: either guest or manual
  const isDemoMode = computed(() => {
    return isGuestDemo.value || isManualDemo.value
  })

  const getDemoStream = (messageText: string): ReadableStream<Uint8Array> | null => {
    if (!isDemoMode.value) return null

    const template = DEMO_TEMPLATES.find(t => t.match(messageText))
    if (!template) return null

    console.log(`[Demo Mode] Using template: ${template.id}`)
    return createDemoStream(template.response, template.title)
  }

  return {
    isDemoMode,
    isGuestDemo,
    getDemoStream
  }
}
```

**Step 3: Commit**

```bash
git add lib-modules/demo-mode/composables/useDemoMode.ts lib-modules/demo-mode/types/index.ts
git commit -m "feat(demo-mode): auto-activate for unauthenticated users"
```

---

## Task 3: Create Demo Conversations Data

**Files:**
- Create: `lib-modules/demo-mode/content/conversations.ts`

**Step 1: Create conversations.ts**

```typescript
// lib-modules/demo-mode/content/conversations.ts

import type { ShortConversationType, ConversationType, MessageType, Role } from '~/lib-modules/conversations'
import { CONTENT_PLAN_RESPONSE, REELS_IDEAS_RESPONSE } from './responses'

// Short conversations for sidebar
export const demoConversations: ShortConversationType[] = [
  {
    privateId: 'demo-content-plan',
    title: 'Контент-план Кофейни Зерно',
    shareId: null,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  },
  {
    privateId: 'demo-reels-ideas',
    title: '10 идей для Reels',
    shareId: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    modifiedAt: new Date(Date.now() - 3600000).toISOString()
  }
]

// Full conversation with messages
export const demoConversationsFull: Record<string, ConversationType> = {
  'demo-content-plan': {
    privateId: 'demo-content-plan',
    title: 'Контент-план Кофейни Зерно',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    messages: [
      {
        id: 1,
        role: 1 as Role, // user
        text: 'Вы — "GPT-маркетолог". Создайте контент-план для кофейни "Зерно" на март 2026.',
        file: null as any,
        files: [],
        createdAt: new Date().toISOString(),
        processing: false,
        error: false
      },
      {
        id: 2,
        role: 0 as Role, // assistant
        text: CONTENT_PLAN_RESPONSE,
        file: null as any,
        files: [],
        createdAt: new Date().toISOString(),
        processing: false,
        error: false
      }
    ]
  },
  'demo-reels-ideas': {
    privateId: 'demo-reels-ideas',
    title: '10 идей для Reels',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    modifiedAt: new Date(Date.now() - 3600000).toISOString(),
    messages: [
      {
        id: 1,
        role: 1 as Role, // user
        text: 'Придумай 10 идей для Reels для кофейни "Зерно"',
        file: null as any,
        files: [],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        processing: false,
        error: false
      },
      {
        id: 2,
        role: 0 as Role, // assistant
        text: REELS_IDEAS_RESPONSE,
        file: null as any,
        files: [],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        processing: false,
        error: false
      }
    ]
  }
}

export function isDemoConversation(privateId: string): boolean {
  return privateId.startsWith('demo-')
}

export function getDemoConversation(privateId: string): ConversationType | null {
  return demoConversationsFull[privateId] || null
}
```

**Step 2: Commit**

```bash
git add lib-modules/demo-mode/content/conversations.ts
git commit -m "feat(demo-mode): add demo conversations data"
```

---

## Task 4: Create Demo Client Data

**Files:**
- Create: `lib-modules/demo-mode/content/client.ts`

**Step 1: Create client.ts**

```typescript
// lib-modules/demo-mode/content/client.ts

export interface DemoClient {
  name: string
  description: string
}

export const demoClient: DemoClient = {
  name: 'Кофейня «Зерно»',
  description: 'Уютная кофейня в центре города. Specialty кофе, авторские десерты, завтраки весь день. Целевая аудитория: 25-40 лет, ценители качественного кофе.'
}
```

**Step 2: Commit**

```bash
git add lib-modules/demo-mode/content/client.ts
git commit -m "feat(demo-mode): add demo client data"
```

---

## Task 5: Create useDemoGuard Composable

**Files:**
- Create: `lib-modules/demo-mode/composables/useDemoGuard.ts`

**Step 1: Create useDemoGuard.ts**

```typescript
// lib-modules/demo-mode/composables/useDemoGuard.ts

import { ref } from 'vue'
import { useDemoMode } from './useDemoMode'

const showAuthModal = ref(false)

export function useDemoGuard() {
  const { isGuestDemo } = useDemoMode()

  /**
   * Guard an action - show auth modal if in guest demo mode
   * @param action The action to execute if not in demo mode
   * @returns true if action was blocked, false if executed
   */
  function guardAction(action: () => void): boolean {
    if (isGuestDemo.value) {
      showAuthModal.value = true
      return true
    }
    action()
    return false
  }

  /**
   * Check if action should be blocked (without showing modal)
   */
  function shouldBlock(): boolean {
    return isGuestDemo.value
  }

  /**
   * Open auth modal manually
   */
  function openAuthModal() {
    showAuthModal.value = true
  }

  /**
   * Close auth modal
   */
  function closeAuthModal() {
    showAuthModal.value = false
  }

  return {
    showAuthModal,
    guardAction,
    shouldBlock,
    openAuthModal,
    closeAuthModal
  }
}
```

**Step 2: Commit**

```bash
git add lib-modules/demo-mode/composables/useDemoGuard.ts
git commit -m "feat(demo-mode): add useDemoGuard composable"
```

---

## Task 6: Create DemoAuthModal Component

**Files:**
- Create: `lib-modules/demo-mode/components/DemoAuthModal.vue`

**Step 1: Create DemoAuthModal.vue**

```vue
<!-- lib-modules/demo-mode/components/DemoAuthModal.vue -->
<template>
  <Dialog :open="showAuthModal" @update:open="closeAuthModal">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ t('demo.authModal.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('demo.authModal.description') }}
        </DialogDescription>
      </DialogHeader>
      <div class="flex flex-col gap-3 mt-4">
        <Button @click="goToAuth" class="w-full">
          {{ t('demo.authModal.button') }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { useDemoGuard } from '../composables/useDemoGuard'

const { t } = useI18n()
const router = useRouter()
const { showAuthModal, closeAuthModal } = useDemoGuard()

function goToAuth() {
  closeAuthModal()
  router.push('/auth')
}
</script>
```

**Step 2: Add i18n keys to en.json**

In `i18n/locales/en.json`, add:

```json
{
  "demo": {
    "authModal": {
      "title": "Sign in to continue",
      "description": "Create an account or sign in to use all features",
      "button": "Sign in"
    },
    "banner": {
      "text": "You are in demo mode.",
      "link": "Sign in for full access"
    }
  }
}
```

**Step 3: Add i18n keys to ru.json**

In `i18n/locales/ru.json`, add:

```json
{
  "demo": {
    "authModal": {
      "title": "Войдите, чтобы продолжить",
      "description": "Создайте аккаунт или войдите, чтобы использовать все возможности сервиса",
      "button": "Войти"
    },
    "banner": {
      "text": "Вы в демо-режиме.",
      "link": "Войдите для полного доступа"
    }
  }
}
```

**Step 4: Commit**

```bash
git add lib-modules/demo-mode/components/DemoAuthModal.vue i18n/locales/en.json i18n/locales/ru.json
git commit -m "feat(demo-mode): add DemoAuthModal component with i18n"
```

---

## Task 7: Create DemoBanner Component

**Files:**
- Create: `lib-modules/demo-mode/components/DemoBanner.vue`

**Step 1: Create DemoBanner.vue**

```vue
<!-- lib-modules/demo-mode/components/DemoBanner.vue -->
<template>
  <Transition name="slide-down">
    <div v-if="isGuestDemo" class="demo-banner">
      <span>{{ t('demo.banner.text') }}</span>
      <NuxtLink to="/auth" class="underline ml-2 font-medium hover:text-white/90">
        {{ t('demo.banner.link') }}
      </NuxtLink>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useDemoMode } from '../composables/useDemoMode'

const { t } = useI18n()
const { isGuestDemo } = useDemoMode()
</script>

<style scoped>
.demo-banner {
  @apply fixed top-0 left-0 right-0 z-[100];
  @apply bg-gradient-to-r from-purple-600 to-indigo-600;
  @apply text-white text-center py-2.5 px-4 text-sm;
  @apply shadow-lg;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
```

**Step 2: Commit**

```bash
git add lib-modules/demo-mode/components/DemoBanner.vue
git commit -m "feat(demo-mode): add DemoBanner component"
```

---

## Task 8: Update demo-mode Module Exports

**Files:**
- Modify: `lib-modules/demo-mode/index.ts`

**Step 1: Update index.ts**

```typescript
// lib-modules/demo-mode/index.ts

export { useDemoMode } from './composables/useDemoMode'
export { useDemoGuard } from './composables/useDemoGuard'
export { default as DemoIndicator } from './components/DemoIndicator.vue'
export { default as DemoBanner } from './components/DemoBanner.vue'
export { default as DemoAuthModal } from './components/DemoAuthModal.vue'
export { demoConversations, demoConversationsFull, isDemoConversation, getDemoConversation } from './content/conversations'
export { demoClient } from './content/client'
export * from './types'
```

**Step 2: Commit**

```bash
git add lib-modules/demo-mode/index.ts
git commit -m "feat(demo-mode): update module exports"
```

---

## Task 9: Integrate Demo Data into Conversations Store

**Files:**
- Modify: `stores/conversations.ts`

**Step 1: Update conversations store**

```typescript
// stores/conversations.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ApiController } from '~/scripts/shared/api/controller'
import { getChatsGroupsFormationArray } from '~/scripts/features/conversations/formatting'
import type { ShortConversationType } from '~/lib-modules/conversations'
import { eventBus } from '~/composables/eventBus'
import type { DialogTitleUpdated } from '~/composables/eventBus/types'
import { useDemoMode, demoConversations } from '~/lib-modules/demo-mode'

const apiController = new ApiController()

export const useConversationsStore = defineStore('conversations', () => {
  const loading = ref(true)
  const conversations = ref<ShortConversationType[]>([])
  const removedConversations = ref<Set<string>>(new Set())

  const groups = computed(() => getChatsGroupsFormationArray(conversations.value))

  async function init() {
    const { isGuestDemo } = useDemoMode()

    loading.value = true
    conversations.value = []

    // In guest demo mode, use static demo conversations
    if (isGuestDemo.value) {
      conversations.value = [...demoConversations]
      loading.value = false
      return
    }

    const limit = 20
    for (let page = 0; page < 10; page++) {
      const pack = await apiController.getConversations(page * limit, limit)
      if (!pack || pack.length === 0) break
      conversations.value.push(...pack)
    }

    loading.value = false
  }

  function updateDialogTitle(data: DialogTitleUpdated) {
    console.log('[conversationsStore] updateDialogTitle called', data)
    console.log('[conversationsStore] conversations count:', conversations.value.length)
    console.log('[conversationsStore] looking for privateId:', data.conversation_id)
    const conv = conversations.value.find(c => c.privateId === data.conversation_id)
    console.log('[conversationsStore] found conversation:', conv)
    if (conv) {
      conv.title = data.title
      console.log('[conversationsStore] title updated to:', data.title)
    }
  }

  async function removeConversation(privateId: string, t: (key: string) => string) {
    removedConversations.value.add(privateId)
    await apiController.deleteConversation(privateId)
  }

  async function shareConversation(privateId: string) {
    const result = await apiController.shareConversation(privateId)
    const conv = conversations.value.find(c => c.privateId === privateId)
    if (conv) conv.shareId = result.shareId
    return result
  }

  async function unshareConversation(privateId: string) {
    const result = await apiController.unshareConversation(privateId)
    const conv = conversations.value.find(c => c.privateId === privateId)
    if (conv) conv.shareId = null
    return result
  }

  function isConversationRemoved(id: string) {
    return removedConversations.value.has(id)
  }

  function addConversation(conversation: ShortConversationType) {
    conversations.value.unshift(conversation)
  }

  function subscribeToEvents() {
    // @ts-ignore
    eventBus.on('dialogTitleUpdated', updateDialogTitle)
  }

  function unsubscribeFromEvents() {
    // @ts-ignore
    eventBus.off('dialogTitleUpdated', updateDialogTitle)
  }

  return {
    loading,
    conversations,
    groups,
    init,
    addConversation,
    subscribeToEvents,
    unsubscribeFromEvents,
    removeConversation,
    isConversationRemoved,
    shareConversation,
    unshareConversation
  }
})
```

**Step 2: Commit**

```bash
git add stores/conversations.ts
git commit -m "feat(demo-mode): integrate demo conversations into store"
```

---

## Task 10: Update Navbar with Login Button

**Files:**
- Modify: `components/organisms/Navbar.vue`

**Step 1: Update Navbar.vue**

Add demo mode check and login button. Replace the TiersWindow/Premium button section (lines 22-27):

```vue
<template>
  <div class="grid grid-cols-3 justify-items-end p-4 relative" v-show="$env.navbarVisible.value">
    <div class="flex items-center gap-x-3 w-full">
      <DialogsSection/>
      <ImageGeneratorNavbarButton/>
    </div>

    <div class="w-full flex justify-center items-center">
      <CrmPopup @click-action="clickActionButton"/>

      <ClientSelector v-if="useSettings().isPaidUser()" @open-create="showClientCreate = true" />

      <ProjectCreateWindow
        v-model:open="showClientCreate"
        @save="onClientCreated"
      />

      <!-- Demo mode: show login button -->
      <Button v-if="isGuestDemo" size="sm" variant="premium" @click="goToAuth">
        <LogIn class="w-4 h-4 mr-1" />
        <div>{{ $t('demo.navbar.login') }}</div>
      </Button>

      <!-- Logged in, not paid: show premium button -->
      <TiersWindow v-else-if="!useSettings().isPaidUser()" @select-tier="selectTier">
        <Button size="sm" variant="premium" ref="getPlusButton">
          <Crown/>
          <div>{{ $t('premium-btn') }}</div>
        </Button>
      </TiersWindow>

      <PaymentProviders @select-method="checkOut">
        <div class="hidden" ref="providersButton"></div>
      </PaymentProviders>
    </div>

    <div class="flex items-center gap-x-3">
      <SettingsSection/>

      <Button size="icon" variant="secondary" @click="handleNewChat">
        <MessageCirclePlus/>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Crown, MessageCirclePlus, LogIn } from "lucide-vue-next";
import SettingsSection from "~/components/templates/SettingsSection.vue";
import TiersWindow from "~/components/templates/TiersWindow.vue";
import { useI18n } from 'vue-i18n'
import PaymentProviders from "~/components/atoms/PaymentProviders.vue";
import { PaymentProvider } from "~/scripts/shared/types/payment";
import { ApiController } from "~/scripts/shared/api/controller";
import CrmPopup from "~/components/molecules/CrmPopup.vue";
import { ImageGeneratorNavbarButton } from "~/lib-modules/imageGenerator";
import { DialogsSection, useCurrentConversation } from "~/lib-modules/conversations";
import ClientSelector from "~/components/molecules/ClientSelector.vue";
import { ProjectCreateWindow, useProjectsStore } from "~/lib-modules/projects";
import { useDemoMode, useDemoGuard } from "~/lib-modules/demo-mode";

const { t } = useI18n()
const router = useRouter()

const $env = useEnv();
const apiController = new ApiController();
const showClientCreate = ref(false);
const { isGuestDemo } = useDemoMode()
const { guardAction } = useDemoGuard()

const goToAuth = () => {
  router.push('/auth')
}

const handleNewChat = () => {
  guardAction(() => {
    useCurrentConversation().makeNewChat()
  })
}

const onClientCreated = async (projectId: string) => {
  const store = useProjectsStore();
  await store.fetchProjects();
  store.selectProject(projectId);
}

const getPlusButton: Ref<HTMLElement | null> = ref(null);
const selectedTierId: Ref<number | null> = ref(null);
const providersButton: Ref<HTMLElement | null> = ref(null);

const selectTier = (tier_id: number) => {
  selectedTierId.value = tier_id;
  (providersButton.value as HTMLElement).click();
}

const checkOut = async (method: PaymentProvider) => {
  try {
    let response = await apiController.createPayment(selectedTierId.value, method);

    if (method !== PaymentProvider.stars) {
      window.location.href = response.url;
      return;
    }

    if (response?.url?.length) {
      window.Telegram?.WebApp.openInvoice(response.url, async (status) => {
        if (status === 'paid') {
          window.Telegram?.WebApp.close();
        }
      })
    }
  } catch (e) {
    console.error("Error creating invoice link:", e);
    window.Telegram?.WebApp.showPopup({
      title: t("500"),
      message: t("500"),
      buttons: [{type: "destructive", text: t('close')}],
    });
  }
}

const clickActionButton = () => {
  (getPlusButton.value as HTMLElement).$el.click();
}
</script>

<style scoped>
</style>
```

**Step 2: Add i18n key**

In `i18n/locales/en.json`:
```json
{
  "demo": {
    "navbar": {
      "login": "Sign in"
    }
  }
}
```

In `i18n/locales/ru.json`:
```json
{
  "demo": {
    "navbar": {
      "login": "Войти"
    }
  }
}
```

**Step 3: Commit**

```bash
git add components/organisms/Navbar.vue i18n/locales/en.json i18n/locales/ru.json
git commit -m "feat(demo-mode): add login button to navbar in demo mode"
```

---

## Task 11: Add DemoBanner and DemoAuthModal to Layout

**Files:**
- Modify: `layouts/default.vue`

**Step 1: Update default.vue**

```vue
<script setup lang="ts">
import Navbar from "~/components/organisms/Navbar.vue";
import { useConversationsStore } from "~/stores/conversations";
import { onMounted, onUnmounted } from "vue";
import { DemoBanner, DemoAuthModal, useDemoMode } from "~/lib-modules/demo-mode";

const conversationsStore = useConversationsStore();
const { isGuestDemo } = useDemoMode();

onMounted(() => {
  conversationsStore.subscribeToEvents();
});

onUnmounted(() => {
  conversationsStore.unsubscribeFromEvents();
});

const onMainWrapperScroll = () => {
  const focusedElement = document.activeElement as HTMLElement;
  if (focusedElement && (focusedElement.tagName === 'TEXTAREA' || focusedElement.tagName === 'INPUT')) {
    focusedElement.blur();
  }
}
</script>

<template>
  <div class="main-wrapper" :class="{ 'pt-10': isGuestDemo }" @scroll="onMainWrapperScroll">
    <DemoBanner />
    <DemoAuthModal />
    <Navbar/>
    <slot/>
  </div>
</template>

<style scoped>
</style>
```

**Step 2: Commit**

```bash
git add layouts/default.vue
git commit -m "feat(demo-mode): add banner and auth modal to layout"
```

---

## Task 12: Guard Send Message Action

**Files:**
- Modify: `lib-modules/conversations/components/SendMessageSection.vue`

**Step 1: Update SendMessageSection.vue**

Add demo guard to sendMessage function:

```typescript
// In script setup, add import:
import { useDemoGuard } from '~/lib-modules/demo-mode'

// Add:
const { guardAction } = useDemoGuard()

// Update sendMessage function:
const sendMessage = () => {
  if (useEnv().sendingMessagesBlocked.value) {
    return;
  }

  if (newMessage.value.trim()) {
    // Guard action in demo mode
    guardAction(() => {
      emit('send', newMessage.value);
      newMessage.value = "";
    })
  }
};
```

**Step 2: Commit**

```bash
git add lib-modules/conversations/components/SendMessageSection.vue
git commit -m "feat(demo-mode): guard send message action"
```

---

## Task 13: Update Landing CTA to Go to /app

**Files:**
- Modify: `components/landing/LandingHero.vue`

**Step 1: Update handleCTA function**

```typescript
function handleCTA() {
  $trackGoal('landing_cta_click', { button: 'hero_try_free' })
  // Always go to app - demo mode will activate if not logged in
  router.push(Routes.newConversation)
}
```

**Step 2: Commit**

```bash
git add components/landing/LandingHero.vue
git commit -m "feat(demo-mode): landing CTA goes directly to app"
```

---

## Task 14: Handle Demo Conversation Loading

**Files:**
- Modify: `pages/app/conversations/[id].vue`

**Step 1: Update conversation loading**

In the conversation page, check if it's a demo conversation and load demo data:

Add to imports:
```typescript
import { isDemoConversation, getDemoConversation } from '~/lib-modules/demo-mode'
```

Update the conversation loading logic to check for demo conversations first:

```typescript
// When loading conversation by ID:
if (isDemoConversation(conversationId)) {
  const demoConv = getDemoConversation(conversationId)
  if (demoConv) {
    // Set conversation data from demo
    currentConversationStore.setConversation(demoConv)
    return
  }
}
// Otherwise fetch from API
```

**Step 2: Commit**

```bash
git add pages/app/conversations/[id].vue
git commit -m "feat(demo-mode): handle demo conversation loading"
```

---

## Task 15: Final Integration Test

**Step 1: Start dev server**

```bash
yarn dev
```

**Step 2: Test unauthenticated access**

1. Open incognito window
2. Go to landing page
3. Click CTA button
4. Verify: redirected to /app, demo banner visible, demo conversations in sidebar
5. Try to send message - auth modal appears
6. Click login button in navbar - goes to /auth

**Step 3: Verify logged in flow unchanged**

1. Log in
2. Verify no demo banner
3. Verify real conversations load
4. Verify send message works

**Step 4: Final commit**

```bash
git add -A && git commit -m "feat(demo-mode): complete guest demo mode implementation"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Remove auth middleware |
| 2 | Update useDemoMode to auto-activate |
| 3 | Create demo conversations data |
| 4 | Create demo client data |
| 5 | Create useDemoGuard composable |
| 6 | Create DemoAuthModal component |
| 7 | Create DemoBanner component |
| 8 | Update demo-mode module exports |
| 9 | Integrate demo data into conversations store |
| 10 | Update Navbar with login button |
| 11 | Add banner and modal to layout |
| 12 | Guard send message action |
| 13 | Update landing CTA |
| 14 | Handle demo conversation loading |
| 15 | Final integration test |
