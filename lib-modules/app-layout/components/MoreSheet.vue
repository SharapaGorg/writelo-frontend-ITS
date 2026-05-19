<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet'
import {
  Sparkles,
  PenSquare,
  Briefcase,
  Users,
  History,
  User,
  Settings,
  Crown,
  LogIn,
  Send,
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib-modules/utils'
import { useAppLayout } from '../composables/useAppLayout'
import { useUserController } from '~/composables/user'
import { useSettings } from '~/composables/settings'
import { usePlans } from '~/lib-modules/plans'
import LimitsPanel from './LimitsPanel.vue'
import PublicationsPanel from './PublicationsPanel.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [v: boolean] }>()

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const userController = useUserController()
const isAuthenticated = computed(() => userController.isAuthenticated())

const settings = useSettings()
const subscription = computed(() => settings.getSubscription())
const isFreePlan = computed(() => {
  const sub = subscription.value
  return !sub || sub.price === 0
})
const planTitle = computed(() => subscription.value?.title ?? t('sidebar.freePlanFallback'))
const { isBusinessPlan } = usePlans()

const iconMap = {
  'sparkles': Sparkles,
  'pen-square': PenSquare,
  'briefcase': Briefcase,
  'users': Users,
  'history': History,
  'user': User,
  'settings': Settings,
} as const

const BOTTOM_BAR_IDS = new Set(['calendar', 'video-analyzer', 'trends'])

const { sidebarItems, bottomItems } = useAppLayout()
const restItems = computed(() => [
  ...sidebarItems.value.filter(i => !BOTTOM_BAR_IDS.has(i.id)),
  ...bottomItems.value,
])

function isActive(itemRoute: string) {
  return route.path === itemRoute || route.path.startsWith(itemRoute + '/')
}

function navigate(itemRoute: string) {
  emit('update:open', false)
  router.push(itemRoute)
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent side="bottom" class="h-[92vh] flex flex-col gap-0 p-0">
      <SheetHeader class="p-4 border-b border-border">
        <SheetTitle class="text-lg font-semibold">Writelo</SheetTitle>
      </SheetHeader>

      <div class="flex-1 overflow-y-auto px-4 py-3">
        <button
          v-if="isAuthenticated"
          type="button"
          :class="cn(
            'w-full flex items-center gap-2 rounded-md border px-3 py-2 text-left mb-2 transition-colors hover:bg-accent',
            isFreePlan
              ? 'border-border bg-muted/50'
              : 'border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800/60'
          )"
          @click="navigate('/app/plans')"
        >
          <component
            :is="isFreePlan ? Sparkles : Crown"
            :class="cn(
              'h-4 w-4 shrink-0',
              isFreePlan ? 'text-muted-foreground' : 'text-amber-600 dark:text-amber-400'
            )"
          />
          <div class="min-w-0 flex-1">
            <div class="text-xs font-medium truncate">
              {{ isFreePlan ? t('sidebar.freePlanLabel') : planTitle }}
            </div>
            <div v-if="isBusinessPlan" class="text-[11px] text-muted-foreground truncate">
              {{ t('sidebar.teamPlanLabel') }}
            </div>
            <div v-if="isFreePlan" class="text-[11px] text-muted-foreground truncate">
              {{ t('sidebar.openPlans') }}
            </div>
          </div>
        </button>

        <LimitsPanel />
        <PublicationsPanel />

        <nav class="mt-2 flex flex-col gap-1">
          <button
            v-for="item in restItems"
            :key="item.id"
            type="button"
            :class="cn(
              'w-full flex items-center gap-3 px-3 h-11 rounded-md text-sm font-medium transition-colors',
              isActive(item.route)
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-accent/60'
            )"
            @click="navigate(item.route)"
          >
            <component :is="iconMap[item.icon as keyof typeof iconMap] ?? User" class="h-5 w-5 shrink-0" />
            <span class="truncate">{{ item.label }}</span>
          </button>
        </nav>

        <Button
          v-if="!isAuthenticated"
          variant="default"
          class="w-full mt-3 gap-2 bg-brand text-brand-foreground hover:bg-brand/90 justify-start"
          @click="navigate('/auth')"
        >
          <LogIn class="h-5 w-5" />
          <span>{{ t('sidebar.login') }}</span>
        </Button>

        <a
          href="https://t.me/sharapagorg"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-4 flex items-center gap-3 px-3 h-10 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Send class="h-4 w-4 shrink-0" />
          <span>{{ t('sidebar.contactMe') }}</span>
        </a>
      </div>
    </SheetContent>
  </Sheet>
</template>
