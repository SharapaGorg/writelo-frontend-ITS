<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex flex-col gap-y-4" id="client-create-modal">
        <DialogHeader>
          <DialogTitle>
            {{ isEditMode ? t('addClient.edit-header') : t('addClient.header') }}
          </DialogTitle>
          <DialogDescription>
            {{ isEditMode ? t('addClient.edit-sub-header') : t('addClient.sub-header') }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-5">
          <!-- 1. Brand Name (required) -->
          <div class="space-y-2">
            <Label for="brandName" class="text-sm font-medium">
              {{ t('addClient.brandName') }} <span class="text-red-500">*</span>
            </Label>
            <Input
              v-model="form.brandName"
              id="brandName"
              :placeholder="t('addClient.brandNamePlaceholder')"
              ref="nameInput"
            />
          </div>

          <!-- 2. Niche -->
          <div class="space-y-2">
            <Label for="niche" class="text-sm font-medium">{{ t('addClient.niche') }}</Label>
            <div class="flex gap-2 flex-wrap mb-2">
              <Button
                v-for="preset in nichePresets"
                :key="preset.key"
                variant="outline"
                size="sm"
                type="button"
                @click="form.niche = preset.value"
                :class="{ 'bg-primary/10 border-primary': form.niche === preset.value }"
              >
                {{ preset.label }}
              </Button>
            </div>
            <Input
              v-model="form.niche"
              id="niche"
              :placeholder="t('addClient.nichePlaceholder')"
            />
          </div>

          <!-- 3. Description -->
          <div class="space-y-2">
            <Label for="description" class="text-sm font-medium">{{ t('addClient.description') }}</Label>
            <Textarea
              v-model="form.description"
              id="description"
              :rows="3"
              :placeholder="t('addClient.descriptionPlaceholder')"
            />
          </div>

          <!-- 4. Target Audience -->
          <div class="space-y-2">
            <Label for="targetAudience" class="text-sm font-medium">{{ t('addClient.targetAudience') }}</Label>
            <Textarea
              v-model="form.targetAudience"
              id="targetAudience"
              :rows="2"
              :placeholder="t('addClient.targetAudiencePlaceholder')"
            />
          </div>

          <!-- 5. Communication Style -->
          <div class="space-y-2">
            <Label for="communicationStyle" class="text-sm font-medium">{{ t('addClient.communicationStyle') }}</Label>
            <div class="flex gap-2 flex-wrap mb-2">
              <Button
                v-for="preset in stylePresets"
                :key="preset.key"
                variant="outline"
                size="sm"
                type="button"
                @click="selectStyle(preset)"
                :class="{ 'bg-primary/10 border-primary': selectedStyleKey === preset.key }"
              >
                {{ preset.label }}
              </Button>
            </div>
            <Textarea
              v-model="form.communicationStyle"
              id="communicationStyle"
              :rows="2"
              :placeholder="t('addClient.communicationStylePlaceholder')"
            />
          </div>

          <!-- 6. Stop Words -->
          <div class="space-y-2">
            <Label for="stopWords" class="text-sm font-medium">{{ t('addClient.stopWords') }}</Label>
            <Input
              v-model="form.stopWords"
              id="stopWords"
              :placeholder="t('addClient.stopWordsPlaceholder')"
            />
          </div>

          <!-- 7. Post Examples (optional) -->
          <div class="space-y-2">
            <Label for="postExamples" class="text-sm font-medium">{{ t('addClient.postExamples') }}</Label>
            <Textarea
              v-model="form.postExamples"
              id="postExamples"
              :rows="8"
              :placeholder="t('addClient.postExamplesPlaceholder')"
            />
          </div>
        </div>

        <DialogFooter class="flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">{{ t('cancel') }}</Button>
          </DialogClose>
          <Button @click="handleSave" :disabled="!form.brandName.trim() || isSaving">
            <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
            {{ isEditMode ? t('addClient.edit-action-button') : t('addClient.action-button') }}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Loader2 } from 'lucide-vue-next'
import { useWorkspaces } from '../composables/useWorkspaces'
import { useDemoGuard } from '~/lib-modules/demo-mode'
import { useSettings } from '~/composables/settings'

const { t } = useI18n()
const { guardAction } = useDemoGuard()
const { createWorkspace, updateWorkspace, getWorkspaceById } = useWorkspaces()
const { getLanguage } = useSettings()

const props = defineProps<{
  open: boolean
  workspaceId?: string | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [workspaceId: string]
}>()

const nameInput = ref<HTMLInputElement>()
const isSaving = ref(false)
const selectedStyleKey = ref<string | null>(null)

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const isEditMode = computed(() => !!props.workspaceId)

interface BriefForm {
  brandName: string
  niche: string
  description: string
  targetAudience: string
  communicationStyle: string
  stopWords: string
  postExamples: string
}

