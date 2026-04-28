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

const props = withDefaults(
  defineProps<{
    idPrefix: string
    draft: BriefDraft
    canEdit: boolean
    initialExpanded?: boolean
  }>(),
  { initialExpanded: false },
)

const { t: t_ } = useI18n()
const { nichePresets, stylePresets } = useBriefPresets()
const expanded = ref(props.initialExpanded)

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
      'rounded-md border overflow-hidden transition-colors',
      expanded
        ? 'border-brand/40 bg-brand/5'
        : 'border-border bg-card hover:bg-secondary',
    ]"
  >
    <button
      type="button"
      class="w-full flex items-center gap-3 px-4 py-3 text-left"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <span
        class="flex items-center justify-center w-9 h-9 rounded-md bg-brand/10 text-brand shrink-0"
      >
        <Sparkles class="h-5 w-5" />
      </span>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-medium">Бриф для ИИ</span>
          <span
            v-if="filledCount === total"
            class="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-brand/15 text-brand"
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
              ? 'bg-brand'
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
            <div v-if="canEdit" class="flex gap-1.5 flex-wrap">
              <button
                v-for="preset in nichePresets"
                :key="preset.key"
                type="button"
                :class="[
                  'px-2.5 py-1 text-xs rounded-full border transition-colors',
                  draft.industry === preset.value
                    ? 'bg-brand/10 border-brand/50 text-brand'
                    : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50',
                ]"
                @click="applyNiche(preset.value)"
              >
                {{ preset.label }}
              </button>
            </div>
            <Input
              v-if="canEdit"
              :id="`${idPrefix}-industry`"
              v-model="draft.industry"
              :placeholder="t_('addClient.nichePlaceholder')"
            />
            <p v-else class="text-sm text-foreground py-1.5 whitespace-pre-wrap">{{ draft.industry || '—' }}</p>
          </div>

          <div class="space-y-2">
            <Label :for="`${idPrefix}-description`">
              {{ t_('addClient.description') }}
            </Label>
            <Textarea
              v-if="canEdit"
              :id="`${idPrefix}-description`"
              v-model="draft.businessDescription"
              :rows="3"
              :placeholder="t_('addClient.descriptionPlaceholder')"
            />
            <p v-else class="text-sm text-foreground py-1.5 whitespace-pre-wrap">{{ draft.businessDescription || '—' }}</p>
          </div>

          <div class="space-y-2">
            <Label :for="`${idPrefix}-audience`">
              {{ t_('addClient.targetAudience') }}
            </Label>
            <Textarea
              v-if="canEdit"
              :id="`${idPrefix}-audience`"
              v-model="draft.targetAudience"
              :rows="2"
              :placeholder="t_('addClient.targetAudiencePlaceholder')"
            />
            <p v-else class="text-sm text-foreground py-1.5 whitespace-pre-wrap">{{ draft.targetAudience || '—' }}</p>
          </div>

          <div class="space-y-2">
            <Label :for="`${idPrefix}-tone`">
              {{ t_('addClient.communicationStyle') }}
            </Label>
            <div v-if="canEdit" class="flex gap-1.5 flex-wrap">
              <button
                v-for="preset in stylePresets"
                :key="preset.key"
                type="button"
                :class="[
                  'px-2.5 py-1 text-xs rounded-full border transition-colors',
                  draft.toneOfVoice === preset.value
                    ? 'bg-brand/10 border-brand/50 text-brand'
                    : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50',
                ]"
                @click="applyStyle(preset.value)"
              >
                {{ preset.label }}
              </button>
            </div>
            <Textarea
              v-if="canEdit"
              :id="`${idPrefix}-tone`"
              v-model="draft.toneOfVoice"
              :rows="2"
              :placeholder="t_('addClient.communicationStylePlaceholder')"
            />
            <p v-else class="text-sm text-foreground py-1.5 whitespace-pre-wrap">{{ draft.toneOfVoice || '—' }}</p>
          </div>

          <div class="space-y-2">
            <Label :for="`${idPrefix}-stop`">{{ t_('addClient.stopWords') }}</Label>
            <Input
              v-if="canEdit"
              :id="`${idPrefix}-stop`"
              v-model="draft.stopWords"
              :placeholder="t_('addClient.stopWordsPlaceholder')"
            />
            <p v-else class="text-sm text-foreground py-1.5 whitespace-pre-wrap">{{ draft.stopWords || '—' }}</p>
          </div>

          <div class="space-y-2">
            <Label :for="`${idPrefix}-examples`">
              {{ t_('addClient.postExamples') }}
            </Label>
            <Textarea
              v-if="canEdit"
              :id="`${idPrefix}-examples`"
              v-model="draft.examplePosts"
              :rows="6"
              :placeholder="t_('addClient.postExamplesPlaceholder')"
            />
            <p v-else class="text-sm text-foreground py-1.5 whitespace-pre-wrap">{{ draft.examplePosts || '—' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
