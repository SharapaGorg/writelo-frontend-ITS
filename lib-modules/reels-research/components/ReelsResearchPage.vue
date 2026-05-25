<script setup lang="ts">
import { onMounted, watch, computed } from 'vue'
import { Loader2, AlertCircle, RefreshCw, Sparkles, Lock, ArrowRight } from 'lucide-vue-next'
import { useReelsResearchStore } from '../stores/reelsResearchStore'
import ReelsFilters from './ReelsFilters.vue'
import ReelsGrid from './ReelsGrid.vue'
import ReelCard from './ReelCard.vue'
import ReelDetailsModal from './ReelDetailsModal.vue'
import { AppNavbar } from '~/lib-modules/app-layout'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import { useSettings } from '~/composables/settings'
import { useUserController } from '~/composables/user'
import { landingReelsMock } from '~/lib-modules/landing-new/helpers/landingReelsMock'
import type { TrendingReelDto } from '../types'

const store = useReelsResearchStore()
const { currentWorkspaceId } = useWorkspaceContext()
const $settings = useSettings()
const userController = useUserController()
const isAuthenticated = computed(() => userController.isAuthenticated())

// Free-tier cap inference: backend hides everything past the top 6 curated
// reels for free users past the 24h grace window. Response has no explicit
// flag — infer paywall state from settings + feed shape.
const isFreeUser = computed(() => !$settings.isPaidUser())
const showFreeTierCallout = computed(() =>
  isFreeUser.value
  && !store.hasActiveFilters
  && !store.isLoading
  && store.reels.length === 6
  && store.nextCursor === null,
)

onMounted(() => {
  if (currentWorkspaceId.value) store.fetchFeed()
})

// Refetch when the user switches workspace from the navbar.
watch(currentWorkspaceId, (id, prev) => {
  if (id && id !== prev) store.fetchFeed()
})

function handleSelect(reel: TrendingReelDto) {
  store.openReel(reel)
}
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <AppNavbar :breadcrumbs="[{ label: 'Тренды' }]" />

    <div class="border-b border-border px-4 py-3">
      <div :class="['max-w-7xl mx-auto w-full', !isAuthenticated && 'pointer-events-none select-none opacity-60']">
        <ReelsFilters />
      </div>
    </div>

    <div class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
      <div class="max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        <!-- Guest: sticky CTA banner above a dimmed preview of the real feed.
             The mock reels come from the landing module so they look like
             actual cards, not a placeholder grid. -->
        <div
          v-if="!isAuthenticated"
          class="flex flex-col gap-3 rounded-lg border border-brand/30 bg-brand/10 p-4 sm:flex-row sm:items-center"
        >
          <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
            <Lock class="size-4" />
          </div>
          <div class="min-w-0 flex-1 space-y-0.5">
            <p class="text-sm font-semibold text-foreground">
              Войдите, чтобы смотреть тренды
            </p>
            <p class="text-xs text-muted-foreground">
              Превью интерфейса доступно всем — свежий вирусный фид и фильтры по нишам открываются после регистрации
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

        <!-- Guest preview grid: mock reels from landing, dimmed + non-interactive. -->
        <div
          v-if="!isAuthenticated"
          class="pointer-events-none select-none opacity-60 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <ReelCard
            v-for="reel in landingReelsMock"
            :key="reel.reelId"
            :reel="reel"
          />
        </div>

        <!-- Loading: covers both workspace bootstrap and feed fetch.
             Showing "select workspace" here is wrong now — there is no header
             selector and the bootstrap in AppLayout sets the context within
             a few hundred ms. -->
        <div
          v-else-if="!currentWorkspaceId || (store.isLoading && store.reels.length === 0)"
          class="py-20 flex flex-col items-center justify-center text-muted-foreground"
        >
          <Loader2 class="size-8 animate-spin" />
          <p class="text-sm mt-3">Загружаем тренды…</p>
        </div>

        <!-- Error -->
        <div
          v-else-if="store.loadError && store.reels.length === 0"
          class="py-20 flex flex-col items-center justify-center text-center gap-3"
        >
          <AlertCircle class="size-10 text-destructive" />
          <p class="text-sm text-foreground">Не получилось загрузить тренды</p>
          <p class="text-xs text-muted-foreground max-w-md">{{ store.loadError }}</p>
          <button
            type="button"
            class="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand text-brand-foreground text-sm font-medium hover:bg-brand/90"
            @click="store.fetchFeed()"
          >
            <RefreshCw class="size-4" />
            Повторить
          </button>
        </div>

        <!-- Empty -->
        <div
          v-else-if="!store.isLoading && store.filteredReels.length === 0"
          class="py-20 text-center text-sm text-muted-foreground"
        >
          Пока ничего не нашлось. Попробуй другие фильтры.
        </div>

        <!-- Grid -->
        <ReelsGrid v-else @select="handleSelect" />

        <!-- Free-tier callout: shown when the default unfiltered feed returns
             exactly 6 reels with no cursor (the backend cap) and the user is
             on a free plan. -->
        <div
          v-if="showFreeTierCallout"
          class="mt-8 rounded-md border border-border bg-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div class="size-10 rounded-full bg-brand/15 text-brand flex items-center justify-center flex-shrink-0">
            <Sparkles class="size-5" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-foreground mb-1">Бесплатный тариф: доступно 6 рилсов</div>
            <p class="text-xs text-muted-foreground">
              Оформите подписку, чтобы открыть полный каталог трендовых рилсов.
            </p>
          </div>
          <NuxtLink
            to="/app/plans"
            class="inline-flex items-center justify-center px-4 py-2 rounded-md bg-brand text-brand-foreground text-sm font-medium hover:bg-brand/90 transition-colors flex-shrink-0"
          >
            Оформить подписку
          </NuxtLink>
        </div>

        <!-- Load more -->
        <div v-if="store.nextCursor && store.reels.length > 0" class="flex justify-center mt-8">
          <button
            type="button"
            :disabled="store.isLoadingMore"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-card hover:bg-accent text-sm font-medium disabled:opacity-60"
            @click="store.loadMore()"
          >
            <Loader2 v-if="store.isLoadingMore" class="size-4 animate-spin" />
            Загрузить ещё
          </button>
        </div>
      </div>
    </div>

    <ReelDetailsModal />
  </div>
</template>
