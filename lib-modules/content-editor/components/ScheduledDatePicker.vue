<script setup lang="ts">
import { computed, ref } from 'vue'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import {
  CalendarCell,
  CalendarCellTrigger,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeader,
  CalendarHeading,
  CalendarNext,
  CalendarPrev,
  CalendarRoot,
} from 'reka-ui'
import { parseDate, type DateValue } from '@internationalized/date'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { TimeInput } from '~/components/ui/time-input'
import { cn } from '~/lib-modules/utils'

const props = defineProps<{
  modelValue: string | null
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

const open = ref(false)

const dateStr = computed(() => props.modelValue?.split('T')[0] ?? '')
const timeStr = computed(() => props.modelValue?.split('T')[1]?.slice(0, 5) ?? '')

const calendarValue = computed<DateValue | undefined>(() => {
  if (!dateStr.value) return undefined
  try {
    return parseDate(dateStr.value)
  } catch {
    return undefined
  }
})

const monthsRu = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

const buttonLabel = computed(() => {
  if (!props.modelValue || !dateStr.value) return 'Запланировать'
  const [, m, d] = dateStr.value.split('-')
  const dd = parseInt(d, 10)
  const mm = monthsRu[parseInt(m, 10) - 1]
  return timeStr.value ? `${dd} ${mm}, ${timeStr.value}` : `${dd} ${mm}`
})

function combine(date: string, time: string): string {
  return `${date}T${time || '00:00'}`
}

function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0')
}

function dateValueToString(d: DateValue): string {
  return `${pad(d.year, 4)}-${pad(d.month)}-${pad(d.day)}`
}

function dateToString(d: Date): string {
  return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function onDateChange(d: DateValue | undefined) {
  if (!d) return
  emit('update:modelValue', combine(dateValueToString(d), timeStr.value))
}

function onTimeChange(t: string) {
  // Time without a date is meaningless — silently fall back to today.
  const baseDate = dateStr.value || dateToString(new Date())
  emit('update:modelValue', combine(baseDate, t))
}

function applyPreset(date: Date, time: string) {
  emit('update:modelValue', `${dateToString(date)}T${time}`)
  open.value = false
}

function presetNow() {
  const n = new Date()
  applyPreset(n, `${pad(n.getHours())}:${pad(n.getMinutes())}`)
}

function presetTodayEvening() {
  applyPreset(new Date(), '18:00')
}

function presetTomorrowMorning() {
  const t = new Date()
  t.setDate(t.getDate() + 1)
  applyPreset(t, '10:00')
}

function presetNextWeek() {
  const t = new Date()
  t.setDate(t.getDate() + 7)
  applyPreset(t, '10:00')
}

function clear() {
  emit('update:modelValue', null)
}
</script>

<template>
  <div class="relative">
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <button
          type="button"
          :disabled="disabled"
          :class="cn(
            'inline-flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 pr-8 text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50',
            !modelValue ? 'text-muted-foreground' : 'text-foreground',
          )"
        >
          <CalendarIcon class="h-4 w-4 shrink-0" />
          <span class="truncate">{{ buttonLabel }}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0" align="end">
        <div class="space-y-3 p-3">
          <CalendarRoot
            v-slot="{ grid, weekDays }"
            :model-value="calendarValue"
            locale="ru-RU"
            weekday-format="short"
            class="select-none"
            @update:model-value="onDateChange"
          >
            <CalendarHeader class="flex items-center justify-between pb-2">
              <CalendarPrev class="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
                <ChevronLeft class="h-4 w-4" />
              </CalendarPrev>
              <CalendarHeading class="text-sm font-medium capitalize" />
              <CalendarNext class="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
                <ChevronRight class="h-4 w-4" />
              </CalendarNext>
            </CalendarHeader>
            <CalendarGrid v-for="month in grid" :key="month.value.toString()" class="w-full border-collapse">
              <CalendarGridHead>
                <CalendarGridRow class="flex">
                  <CalendarHeadCell
                    v-for="day in weekDays"
                    :key="day"
                    class="w-8 text-center text-xs font-normal capitalize text-muted-foreground"
                  >
                    {{ day }}
                  </CalendarHeadCell>
                </CalendarGridRow>
              </CalendarGridHead>
              <CalendarGridBody>
                <CalendarGridRow
                  v-for="(weekDates, idx) in month.rows"
                  :key="`row-${idx}`"
                  class="mt-1 flex w-full"
                >
                  <CalendarCell
                    v-for="weekDate in weekDates"
                    :key="weekDate.toString()"
                    :date="weekDate"
                    class="relative w-8 p-0 text-center text-sm"
                  >
                    <CalendarCellTrigger
                      :day="weekDate"
                      :month="month.value"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring data-[disabled]:opacity-30 data-[outside-view]:text-muted-foreground/40 data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[today]:font-bold"
                    />
                  </CalendarCell>
                </CalendarGridRow>
              </CalendarGridBody>
            </CalendarGrid>
          </CalendarRoot>

          <div class="space-y-2 border-t border-border pt-3">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs text-muted-foreground">Время</span>
              <TimeInput :model-value="timeStr" @update:model-value="onTimeChange" />
            </div>
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                class="rounded-md border border-border px-2 py-1 text-xs text-foreground hover:bg-accent"
                @click="presetNow"
              >
                Сейчас
              </button>
              <button
                type="button"
                class="rounded-md border border-border px-2 py-1 text-xs text-foreground hover:bg-accent"
                @click="presetTodayEvening"
              >
                Сегодня 18:00
              </button>
              <button
                type="button"
                class="rounded-md border border-border px-2 py-1 text-xs text-foreground hover:bg-accent"
                @click="presetTomorrowMorning"
              >
                Завтра 10:00
              </button>
              <button
                type="button"
                class="rounded-md border border-border px-2 py-1 text-xs text-foreground hover:bg-accent"
                @click="presetNextWeek"
              >
                Через неделю
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>

    <button
      v-if="modelValue && !disabled"
      type="button"
      class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      aria-label="Очистить дату"
      @click="clear"
    >
      <X class="h-3.5 w-3.5" />
    </button>
  </div>
</template>
