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
  Crown
} from 'lucide-vue-next'
import { cn } from '~/lib-modules/utils'
import { Button } from '~/components/ui/button'
import { useAppLayout } from '../composables/useAppLayout'
import type { SidebarItem } from '../types'
import { useUserController } from '~/composables/user'
import { useSettings } from '~/composables/settings'

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
const planTitle = computed(() => subscription.value?.title ?? 'Бесплатный')

const iconComponents: Record<string, typeof Calendar> = {
  'calendar': Calendar,
  'pen-square': PenSquare,
  'film': Film,
  'trending-up': TrendingUp,
  'briefcase': Briefcase,
  'user': User,
  'settings': Settings,
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
      'flex flex-col h-full bg-background border-r border-border transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-60'
    )"
  >
    <!-- Logo / Brand -->
    <div
      :class="cn(
        'flex items-center h-14 px-4 border-b border-border',
        isCollapsed ? 'justify-center' : 'justify-between'
      )"
    >
      <div v-if="!isCollapsed" class="flex items-baseline gap-1.5">
        <span class="text-lg font-semibold">Writelo</span>
        <span
          class="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-primary/10 text-primary leading-none"
        >
          beta
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8"
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
          'justify-start gap-3 h-10',
          isCollapsed && 'justify-center px-2',
          isActive(item) && 'bg-accent text-accent-foreground'
        )"
        @click="navigate(item)"
      >
        <component :is="getIcon(item.icon)" class="h-5 w-5 shrink-0" />
        <span v-if="!isCollapsed" class="truncate">{{ item.label }}</span>
      </Button>
    </nav>

    <!-- Auth state banner (shown when not signed in) -->
    <div
      v-if="!isAuthenticated"
      class="p-2 border-t border-border"
    >
      <Button
        variant="default"
        :class="cn(
          'w-full gap-2 h-10 bg-primary text-primary-foreground hover:bg-primary/90',
          isCollapsed ? 'justify-center px-2' : 'justify-start'
        )"
        @click="router.push('/auth')"
      >
        <LogIn class="h-5 w-5 shrink-0" />
        <span v-if="!isCollapsed" class="truncate">Войти в аккаунт</span>
      </Button>
      <p
        v-if="!isCollapsed"
        class="mt-2 px-2 text-xs text-muted-foreground leading-snug"
      >
        Сейчас вы не авторизованы — часть функций недоступна
      </p>
    </div>

    <!-- Subscription chip -->
    <button
      v-if="isAuthenticated"
      type="button"
      :class="cn(
        'mx-2 mb-1 mt-1 flex items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors hover:bg-accent',
        isCollapsed && 'justify-center px-0',
        isFreePlan
          ? 'border-border bg-muted/50'
          : 'border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800/60'
      )"
      @click="router.push('/app/profile')"
    >
      <component
        :is="isFreePlan ? Sparkles : Crown"
        :class="cn(
          'h-4 w-4 shrink-0',
          isFreePlan ? 'text-muted-foreground' : 'text-amber-600 dark:text-amber-400'
        )"
      />
      <div v-if="!isCollapsed" class="flex-1 min-w-0">
        <div class="text-xs font-medium truncate">
          {{ isFreePlan ? 'Бесплатный тариф' : planTitle }}
        </div>
        <div v-if="isFreePlan" class="text-[11px] text-muted-foreground truncate">
          Открыть тарифы →
        </div>
      </div>
    </button>

    <!-- Bottom Navigation -->
    <div class="flex flex-col gap-1 p-2 border-t border-border">
      <Button
        v-for="item in bottomItems"
        :key="item.id"
        variant="ghost"
        :class="cn(
          'justify-start gap-3 h-10',
          isCollapsed && 'justify-center px-2',
          isActive(item) && 'bg-accent text-accent-foreground'
        )"
        @click="navigate(item)"
      >
        <component :is="getIcon(item.icon)" class="h-5 w-5 shrink-0" />
        <span v-if="!isCollapsed" class="truncate">{{ item.label }}</span>
      </Button>
    </div>
  </aside>
</template>
