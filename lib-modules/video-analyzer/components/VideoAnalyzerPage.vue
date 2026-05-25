<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Sparkles, Lock, ArrowRight } from 'lucide-vue-next'
import { AppNavbar } from '~/lib-modules/app-layout'
import { Button } from '~/components/ui/button'
import { useWorkspaces, useWorkspaceContext } from '~/lib-modules/workspaces'
import { useUserController } from '~/composables/user'
import AnalysisInputBar from './AnalysisInputBar.vue'
import AnalysisHistoryGrid from './AnalysisHistoryGrid.vue'
import { useVideoAnalyzer } from '../composables/useVideoAnalyzer'
import { useAnalysisLimits } from '../composables/useAnalysisLimits'

const { t } = useI18n()
const { workspaces, initialize: initializeWorkspaces } = useWorkspaces()
const { currentWorkspaceId } = useWorkspaceContext()
const userController = useUserController()
const isAuthenticated = computed(() => userController.isAuthenticated())

const analyzer = useVideoAnalyzer()
const limits = useAnalysisLimits()

// Dev-only preview of the v2 analyser layout. Wired via query param so it
// disappears the moment you navigate away.
const isDev = import.meta.env.DEV

onMounted(async () => {
  if (!isAuthenticated.value) return
  if (workspaces.value.length === 0) await initializeWorkspaces()
  if (currentWorkspaceId.value) {
    analyzer.loadHistory(true)
    limits.load()
  }
})

// Reload when the workspace switches via the navbar selector.
watch(currentWorkspaceId, (id) => {
  if (!id) return
  analyzer.loadHistory(true)
  limits.load()
})
</script>

<template>
  <div class="flex h-full flex-col">
    <AppNavbar
      :breadcrumbs="[{ label: t('videoAnalyzer.breadcrumb') }]"
    />

    <div class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-7xl space-y-6 p-6">
        <!-- Guest: no token, no workspace — show registration CTA instead of
             a broken input bar (the analyse endpoint is auth-gated). -->
        <div
          v-if="!isAuthenticated"
          class="py-16 flex flex-col items-center justify-center text-center gap-4"
        >
          <div class="size-12 rounded-full bg-brand/15 text-brand flex items-center justify-center">
            <Lock class="size-6" />
          </div>
          <div class="space-y-1.5 max-w-md">
            <p class="text-base font-semibold text-foreground">
              Анализ видео доступен после регистрации
            </p>
            <p class="text-sm text-muted-foreground">
              Заведите бесплатный аккаунт за минуту — и разбирайте любые рилсы по полочкам
            </p>
          </div>
          <NuxtLink
            to="/auth"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand text-brand-foreground text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            Создать аккаунт
            <ArrowRight class="size-4" />
          </NuxtLink>
        </div>

        <template v-else>
          <AnalysisInputBar />

          <NuxtLink
            v-if="isDev"
            to="/app/video-analyzer/mock-v2?mock=v2"
            class="block"
          >
            <Button
              variant="outline"
              class="gap-1.5 border-dashed border-brand/40 text-brand hover:bg-brand/10 hover:text-brand"
            >
              <Sparkles class="h-3.5 w-3.5" />
              {{ t('videoAnalyzer.mockV2Cta') }}
            </Button>
          </NuxtLink>

          <AnalysisHistoryGrid
            :items="analyzer.history.value"
            :is-loading="analyzer.isHistoryLoading.value"
          />
        </template>
      </div>
    </div>
  </div>
</template>
