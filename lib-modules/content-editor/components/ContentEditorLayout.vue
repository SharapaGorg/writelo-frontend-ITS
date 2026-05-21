<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import interact from 'interactjs'
import { MessageSquare, Image, Users } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { cn } from '~/lib-modules/utils'
import { useContentEditor } from '../composables/useContentEditor'
import { AccountsSidebar } from '~/lib-modules/content-calendar'
import { useContentProjectStore } from '~/lib-modules/content-calendar/stores/contentProjectStore'
import type { SocialAccount } from '~/lib-modules/content-calendar/types'
import { AppNavbar, type BreadcrumbItem } from '~/lib-modules/app-layout'
import { getToasterPosition } from '~/scripts/features/utils/toater'
import { useViewport } from '~/composables/useViewport'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '~/components/ui/sheet'
import { Button } from '~/components/ui/button'
import TabStrip from '~/components/molecules/TabStrip.vue'
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

// Mobile state
const { isMobile } = useViewport()
const accountsSheetOpen = ref(false)
type EditorTab = 'edit' | 'preview'
const activeTab = ref<EditorTab>('edit')
const tabs = computed(() => [
  { id: 'edit' as const, label: t('contentEditor.tabs.edit') },
  { id: 'preview' as const, label: t('contentEditor.tabs.preview') },
])

onMounted(() => {
  // resize handle is v-if'd off on mobile; bail when not rendered
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
    <AppNavbar v-if="!props.showcaseMode" :breadcrumbs="breadcrumbs" show-workspace-selector>
      <template #actions>
        <Button
          v-if="isMobile && !props.showcaseMode"
          variant="ghost"
          size="icon"
          :title="t('contentEditor.mobile.accounts')"
          @click="accountsSheetOpen = true"
        >
          <Users class="h-5 w-5" />
        </Button>
      </template>
    </AppNavbar>

    <!-- Mobile tab strip -->
    <div v-if="isMobile" class="px-3 py-2 border-b border-border">
      <TabStrip :tabs="tabs" v-model="activeTab" />
    </div>

    <!-- Main content area -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Accounts Sidebar — desktop inline -->
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
        <!-- Left panel (Edit) -->
        <div
          v-show="!isMobile || activeTab === 'edit'"
          :class="cn(
            'relative flex flex-col border-r border-border',
            isMobile ? 'flex-1 w-full' : ''
          )"
          :style="!isMobile ? { width: `${leftPanelWidth}%` } : undefined"
          @click="setActivePanel('left')"
          @focusin="setActivePanel('left')"
        >
          <!-- Active panel border overlay (desktop only) -->
          <div
            v-if="isLeftActive && !isMobile"
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

        <!-- Resize handle — desktop only -->
        <div
          v-if="!isMobile"
          ref="resizeHandleRef"
          :class="cn(
            'w-1 flex-shrink-0 cursor-col-resize bg-transparent hover:bg-ring/50 transition-colors',
            isDragging && 'bg-ring'
          )"
        />

        <!-- Right panel (Preview) -->
        <div
          v-show="!isMobile || activeTab === 'preview'"
          :class="cn(
            'relative flex flex-col overflow-hidden',
            isMobile ? 'flex-1 w-full' : 'flex-1'
          )"
          @click="setActivePanel('right')"
          @focusin="setActivePanel('right')"
        >
          <!-- Active panel border overlay (desktop only) -->
          <div
            v-if="isRightActive && !isMobile"
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

    <!-- Mobile: AccountsSidebar in a left Sheet -->
    <Sheet v-if="isMobile && !props.showcaseMode" v-model:open="accountsSheetOpen">
      <SheetContent side="left" class="w-[88vw] max-w-[320px] p-0 flex flex-col">
        <SheetHeader class="p-4 border-b border-border">
          <SheetTitle>{{ t('contentEditor.mobile.accounts') }}</SheetTitle>
        </SheetHeader>
        <div class="flex-1 min-h-0 overflow-hidden">
          <AccountsSidebar
            :accounts="currentProjectAccounts"
            :selected-account-id="selectedAccountId ?? undefined"
            :single-select="true"
            :loading="projectStore.loading"
            mobile
            @select="(id) => { selectAccount(id); accountsSheetOpen = false }"
            @unlink="onUnlinkRequest"
          />
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>
