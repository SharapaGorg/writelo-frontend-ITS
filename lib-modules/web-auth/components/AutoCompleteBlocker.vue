<script setup lang="ts">

withDefaults(defineProps<{
  type?: "text" | "password",
  name?: string
}>(), {
  type: "text",
  name: "email"
});

</script>

<template>
  <!--      workaround to disable fucking autocomplete-->
  <Input
      :type="type"
      :name="name"
      class="opacity-0 h-0 cursor-default flex-grow-0 w-0"
      readonly
  />
</template>

<style scoped>

</style>