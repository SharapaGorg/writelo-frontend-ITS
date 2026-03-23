<script setup lang="ts">

import {Image} from "lucide-vue-next";
</script>

<template>
  <NuxtLink to="/app/image-generator">
    <Button id="image-generator-button" variant="outline" size="icon">
      <Image/>
    </Button>
  </NuxtLink>
</template>

<style scoped>

</style>