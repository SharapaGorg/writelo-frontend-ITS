<script setup lang="ts">
import { ExternalLink, Languages, Gift, ListOrdered, Lightbulb } from 'lucide-vue-next'
import {
  PlatformIcon,
  SummarySection,
  HooksSection,
  StructureSection,
  FunnelSection,
  TagsSection,
  ImprovementsSection,
  TranscriptionSection,
} from '~/lib-modules/video-analyzer'

// Hardcoded sample matching real ShortVideoAnalysisDto shape — fed straight
// into the production section renderers so the showcase reflects the real UI.
const summary = {
  video_topic_ru: 'Как заполнить шапку профиля Instagram, чтобы подписчики не уходили',
  essence_ru:
    'Автор разбирает 3 ошибки в био эксперта и показывает, как переписать его за минуту, чтобы из любопытного зрителя сделать подписчика.',
  video_description_ru:
    'Динамичный экспертный рилс, snappy-монтаж, текст крупными плашками поверх кадра. Автор сравнивает «до/после» и заканчивает CTA на бесплатный гайд в шапке профиля.',
}

const hooks = {
  text_hook_ru: '«Если у тебя такое био — ты теряешь подписчиков»',
  hook_phrase_ru: 'Покажу 3 ошибки за 30 секунд',
  visual_hook_ru: 'Скриншот реального профиля с красными зачёркиваниями',
}

const structure = {
  step1: {
    timing: '0:00–0:04',
    title_ru: 'Хук',
    details_ru: 'Крупный текст-обвинение + скриншот «плохого» био. Зритель узнаёт себя.',
  },
  step2: {
    timing: '0:04–0:18',
    title_ru: '3 ошибки',
    details_ru: 'Перечисление: общие фразы, нет оффера, нет CTA — каждая с примером и быстрой правкой.',
  },
  step3: {
    timing: '0:18–0:26',
    title_ru: 'Решение',
    details_ru: 'Формула «кому → что → как» и пример нового био на экране.',
  },
  step4: {
    timing: '0:26–0:30',
    title_ru: 'CTA',
    details_ru: 'Подписка + ссылка на бесплатный гайд по био в шапке профиля.',
  },
}

const funnel = {
  lead_magnet: true,
  traffic_destination: 'profile_link',
  cta_voice_visual_ru:
    '«Забирай шаблон био по ссылке в шапке — заполнишь за 5 минут»',
}

const tags = {
  niches: ['smm', 'experts'],
  formats: ['talking_head', 'screen_recording', 'before_after'],
}

const improvements = {
  quick_fixes_ru: [
    'Добавить таймкоды-плашки на каждой ошибке — зритель легче отследит структуру',
    'Усилить визуальный хук цветным маркером поверх скриншота',
  ],
  hook_improvements_ru: [
    'Заменить общую фразу на конкретику: «Био из 3 строк, которое теряет 70% подписчиков»',
  ],
  structure_improvements_ru: [
    'После CTA вернуть «до/после» одним кадром — закрепит вывод',
  ],
}

const transcription = {
  language: 'ru',
  text_ru:
    'Если у тебя такое био — ты теряешь подписчиков. Сейчас покажу 3 ошибки за 30 секунд и как их исправить.\n\nПервая — общие фразы вроде «помогаю людям». Вторая — нет оффера, не понятно, что ты предлагаешь. Третья — нет CTA, человек просто закрывает профиль.\n\nИсправляется одной формулой: кому → что → как. Забирай готовый шаблон по ссылке в шапке — заполнишь за 5 минут.',
  text_original:
    'Если у тебя такое био — ты теряешь подписчиков. Сейчас покажу 3 ошибки за 30 секунд и как их исправить...',
  on_screen_text:
    '3 ОШИБКИ В БИО → ИСПРАВЬ ЗА 5 МИНУТ\nКОМУ → ЧТО → КАК\nШАБЛОН В ШАПКЕ ↑',
  unclear_parts: 'null',
}
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden bg-background text-foreground">
    <div class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-3xl space-y-5 p-5">
        <!-- Meta header -->
        <header class="space-y-3 rounded-lg border border-border bg-card p-4">
          <div class="flex items-start gap-3">
            <PlatformIcon platform="instagram" size="lg" tinted />
            <div class="min-w-0 flex-1">
              <a
                href="#"
                tabindex="-1"
                class="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline break-all"
                @click.prevent
              >
                instagram.com/reel/CxA1b2C3
                <ExternalLink class="h-3 w-3 shrink-0 text-muted-foreground" />
              </a>
              <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span class="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-medium text-emerald-300">
                  Готово
                </span>
                <span>· сегодня, 14:02</span>
                <span class="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono">v1</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Stats chips -->
        <div class="flex flex-wrap gap-1.5">
          <span class="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1 text-xs font-medium text-foreground">
            <Languages class="h-3.5 w-3.5" />
            <span class="text-muted-foreground/80">Язык:</span>
            <span>RU</span>
          </span>
          <span class="inline-flex items-center gap-1.5 rounded-md bg-emerald-900/40 px-2 py-1 text-xs font-medium text-emerald-200">
            <Gift class="h-3.5 w-3.5" />
            <span class="text-emerald-200/80">Лид-магнит:</span>
            <span>есть</span>
          </span>
          <span class="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1 text-xs font-medium text-foreground">
            <ListOrdered class="h-3.5 w-3.5" />
            <span class="text-muted-foreground/80">Шагов:</span>
            <span>4</span>
          </span>
          <span class="inline-flex items-center gap-1.5 rounded-md bg-brand/10 px-2 py-1 text-xs font-medium text-brand">
            <Lightbulb class="h-3.5 w-3.5" />
            <span class="text-muted-foreground/80">Идей улучшений:</span>
            <span>4</span>
          </span>
        </div>

        <SummarySection :value="summary" />
        <HooksSection :value="hooks" />
        <StructureSection :value="structure" />
        <FunnelSection :value="funnel" />
        <TagsSection :value="tags" />
        <ImprovementsSection :value="improvements" />
        <TranscriptionSection :value="transcription" />
      </div>
    </div>
  </div>
</template>
