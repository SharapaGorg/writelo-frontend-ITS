<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PrimaryButton from './PrimaryButton.vue'
import { Routes } from '~/scripts/shared/types'

const props = withDefaults(
  defineProps<{
    section: string
    align?: 'center' | 'start'
    to?: string
  }>(),
  { align: 'center', to: Routes.app },
)

const { t } = useI18n()
const router = useRouter()
const { $trackGoal } = useNuxtApp()

function onClick() {
  $trackGoal('landing_cta_click', { button: `${props.section}_try_free` })
  router.push(props.to)
}
</script>

<template>
  <div
    class="mt-12 md:mt-16 flex"
    :class="align === 'center' ? 'justify-center' : 'justify-start'"
  >
    <PrimaryButton @click="onClick">
      {{ t('landingNew.sectionCta') }}
    </PrimaryButton>
  </div>
</template>
