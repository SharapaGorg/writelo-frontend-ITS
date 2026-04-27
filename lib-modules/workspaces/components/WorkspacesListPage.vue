<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Plus, Loader2, Trash2, Check } from 'lucide-vue-next'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
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
import BrandAccountsSection from './BrandAccountsSection.vue'
import BrandBriefSection from './BrandBriefSection.vue'
import { AppNavbar } from '~/lib-modules/app-layout'
import { useWorkspaces } from '../composables/useWorkspaces'
import { useDemoGuard } from '~/lib-modules/demo-mode'
import { useSettings } from '~/composables/settings'
import { toastError, toastChangesSavedSuccess, toastDeleteSuccess, getToasterPosition } from '~/scripts/features/utils/toater'
import { toast } from 'vue-sonner'
// Direct imports (not via barrel) to avoid module-eval cycle: content-calendar
// barrel re-exports ContentCalendarPage, which imports from '~/lib-modules/workspaces'.
import { useContentCalendarApi } from '~/lib-modules/content-calendar/helpers/api'
import type { SocialAccount } from '~/lib-modules/content-calendar/types'
import type { WorkspaceDto } from '../types'

const { t: t_ } = useI18n()
const { guardAction } = useDemoGuard()
const { workspaces, loading, initialize, createWorkspace, updateWorkspace, deleteWorkspace, canEdit } =
  useWorkspaces()
const { getLanguage } = useSettings()

const openValue = ref<string | undefined>(undefined)
const savingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const deleteTarget = ref<string | null>(null)
const deleteDialogOpen = ref(false)
const isCreating = ref(false)
const unlinkAccountDialogOpen = ref(false)
const pendingUnlinkAccount = ref<{ workspaceId: string; account: SocialAccount } | null>(null)

// Accounts state per workspace — loaded lazily when the accordion opens.
const accountsByWorkspace = reactive<Record<string, SocialAccount[]>>({})
const accountsLoading = reactive<Record<string, boolean>>({})
const accountsLoaded = reactive<Record<string, boolean>>({})
const calendarApi = useContentCalendarApi()

async function loadAccounts(workspaceId: string) {
  if (accountsLoaded[workspaceId] || accountsLoading[workspaceId]) return
  accountsLoading[workspaceId] = true
  try {
    accountsByWorkspace[workspaceId] = await calendarApi.getSocialAccounts(workspaceId)
    accountsLoaded[workspaceId] = true
  } catch (e) {
    console.error('[WorkspacesListPage] load accounts failed:', e)
    accountsByWorkspace[workspaceId] = []
  } finally {
    accountsLoading[workspaceId] = false
  }
}

watch(openValue, (id) => {
  if (id) loadAccounts(id)
})

interface DraftForm {
  name: string
  industry: string
  businessDescription: string
  targetAudience: string
  toneOfVoice: string
  stopWords: string
  examplePosts: string
}

const drafts = reactive<Record<string, DraftForm>>({})

// Refs to per-workspace BrandBriefSection instances so we can collapse them
// after a successful save. Populated via function refs in the template.
type BriefSectionRef = { collapse: () => void }
const briefRefs: Record<string, BriefSectionRef | null> = {}

const emptyDraft = (): DraftForm => ({
  name: '',
  industry: '',
  businessDescription: '',
  targetAudience: '',
  toneOfVoice: '',
  stopWords: '',
  examplePosts: '',
})

// Pending draft is the inline create slot; null when no slot is open.
const pendingDraft = ref<DraftForm | null>(null)

function openCreate() {
  guardAction(() => {
    if (pendingDraft.value) return
    pendingDraft.value = emptyDraft()
  })
}

function cancelPending() {
  pendingDraft.value = null
}

function briefFilled(d: DraftForm): boolean {
  return (
    !!d.industry.trim() ||
    !!d.businessDescription.trim() ||
    !!d.targetAudience.trim() ||
    !!d.toneOfVoice.trim() ||
    parseStopWords(d.stopWords).length > 0 ||
    !!d.examplePosts.trim()
  )
}

