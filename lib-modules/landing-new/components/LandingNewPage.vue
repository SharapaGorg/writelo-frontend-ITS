<script setup lang="ts">
import { ref } from 'vue'
import { Menu, X } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { cn } from '~/lib-modules/utils'
import HeroSection from './HeroSection.vue'
import AudienceSection from './AudienceSection.vue'
import TrendsSection from './TrendsSection.vue'
import ReelsSection from './ReelsSection.vue'
import PricingSection from './PricingSection.vue'
import FaqSection from './FaqSection.vue'
import FinalCtaSection from './FinalCtaSection.vue'
import ContactsSection from './ContactsSection.vue'
import PrimaryButton from './PrimaryButton.vue'
import { Routes } from '~/scripts/shared/types'

const { t, locale } = useI18n()
const router = useRouter()
const { $trackGoal } = useNuxtApp()
const mobileMenuOpen = ref(false)

function closeMobile() {
  mobileMenuOpen.value = false
}

function goToApp() {
  $trackGoal('landing_cta_click', { button: 'header_try_free' })
  router.push(Routes.app)
  closeMobile()
}

function switchLang(code: 'ru' | 'en') {
  closeMobile()
  if (locale.value === code) return
  $trackGoal('language_switch', { from: locale.value, to: code })
  navigateTo(`/${code}`)
}
</script>

<template>
  <div
    class="landing-new-root h-screen overflow-y-auto overflow-x-hidden bg-white dark:bg-[#0a0a0a] text-[#0a0a0a] dark:text-[#ede8de] scroll-smooth"
  >
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-[#0a0a0a]/85 backdrop-blur-sm border-b border-[#0a0a0a]/10 dark:border-[#ede8de]/10">
      <div class="max-w-[1400px] mx-auto px-6 md:px-12">
        <div class="grid grid-cols-[1fr_auto_1fr] items-center h-16">
          <a href="#top" class="lnf-display font-bold text-[18px] tracking-[-0.02em] text-[#0a0a0a] dark:text-[#ede8de] justify-self-start">
            Writelo
          </a>

          <nav class="hidden md:flex items-center gap-10 justify-self-center">
            <a href="#trends" class="lnf-body text-sm text-[#5f5f5f] dark:text-[#a8a094] hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors">
              {{ t('landingNew.header.nav.features') }}
            </a>
            <a href="#pricing" class="lnf-body text-sm text-[#5f5f5f] dark:text-[#a8a094] hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors">
              {{ t('landingNew.header.nav.pricing') }}
            </a>
            <a href="#contacts" class="lnf-body text-sm text-[#5f5f5f] dark:text-[#a8a094] hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors">
              {{ t('landingNew.header.nav.contacts') }}
            </a>
          </nav>

          <button
            class="md:hidden justify-self-center p-2 text-[#0a0a0a] dark:text-[#ede8de]"
            :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <Menu v-if="!mobileMenuOpen" class="w-6 h-6" />
            <X v-else class="w-6 h-6" />
          </button>

          <div class="flex items-center gap-3 justify-self-end -mr-4 md:mr-0">
            <div class="flex items-center gap-1.5 lnf-mono text-[12px] tracking-[0.04em] md:mr-2" role="group" aria-label="Language">
              <button
                type="button"
                :class="cn(
                  'px-1.5 py-1 uppercase transition-colors',
                  locale === 'ru'
                    ? 'text-[#0a0a0a] dark:text-[#ede8de] font-bold'
                    : 'text-[#8a8a8a] dark:text-[#7a7268] hover:text-[#0a0a0a] dark:hover:text-[#ede8de]',
                )"
                :aria-pressed="locale === 'ru'"
                @click="switchLang('ru')"
              >
                RU
              </button>
              <span class="text-[#c4c4c4] dark:text-[#3a3530]">/</span>
              <button
                type="button"
                :class="cn(
                  'px-1.5 py-1 uppercase transition-colors',
                  locale === 'en'
                    ? 'text-[#0a0a0a] dark:text-[#ede8de] font-bold'
                    : 'text-[#8a8a8a] dark:text-[#7a7268] hover:text-[#0a0a0a] dark:hover:text-[#ede8de]',
                )"
                :aria-pressed="locale === 'en'"
                @click="switchLang('en')"
              >
                EN
              </button>
            </div>
            <PrimaryButton size="sm" class="hidden md:inline-flex" @click="goToApp">
              {{ t('landingNew.header.cta') }}
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
        <div v-if="mobileMenuOpen" class="md:hidden border-t border-[#0a0a0a]/10 dark:border-[#ede8de]/10 bg-white dark:bg-[#0a0a0a]">
          <nav class="px-6 py-6 flex flex-col gap-5">
            <a href="#trends" class="lnf-body text-[#0a0a0a] dark:text-[#ede8de]" @click="closeMobile">
              {{ t('landingNew.header.nav.features') }}
            </a>
            <a href="#pricing" class="lnf-body text-[#0a0a0a] dark:text-[#ede8de]" @click="closeMobile">
              {{ t('landingNew.header.nav.pricing') }}
            </a>
            <a href="#contacts" class="lnf-body text-[#0a0a0a] dark:text-[#ede8de]" @click="closeMobile">
              {{ t('landingNew.header.nav.contacts') }}
            </a>
            <PrimaryButton size="sm" class="self-start" @click="goToApp">
              {{ t('landingNew.header.cta') }}
            </PrimaryButton>
          </nav>
        </div>
      </Transition>
    </header>

    <main id="top">
      <HeroSection />
      <AudienceSection />
      <TrendsSection />
      <ReelsSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
      <ContactsSection />
    </main>

    <footer class="border-t border-[#0a0a0a]/15 dark:border-[#ede8de]/15 py-10">
      <div class="max-w-[1200px] mx-auto px-6 md:px-12">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="lnf-display font-bold text-[18px] tracking-[-0.02em] text-[#0a0a0a] dark:text-[#ede8de]">
            Writelo
          </div>
          <nav class="flex flex-wrap justify-center gap-x-8 gap-y-3 lnf-body text-sm text-[#5f5f5f] dark:text-[#a8a094]">
            <a href="#pricing" class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors">
              {{ t('landingNew.footer.nav.pricing') }}
            </a>
            <a href="#contacts" class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors">
              {{ t('landingNew.footer.nav.contacts') }}
            </a>
            <NuxtLink to="/auth" class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors">
              {{ t('landingNew.footer.nav.login') }}
            </NuxtLink>
            <NuxtLink to="/start" class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors">
              {{ t('landingNew.footer.nav.start') }}
            </NuxtLink>
            <NuxtLink to="/privacy" class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors">
              {{ t('landingNew.footer.nav.privacy') }}
            </NuxtLink>
            <NuxtLink to="/terms" class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors">
              {{ t('landingNew.footer.nav.terms') }}
            </NuxtLink>
            <NuxtLink to="/data-deletion" class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors">
              {{ t('landingNew.footer.nav.dataDeletion') }}
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

