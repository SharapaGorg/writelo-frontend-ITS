<script setup lang="ts">
import { Button } from '~/components/ui/button'
import DayCell from './DayCell.vue'
import type { CalendarPost } from '../types'

const props = defineProps<{
  currentMonth: Date
  selectedDate: string | null
  getPostsForDate: (date: string) => CalendarPost[]
  hasInfoEvent: (date: string) => boolean
}>()

// Format date as YYYY-MM-DD without timezone conversion
function formatDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const emit = defineEmits<{
  selectDate: [date: string]
  prevMonth: []
  nextMonth: []
  dropNews: [date: string, news: any]
  createPost: [date: string]
}>()

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const monthName = computed(() => {
  return props.currentMonth.toLocaleString('ru', { month: 'long', year: 'numeric' })
})

interface DayInfo {
  date: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
}

const calendarDays = computed((): DayInfo[] => {
  const year = props.currentMonth.getFullYear()
  const month = props.currentMonth.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Get Monday as first day of week (0 = Monday in our system)
  let startDay = firstDay.getDay() - 1
  if (startDay < 0) startDay = 6

  const days: DayInfo[] = []
  const today = formatDateLocal(new Date())

  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i
    const date = new Date(year, month - 1, dayNum)
    days.push({
      date: formatDateLocal(date),
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: false
    })
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    const dateStr = formatDateLocal(date)
    days.push({
      date: dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateStr === today
    })
  }

  // Next month days to fill 6 rows
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d)
    days.push({
      date: formatDateLocal(date),
      dayNumber: d,
      isCurrentMonth: false,
      isToday: false
    })
  }

  return days
})
</script>

<template>
  <div class="flex flex-col">
    <!-- Month navigation -->
    <div class="flex items-center justify-between px-4 py-3">
      <Button variant="ghost" size="sm" @click="emit('prevMonth')">
        ◄
      </Button>
      <h2 class="text-lg font-semibold capitalize text-zinc-900 dark:text-zinc-100">
        {{ monthName }}
      </h2>
      <Button variant="ghost" size="sm" @click="emit('nextMonth')">
        ►
      </Button>
    </div>

    <!-- Week days header -->
    <div class="grid grid-cols-7 gap-1 px-2 pb-2">
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-center text-xs font-medium text-zinc-500 py-2"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="grid grid-cols-7 gap-1 px-2">
      <DayCell
        v-for="day in calendarDays"
        :key="day.date"
        :date="day.date"
        :day-number="day.dayNumber"
        :is-current-month="day.isCurrentMonth"
        :is-today="day.isToday"
        :is-selected="selectedDate === day.date"
        :posts="getPostsForDate(day.date)"
        :has-info-event="hasInfoEvent(day.date)"
        @select="emit('selectDate', $event)"
        @drop-news="(date, news) => emit('dropNews', date, news)"
        @create-post="emit('createPost', $event)"
      />
    </div>
  </div>
</template>
