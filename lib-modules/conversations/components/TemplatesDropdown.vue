<template>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <div id="templates-button">
        <Button
          variant="outline"
          class="rounded-3xl h-9 max-w-[160px] md:max-w-full whitespace-nowrap overflow-hidden"
        >
          <FileText class="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span class="block overflow-hidden text-ellipsis whitespace-nowrap">
            {{ $t('templates.button') }}
          </span>
        </Button>
      </div>
    </DropdownMenuTrigger>

    <DropdownMenuContent class="w-64" align="start">
      <DropdownMenuLabel>{{ $t('templates.header') }}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        v-for="template in templates"
        :key="template.key"
        @click="selectTemplate(template)"
        class="cursor-pointer"
      >
        <component :is="template.icon" class="w-4 h-4 mr-2 flex-shrink-0" />
        {{ template.label }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import {
  FileText,
  Calendar,
  Video,
  Target,
  ShoppingCart,
  MessageCircle,
  Lightbulb,
  LayoutGrid
} from 'lucide-vue-next'

const { t } = useI18n()

const emit = defineEmits<{
  select: [text: string]
}>()

interface Template {
  key: string
  label: string
  prompt: string
  icon: any
}

const templates = computed<Template[]>(() => [
  {
    key: 'content-plan',
    label: t('templates.items.contentPlan'),
    prompt: t('templates.prompts.contentPlan'),
    icon: Calendar
  },
  {
    key: 'reels-ideas',
    label: t('templates.items.reelsIdeas'),
    prompt: t('templates.prompts.reelsIdeas'),
    icon: Video
  },
  {
    key: 'content-strategy',
    label: t('templates.items.contentStrategy'),
    prompt: t('templates.prompts.contentStrategy'),
    icon: Target
  },
  {
    key: 'sales-post',
    label: t('templates.items.salesPost'),
    prompt: t('templates.prompts.salesPost'),
    icon: ShoppingCart
  },
  {
    key: 'engagement-post',
    label: t('templates.items.engagementPost'),
    prompt: t('templates.prompts.engagementPost'),
    icon: MessageCircle
  },
  {
    key: 'expert-post',
    label: t('templates.items.expertPost'),
    prompt: t('templates.prompts.expertPost'),
    icon: Lightbulb
  },
  {
    key: 'content-categories',
    label: t('templates.items.contentCategories'),
    prompt: t('templates.prompts.contentCategories'),
    icon: LayoutGrid
  }
])

const selectTemplate = (template: Template) => {
  emit('select', template.prompt)
}
</script>
