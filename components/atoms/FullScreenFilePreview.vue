<template>
  <div class="fullscreen" v-show="showFileFullScreen" @click.self="close">
    <Transition name="modal-fade">
      <NuxtImg
          v-if="imgSrc"
          alt="full screen image preview"
          :src="imgSrc"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">

import {ref} from "vue";
import {eventBus, type OpenFileFullScreen} from "~/composables/eventBus";
import {FileForm} from "~/lib-modules/conversations";

const emit = defineEmits(['close'])

const showFileFullScreen = ref(false);
const imgSrc = ref(null);

const close = () => {
  imgSrc.value = null;

  setTimeout(() => {
    showFileFullScreen.value = false;
  }, 150)
}

const trigger = (data: OpenFileFullScreen) => {
  showFileFullScreen.value = true;

  if (data.type === FileForm.image) {
    imgSrc.value = data.content;
  }
}

onBeforeMount(() => {
  eventBus.on('openFileFullScreen', trigger);
})

onBeforeUnmount(() => {
  eventBus.off('openFileFullScreen', trigger);
})


</script>


<style scoped>

.fullscreen {
  @apply fixed top-0 left-0 w-screen h-screen flex items-center justify-center
  bg-black/50 z-[100] backdrop-blur-xl select-none
}

img {
  @apply max-w-[90%] lg:max-w-[800px] object-center object-cover
  rounded-lg
}

</style>