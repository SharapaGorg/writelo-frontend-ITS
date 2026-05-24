<script setup lang="ts">
import { computed, ref } from 'vue'
import { Clock, LogOut } from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AppNavbar } from '~/lib-modules/app-layout'
import TariffPlanZone from './TariffPlanZone.vue'
import UsageLimitsZone from './UsageLimitsZone.vue'
import GiftsSection from './GiftsSection.vue'
import EditAccountZone from './EditAccountZone.vue'
import ConnectionsZone from './ConnectionsZone.vue'
import DevToolsZone from './DevToolsZone.vue'
import PreferencesZone from './PreferencesZone.vue'
import { isInTelegramApp } from '~/scripts/features/utils'
import { useDemoMode, useDemoGuard } from '~/lib-modules/demo-mode'
import { useProfileI18n } from '../composables/useProfileI18n'

const { t, globalT } = useProfileI18n()
const { isGuestDemo } = useDemoMode()
const { guardAction } = useDemoGuard()
const $settings = useSettings()
const userController = useUserController()

const user = computed(() => $settings.getUser())

const displayName = computed(() => {
  if (isGuestDemo.value) return t('demoUser.name')
  return user.value?.name ?? ''
})

const displayEmail = computed(() => {
  if (isGuestDemo.value) return t('demoUser.email')
  return user.value?.email ?? ''
})

const pendingEmail = computed(() => user.value?.pendingEmail)
const initials = computed(() => {
  const parts = displayName.value.trim().split(/\s+/)
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')
  return letters || 'U'
})

const logoutDialogOpen = ref(false)
const canLogout = computed(() => !isInTelegramApp.value)
const isDev = import.meta.dev

const openLogoutDialog = () => {
  if (guardAction(() => {})) return
  logoutDialogOpen.value = true
}

async function handleLogout() {
  userController.clearToken()
  logoutDialogOpen.value = false
  await navigateTo('/auth')
}
</script>

<template>
  <div class="flex flex-col h-full">
    <AppNavbar :breadcrumbs="[{ label: globalT('sidebar.items.profile') }]" />

    <div class="flex-1 overflow-y-auto">
      <div class="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        <!-- Hero -->
        <section class="flex items-center gap-4 rounded-xl border bg-card px-5 py-4 shadow-sm">
          <Avatar class="h-16 w-16 sm:h-20 sm:w-20 shrink-0">
            <AvatarImage src="https://github.com/shadcn.png" alt="@avatar" />
            <AvatarFallback>{{ initials }}</AvatarFallback>
          </Avatar>
          <div class="flex flex-col min-w-0 flex-1">
            <span class="text-lg sm:text-xl font-semibold truncate">{{ displayName }}</span>
            <span class="text-sm text-muted-foreground truncate">{{ displayEmail }}</span>
            <span
              v-if="pendingEmail"
              class="mt-1 flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 truncate"
            >
              <Clock class="h-3 w-3 shrink-0" />
              {{ pendingEmail }}
            </span>
          </div>
          <Button
            v-if="canLogout"
            variant="ghost"
            size="sm"
            class="shrink-0 text-muted-foreground hover:text-destructive"
            @click="openLogoutDialog"
          >
            <LogOut class="h-4 w-4" />
            <span class="hidden sm:inline">{{ t('dangerZone.logout') }}</span>
          </Button>
        </section>

        <!-- Tariff + usage — split on lg+, stacked below -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TariffPlanZone />
          <UsageLimitsZone />
        </div>

        <!-- Two-column grid on lg+, single column below -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EditAccountZone />
          <PreferencesZone />
          <GiftsSection />
          <DevToolsZone v-if="isDev" />
          <ConnectionsZone />
        </div>
      </div>
    </div>

    <Dialog v-model:open="logoutDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ t('dangerZone.logoutConfirm.title') }}</DialogTitle>
          <DialogDescription>
            {{ t('dangerZone.logoutConfirm.description') }}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="logoutDialogOpen = false">
            {{ t('dangerZone.logoutConfirm.cancel') }}
          </Button>
          <Button variant="destructive" @click="handleLogout">
            {{ t('dangerZone.logoutConfirm.confirm') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
