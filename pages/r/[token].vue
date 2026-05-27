<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { SharedVideoAnalysisPage } from '~/lib-modules/video-analyzer'

const route = useRoute()
const token = computed(() => String(route.params.token ?? ''))

definePageMeta({
  // No 'app' layout — public, unauthenticated viewer.
})
</script>

<template>
  <SharedVideoAnalysisPage :token="token" />
</template>
