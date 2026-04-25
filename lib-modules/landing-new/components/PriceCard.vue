<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import type { PriceCardProps, PriceCardCtaAction } from '../types'
import PrimaryButton from './PrimaryButton.vue'
import GhostButton from './GhostButton.vue'

withDefaults(defineProps<PriceCardProps>(), {
  highlighted: false,
})

const emit = defineEmits<{ cta: [action: PriceCardCtaAction] }>()
</script>

<template>
  <div
    :class="[
      'relative flex flex-col p-8 md:p-10 border bg-transparent',
      highlighted ? 'border-[#d4683f]' : 'border-[#ede8de]/30',
    ]"
  >
    <div v-if="highlighted" class="absolute top-0 left-0 right-0 h-1 bg-[#d4683f]" />

    <div class="flex items-baseline justify-between mb-3 gap-4">
      <h3 class="lnf-display font-medium text-[22px] md:text-[26px] tracking-[-0.02em] text-[#ede8de]">
        {{ name }}
      </h3>
      <div class="flex items-baseline gap-1 shrink-0">
        <span class="lnf-display font-bold text-[26px] md:text-[36px] text-[#ede8de] tracking-[-0.02em] leading-none">
          {{ price }}
        </span>
        <span v-if="period" class="text-sm text-[#5a5550]">{{ period }}</span>
      </div>
    </div>

    <p class="lnf-body text-[14px] md:text-[15px] text-[#a8a094] mb-8 leading-[1.55]">
      {{ description }}
    </p>

    <ul class="space-y-3 mb-10 flex-1">
      <li
        v-for="feature in features"
        :key="feature"
        class="lnf-body flex items-start gap-3 text-[14px] md:text-[15px] text-[#ede8de] leading-[1.5]"
      >
        <Check class="w-4 h-4 mt-0.5 shrink-0 text-[#d4683f]" />
        <span>{{ feature }}</span>
      </li>
    </ul>

    <PrimaryButton
      v-if="highlighted || cta.action === 'demo'"
      class="w-full"
      @click="emit('cta', cta.action)"
    >
      {{ cta.label }}
    </PrimaryButton>
    <GhostButton
      v-else
      class="w-full"
      @click="emit('cta', cta.action)"
    >
      {{ cta.label }}
    </GhostButton>
  </div>
</template>