async function createFromPending() {
  const d = pendingDraft.value
  if (!d) return
  const name = d.name.trim()
  if (!name) {
    toastError('Название бренда обязательно')
    return
  }

  guardAction(async () => {
    isCreating.value = true
    try {
      // Backend POST accepts only name + contentLanguage, so brief fields
      // go via a follow-up PATCH. See lib-modules/workspaces/helpers/api.ts.
      const created = await createWorkspace({
        name,
        contentLanguage: getLanguage() ?? 'ru',
      })
      if (!created) {
        toastError('Не удалось создать бренд')
        return
      }

      let final = created
      if (briefFilled(d)) {
        const updated = await updateWorkspace(created.id, {
          name,
          industry: d.industry.trim() || null,
          businessDescription: d.businessDescription.trim() || null,
          targetAudience: d.targetAudience.trim() || null,
          toneOfVoice: d.toneOfVoice.trim() || null,
          stopWords: parseStopWords(d.stopWords),
          examplePosts: d.examplePosts.trim() || null,
        })
        if (updated) final = updated
        else toastError('Бренд создан, но бриф не сохранился')
      }

      // Force-seed the draft from the post-PATCH workspace: the deep watcher
      // creates a draft as soon as POST pushes to the store, which would
      // otherwise cache an empty-brief draft before PATCH lands.
      drafts[final.id] = toDraft(final)
      pendingDraft.value = null
      openValue.value = final.id
      toastChangesSavedSuccess(t_)
    } catch (e) {
      console.error('[WorkspacesListPage] create failed:', e)
      toastError('Не удалось создать бренд')
    } finally {
      isCreating.value = false
    }
  })
}

function toDraft(w: WorkspaceDto): DraftForm {
  return {
    name: w.name ?? '',
    industry: w.industry ?? '',
    businessDescription: w.businessDescription ?? '',
    targetAudience: w.targetAudience ?? '',
    toneOfVoice: w.toneOfVoice ?? '',
    stopWords: (w.stopWords ?? []).join(', '),
    examplePosts: w.examplePosts ?? '',
  }
}

function ensureDraft(w: WorkspaceDto) {
  if (!drafts[w.id]) drafts[w.id] = toDraft(w)
}

function isDirty(w: WorkspaceDto): boolean {
  const d = drafts[w.id]
  if (!d) return false
  const current = toDraft(w)
  return (
    d.name !== current.name ||
    d.industry !== current.industry ||
    d.businessDescription !== current.businessDescription ||
    d.targetAudience !== current.targetAudience ||
    d.toneOfVoice !== current.toneOfVoice ||
    d.stopWords !== current.stopWords ||
    d.examplePosts !== current.examplePosts
  )
}

function resetDraft(w: WorkspaceDto) {
  drafts[w.id] = toDraft(w)
}

const parseStopWords = (input: string): string[] =>
  input.split(/[,;\n]/).map((w) => w.trim()).filter(Boolean)

async function saveDraft(w: WorkspaceDto) {
  const d = drafts[w.id]
  if (!d) return
  if (!d.name.trim()) {
    toastError('Название бренда обязательно')
    return
  }

  guardAction(async () => {
    savingId.value = w.id
    try {
      const updated = await updateWorkspace(w.id, {
        name: d.name.trim(),
        industry: d.industry.trim() || null,
        businessDescription: d.businessDescription.trim() || null,
        targetAudience: d.targetAudience.trim() || null,
        toneOfVoice: d.toneOfVoice.trim() || null,
        stopWords: parseStopWords(d.stopWords),
        examplePosts: d.examplePosts.trim() || null,
      })
      if (updated) {
        drafts[w.id] = toDraft(updated)
        briefRefs[w.id]?.collapse()
        toastChangesSavedSuccess(t_)
      }
    } catch (e) {
      console.error('[WorkspacesListPage] save failed:', e)
      toastError('Не удалось сохранить изменения')
    } finally {
      savingId.value = null
    }
  })
}

function requestDelete(id: string) {
  deleteTarget.value = id
  deleteDialogOpen.value = true
}