/* Reuse the same parchment scrollbar inside the video-analyzer showcase
   frame — overrides the global `*::-webkit-scrollbar { width: 0 }` rule. */
.landing-new-root .va-showcase-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(10, 10, 10, 0.18) transparent;
}

:where(html.dark) .landing-new-root .va-showcase-scroll {
  scrollbar-color: rgba(237, 232, 222, 0.16) transparent;
}

.landing-new-root .va-showcase-scroll::-webkit-scrollbar {
  width: 8px !important;
  height: 8px !important;
}

.landing-new-root .va-showcase-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.landing-new-root .va-showcase-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(10, 10, 10, 0.18);
  border-radius: 9999px;
  transition: background-color 200ms;
}

.landing-new-root .va-showcase-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(10, 10, 10, 0.32);
}

:where(html.dark) .landing-new-root .va-showcase-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(237, 232, 222, 0.16);
}

:where(html.dark) .landing-new-root .va-showcase-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(237, 232, 222, 0.32);
}

.landing-new-root .lnu-fade-up {
  opacity: 0;
  transform: translateY(8px);
  animation: lnu-fade-up 700ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes lnu-fade-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.landing-new-root .lnu-bounce-slow {
  animation: lnu-bounce 2.4s ease-in-out infinite;
}

@keyframes lnu-bounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(6px); }
}
</style>
