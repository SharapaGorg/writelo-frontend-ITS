<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex flex-col gap-y-4" id="client-create-modal">
        <DialogHeader>
          <DialogTitle>{{ t('addClient.header') }}</DialogTitle>
          <DialogDescription>
            {{ t('addClient.sub-header') }}
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
            {{ t('addClient.action-button') }}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
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
import { ProjectsApiController } from '../helpers/api'

const { t } = useI18n()
const api = new ProjectsApiController()

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [projectId: string]
}>()

const nameInput = ref<HTMLInputElement>()
const isSaving = ref(false)
const selectedStyleKey = ref<string | null>(null)

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

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

const buildPrompt = (): string => {
  const parts: string[] = []

  parts.push(`Ты — SMM-копирайтер для бренда "${form.brandName}".`)

  if (form.niche) {
    parts.push(`\nНиша: ${form.niche}.`)
  }

  if (form.description) {
    parts.push(`\nОписание: ${form.description}.`)
  }

  if (form.targetAudience) {
    parts.push(`\nЦелевая аудитория: ${form.targetAudience}.`)
  }

  if (form.communicationStyle) {
    parts.push(`\nСтиль общения: ${form.communicationStyle}.`)
  }

  if (form.stopWords) {
    parts.push(`\nНикогда не используй следующие слова и выражения: ${form.stopWords}.`)
  }

  if (form.postExamples) {
    parts.push(`\nОриентируйся на следующие примеры постов:\n${form.postExamples}`)
  }

  parts.push(`\nВсегда пиши в указанном стиле. Тексты должны быть живыми, без воды и канцелярита. Не используй чрезмерные эмодзи и восклицательные знаки.`)

  return parts.join('')
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

const handleSave = async () => {
  if (!form.brandName.trim() || isSaving.value) return

  isSaving.value = true

  try {
    // Step 1: Create project with brand name as title
    const project = await api.createProject(form.brandName.trim())

    // Step 2: Update project with assembled custom instructions
    const customInstructions = buildPrompt()
    await api.editProject(project.id, form.brandName.trim(), customInstructions)

    // Emit save event with project ID
    emit('save', project.id)

    // Close dialog and reset form
    isOpen.value = false
    resetForm()
  } catch (error) {
    console.error('Failed to create client:', error)
  } finally {
    isSaving.value = false
  }
}
</script>
