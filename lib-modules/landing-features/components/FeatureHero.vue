<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import PrimaryButton from '~/lib-modules/landing-new/components/PrimaryButton.vue'

defineProps<{
  breadcrumb: string
  title: string
  titleAccent?: string
  lead: string
  ctaLabel: string
  ctaTo: string
}>()

const router = useRouter()
const { $trackGoal } = useNuxtApp()

function onCta(ctaTo: string, breadcrumb: string) {
  $trackGoal('feature_page_cta_click', { page: breadcrumb, position: 'hero' })
  router.push(ctaTo)
}
</script>

<template>
  <section class="px-6 md:px-12 pt-28 md:pt-36 pb-12 md:pb-20">
    <div class="max-w-[1100px] mx-auto">
      <nav
        class="lnf-mono text-[11px] md:text-[12px] tracking-[0.08em] uppercase text-[#8a8a8a] dark:text-[#5a5550] mb-6 md:mb-8 flex items-center gap-2 flex-wrap"
        aria-label="Хлебные крошки"
      >
        <NuxtLink
          to="/"
          class="hover:text-[#d4683f] dark:hover:text-[#d4683f] transition-colors"
        >
          Главная
        </NuxtLink>
        <ChevronRight class="w-3.5 h-3.5 text-[#c4c4c4] dark:text-[#3a3530]" />
        <span class="text-[#0a0a0a] dark:text-[#ede8de]">{{ breadcrumb }}</span>
      </nav>

      <h1
        class="lnf-display font-bold text-[40px] md:text-[64px] lg:text-[76px] leading-[1.02] tracking-[-0.035em] text-[#0a0a0a] dark:text-[#ede8de] max-w-[18ch]"
      >
        <template v-if="titleAccent">
          {{ title }}
          <span class="italic font-medium text-[#d4683f]">{{ titleAccent }}</span>
        </template>
        <template v-else>{{ title }}</template>
      </h1>

      <p
        class="lnf-body text-[17px] md:text-[19px] leading-[1.55] text-[#5f5f5f] dark:text-[#a8a094] max-w-[62ch] mt-7 md:mt-9"
      >
        {{ lead }}
      </p>

      <div class="mt-10 md:mt-12">
        <PrimaryButton @click="onCta(ctaTo, breadcrumb)">
          {{ ctaLabel }}
        </PrimaryButton>
      </div>
    </div>
  </section>
</template>
