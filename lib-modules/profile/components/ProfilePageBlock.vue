<script setup lang="ts">
import {defineComponent} from 'vue'

defineComponent({
  name: "ProfilePageBlock"
})
</script>

<template>
  <div class="flex flex-col gap-y-2">
    <div class="profile-page__block-header">
      <slot name="header"/>
    </div>

    <div class="profile-page__block">
      <slot name="content"/>
    </div>
  </div>
</template>

<style scoped>

.profile-page__block {
  @apply w-full rounded-xl border-2
  border-solid border-input p-4
}

.profile-page__block-header {
  @apply text-lg font-bold
}

</style>