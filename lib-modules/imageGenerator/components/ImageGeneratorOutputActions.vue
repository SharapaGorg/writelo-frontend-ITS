<script setup lang="ts">
import {defineComponent} from 'vue'
import {BotMessageSquare, Copy, Wand} from "lucide-vue-next";
import SplitDownloadButton from "~/components/atoms/SplitDownloadButton.vue";
import {useImageGeneratorStore} from "../stores";
import {useImageGenerator} from "../composables";

defineComponent({
  name: "ImageGeneratorOutputActions",
})


const store = useImageGeneratorStore();
const imageGenerator = useImageGenerator();

const {t} = useI18n();

const handleCopyImage = async () => {
  await imageGenerator.copyImage(t);
};

const selectedFormat = ref<'jpeg' | 'png'>('jpeg');

const downloadOptions = [
  {value: 'jpeg', label: 'JPG'},
  {value: 'png', label: 'PNG'}
];

const handleDownload = async (format: string) => {
  await imageGenerator.downloadImage(format as 'jpeg' | 'png', t);
};

const modifyImage = () => {
  if (store.outputFile) {
    store.setImage(store.outputFile);
  }
}

</script>

<template>
  <div class="flex items-center gap-x-3">
    <Button variant="secondary" size="sm" @click="modifyImage">
      <Wand class="generator-output-image__icon"/>
      <span>{{ $t('imageGenerator.output.actions.modify') }}</span>
    </Button>

    <Button variant="secondary" size="sm" @click="handleCopyImage">
      <Copy class="generator-output-image__icon"/>
      <span>{{ $t('imageGenerator.output.actions.copy') }}</span>
    </Button>
  </div>

  <div class="flex items-center gap-x-3">
    <!--    <Button variant="secondary" size="sm">-->
    <!--      <BotMessageSquare class="generator-output-image__icon"/>-->
    <!--      <span>{{ $t('imageGenerator.output.actions.toChat') }}</span>-->
    <!--    </Button>-->

    <SplitDownloadButton
        v-model="selectedFormat"
        :options="downloadOptions"
        :button-prefix="$t('imageGenerator.output.actions.download')"
        @download="handleDownload"
    />
  </div>
</template>


<style scoped>

.generator-output-image__icon {
  @apply w-4 h-4
}

</style>