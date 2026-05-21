<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '~/components/ui/button'
import { Routes } from '~/scripts/shared/types'
import { cn } from '~/lib-modules/utils'

interface NuxtErrorLike {
  statusCode?: number
  statusMessage?: string
  message?: string
  url?: string
}

const props = defineProps<{
  error: NuxtErrorLike
}>()

const { t } = useI18n()

useTheme()

const statusCode = computed(() => Number(props.error?.statusCode) || 500)

type Variant = 'notFound' | 'badRequest' | 'serverError'

const variant = computed<Variant>(() => {
  const c = statusCode.value
  if (c === 404) return 'notFound'
  if (c >= 400 && c < 500) return 'badRequest'
  return 'serverError'
})

const isServerError = computed(() => variant.value === 'serverError')

const accentClass = computed(() =>
  isServerError.value ? 'text-destructive' : 'text-brand',
)

const title = computed(() => t(`errorPage.${variant.value}.title`))
const description = computed(() => t(`errorPage.${variant.value}.description`))

const showDevDetails = import.meta.dev && !!props.error?.message

function handleGoHome() {
  clearError({ redirect: Routes.landing })
}

function handleReload() {
  if (import.meta.client) {
    clearError({ redirect: window.location.pathname + window.location.search })
  } else {
    clearError({ redirect: '/' })
  }
}

useHead({
  title: `${statusCode.value} — Writelo`,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>

<template>
  <div class="min-h-dvh w-full bg-background text-foreground flex flex-col">
    <header class="px-6 md:px-12 py-6">
      <a
        href="/"
        class="inline-block font-display font-bold text-[18px] tracking-[-0.02em] text-foreground"
      >
        Writelo
      </a>
    </header>

    <main class="flex-1 flex items-center justify-center px-6 md:px-12 pb-16">
      <div class="w-full max-w-[640px] text-center">
        <div
          :class="cn(
            'font-display font-bold leading-[0.85] tracking-[-0.04em] tabular-nums',
            'text-[clamp(120px,22vw,240px)]',
            accentClass,
          )"
        >
          {{ statusCode }}
        </div>

        <p class="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {{ t('errorPage.code', { code: statusCode }) }}
        </p>

        <h1
          class="mt-10 font-display font-semibold text-[clamp(28px,4vw,40px)] leading-tight tracking-[-0.02em] text-foreground"
        >
          {{ title }}
        </h1>

        <p class="mt-4 text-base md:text-lg text-muted-foreground max-w-[480px] mx-auto">
          {{ description }}
        </p>

        <div class="mt-10 flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Button
            variant="default"
            size="lg"
            class="w-full sm:w-auto min-w-[180px]"
            @click="handleGoHome"
          >
            {{ t('errorPage.actions.goHome') }}
          </Button>
          <Button
            v-if="isServerError"
            variant="outline"
            size="lg"
            class="w-full sm:w-auto min-w-[180px]"
            @click="handleReload"
          >
            {{ t('errorPage.actions.retry') }}
          </Button>
        </div>

        <div
          v-if="showDevDetails"
          class="mt-12 mx-auto max-w-[560px] text-left rounded-md border border-border bg-muted/40 px-4 py-3"
        >
          <p class="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-2">
            dev only
          </p>
          <pre class="text-xs text-foreground/80 whitespace-pre-wrap break-words font-mono">{{ props.error?.message }}</pre>
          <p v-if="props.error?.url" class="mt-2 text-xs text-muted-foreground font-mono break-all">
            {{ props.error.url }}
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
