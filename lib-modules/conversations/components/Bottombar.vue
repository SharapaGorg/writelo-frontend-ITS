<template>
  <div class="flex items-center pt-2 gap-x-2 w-full" data-no-blur="true">
    <!--    <div class="w-full">-->
    <!--      <div class="select-none w-fit flex items-center gap-x-2" data-no-blur="true">-->
    <client-only>
      <div
          id="search-button"
          :class="searchButtonClass"
          :style="{
                backgroundColor: isSearchEnabled ? 'rgb(59 130 246 / 0.3)' : '',
                color: isSearchEnabled ? 'rgb(59 130 246)' : '',
                cursor: searchAvailable ? 'pointer' : 'not-allowed'
              }"

          @click.prevent="handleToggleClick"
      >
        <svg class="icon" width="20" height="20" viewBox="0 0 20 20" fill="none"
             xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.8"></circle>
          <path d="M10 1c1.657 0 3 4.03 3 9s-1.343 9-3 9M10 19c-1.657 0-3-4.03-3-9s1.343-9 3-9M1 10h18"
                stroke="currentColor" stroke-width="1.8"></path>
        </svg>
        <div>{{ $t('search') }}</div>
      </div>
    </client-only>

    <div class="flex-grow">
      <RolesStore/>
    </div>

    <div class="flex gap-x-2" data-no-blur="true">
      <AttachMediaButton/>
      <SendMessageButton
          v-if="!generationInProcess"
          :disabled="sendButtonDisabled || useEnv().sendingMessagesBlocked.value"
          @click="emit('send')"
      />

      <Button
          variant="secondary"
          size="icon"
          class="rounded-full"
          v-if="generationInProcess"
          @click="eventBus.emit('stopGeneration')"
      >
        <div class="w-[18px] h-[18px] bg-white rounded-sm"></div>
      </Button>
      <!--      <VoiceRecorderButton/>-->
    </div>
  </div>
</template>

<script setup lang="ts">

import {Button} from "~/components/ui/button";
import {ref, computed} from "vue";
import {FeatureType} from "~/scripts/shared/types/common";
import {toastFeatureUnavailable} from "~/scripts/features/utils/toater";
import {useI18n} from 'vue-i18n'
import {eventBus} from "~/composables/eventBus";
import RolesStore from "~/components/organisms/RolesStore.vue";
import {AttachMediaButton, SendMessageButton} from "~/lib-modules/conversations";
import {ApiController} from "~/scripts/shared/api/controller";

const {t} = useI18n();
const apiController = new ApiController();

const emit = defineEmits(['send', 'searchButtonClicked'])
const props = defineProps<{
  searchDisabled: Boolean,
  message: String,
  generationInProcess: Boolean
}>();

// ==== SEARCH ====
const $settings = useSettings();
const isSearchEnabled = ref($settings.getUser()?.searchEnabled || false);

const searchAvailable = computed(() => {
  return $settings.hasFeature(FeatureType.search);
});


// Search button styles that exactly match the original toggle styles
const searchButtonClass = computed(() => {
  const baseStyles = `
    select-none inline-flex items-center justify-center gap-x-1.5 rounded-2xl text-sm font-medium 
    transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring 
    disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 
    h-9 px-2.5 min-w-9 border border-input shadow-sm transition-all duration-200
  `;

  if (isSearchEnabled.value) {
    // Active state: data-[state=on] equivalent
    return `${baseStyles} hover:bg-blue-500/20 hover:text-blue-500`;
  } else {
    // Inactive state: data-[state=off] equivalent with hover effect
    return `${baseStyles} text-black/80 dark:text-white/90 hover:bg-blue-500/10 hover:text-black/80 hover:dark:text-white/90`;
  }
});

const handleToggleClick = async () => {
  emit('searchButtonClicked');

  if (!searchAvailable.value) {
    toastFeatureUnavailable(t);
    return;
  }

  const newSearchState = !isSearchEnabled.value;
  isSearchEnabled.value = newSearchState;
  
  // Update the search state on the backend
  try {
    await apiController.updateSearchEnabled(newSearchState);
  } catch (error) {
    console.error('Failed to update search settings:', error);
    // Revert the state if the API call fails
    isSearchEnabled.value = !newSearchState;
  }
}

// Remove the old toggleSearch function since we're managing state manually now

watch(isSearchEnabled, value => {
  useSettings().setToolState(FeatureType.search, value);
})

watch(settings.toolsEnabled, value => {
  isSearchEnabled.value = value[FeatureType.search] || false;
}, {
  deep: true
})

const sendButtonDisabled = ref(true);
watch(() => props.message, value => {
  sendButtonDisabled.value = !value.length;
})


watch(() => props.searchDisabled, () => {
  isSearchEnabled.value = false;
});

// Watch for user data updates to sync the search state
watch(() => $settings.getUser()?.searchEnabled, (newValue) => {
  if (newValue !== undefined) {
    isSearchEnabled.value = newValue;
  }
});

</script>

<style scoped>

.search-toggle-container {
  @apply h-9 px-2 min-w-9
  select-none inline-flex items-center justify-center
  gap-x-1.5 rounded-md text-sm font-medium transition-colors
  hover:text-muted-foreground focus-visible:outline-none
  focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none
  disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground
  [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
  border border-input shadow-sm transition-all duration-200
  hover:text-white
}

</style>