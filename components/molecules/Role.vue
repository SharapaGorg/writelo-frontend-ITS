<template>
  <div
      @click="select"
      class="chibi-role"
      :class="wrapperClassname"
  >
    <button
        class="chibi-role__select-button"
        @click="select"
        :aria-pressed="selected"
        type="button"
    >
      <Check v-if="selected" class="text-lime-600 dark:text-lime-500" :size="22"/>
      <Circle v-else class="text-gray-400" :size="22"/>
    </button>

    <div class="flex gap-x-2 w-full relative">
      <NuxtImg
          :src="image"
          :alt="name"
          class="chibi-role__image"
          loading="lazy"
          placeholder="/roles/skeleton.svg"
      />

      <div class="flex flex-col text-center gap-y-2 flex-1">
        <div class="chibi-role__name">{{ name }}</div>
        <div class="chibi-role__description ">{{ description }}</div>
      </div>
    </div>

    <div
        v-if="dialog"
        class="chibi-role__toggle"
        @click.stop="showDialog = !showDialog"
    >
      <ChevronDown
          class="chibi-role__icon"
          :class="{ 'chibi-role__icon--open': showDialog }"
          :size="20"
      />
      <span class="chibi-role__toggle-text">{{ $t('roles.example') }}</span>
    </div>

    <div v-if="dialog && showDialog" class="chibi-role__dialog">
      <div
          v-for="row in dialog"
          :key="row"
          class="chibi-role__dialog-row"
      >
        — {{ row }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {ChevronDown, Check, Circle} from 'lucide-vue-next'
import {toastFeatureUnavailable} from "~/scripts/features/utils/toater";

const props = defineProps<{
  image: string,
  name: string,
  description: string,
  selected?: boolean,
  dialog?: string[],
  locked?: boolean
}>()

const emit = defineEmits<{
  (e: "select"): void
}>();

const {t} = useI18n();
const showDialog = ref(false);

const wrapperClassname = computed(() => {
  let result = 'border-gray-300 dark:border-gray-700';

  if (props.locked) {
    return result + ' opacity-50'
  }

  if (props.selected) {
    return 'border-lime-500';
  }

  return result + ' hover:scale-105'
})

const select = () => {
  if (props.locked) {
    toastFeatureUnavailable(t);
    return;
  }

  if (props.selected) return;

  emit('select');
}

</script>

<style scoped>
.chibi-role {
  @apply w-full max-w-[300px] rounded-xl shadow-lg
  flex flex-col items-center p-4 transition-all duration-200 ease-in-out
  cursor-pointer gap-y-2 relative h-fit border-2 border-solid
  bg-white dark:bg-gray-800
}

.chibi-role:hover {
  @apply transform  shadow-2xl dark:shadow-xl
}

.chibi-role__image {
  @apply object-contain h-[120px] max-w-[80px];
}

.chibi-role__select-button {
  @apply top-4 right-4 absolute text-[12px] bg-transparent outline-none z-50;
}

.chibi-role__name {
  @apply font-bold text-gray-900 dark:text-white overflow-hidden text-ellipsis whitespace-nowrap
  w-full
  text-start max-w-[150px]
}

.chibi-role__description {
  @apply text-[12px] text-gray-600 dark:text-gray-300 text-start
}

.chibi-role__toggle {
  @apply flex items-center gap-x-2 cursor-pointer select-none mt-2;
}

.chibi-role__icon {
  @apply transition-transform duration-200 text-gray-400;
  transform: rotate(0deg);
}

.chibi-role__icon--open {
  transform: rotate(180deg);
}

.chibi-role__toggle-text {
  @apply text-[13px] text-gray-500 dark:text-slate-400;
}

.chibi-role__dialog {
  @apply flex flex-col gap-y-2 text-[12px] border-t border-solid pt-2 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700;
}

.chibi-role__dialog-row {
}
</style>
