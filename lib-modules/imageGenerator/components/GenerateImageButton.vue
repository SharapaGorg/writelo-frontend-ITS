<script setup lang="ts">
import {defineComponent} from 'vue'
import {useImageGeneratorStore} from "../stores";
import {useImageGenerator} from "~/lib-modules/imageGenerator/composables/useImageGenerator";
import {useDemoGuard} from "~/lib-modules/demo-mode";
import {Loader2} from 'lucide-vue-next';

defineComponent({
  name: "GenerateImageButton"
})

const store = useImageGeneratorStore();
const {isFilled, isGenerating} = toRefs(store);
const imageGenerator = useImageGenerator();
const {guardAction} = useDemoGuard();

const handleGenerate = () => {
  guardAction(() => {
    console.log('Generate button clicked, isFilled:', isFilled.value, 'isGenerating:', isGenerating.value);
    imageGenerator.generate();
  });
}

</script>

<template>
  <Button
      variant="secondary"
      size="sm"
      :disabled="!isFilled || isGenerating"
      @click="handleGenerate"
      class="relative"
  >
    <template v-if="isGenerating">
      <Loader2 class="w-4 h-4 mr-2 animate-spin"/>
      {{ $t('imageGenerator.generate.loading') }}
    </template>
    <template v-else>
      {{ $t('imageGenerator.generate.button') }}
    </template>
  </Button>
</template>

<style scoped>

</style>