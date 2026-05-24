<script setup lang="ts">
import { Lock, ArrowRight } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const { $trackGoal } = useNuxtApp()

function onClick() {
  $trackGoal('landing_cta_click', { button: 'trends_locked_card' })
  router.push('/auth')
}
</script>

<template>
  <button
    type="button"
    class="group text-left rounded-md border border-border bg-card overflow-hidden transition-all hover:border-foreground/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    @click="onClick"
  >
    <div class="relative aspect-[4/5] overflow-hidden bg-muted flex items-center justify-center">
      <div class="absolute inset-0 bg-gradient-to-br from-muted via-muted/60 to-[#d4683f]/15" />
      <div class="absolute inset-0 backdrop-blur-md" />
      <div class="relative z-10 flex flex-col items-center gap-2 px-3 text-center">
        <div class="w-11 h-11 rounded-full bg-background/85 border border-border flex items-center justify-center shadow-sm">
          <Lock class="w-5 h-5 text-foreground/70" />
        </div>
        <span class="text-[11px] font-medium text-foreground/80 leading-snug">
          {{ t('landingNew.trends.lockedCard.thumbCaption') }}
        </span>
      </div>
    </div>

    <div class="p-3">
      <p class="text-xs font-semibold text-foreground line-clamp-2 mb-1.5 leading-snug min-h-[2rem]">
        {{ t('landingNew.trends.lockedCard.title') }}
      </p>
      <p class="text-[11px] text-muted-foreground line-clamp-2 mb-2 leading-snug">
        {{ t('landingNew.trends.lockedCard.body') }}
      </p>
      <div class="flex items-center gap-1 text-[11px] font-semibold text-[#d4683f] transition-all group-hover:gap-1.5">
        <span>{{ t('landingNew.trends.lockedCard.cta') }}</span>
        <ArrowRight class="w-3.5 h-3.5" />
      </div>
    </div>
  </button>
</template>