const form = reactive<BriefForm>({
  brandName: '',
  niche: '',
  description: '',
  targetAudience: '',
  communicationStyle: '',
  stopWords: '',
  postExamples: ''
})

const nichePresets = computed(() => [
  { key: 'beauty', label: t('addClient.niches.beautySalon'), value: t('addClient.niches.beautySalon') },
  { key: 'auto', label: t('addClient.niches.autoService'), value: t('addClient.niches.autoService') },
  { key: 'coffee', label: t('addClient.niches.coffeeShop'), value: t('addClient.niches.coffeeShop') },
  { key: 'fitness', label: t('addClient.niches.fitness'), value: t('addClient.niches.fitness') },
  { key: 'clothing', label: t('addClient.niches.clothingStore'), value: t('addClient.niches.clothingStore') },
  { key: 'restaurant', label: t('addClient.niches.restaurant'), value: t('addClient.niches.restaurant') },
  { key: 'dental', label: t('addClient.niches.dental'), value: t('addClient.niches.dental') },
  { key: 'realestate', label: t('addClient.niches.realEstate'), value: t('addClient.niches.realEstate') }
])

const stylePresets = computed(() => [
  { key: 'friendly', label: t('addClient.styles.friendly'), value: t('addClient.styles.friendlyDesc') },
  { key: 'formal', label: t('addClient.styles.formal'), value: t('addClient.styles.formalDesc') },
  { key: 'expert', label: t('addClient.styles.expert'), value: t('addClient.styles.expertDesc') },
  { key: 'provocative', label: t('addClient.styles.provocative'), value: t('addClient.styles.provocativeDesc') }
])

const selectStyle = (preset: { key: string; label: string; value: string }) => {
  form.communicationStyle = preset.value
  selectedStyleKey.value = preset.key
}

const parseStopWords = (input: string): string[] => {
  return input
    .split(/[,;\n]/)
    .map(w => w.trim())
    .filter(Boolean)
}

const resetForm = () => {
  form.brandName = ''
  form.niche = ''
  form.description = ''
  form.targetAudience = ''
  form.communicationStyle = ''
  form.stopWords = ''
  form.postExamples = ''
  selectedStyleKey.value = null
}

const hydrateFromWorkspace = (workspaceId: string) => {
  const workspace = getWorkspaceById(workspaceId)
  if (!workspace) {
    resetForm()
    return
  }
  form.brandName = workspace.name ?? ''
  form.niche = workspace.industry ?? ''
  form.description = workspace.businessDescription ?? ''
  form.targetAudience = workspace.targetAudience ?? ''
  form.communicationStyle = workspace.toneOfVoice ?? ''
  form.stopWords = (workspace.stopWords ?? []).join(', ')
  form.postExamples = workspace.examplePosts ?? ''
  selectedStyleKey.value =
    stylePresets.value.find((p) => p.value === workspace.toneOfVoice)?.key ?? null
}

watch(
  () => [props.open, props.workspaceId] as const,
  ([open, id]) => {
    if (!open) return
    if (id) {
      hydrateFromWorkspace(id)
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

const handleSave = () => {
  if (!form.brandName.trim() || isSaving.value) return

  guardAction(async () => {
    isSaving.value = true

    try {
      const name = form.brandName.trim()
      const stopWords = parseStopWords(form.stopWords)
      const briefFilled =
        !!form.niche.trim() ||
        !!form.description.trim() ||
        !!form.targetAudience.trim() ||
        !!form.communicationStyle.trim() ||
        stopWords.length > 0 ||
        !!form.postExamples.trim()

      let workspaceId = props.workspaceId ?? null

      if (!workspaceId) {
        const workspace = await createWorkspace({
          name,
          contentLanguage: getLanguage() ?? 'ru',
        })
        if (!workspace) throw new Error('Failed to create workspace')
        workspaceId = workspace.id
      }

      // POST only accepts name + contentLanguage, so brief fields go via PATCH.
      // Skip the PATCH when nothing to set: avoids a pointless round-trip and
      // a plan-gated 403 for users who just typed a name.
      const nameChanged = isEditMode.value && props.workspaceId
        ? (getWorkspaceById(props.workspaceId)?.name ?? '') !== name
        : false

      if (briefFilled || nameChanged) {
        await updateWorkspace(workspaceId, {
          name,
          industry: form.niche.trim() || null,
          businessDescription: form.description.trim() || null,
          targetAudience: form.targetAudience.trim() || null,
          toneOfVoice: form.communicationStyle.trim() || null,
          stopWords,
          examplePosts: form.postExamples.trim() || null,
        })
      }

      emit('save', workspaceId)

      isOpen.value = false
      resetForm()
    } catch (error) {
      console.error('Failed to save workspace:', error)
    } finally {
      isSaving.value = false
    }
  })
}
</script>
