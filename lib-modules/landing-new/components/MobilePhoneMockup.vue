<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ScanSearch, TrendingUp, MoreHorizontal } from 'lucide-vue-next'
import { cn } from '~/lib-modules/utils'

type TabId = 'trends' | 'video-analyzer' | 'more'

const props = withDefaults(
  defineProps<{
    active?: TabId | null
    source?: string
    wide?: boolean
  }>(),
  { active: null, source: 'phone', wide: false }
)

const { t } = useI18n()
const router = useRouter()
const { $trackGoal } = useNuxtApp()

const items = computed(() => [
  { id: 'trends' as const, icon: TrendingUp, label: t('sidebar.items.trends'), route: '/app/trends' },
  { id: 'video-analyzer' as const, icon: ScanSearch, label: t('sidebar.items.videoAnalyzer'), route: '/app/video-analyzer' },
  { id: 'more' as const, icon: MoreHorizontal, label: t('mobileNav.more'), route: '/app' },
])

function go(route: string, id: TabId) {
  $trackGoal('landing_cta_click', { button: `${props.source}_phone_${id}` })
  router.push(route)
}
</script>

<template>
  <div :class="['mx-auto', !props.wide && 'max-w-[22rem]']">
    <div class="relative rounded-[2rem] bg-[#0a0a0a] dark:bg-[#161616] p-1.5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] ring-1 ring-[#0a0a0a]/40 dark:ring-[#ede8de]/15">
      <div class="relative flex flex-col overflow-hidden rounded-[1.5rem] bg-background">
        <!-- Status bar with notch -->
        <div class="relative flex h-7 shrink-0 items-center justify-between bg-background px-5 lnf-mono text-[10px] font-semibold text-foreground">
          <span>9:41</span>
          <div class="absolute left-1/2 top-1 h-4 w-20 -translate-x-1/2 rounded-full bg-[#0a0a0a] dark:bg-[#161616]" />
          <div class="flex items-center gap-1">
            <svg viewBox="0 0 20 12" class="h-2.5 w-3 fill-current">
              <rect x="0" y="9" width="3" height="3" rx="0.5" />
              <rect x="4.5" y="6" width="3" height="6" rx="0.5" />
              <rect x="9" y="3" width="3" height="9" rx="0.5" />
              <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
            </svg>
            <svg viewBox="0 0 24 12" class="h-2.5 w-4 fill-none stroke-current" stroke-width="1.5">
              <path d="M1 9.5 L12 1 L23 9.5" />
            </svg>
            <div class="relative ml-0.5 h-2.5 w-5 rounded-[2px] border border-current">
              <div class="absolute inset-[1px] right-[5px] rounded-[1px] bg-current" />
              <div class="absolute -right-0.5 top-1/2 h-1 w-0.5 -translate-y-1/2 rounded-r-sm bg-current" />
            </div>
          </div>
        </div>

        <!-- Screen content -->
        <div class="bg-background">
          <slot />
        </div>

        <!-- Bottom tab bar -->
        <nav class="flex shrink-0 items-stretch border-t border-border bg-background pb-1">
          <button
            v-for="item in items"
            :key="item.id"
            type="button"
            :class="cn(
              'relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition-colors',
              props.active === item.id ? 'text-brand' : 'text-muted-foreground hover:text-foreground'
            )"
            @click="go(item.route, item.id)"
          >
            <span
              v-if="props.active === item.id"
              class="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-brand"
            />
            <component :is="item.icon" class="h-5 w-5" />
            <span>{{ item.label }}</span>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
