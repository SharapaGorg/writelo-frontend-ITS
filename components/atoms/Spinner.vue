<template>
  <div class="loading-screen-container">
    <LoaderCircle
        class="animate-spin"
        :style="{ width : props.size + 'px', height : props.size + 'px' }"
    />
  </div>

</template>

<script setup>

import {LoaderCircle} from "lucide-vue-next";

const props = defineProps(['size'])

</script>

<style scoped>

.loading-screen-container {
  @apply flex items-center justify-center w-full
  h-full

}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
  @apply block w-[96px] h-[96px]
}


</style>