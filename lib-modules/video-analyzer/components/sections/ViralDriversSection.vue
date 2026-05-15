<script setup lang="ts">
import { computed } from 'vue'
import {
  HelpCircle, Zap, Heart, Flame, Bookmark, Trophy,
  Megaphone, Sparkles, Repeat, Flag,
} from 'lucide-vue-next'
import RawJsonViewer from '../RawJsonViewer.vue'
import { isViralDriversArray } from '../../helpers/sectionShape'
import type { ViralDriverDto, ViralDriverKey } from '../../types'

const props = defineProps<{
  drivers: unknown
  summary?: string | null
}>()

const drivers = computed<ViralDriverDto[] | null>(() =>
  isViralDriversArray(props.drivers) ? (props.drivers as ViralDriverDto[]) : null,
)

const summary = computed(() => {
  const s = props.summary
  return s && s.trim() ? s : null
})

const DRIVER_META: Record<ViralDriverKey, { label: string; icon: typeof Flag; description: string }> = {
  curiosity_gap: {
    label: 'Открытая петля',
    icon: HelpCircle,
    description: 'Payoff отложен до конца — зритель досматривает за разрядкой',
  },
  pattern_interrupt: {
    label: 'Паттерн-интерапт',
    icon: Zap,
    description: 'Неожиданный визуальный или смысловой слом сбрасывает внимание',
  },
  identity_relatability: {
    label: 'Релейтабельность',
    icon: Heart,
    description: '«Это прямо про меня», сильное узнавание в группе',
  },
  emotional_spike: {
    label: 'Эмоциональный пик',
    icon: Flame,
    description: 'Шок, восторг, злость, ностальгия — резкая реакция',
  },
  utility_save_worthy: {
    label: 'Полезное → сохранить',
    icon: Bookmark,
    description: 'Лайфхак, чек-лист, референс — есть зачем сохранить',
  },
  social_currency: {
    label: 'Социальная валюта',
    icon: Trophy,
    description: '«Я выгляжу умно/в-теме, если поделюсь»',
  },
  controversy_hot_take: {
    label: 'Спорное мнение',
    icon: Megaphone,
    description: 'Провоцирует спор в комментариях',
  },
  production_novelty: {
    label: 'Новизна формата',
    icon: Sparkles,
    description: 'Новый приём, переход или формат, которого зритель не видел',
  },
  loop_rewatch: {
    label: 'Закольцованность',
    icon: Repeat,
    description: 'Сделан для пересмотра — концовка кормит начало',
  },
}

function meta(key: string) {
  return DRIVER_META[key as ViralDriverKey] ?? {
    label: key,
    icon: Flag,
    description: '',
  }
}
</script>

<template>
  <section v-if="drivers || summary" class="space-y-3">
    <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Виральный потенциал</h3>

    <div class="space-y-3 rounded-lg border border-border bg-card p-4">
      <p
        v-if="summary"
        class="text-sm leading-relaxed text-foreground"
      >{{ summary }}</p>

      <div v-if="drivers && drivers.length" class="space-y-2">
        <div
          v-for="(d, i) in drivers"
          :key="i"
          class="flex gap-3 rounded-md border border-border bg-background p-3"
        >
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <component :is="meta(d.driver).icon" class="h-4 w-4" />
          </div>
          <div class="min-w-0 flex-1 space-y-1">
            <div class="flex flex-wrap items-baseline gap-2">
              <span class="text-sm font-semibold">{{ meta(d.driver).label }}</span>
              <span
                v-if="i === 0"
                class="rounded-md bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand"
              >Главный драйвер</span>
              <span
                v-if="meta(d.driver).description"
                class="text-[11px] text-muted-foreground"
              >· {{ meta(d.driver).description }}</span>
            </div>
            <p
              v-if="d.driver_evidence_ru"
              class="text-sm leading-relaxed text-muted-foreground"
            >{{ d.driver_evidence_ru }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Raw fallback only when prop was sent but not in expected shape. -->
  <RawJsonViewer
    v-else-if="props.drivers !== null && props.drivers !== undefined"
    :value="props.drivers"
  />
</template>
