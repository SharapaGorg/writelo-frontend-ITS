<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import interact from 'interactjs'
import { MessageSquare, Image } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { cn } from '~/lib-modules/utils'
import { useContentEditor } from '../composables/useContentEditor'
import { AccountsSidebar } from '~/lib-modules/content-calendar'
import { useContentProjectStore } from '~/lib-modules/content-calendar/stores/contentProjectStore'
import type { SocialAccount } from '~/lib-modules/content-calendar/types'
import { AppNavbar, type BreadcrumbItem } from '~/lib-modules/app-layout'
import { getToasterPosition } from '~/scripts/features/utils/toater'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'

const props = withDefaults(defineProps<{
  showcaseMode?: boolean
}>(), {
  showcaseMode: false
})

const { t } = useI18n()

const {
  currentDraft,
  editorMode,
  setEditorMode,
  activePanel,
  setActivePanel,
  isEditMode,
  selectedAccountId,
  selectAccount,
  currentProjectAccounts
} = useContentEditor()

const isLeftActive = computed(() => activePanel.value === 'left')
const isRightActive = computed(() => activePanel.value === 'right')

const projectStore = useContentProjectStore()
const unlinkDialogOpen = ref(false)
const pendingUnlink = ref<SocialAccount | null>(null)

function onUnlinkRequest(accountId: string) {
  const acc = currentProjectAccounts.value.find(a => a.id === accountId)
  if (!acc) return
  pendingUnlink.value = acc
  unlinkDialogOpen.value = true
}

async function confirmUnlink() {
  const acc = pendingUnlink.value
  if (!acc) return
  unlinkDialogOpen.value = false
  if (selectedAccountId.value === acc.id) {
    selectAccount(null)
  }
  const ok = await projectStore.unlinkAccount(acc.id)
  pendingUnlink.value = null
  if (ok) {
    toast.success(t('contentEditor.accountUnlinked'), { position: getToasterPosition() })
  } else {
    toast.error(t('contentEditor.accountUnlinkFailed'), { position: getToasterPosition() })
  }
}

// Resizable panel state
const leftPanelWidth = ref(50) // percentage
const resizeHandleRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)

const MIN_PANEL_WIDTH = 25 // minimum 25%
const MAX_PANEL_WIDTH = 75 // maximum 75%

onMounted(() => {
  if (!resizeHandleRef.value || !containerRef.value) return

  interact(resizeHandleRef.value).draggable({
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: 'parent'
      })
    ],
    listeners: {
      start() {
        isDragging.value = true
      },
      move(event) {
        if (!containerRef.value) return
        const containerRect = containerRef.value.getBoundingClientRect()
        const newX = event.clientX - containerRect.left
        const newPercent = (newX / containerRect.width) * 100
        leftPanelWidth.value = Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, newPercent))
      },
      end() {
        isDragging.value = false
      }
    }
  })
})

onUnmounted(() => {
  if (resizeHandleRef.value) {
    interact(resizeHandleRef.value).unset()
  }
})

const headerTitle = computed(() => {
  if (isEditMode.value && currentDraft.value?.title) {
    return currentDraft.value.title
  }
  return t('contentEditor.newPost')
})

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: t('contentEditor.calendarCrumb'), to: '/app/calendar' },
  { label: headerTitle.value },
])
</script>

<template>
  <div :class="cn('flex flex-col', props.showcaseMode ? 'h-[700px]' : 'h-full', isDragging && 'select-none')">
    <AppNavbar v-if="!props.showcaseMode" :breadcrumbs="breadcrumbs" show-workspace-selector />

    <!-- Main content area -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Accounts Sidebar -->
      <AccountsSidebar
        v-if="!props.showcaseMode"
        :accounts="currentProjectAccounts"
        :selected-account-id="selectedAccountId ?? undefined"
        :single-select="true"
        :loading="projectStore.loading"
        @select="selectAccount"
        @unlink="onUnlinkRequest"
      />

      <!-- Panels container -->
      <div ref="containerRef" class="flex flex-1 overflow-hidden">
        <!-- Left panel -->
        <div
          :class="cn(
            'relative flex flex-col border-r border-border'
          )"
          :style="{ width: `${leftPanelWidth}%` }"
          @click="setActivePanel('left')"
          @focusin="setActivePanel('left')"
        >
          <!-- Active panel border overlay -->
          <div
            v-if="isLeftActive"
            class="absolute inset-0 border border-ring/50 rounded-sm pointer-events-none z-10"
          />
          <!-- Mode switcher tabs -->
          <div class="flex border-b border-border px-2 py-2 select-none">
            <button
              @click="setEditorMode('chat')"
              :class="cn(
                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                editorMode === 'chat'
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )"
            >
              <MessageSquare class="h-4 w-4" />
              {{ $t('editor.tabs.chat') }}
            </button>
            <button
              @click="setEditorMode('images')"
              :class="cn(
                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                editorMode === 'images'
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )"
            >
              <Image class="h-4 w-4" />
              {{ $t('editor.tabs.images') }}
            </button>
          </div>

          <!-- Left panel content slot -->
          <div class="flex-1 overflow-hidden">
            <slot name="left-panel" />
          </div>
        </div>

        <!-- Resize handle -->
        <div
          ref="resizeHandleRef"
          :class="cn(
            'w-1 flex-shrink-0 cursor-col-resize bg-transparent hover:bg-ring/50 transition-colors',
            isDragging && 'bg-ring'
          )"
        />

        <!-- Right panel -->
        <div
          class="relative flex flex-1 flex-col overflow-hidden"
          @click="setActivePanel('right')"
          @focusin="setActivePanel('right')"
        >
          <!-- Active panel border overlay -->
          <div
            v-if="isRightActive"
            class="absolute inset-0 border border-ring/50 rounded-sm pointer-events-none z-10"
          />
          <slot name="right-panel" />
        </div>
      </div>
    </div>

    <AlertDialog v-model:open="unlinkDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t('contentEditor.unlinkDialog.title') }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ t('contentEditor.unlinkDialog.description', { name: pendingUnlink?.name ?? '' }) }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel class="cursor-pointer">{{ t('contentEditor.unlinkDialog.cancel') }}</AlertDialogCancel>
          <AlertDialogAction
            class="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
            @click="confirmUnlink"
          >
            {{ t('contentEditor.unlinkDialog.confirm') }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
