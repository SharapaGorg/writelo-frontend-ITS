<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ReelItem } from '../types'

const props = defineProps<{
  isOpen: boolean
  reel: ReelItem | null
}>()

const emit = defineEmits<{
  close: []
  drop: [date: string, reel: ReelItem]
}>()

const currentMonth = ref(new Date())
const dragOverDate = ref<string | null>(null)

const monthName = computed(() => {
  return currentMonth.value.toLocaleDateString('ru', { month: 'long', year: 'numeric' })
})

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  let startDayOfWeek = firstDay.getDay() - 1
  if (startDayOfWeek < 0) startDayOfWeek = 6

  const days: { date: string; dayNumber: number; isCurrentMonth: boolean; isToday: boolean }[] = []

  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i)
    days.push({
      date: formatDate(d),
      dayNumber: prevMonthLastDay - i,
      isCurrentMonth: false,
      isToday: false
    })
  }

  // Current month days
  const today = new Date()
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i)
    days.push({
      date: formatDate(d),
      dayNumber: i,
      isCurrentMonth: true,
      isToday: d.toDateString() === today.toDateString()
    })
  }

  // Next month days to fill grid (6 rows * 7 = 42)
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push({
      date: formatDate(d),
      dayNumber: i,
      isCurrentMonth: false,
      isToday: false
    })
  }

  return days
})

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function prevMonth() {
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() - 1)
  currentMonth.value = d
}

function nextMonth() {
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() + 1)
  currentMonth.value = d
}

function handleDragOver(date: string, e: DragEvent) {
  e.preventDefault()
  dragOverDate.value = date
}

function handleDragLeave() {
  dragOverDate.value = null
}

function handleDrop(date: string, e: DragEvent) {
  e.preventDefault()
  dragOverDate.value = null
  if (props.reel) {
    emit('drop', date, props.reel)
  }
}

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
    @click="handleOverlayClick"
  >
    <!-- Modal card -->
    <div class="bg-white dark:bg-zinc-800 rounded-xl w-[600px] p-6 shadow-xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
          Добавить в календарь
        </h2>
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          @click="emit('close')"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Month navigation -->
      <div class="flex items-center justify-between mb-4">
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          @click="prevMonth"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span class="text-lg font-medium text-zinc-800 dark:text-zinc-100 capitalize">
          {{ monthName }}
        </span>
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          @click="nextMonth"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <!-- Week days header -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div
          v-for="day in weekDays"
          :key="day"
          class="text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 py-2"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar grid -->
      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="day in calendarDays"
          :key="day.date"
          class="aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all border-2"
          :class="[
            day.isCurrentMonth
              ? 'text-zinc-800 dark:text-zinc-200'
              : 'text-zinc-400 dark:text-zinc-600',
            day.isToday
              ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500'
              : 'border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700',
            dragOverDate === day.date
              ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
              : ''
          ]"
          @dragover="handleDragOver(day.date, $event)"
          @dragleave="handleDragLeave"
          @drop="handleDrop(day.date, $event)"
        >
          {{ day.dayNumber }}
        </button>
      </div>
    </div>
  </div>
</template>
