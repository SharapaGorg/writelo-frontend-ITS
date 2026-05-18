<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Calendar,
  PenSquare,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Film,
  LogIn,
  User,
  Briefcase,
  Sparkles,
  Crown,
  Users,
  History,
  ScanSearch,
  Send,
} from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { cn } from '~/lib-modules/utils'
import { Button } from '~/components/ui/button'
import { useAppLayout } from '../composables/useAppLayout'
import type { SidebarItem } from '../types'
import { useUserController } from '~/composables/user'
import { useSettings } from '~/composables/settings'
import { usePlans } from '~/lib-modules/plans'
import PublicationsPanel from './PublicationsPanel.vue'
import LimitsPanel from './LimitsPanel.vue'

const router = useRouter()
const route = useRoute()
const { isCollapsed, sidebarItems, bottomItems, toggleSidebar } = useAppLayout()

const userController = useUserController()
const isAuthenticated = computed(() => userController.isAuthenticated())

const settings = useSettings()
const subscription = computed(() => settings.getSubscription())
const isFreePlan = computed(() => {
  const sub = subscription.value
  return !sub || sub.price === 0
})
const { t } = useI18n()
const planTitle = computed(() => subscription.value?.title ?? t('sidebar.freePlanFallback'))

const { isBusinessPlan } = usePlans()

const iconComponents: Record<string, typeof Calendar> = {
  'calendar': Calendar,
  'pen-square': PenSquare,
  'film': Film,
  'trending-up': TrendingUp,
  'briefcase': Briefcase,
  'user': User,
  'settings': Settings,
  'users': Users,
  'history': History,
  'sparkles': Sparkles,
  'scan-search': ScanSearch,
}

function getIcon(iconName: string) {
  return iconComponents[iconName] || Calendar
}

function isActive(item: SidebarItem): boolean {
  return route.path === item.route || route.path.startsWith(item.route + '/')
}

function navigate(item: SidebarItem) {
  router.push(item.route)
}
</script>

<template>
  <aside
    :class="cn(
      'flex flex-col h-full bg-background border-r border-border overflow-hidden transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-60'
    )"
  >
    <!-- Logo / Brand -->
    <div class="flex items-center justify-between h-16 px-4 border-b border-border gap-2">
      <div
        :class="cn(
          'flex items-baseline gap-1.5 overflow-hidden transition-all duration-300',
          isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'
        )"
      >
        <span class="text-lg font-semibold whitespace-nowrap">Writelo</span>
        <span
          class="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-primary/10 text-primary leading-none whitespace-nowrap"
        >
          beta
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 shrink-0"
        @click="toggleSidebar"
      >
        <ChevronLeft v-if="!isCollapsed" class="h-4 w-4" />
        <ChevronRight v-else class="h-4 w-4" />
      </Button>
    </div>

    <!-- Main Navigation -->
    <nav class="flex-1 flex flex-col gap-1 p-2">
      <Button
        v-for="item in sidebarItems"
        :key="item.id"
        variant="ghost"
        :class="cn(
          'w-full justify-start gap-3 h-10 px-3 overflow-hidden',
          isActive(item) && 'bg-accent text-accent-foreground'
        )"
        @click="navigate(item)"
      >
        <component :is="getIcon(item.icon)" class="h-5 w-5 shrink-0" />
        <span
          :class="cn(
            'truncate whitespace-nowrap transition-all duration-300',
            isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'
          )"
        >{{ item.label }}</span>
      </Button>
    </nav>

    <!-- Auth state banner (shown when not signed in) -->
    <div
      v-if="!isAuthenticated"
      class="p-2 border-t border-border"
    >
      <Button
        variant="default"
        class="w-full gap-2 h-10 px-3 bg-brand text-brand-foreground hover:bg-brand/90 justify-start overflow-hidden"
        @click="router.push('/auth')"
      >
        <LogIn class="h-5 w-5 shrink-0" />
        <span
          :class="cn(
            'truncate whitespace-nowrap transition-all duration-300',
            isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'
          )"
        >{{ t('sidebar.login') }}</span>
      </Button>
      <div
        :class="cn(
          'overflow-hidden transition-all duration-300',
          isCollapsed ? 'max-h-0 opacity-0 mt-0' : 'max-h-24 opacity-100 mt-2'
        )"
      >
        <p class="px-2 text-xs text-muted-foreground leading-snug">
          {{ t('sidebar.unauthBanner') }}
        </p>
      </div>
    </div>

    <!-- Subscription chip -->
    <button
      v-if="isAuthenticated"
      type="button"
      :class="cn(
        'mx-2 mb-1 mt-1 flex items-center gap-2 rounded-md border px-3 py-2 text-left overflow-hidden transition-colors hover:bg-accent',
        isFreePlan
          ? 'border-border bg-muted/50'
          : 'border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800/60'
      )"
      @click="router.push('/app/plans')"
    >
      <component
        :is="isFreePlan ? Sparkles : Crown"
        :class="cn(
          'h-4 w-4 shrink-0',
          isFreePlan ? 'text-muted-foreground' : 'text-amber-600 dark:text-amber-400'
        )"
      />
      <div
        :class="cn(
          'min-w-0 overflow-hidden transition-all duration-300',
          isCollapsed ? 'max-w-0 opacity-0' : 'flex-1 max-w-[200px] opacity-100'
        )"
      >
        <div class="text-xs font-medium truncate whitespace-nowrap">
          {{ isFreePlan ? t('sidebar.freePlanLabel') : planTitle }}
        </div>
        <div
          v-if="isBusinessPlan"
          class="text-[11px] text-muted-foreground truncate whitespace-nowrap"
        >
          {{ t('sidebar.teamPlanLabel') }}
        </div>
        <div v-if="isFreePlan" class="text-[11px] text-muted-foreground truncate whitespace-nowrap">
          {{ t('sidebar.openPlans') }}
        </div>
      </div>
    </button>

    <LimitsPanel />

    <PublicationsPanel />

    <!-- Bottom Navigation -->
    <div class="flex flex-col gap-1 p-2 border-t border-border">
      <Button
        v-for="item in bottomItems"
        :key="item.id"
        variant="ghost"
        :class="cn(
          'w-full justify-start gap-3 h-10 px-3 overflow-hidden',
          isActive(item) && 'bg-accent text-accent-foreground'
        )"
        @click="navigate(item)"
      >
        <component :is="getIcon(item.icon)" class="h-5 w-5 shrink-0" />
        <span
          :class="cn(
            'truncate whitespace-nowrap transition-all duration-300',
            isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'
          )"
        >{{ item.label }}</span>
      </Button>

      <a
        href="https://t.me/sharapagorg"
        target="_blank"
        rel="noopener noreferrer"
        :title="t('sidebar.contactMeTooltip')"
        :class="cn(
          'flex items-center gap-3 h-9 px-3 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent overflow-hidden transition-colors'
        )"
      >
        <Send class="h-4 w-4 shrink-0" />
        <span
          :class="cn(
            'truncate whitespace-nowrap transition-all duration-300',
            isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'
          )"
        >{{ t('sidebar.contactMe') }}</span>
      </a>
    </div>
  </aside>
</template>
