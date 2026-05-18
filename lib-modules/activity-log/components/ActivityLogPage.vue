<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { AppNavbar } from '~/lib-modules/app-layout'
import { Button } from '~/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { useWorkspaceContext, useWorkspaces, useWorkspacePermissions, NoAccessState } from '~/lib-modules/workspaces'
import ActivityLogFilters from './ActivityLogFilters.vue'
import ActivityLogItem from './ActivityLogItem.vue'
import { useActivityLog } from '../composables/useActivityLog'
import { groupByDay } from '../helpers/formatting'

const { t, locale } = useI18n()
const { currentWorkspaceId, currentWorkspace } = useWorkspaceContext()
const { workspaces, initialize: initializeWorkspaces } = useWorkspaces()
const { canViewActivityLog } = useWorkspacePermissions()
const {
  items,
  loading,
  hasMore,
  forbidden,
  filters,
  loadInitial,
  loadMore,
  setFilters,
  resetFilters,
} = useActivityLog()

const workspaceName = computed(() => currentWorkspace.value?.name ?? '')
const groups = computed(() => groupByDay(t, items.value, locale.value))

// Какие дни открыты в аккордеоне. По умолчанию — самый верхний (свежий) день.
// initializedFor хранит ws-id, для которого мы уже выставили дефолт, чтобы
// loadMore (новые items в том же ws) НЕ переоткрывал то, что юзер свернул.
const openDays = ref<string[]>([])
const initializedFor = ref<string | null>(null)

watch(
  [currentWorkspaceId, groups],
  ([wsId, g]) => {
    if (!wsId) {
      openDays.value = []
      initializedFor.value = null
      return
    }
    if (wsId !== initializedFor.value && g.length) {
      openDays.value = [g[0].key]
      initializedFor.value = wsId
    }
  },
  { immediate: true },
)

onMounted(async () => {
  if (workspaces.value.length === 0) await initializeWorkspaces()
})

watch(
  currentWorkspaceId,
  (id) => {
    if (id) loadInitial()
  },
  { immediate: true },
)

function pluralEvents(n: number): string {
  if (n === 1) return t('activityLog.events.one')
  if (n < 5) return t('activityLog.events.few')
  return t('activityLog.events.many')
}
</script>

<template>
  <!-- Permission gate: only fires once currentWorkspace has resolved.
       During the loading window the page renders normally and the inner
       "Выберите бренд" placeholder shows, so admin/owner never see a
       flash of NoAccess on hard refresh. -->
  <NoAccessState v-if="currentWorkspace && !canViewActivityLog" />
  <div v-else class="flex flex-col h-full">
    <AppNavbar
      :breadcrumbs="[{ label: t('activityLog.breadcrumb') }]"
      :show-workspace-selector="true"
    />

    <div class="flex-1 overflow-auto">
      <div class="p-6 max-w-3xl mx-auto space-y-6">
        <header v-if="workspaceName">
          <h1 class="text-xl font-semibold">{{ workspaceName }}</h1>
          <p class="text-sm text-muted-foreground">{{ t('activityLog.wsSubtitle') }}</p>
        </header>

        <div
          v-if="!currentWorkspaceId"
          class="rounded-md border bg-card p-6 text-center text-sm text-muted-foreground"
        >
          {{ t('activityLog.selectBrand') }}
        </div>

        <template v-else>
          <ActivityLogFilters
            :filters="filters"
            @change="(f: any) => setFilters(f)"
            @reset="resetFilters"
          />

          <div
            v-if="forbidden"
            class="rounded-md border bg-card p-6 text-center text-sm text-muted-foreground"
          >
            {{ t('activityLog.forbidden') }}
          </div>

          <div
            v-else-if="!items.length && !loading"
            class="rounded-md border bg-card p-6 text-center text-sm text-muted-foreground"
          >
            {{ t('activityLog.noRecords') }}
          </div>

          <Accordion
            v-else
            v-model="openDays"
            type="multiple"
            class="rounded-md border bg-card"
          >
            <AccordionItem
              v-for="(g, idx) in groups"
              :key="g.key"
              :value="g.key"
              class="border-b last:border-b-0"
            >
              <AccordionTrigger class="px-4 py-3 hover:no-underline">
                <div class="flex flex-1 items-center justify-between gap-3">
                  <span class="text-sm font-medium capitalize">{{ g.label }}</span>
                  <span class="text-xs text-muted-foreground">
                    {{ g.items.length }} {{ pluralEvents(g.items.length) }}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent class="pb-0">
                <div class="divide-y border-t">
                  <ActivityLogItem v-for="i in g.items" :key="i.id" :item="i" />
                </div>
                <!-- "Загрузить ещё" появляется только под верхним (свежим) днём,
                     потому что догрузка отдаёт ОЛДЕР items — они и так попадают
                     в новые дни ниже, и логично иметь триггер у активной точки чтения. -->
                <div
                  v-if="idx === 0 && hasMore"
                  class="flex justify-center border-t px-4 py-3"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    :disabled="loading"
                    @click="loadMore"
                  >
                    {{ loading ? t('activityLog.loading') : t('activityLog.loadMore') }}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div
            v-if="loading && items.length"
            class="text-center text-xs text-muted-foreground"
          >
            {{ t('activityLog.loading') }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
