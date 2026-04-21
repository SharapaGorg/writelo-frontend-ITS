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
import WorkspaceCreateWindow from './WorkspaceCreateWindow.vue'
import { useWorkspaces } from '../composables/useWorkspaces'
import { useDemoGuard } from '~/lib-modules/demo-mode'
import { toastError, toastChangesSavedSuccess, toastDeleteSuccess } from '~/scripts/features/utils/toater'
import type { WorkspaceDto } from '../types'

const { t: t_ } = useI18n()
const { guardAction } = useDemoGuard()
const { workspaces, loading, initialize, updateWorkspace, deleteWorkspace, canEdit, isOwner } =
  useWorkspaces()

const createOpen = ref(false)
const openValue = ref<string | undefined>(undefined)
const savingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const confirmDeleteId = ref<string | null>(null)

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

async function confirmDelete() {
  const id = confirmDeleteId.value
  if (!id) return
  guardAction(async () => {
    deletingId.value = id
    try {
      const ok = await deleteWorkspace(id)
      if (ok) {
        delete drafts[id]
        if (openValue.value === id) openValue.value = undefined
        toastDeleteSuccess(t_)
      }
    } finally {
      deletingId.value = null
      confirmDeleteId.value = null
    }
  })
}

watch(
  workspaces,
  (list) => {
    for (const w of list) ensureDraft(w)
  },
  { immediate: true, deep: true }
)

function handleCreated(workspaceId: string) {
  openValue.value = workspaceId
}

onMounted(async () => {
  if (workspaces.value.length === 0) {
    await initialize()
  }
})
</script>

<template>
  <div class="flex flex-col h-full bg-background">
    <header class="flex items-center justify-between px-6 py-4 border-b border-border">
      <div>
        <h1 class="text-xl font-semibold">Бренды</h1>
        <p class="text-sm text-muted-foreground">
          Управляйте воркспейсами: просматривайте и редактируйте бриф для каждого бренда.
        </p>
      </div>
      <Button @click="createOpen = true" class="gap-2">
        <Plus class="h-4 w-4" />
        Создать бренд
      </Button>
    </header>

    <div class="flex-1 overflow-y-auto px-6 py-4">
      <div v-if="loading && workspaces.length === 0" class="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 class="h-5 w-5 animate-spin mr-2" />
        Загрузка...
      </div>

      <div
        v-else-if="workspaces.length === 0"
        class="flex flex-col items-center justify-center py-16 text-center text-muted-foreground"
      >
        <p class="mb-4">У вас ещё нет ни одного бренда.</p>
        <Button @click="createOpen = true" class="gap-2">
          <Plus class="h-4 w-4" />
          Создать первый бренд
        </Button>
      </div>

      <Accordion
        v-else
        type="single"
        collapsible
        class="flex flex-col gap-2"
        v-model="openValue"
      >
        <AccordionItem
          v-for="w in workspaces"
          :key="w.id"
          :value="w.id"
          class="rounded-lg border border-border bg-card px-4"
        >
          <AccordionTrigger class="hover:no-underline">
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

          <AccordionContent>
            <div v-if="drafts[w.id]" class="space-y-4 pt-2 pb-4">
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

              <div class="space-y-2">
                <Label :for="`industry-${w.id}`">{{ t_('addClient.niche') }}</Label>
                <Input
                  :id="`industry-${w.id}`"
                  v-model="drafts[w.id].industry"
                  :disabled="!canEdit(w.id)"
                  :placeholder="t_('addClient.nichePlaceholder')"
                />
              </div>

              <div class="space-y-2">
                <Label :for="`description-${w.id}`">{{ t_('addClient.description') }}</Label>
                <Textarea
                  :id="`description-${w.id}`"
                  v-model="drafts[w.id].businessDescription"
                  :disabled="!canEdit(w.id)"
                  :rows="3"
                  :placeholder="t_('addClient.descriptionPlaceholder')"
                />
              </div>

              <div class="space-y-2">
                <Label :for="`audience-${w.id}`">{{ t_('addClient.targetAudience') }}</Label>
                <Textarea
                  :id="`audience-${w.id}`"
                  v-model="drafts[w.id].targetAudience"
                  :disabled="!canEdit(w.id)"
                  :rows="2"
                  :placeholder="t_('addClient.targetAudiencePlaceholder')"
                />
              </div>

              <div class="space-y-2">
                <Label :for="`tone-${w.id}`">{{ t_('addClient.communicationStyle') }}</Label>
                <Textarea
                  :id="`tone-${w.id}`"
                  v-model="drafts[w.id].toneOfVoice"
                  :disabled="!canEdit(w.id)"
                  :rows="2"
                  :placeholder="t_('addClient.communicationStylePlaceholder')"
                />
              </div>

              <div class="space-y-2">
                <Label :for="`stop-${w.id}`">{{ t_('addClient.stopWords') }}</Label>
                <Input
                  :id="`stop-${w.id}`"
                  v-model="drafts[w.id].stopWords"
                  :disabled="!canEdit(w.id)"
                  :placeholder="t_('addClient.stopWordsPlaceholder')"
                />
              </div>

              <div class="space-y-2">
                <Label :for="`examples-${w.id}`">{{ t_('addClient.postExamples') }}</Label>
                <Textarea
                  :id="`examples-${w.id}`"
                  v-model="drafts[w.id].examplePosts"
                  :disabled="!canEdit(w.id)"
                  :rows="6"
                  :placeholder="t_('addClient.postExamplesPlaceholder')"
                />
              </div>

              <div class="flex items-center justify-between gap-2 pt-2 border-t border-border">
                <Button
                  v-if="isOwner(w.id)"
                  variant="ghost"
                  size="sm"
                  class="text-destructive hover:text-destructive gap-2"
                  :disabled="deletingId === w.id"
                  @click="confirmDeleteId = w.id"
                >
                  <Loader2 v-if="deletingId === w.id" class="h-4 w-4 animate-spin" />
                  <Trash2 v-else class="h-4 w-4" />
                  {{ t_('delete') }}
                </Button>
                <span v-else />

                <div class="flex items-center gap-2">
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
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>

    <WorkspaceCreateWindow v-model:open="createOpen" @save="handleCreated" />

    <AlertDialog
      :open="confirmDeleteId !== null"
      @update:open="(v: boolean) => !v && (confirmDeleteId = null)"
    >
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
  </div>
</template>
