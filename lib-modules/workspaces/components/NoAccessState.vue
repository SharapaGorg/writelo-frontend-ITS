<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ShieldX } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'

const router = useRouter()
const { t } = useI18n()

function goHome() {
  router.push('/app/calendar')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 text-center px-6">
    <ShieldX class="h-12 w-12 text-muted-foreground" />
    <div class="space-y-1">
      <h2 class="text-lg font-semibold">{{ t('noAccess.title') }}</h2>
      <p class="text-sm text-muted-foreground max-w-sm">
        {{ t('noAccess.description') }}
      </p>
    </div>
    <Button variant="outline" size="sm" @click="goHome">{{ t('noAccess.back') }}</Button>
  </div>
</template>