async function confirmDelete() {
  const id = deleteTarget.value
  if (!id) return
  guardAction(async () => {
    deletingId.value = id
    try {
      const ok = await deleteWorkspace(id)
      if (ok) {
        delete drafts[id]
        delete accountsByWorkspace[id]
        delete accountsLoading[id]
        delete accountsLoaded[id]
        if (openValue.value === id) openValue.value = undefined
        toastDeleteSuccess(t_)
      }
    } finally {
      deletingId.value = null
      deleteTarget.value = null
    }
  })
}

function onAccountUnlinkRequest(workspaceId: string, accountId: string) {
  const acc = (accountsByWorkspace[workspaceId] ?? []).find(a => a.id === accountId)
  if (!acc) return
  pendingUnlinkAccount.value = { workspaceId, account: acc }
  unlinkAccountDialogOpen.value = true
}

async function confirmAccountUnlink() {
  const p = pendingUnlinkAccount.value
  if (!p) return
  unlinkAccountDialogOpen.value = false
  // Бэк иногда отдаёт 4xx, но фактически удаляет аккаунт. Игнорим ошибку
  // DELETE и проверяем результат через рефетч — если в свежем списке id нет,
  // считаем успешным.
  try {
    await calendarApi.deleteSocialAccount(p.workspaceId, p.account.id)
  } catch (e) {
    console.warn('[WorkspacesListPage] DELETE returned error, will verify via refetch', e)
  }

  try {
    const fresh = await calendarApi.getSocialAccounts(p.workspaceId, true)
    accountsByWorkspace[p.workspaceId] = fresh
    if (!fresh.some(a => a.id === p.account.id)) {
      toast.success('Аккаунт отвязан', { position: getToasterPosition() })
    } else {
      toast.error('Не получилось отвязать аккаунт', { position: getToasterPosition() })
    }
  } catch (e) {
    console.error('[WorkspacesListPage] refetch after unlink failed:', e)
    toast.error('Не получилось отвязать аккаунт', { position: getToasterPosition() })
  } finally {
    pendingUnlinkAccount.value = null
  }
}

watch(
  workspaces,
  (list) => {
    for (const w of list) ensureDraft(w)
  },
  { immediate: true, deep: true }
)

onMounted(async () => {
  if (workspaces.value.length === 0) {
    await initialize()
  }
})
</script>

