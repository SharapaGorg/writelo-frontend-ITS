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
  LogIn
} from 'lucide-vue-next'
import { cn } from '~/lib-modules/utils'
import { Button } from '~/components/ui/button'
import { useAppLayout } from '../composables/useAppLayout'
import type { SidebarItem } from '../types'
import { useUserController } from '~/composables/user'

const router = useRouter()
const route = useRoute()
const { isCollapsed, sidebarItems, bottomItems, toggleSidebar } = useAppLayout()

const userController = useUserController()
const isAuthenticated = computed(() => userController.isAuthenticated())

const iconComponents: Record<string, typeof Calendar> = {
  'calendar': Calendar,
  'pen-square': PenSquare,
  'film': Film,
  'trending-up': TrendingUp,
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
      <span v-if="!isCollapsed" class="text-lg font-semibold">Writelo</span>
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
