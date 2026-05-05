<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { VideoAnalysisDetail } from '~/lib-modules/video-analyzer'

definePageMeta({
  layout: 'app',
})

const route = useRoute()
const analysisId = computed(() => String(route.params.id ?? ''))
</script>

<template>
  <VideoAnalysisDetail :analysis-id="analysisId" />
</template>
