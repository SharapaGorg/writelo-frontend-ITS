<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog'
import TelegramLinkFlow from '~/lib-modules/content-calendar/components/TelegramLinkFlow.vue'
import { AppNavbar, type BreadcrumbItem } from '~/lib-modules/app-layout'
import { useWorkspaces } from '../composables/useWorkspaces'
import { useWorkspacesApi } from '../helpers/api'
import { useContentProjectStore } from '~/lib-modules/content-calendar/stores/contentProjectStore'
import type { WorkspaceDto } from '../types'
import type { SocialNetwork } from '~/lib-modules/content-calendar/types'
import { getToasterPosition } from '~/scripts/features/utils/toater'

const route = useRoute()

const workspaceId = computed(() => String(route.query.workspaceId ?? ''))
const workspace = ref<WorkspaceDto | null>(null)

const { getWorkspaceById, initialize, workspaces } = useWorkspaces()
const api = useWorkspacesApi()
const projectStore = useContentProjectStore()

interface PlatformOption {
  id: SocialNetwork
  name: string
  description: string
  badgeClass: string
  available: boolean
}

const platforms: PlatformOption[] = [
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Каналы и чаты',
    badgeClass: 'bg-sky-500',
    available: true,
  },
  {
    id: 'vk',
    name: 'ВКонтакте',
    description: 'Группы и страницы',
    badgeClass: 'bg-blue-600',
    available: false,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Бизнес-аккаунты',
    badgeClass: 'bg-gradient-to-br from-purple-500 to-pink-500',
    available: false,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Каналы',
    badgeClass: 'bg-red-600',
    available: false,
  },
]

const dialogOpen = ref(false)
const selectedPlatformId = ref<SocialNetwork | null>(null)
const selectedPlatform = computed(() =>
  platforms.find((p) => p.id === selectedPlatformId.value) ?? null,
)

function openPlatform(id: SocialNetwork) {
  selectedPlatformId.value = id
  dialogOpen.value = true
}

async function onChannelLinked(_socialAccountId: string) {
  toast.success('Канал привязан', { position: getToasterPosition() })
  dialogOpen.value = false
  // Принудительный рефетч в стор: дефолтный watcher на смене workspaceId
  // молчит, когда воркспейс не сменился (или когда в проекте уже есть данные),
  // поэтому без явного вызова на /app/calendar придётся жать F5, чтобы увидеть
  // только что привязанный канал.
  if (workspaceId.value) {
    projectStore.fetchProjectData(workspaceId.value)
  }
  navigateTo('/app/calendar')
}

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: 'Бренды', to: '/app/workspaces' },
  { label: workspace.value?.name ?? '…' },
  { label: 'Добавить соц. сети' },
])

onMounted(async () => {
  if (!workspaceId.value) {
    navigateTo('/app/workspaces')
    return
  }
  try {
    const cached = getWorkspaceById(workspaceId.value)
    if (cached) {
      workspace.value = cached
    } else {
      if (workspaces.value.length === 0) await initialize()
      const found = getWorkspaceById(workspaceId.value)
      workspace.value = found ?? (await api.getWorkspace(workspaceId.value))
    }
  } catch (e) {
    console.error('[ConnectAccountPage] load workspace failed:', e)
  }
})
</script>

<template>
  <div class="flex flex-col h-full">
    <AppNavbar :breadcrumbs="breadcrumbs" />

    <div class="flex-1 overflow-y-auto px-6 py-6">
      <div class="mx-auto max-w-2xl">
        <p class="text-sm text-muted-foreground mb-4">
          Выберите платформу, чтобы добавить аккаунт к бренду.
        </p>
        <div class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="p in platforms"
            :key="p.id"
            type="button"
            class="flex items-start gap-4 p-4 rounded-lg border border-border bg-card text-left hover:border-primary/50 hover:bg-accent/30 transition"
            @click="openPlatform(p.id)"
          >
            <div
              :class="[
                'w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0',
                p.badgeClass,
              ]"
            >
              <svg v-if="p.id === 'telegram'" class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <svg v-else-if="p.id === 'vk'" class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.596-.19 1.365 1.26 2.178 1.818.616.422 1.084.33 1.084.33l2.178-.03s1.14-.07.598-.962c-.044-.073-.316-.659-1.627-1.861-1.372-1.26-1.188-1.055.464-3.233.996-1.356 1.47-2.184 1.338-2.537-.125-.337-.907-.248-.907-.248l-2.45.015s-.182-.025-.316.056c-.132.078-.216.263-.216.263s-.388 1.031-.904 1.908c-1.092 1.852-1.528 1.95-1.706 1.836-.416-.267-.312-1.074-.312-1.646 0-1.79.272-2.535-.529-2.728-.266-.065-.461-.107-1.14-.114-.87-.01-1.606.003-2.023.207-.278.136-.492.439-.362.457.162.022.529.1.724.364.252.343.243 1.113.243 1.113s.145 2.106-.337 2.368c-.332.18-.786-.187-1.762-1.867-.5-.86-.878-1.81-.878-1.81s-.073-.178-.203-.273c-.158-.116-.378-.153-.378-.153l-2.327.015s-.35.01-.478.162c-.114.135-.009.414-.009.414s1.825 4.267 3.893 6.417c1.896 1.972 4.046 1.842 4.046 1.842h.975z"/>
              </svg>
              <svg v-else-if="p.id === 'instagram'" class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
              <svg v-else-if="p.id === 'youtube'" class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-medium">{{ p.name }}</span>
                <span
                  v-if="!p.available"
                  class="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                >
                  Скоро
                </span>
              </div>
              <div class="text-sm text-muted-foreground">{{ p.description }}</div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Подключить {{ selectedPlatform?.name ?? '' }}
          </DialogTitle>
          <DialogDescription v-if="selectedPlatform?.id === 'telegram'">
            Авторизуйтесь через Telegram, чтобы связать канал с брендом.
          </DialogDescription>
          <DialogDescription v-else>
            Интеграция с этой платформой появится в ближайших обновлениях.
          </DialogDescription>
        </DialogHeader>

        <TelegramLinkFlow
          v-if="selectedPlatform?.id === 'telegram' && workspaceId"
          :workspace-id="workspaceId"
          @linked="onChannelLinked"
        />
        <div v-else class="py-6 flex items-center justify-center text-sm text-muted-foreground gap-2">
          <Loader2 class="h-4 w-4 animate-spin" />
          Скоро будет доступно
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