<template>
  <div class="flex flex-col h-full">
    <AppNavbar :breadcrumbs="[{ label: 'Бренды' }]">
      <template #actions>
        <Button size="sm" @click="openCreate" class="gap-2">
          <Plus class="h-3.5 w-3.5" />
          Создать бренд
        </Button>
      </template>
    </AppNavbar>

    <div class="flex-1 overflow-y-auto px-6 py-4">
      <div v-if="loading && workspaces.length === 0 && !pendingDraft" class="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 class="h-5 w-5 animate-spin mr-2" />
        Загрузка...
      </div>

      <div
        v-else-if="workspaces.length === 0 && !pendingDraft"
        class="flex flex-col items-center justify-center py-16 text-center text-muted-foreground"
      >
        <p class="mb-4">У вас ещё нет ни одного бренда.</p>
        <Button @click="openCreate" class="gap-2">
          <Plus class="h-4 w-4" />
          Создать первый бренд
        </Button>
      </div>

      <div v-else class="flex flex-col gap-2">
        <!-- Inline create slot: same card style as accordion items, but lives outside the accordion -->
        <!-- so its expand/collapse state is independent and doesn't fight the v-model. -->
        <div
          v-if="pendingDraft"
          class="rounded-md border border-brand/40 bg-background px-4 py-4"
        >
          <div class="flex items-center gap-2 pb-3 border-b border-border">
            <span class="flex items-center justify-center h-6 w-6 rounded-md bg-brand/10 text-brand">
              <Plus class="h-3.5 w-3.5" />
            </span>
            <span class="text-sm font-medium">Новый бренд</span>
          </div>
          <div class="space-y-4 pt-4">
            <div class="space-y-2">
              <Label for="pending-name">
                {{ t_('addClient.brandName') }} <span class="text-red-500">*</span>
              </Label>
              <Input
                id="pending-name"
                v-model="pendingDraft.name"
                :placeholder="t_('addClient.brandNamePlaceholder')"
              />
            </div>

            <BrandBriefSection
              id-prefix="pending"
              :draft="pendingDraft"
              :can-edit="!isCreating"
            />

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                :disabled="isCreating"
                @click="cancelPending"
              >
                {{ t_('cancel') }}
              </Button>
              <Button
                size="sm"
                class="gap-2"
                :disabled="!pendingDraft.name.trim() || isCreating"
                @click="createFromPending"
              >
                <Loader2 v-if="isCreating" class="h-4 w-4 animate-spin" />
                <Check v-else class="h-4 w-4" />
                Создать
              </Button>
            </div>
          </div>
        </div>

        <Accordion
          v-if="workspaces.length > 0"
          type="single"
          collapsible
          class="flex flex-col gap-2"
          v-model="openValue"
        >
        <AccordionItem
          v-for="w in workspaces"
          :key="w.id"
          :value="w.id"
          class="relative rounded-md border border-border bg-background px-4"
        >
          <AccordionTrigger class="hover:no-underline pr-20">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <span class="font-medium truncate">{{ w.name }}</span>
              <span
                v-if="w.industry"
                class="text-xs text-muted-foreground truncate hidden sm:inline"
              >
                · {{ w.industry }}
              </span>
              <span
                class="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground shrink-0"
              >
                {{ w.role }}
              </span>
            </div>
          </AccordionTrigger>

          <button
            v-if="canEdit(w.id)"
            type="button"
            class="absolute right-10 top-2.5 flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            :disabled="deletingId === w.id"
            :aria-label="t_('delete')"
            @click.stop="requestDelete(w.id)"
          >
            <Loader2 v-if="deletingId === w.id" class="h-4 w-4 animate-spin" />
            <Trash2 v-else class="h-4 w-4" />
          </button>

          <AccordionContent>
            <div v-if="drafts[w.id]" class="space-y-4 px-1 pt-2 pb-4">
              <BrandAccountsSection
                :workspace-id="w.id"
                :accounts="accountsByWorkspace[w.id] ?? []"
                :loading="accountsLoading[w.id] === true"
                :loaded="accountsLoaded[w.id] === true"
                @unlink="(id) => onAccountUnlinkRequest(w.id, id)"
              />

              <div class="space-y-2">
                <Label :for="`name-${w.id}`">
                  {{ t_('addClient.brandName') }} <span class="text-red-500">*</span>
                </Label>
                <Input
                  :id="`name-${w.id}`"
                  v-model="drafts[w.id].name"
                  :disabled="!canEdit(w.id)"
                />
              </div>

              <BrandBriefSection
                :ref="(el) => { briefRefs[w.id] = el as BriefSectionRef | null }"
                :id-prefix="w.id"
                :draft="drafts[w.id]"
                :can-edit="canEdit(w.id)"
              />

              <div class="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  :disabled="!isDirty(w) || savingId === w.id"
                  @click="resetDraft(w)"
                >
                  {{ t_('cancel') }}
                </Button>
                <Button
                  size="sm"
                  class="gap-2"
                  :disabled="!canEdit(w.id) || !isDirty(w) || savingId === w.id"
                  @click="saveDraft(w)"
                >
                  <Loader2 v-if="savingId === w.id" class="h-4 w-4 animate-spin" />
                  <Check v-else class="h-4 w-4" />
                  {{ t_('save') }}
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        </Accordion>
      </div>
    </div>

    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить бренд?</AlertDialogTitle>
          <AlertDialogDescription>
            Это действие необратимо. Все данные бренда будут удалены без возможности восстановления.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{{ t_('cancel') }}</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            @click="confirmDelete"
          >
            {{ t_('delete') }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog v-model:open="unlinkAccountDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Отвязать аккаунт?</AlertDialogTitle>
          <AlertDialogDescription>
            Канал «{{ pendingUnlinkAccount?.account.name }}» будет отвязан от бренда. Запланированные публикации в него не пройдут.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel class="cursor-pointer">{{ t_('cancel') }}</AlertDialogCancel>
          <AlertDialogAction
            class="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
            @click="confirmAccountUnlink"
          >
            Отвязать
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
