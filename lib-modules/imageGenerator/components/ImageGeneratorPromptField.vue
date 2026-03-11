<script setup lang="ts">

import CustomTextarea from "~/components/atoms/CustomTextarea.vue";
import {useImageGeneratorStore} from "../stores";

const {setPrompt} = useImageGeneratorStore();

</script>

<template>
  <CustomTextarea
      @update:modelValue="setPrompt"
      :placeholder="$t('imageGenerator.prompt.placeholder')"
      :label="$t('imageGenerator.prompt.label')"
  />
</template>

<style scoped>

</style>t