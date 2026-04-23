<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown, Sparkles } from 'lucide-vue-next'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { useBriefPresets } from '../helpers/brief-presets'

interface BriefDraft {
  industry: string
  businessDescription: string
  targetAudience: string
  toneOfVoice: string
  stopWords: string
  examplePosts: string
}

const props = defineProps<{
  idPrefix: string
  draft: BriefDraft
  canEdit: boolean
}>()

const { t: t_ } = useI18n()
const { nichePresets, stylePresets } = useBriefPresets()
const expanded = ref(false)

const fields = computed(() => [
  { key: 'industry', value: props.draft.industry },
  { key: 'businessDescription', value: props.draft.businessDescription },
  { key: 'targetAudience', value: props.draft.targetAudience },
  { key: 'toneOfVoice', value: props.draft.toneOfVoice },
  { key: 'stopWords', value: props.draft.stopWords },
  { key: 'examplePosts', value: props.draft.examplePosts },
])

const total = computed(() => fields.value.length)
const filledCount = computed(() =>
  fields.value.filter((f) => f.value.trim().length > 0).length,
)

const statusLabel = computed(() => {
  if (filledCount.value === 0) return 'Заполните, чтобы ИИ писал в стиле бренда'
  if (filledCount.value === total.value) return 'Бриф заполнен полностью'
  return `Заполнено ${filledCount.value} из ${total.value}`
})

function applyNiche(value: string) {
  if (!props.canEdit) return
  props.draft.industry = value
}

function applyStyle(value: string) {
  if (!props.canEdit) return
  props.draft.toneOfVoice = value
}

defineExpose({
  collapse: () => {
    expanded.value = false
  },
})
</script>

<template>
  <div
    :class="[
      'rounded-lg border overflow-hidden transition-colors',
      expanded
        ? 'border-purple-500/40 bg-purple-500/5 dark:bg-purple-400/5'
        : 'border-border bg-muted/20 hover:bg-muted/40',
    ]"
  >
    <button
      type="button"
      class="w-full flex items-center gap-3 px-4 py-3 text-left"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <span
        class="flex items-center justify-center w-9 h-9 rounded-md bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 text-purple-500 dark:text-purple-400 shrink-0"
      >
        <Sparkles class="h-5 w-5" />
      </span>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-medium">Бриф для ИИ</span>
          <span
            v-if="filledCount === total"
            class="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-600 dark:text-purple-400"
          >
            полный
          </span>
        </div>
        <div class="text-xs text-muted-foreground truncate">{{ statusLabel }}</div>
      </div>

      <div class="hidden sm:flex items-center gap-1 shrink-0">
        <span
          v-for="f in fields"
          :key="f.key"
          :class="[
            'w-1.5 h-1.5 rounded-full transition-colors duration-300',
            f.value.trim().length > 0
              ? 'bg-purple-500 dark:bg-purple-400'
              : 'bg-muted-foreground/25',
          ]"
        />
      </div>

      <ChevronDown
        :class="[
          'h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0',
          expanded && 'rotate-180',
        ]"
      />
    </button>

    <div
      :class="[
        'grid transition-[grid-template-rows] duration-200 ease-out',
        expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
      ]"
    >
      <div class="min-h-0 overflow-hidden">
        <div class="space-y-4 px-5 pb-4 pt-3 border-t border-border">
          <div class="space-y-2">
            <Label :for="`${idPrefix}-industry`">{{ t_('addClient.niche') }}</Label>
            <div class="flex gap-1.5 flex-wrap">
              <button
                v-for="preset in nichePresets"
                :key="preset.key"
                type="button"
                :disabled="!canEdit"
                :class="[
                  'px-2.5 py-1 text-xs rounded-full border transition-colors',
                  draft.industry === preset.value
                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-700 dark:text-purple-300'
                    : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50',
                  !canEdit && 'opacity-50 cursor-not-allowed',
                ]"
                @click="applyNiche(preset.value)"
              >
                {{ preset.label }}
              </button>
            </div>
            <Input
              :id="`${idPrefix}-industry`"
              v-model="draft.industry"
              :disabled="!canEdit"
              :placeholder="t_('addClient.nichePlaceholder')"
            />
          </div>

          <div class="space-y-2">
            <Label :for="`${idPrefix}-description`">
              {{ t_('addClient.description') }}
            </Label>
            <Textarea
              :id="`${idPrefix}-description`"
              v-model="draft.businessDescription"
              :disabled="!canEdit"
              :rows="3"
              :placeholder="t_('addClient.descriptionPlaceholder')"
            />
          </div>

          <div class="space-y-2">
            <Label :for="`${idPrefix}-audience`">
              {{ t_('addClient.targetAudience') }}
            </Label>
            <Textarea
              :id="`${idPrefix}-audience`"
              v-model="draft.targetAudience"
              :disabled="!canEdit"
              :rows="2"
              :placeholder="t_('addClient.targetAudiencePlaceholder')"
            />
          </div>

          <div class="space-y-2">
            <Label :for="`${idPrefix}-tone`">
              {{ t_('addClient.communicationStyle') }}
            </Label>
            <div class="flex gap-1.5 flex-wrap">
              <button
                v-for="preset in stylePresets"
                :key="preset.key"
                type="button"
                :disabled="!canEdit"
                :class="[
                  'px-2.5 py-1 text-xs rounded-full border transition-colors',
                  draft.toneOfVoice === preset.value
                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-700 dark:text-purple-300'
                    : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50',
                  !canEdit && 'opacity-50 cursor-not-allowed',
                ]"
                @click="applyStyle(preset.value)"
              >
                {{ preset.label }}
              </button>
            </div>
            <Textarea
              :id="`${idPrefix}-tone`"
              v-model="draft.toneOfVoice"
              :disabled="!canEdit"
              :rows="2"
              :placeholder="t_('addClient.communicationStylePlaceholder')"
            />
          </div>

          <div class="space-y-2">
            <Label :for="`${idPrefix}-stop`">{{ t_('addClient.stopWords') }}</Label>
            <Input
              :id="`${idPrefix}-stop`"
              v-model="draft.stopWords"
              :disabled="!canEdit"
              :placeholder="t_('addClient.stopWordsPlaceholder')"
            />
          </div>

          <div class="space-y-2">
            <Label :for="`${idPrefix}-examples`">
              {{ t_('addClient.postExamples') }}
            </Label>
            <Textarea
              :id="`${idPrefix}-examples`"
              v-model="draft.examplePosts"
              :disabled="!canEdit"
              :rows="6"
              :placeholder="t_('addClient.postExamplesPlaceholder')"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
