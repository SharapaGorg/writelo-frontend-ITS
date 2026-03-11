<script setup lang="ts">
import {defineComponent} from 'vue'
import {parseAspectRatio, useImageGeneratorStore} from '../stores';

defineComponent({
  name: "ImagesAspectRatios"
})

const {setRatio} = useImageGeneratorStore();
const {ratio: selectedRatio} = toRefs(useImageGeneratorStore());

const aspectRatios = computed(() => {
  const config = useSettings().getConfig();
  return config?.imagesConfig?.aspectRatios || [];
});

const getRatioValues = (ratio: string): [number, number] => {
  if (ratio === 'auto') return [1, 1];
  return parseAspectRatio(ratio) || [1, 1];
};

const handleRatioClick = (ratio: string) => {
  setRatio(ratio);
};
</script>

<template>
  <div class="flex flex-col space-y-2 select-none">
    <h3 class="text-md">{{ $t('imageGenerator.aspectRatio.title') }}</h3>

    <div class="aspect-ratios-grid">
      <div
          class="flex flex-col gap-y-1 text-center select-none items-center"
          v-for="ratio in aspectRatios"
          :key="ratio"
      >
        <div
            class="aspect-ratio__container"
            :class="{ 'aspect-ratio__container--selected': selectedRatio === ratio }"
            @click="handleRatioClick(ratio)"
        >
          <div
              v-if="ratio !== 'auto'"
              class="aspect-ratio__shape"
              :style="{
                width: `${40 * (getRatioValues(ratio)[0] / Math.max(...getRatioValues(ratio)))}px`,
                height: `${40 * (getRatioValues(ratio)[1] / Math.max(...getRatioValues(ratio)))}px`
              }"
          ></div>
          <span v-else class="text-xs text-muted-foreground">Auto</span>
        </div>

        <span class="text-sm">{{ ratio }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>

.aspect-ratios-grid {
  @apply grid gap-x-3 gap-y-2;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
}

.aspect-ratio__container {
  @apply w-[60px] h-[60px] lg:w-[70px] lg:h-[70px] border-input border-2 border-solid
  rounded-lg flex flex-col items-center justify-center cursor-pointer
  hover:border-primary transition-all duration-200
}

.aspect-ratio__container--selected {
  @apply border-primary bg-primary/10 scale-[1.05];
}

.aspect-ratio__container--selected .aspect-ratio__shape {
  @apply bg-primary;
}

.aspect-ratio__shape {
  @apply bg-primary/20 rounded transition-colors duration-200;
}

</style>