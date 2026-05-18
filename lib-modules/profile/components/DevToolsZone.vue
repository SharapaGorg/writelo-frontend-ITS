<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Crown, Wrench } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { ApiController } from '~/scripts/shared/api/controller'
import { getToasterPosition } from '~/scripts/features/utils/toater'

const $settings = useSettings()
const api = new ApiController()
const { t } = useI18n()

const userId = computed<string | null>(() => $settings.getUser()?.id ?? null)
const isGranting = ref(false)

async function grantBusiness() {
  if (!userId.value || isGranting.value) return
  isGranting.value = true
  try {
    await api.grantDevSubscription(userId.value)
    await $settings.refreshUserData()
    toast.success(t('devTools.granted'), { position: getToasterPosition() })
  } catch (e) {
    console.error('grantDevSubscription failed', e)
  } finally {
    isGranting.value = false
  }
}
</script>

<template>
  <section class="rounded-xl border border-dashed bg-card px-5 py-4 shadow-sm flex flex-col gap-3">
    <header class="flex items-center gap-2">
      <Wrench class="h-4 w-4 text-muted-foreground" />
      <span class="text-sm font-semibold">{{ t('devTools.header') }}</span>
      <span class="text-xs text-muted-foreground">{{ t('devTools.devOnly') }}</span>
    </header>

    <div class="flex flex-wrap items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        :disabled="!userId || isGranting"
        @click="grantBusiness"
      >
        <Crown class="h-4 w-4" />
        {{ t('devTools.grantBusiness') }}
      </Button>
    </div>
  </section>
</template>
