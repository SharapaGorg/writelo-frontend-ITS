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
        <!-- Guest: show a sticky CTA banner above the real interface so they
             can preview how the analyser looks. The dimmed wrapper below
             stops interactions — submit endpoint is auth-gated anyway. -->
        <div
          v-if="!isAuthenticated"
          class="flex flex-col gap-3 rounded-lg border border-brand/30 bg-brand/10 p-4 sm:flex-row sm:items-center"
        >
          <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
            <Lock class="size-4" />
          </div>
          <div class="min-w-0 flex-1 space-y-0.5">
            <p class="text-sm font-semibold text-foreground">
              Войдите, чтобы анализировать видео
            </p>
            <p class="text-xs text-muted-foreground">
              Превью интерфейса доступно всем — отправлять ссылки и смотреть разбор можно после регистрации
            </p>
          </div>
          <NuxtLink
            to="/auth"
            class="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90"
          >
            Создать аккаунт
            <ArrowRight class="size-4" />
          </NuxtLink>
        </div>

        <div :class="!isAuthenticated && 'pointer-events-none select-none opacity-60'">
          <div class="space-y-6">
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
