<script setup lang="ts">
import { ref } from 'vue'
import { Menu, X } from 'lucide-vue-next'
import PrimaryButton from '~/lib-modules/landing-new/components/PrimaryButton.vue'
import { Routes } from '~/scripts/shared/types'

const router = useRouter()
const { $trackGoal } = useNuxtApp()
const mobileMenuOpen = ref(false)

function closeMobile() {
  mobileMenuOpen.value = false
}

function goToApp() {
  $trackGoal('landing_cta_click', { button: 'feature_page_header_try_free' })
  router.push(Routes.app)
  closeMobile()
}

function switchLang(code: 'ru' | 'en') {
  closeMobile()
  // RU-only feature pages: EN button always returns to main EN landing.
  if (code === 'en') navigateTo('/en')
}
</script>

<template>
  <div
    class="landing-new-root h-screen overflow-y-auto overflow-x-hidden bg-white dark:bg-[#0a0a0a] text-[#0a0a0a] dark:text-[#ede8de] scroll-smooth"
  >
    <header
      class="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-[#0a0a0a]/85 backdrop-blur-sm border-b border-[#0a0a0a]/10 dark:border-[#ede8de]/10"
    >
      <div class="max-w-[1400px] mx-auto px-6 md:px-12">
        <div class="grid grid-cols-[1fr_auto_1fr] items-center h-16">
          <NuxtLink
            to="/"
            class="lnf-display font-bold text-[18px] tracking-[-0.02em] text-[#0a0a0a] dark:text-[#ede8de] justify-self-start"
          >
            Writelo
          </NuxtLink>

          <nav class="hidden md:flex items-center gap-10 justify-self-center">
            <NuxtLink
              to="/#trends"
              class="lnf-body text-sm text-[#5f5f5f] dark:text-[#a8a094] hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors"
            >
              Возможности
            </NuxtLink>
            <NuxtLink
              to="/#pricing"
              class="lnf-body text-sm text-[#5f5f5f] dark:text-[#a8a094] hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors"
            >
              Тарифы
            </NuxtLink>
            <NuxtLink
              to="/#contacts"
              class="lnf-body text-sm text-[#5f5f5f] dark:text-[#a8a094] hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors"
            >
              Контакты
            </NuxtLink>
          </nav>

          <button
            class="md:hidden justify-self-center p-2 text-[#0a0a0a] dark:text-[#ede8de]"
            :aria-label="mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <Menu v-if="!mobileMenuOpen" class="w-6 h-6" />
            <X v-else class="w-6 h-6" />
          </button>

          <div class="flex items-center gap-3 justify-self-end -mr-4 md:mr-0">
            <div
              class="flex items-center gap-1.5 lnf-mono text-[12px] tracking-[0.04em] md:mr-2"
              role="group"
              aria-label="Язык"
            >
              <button
                type="button"
                class="px-1.5 py-1 uppercase text-[#0a0a0a] dark:text-[#ede8de] font-bold"
                aria-pressed="true"
                @click="switchLang('ru')"
              >
                RU
              </button>
              <span class="text-[#c4c4c4] dark:text-[#3a3530]">/</span>
              <button
                type="button"
                class="px-1.5 py-1 uppercase text-[#8a8a8a] dark:text-[#7a7268] hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors"
                aria-pressed="false"
                @click="switchLang('en')"
              >
                EN
              </button>
            </div>
            <PrimaryButton size="sm" class="hidden md:inline-flex" @click="goToApp">
              Попробовать бесплатно
            </PrimaryButton>
          </div>
        </div>
      </div>

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
          class="md:hidden border-t border-[#0a0a0a]/10 dark:border-[#ede8de]/10 bg-white dark:bg-[#0a0a0a]"
        >
          <nav class="px-6 py-6 flex flex-col gap-5">
            <NuxtLink
              to="/#trends"
              class="lnf-body text-[#0a0a0a] dark:text-[#ede8de]"
              @click="closeMobile"
            >
              Возможности
            </NuxtLink>
            <NuxtLink
              to="/#pricing"
              class="lnf-body text-[#0a0a0a] dark:text-[#ede8de]"
              @click="closeMobile"
            >
              Тарифы
            </NuxtLink>
            <NuxtLink
              to="/#contacts"
              class="lnf-body text-[#0a0a0a] dark:text-[#ede8de]"
              @click="closeMobile"
            >
              Контакты
            </NuxtLink>
            <PrimaryButton size="sm" class="self-start" @click="goToApp">
              Попробовать бесплатно
            </PrimaryButton>
          </nav>
        </div>
      </Transition>
    </header>

    <main>
      <slot />
    </main>

    <footer class="border-t border-[#0a0a0a]/15 dark:border-[#ede8de]/15 py-10">
      <div class="max-w-[1200px] mx-auto px-6 md:px-12">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <NuxtLink
            to="/"
            class="lnf-display font-bold text-[18px] tracking-[-0.02em] text-[#0a0a0a] dark:text-[#ede8de]"
          >
            Writelo
          </NuxtLink>
          <nav
            class="flex flex-wrap justify-center gap-x-8 gap-y-3 lnf-body text-sm text-[#5f5f5f] dark:text-[#a8a094]"
          >
            <NuxtLink
              to="/poisk-trendov-v-instagrame"
              class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors"
            >
              Тренды
            </NuxtLink>
            <NuxtLink
              to="/kontent-plan-dlya-smm"
              class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors"
            >
              Календарь
            </NuxtLink>
            <NuxtLink
              to="/ai-razbor-reels"
              class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors"
            >
              Разбор Reels
            </NuxtLink>
            <NuxtLink
              to="/brif-brenda-dlya-ai"
              class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors"
            >
              Бриф бренда
            </NuxtLink>
            <NuxtLink
              to="/#pricing"
              class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors"
            >
              Тарифы
            </NuxtLink>
            <NuxtLink
              to="/auth"
              class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors"
            >
              Войти
            </NuxtLink>
            <NuxtLink
              to="/privacy"
              class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors"
            >
              Конфиденциальность
            </NuxtLink>
            <NuxtLink
              to="/terms"
              class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors"
            >
              Условия
            </NuxtLink>
          </nav>
          <div class="lnf-body text-sm text-[#8a8a8a] dark:text-[#5a5550]">© 2026 Writelo</div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
