<script setup lang="ts">
import PrimaryButton from '~/lib-modules/landing-new/components/PrimaryButton.vue'

const props = defineProps<{
  title: string
  body: string
  ctaLabel: string
  ctaTo: string
  page: string
}>()

const router = useRouter()
const { $trackGoal } = useNuxtApp()

function onClick() {
  $trackGoal('feature_page_cta_click', { page: props.page, position: 'final' })
  router.push(props.ctaTo)
}
</script>

<template>
  <section class="px-6 md:px-12 py-20 md:py-32">
    <div
      class="max-w-[1100px] mx-auto border-t border-[#0a0a0a]/15 dark:border-[#ede8de]/15 pt-16 md:pt-24 text-center"
    >
      <h2
        class="lnf-display font-bold text-[32px] md:text-[48px] lg:text-[56px] leading-[1.05] tracking-[-0.03em] text-[#0a0a0a] dark:text-[#ede8de] max-w-[20ch] mx-auto"
      >
        {{ title }}
      </h2>
      <p
        class="lnf-body text-[16px] md:text-[18px] leading-[1.55] text-[#5f5f5f] dark:text-[#a8a094] max-w-[56ch] mx-auto mt-6 md:mt-8"
      >
        {{ body }}
      </p>
      <div class="mt-10 md:mt-12">
        <PrimaryButton @click="onClick">{{ ctaLabel }}</PrimaryButton>
      </div>
    </div>
  </section>
</template>
