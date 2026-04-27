<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { InviteAcceptPage } from '~/lib-modules/team'

const route = useRoute()
const token = computed(() => String(route.params.token ?? ''))

definePageMeta({
  // No 'app' layout — public page accessible без логина.
})
</script>

<template>
  <InviteAcceptPage :token="token" />
</template>