.landing-new-root {
  --font-display: 'Unbounded', system-ui, sans-serif;
  --font-body: 'IBM Plex Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  font-family: var(--font-body);
}

.landing-new-root .lnf-display { font-family: var(--font-display); }
.landing-new-root .lnf-body    { font-family: var(--font-body); }
.landing-new-root .lnf-mono    { font-family: var(--font-mono); }

.landing-new-root {
  scrollbar-width: thin;
  scrollbar-color: rgba(10, 10, 10, 0.18) transparent;
}

:where(html.dark) .landing-new-root {
  scrollbar-color: rgba(237, 232, 222, 0.12) transparent;
}

.landing-new-root::-webkit-scrollbar {
  width: 8px !important;
  height: 8px !important;
}

.landing-new-root::-webkit-scrollbar-track {
  background: transparent;
}

.landing-new-root::-webkit-scrollbar-thumb {
  background-color: rgba(10, 10, 10, 0.18);
  border-radius: 9999px;
  transition: background-color 200ms;
}

.landing-new-root::-webkit-scrollbar-thumb:hover {
  background-color: rgba(10, 10, 10, 0.32);
}

:where(html.dark) .landing-new-root::-webkit-scrollbar-thumb {
  background-color: rgba(237, 232, 222, 0.12);
}

:where(html.dark) .landing-new-root::-webkit-scrollbar-thumb:hover {
  background-color: rgba(237, 232, 222, 0.24);
}
</style>
