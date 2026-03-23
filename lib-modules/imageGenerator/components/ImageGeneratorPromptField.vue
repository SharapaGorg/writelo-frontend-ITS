<script setup lang="ts">

import CustomTextarea from "~/components/atoms/CustomTextarea.vue";
import {useImageGeneratorStore} from "../stores";

const store = useImageGeneratorStore();
const {prompt} = toRefs(store);

</script>

<template>
  <CustomTextarea
      :modelValue="prompt"
      @update:modelValue="store.setPrompt"
      :placeholder="$t('imageGenerator.prompt.placeholder')"
      :label="$t('imageGenerator.prompt.label')"
  />
</template>

<style scoped>

</style>t