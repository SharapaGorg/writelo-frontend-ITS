<script setup lang="ts">
import {defineComponent} from 'vue'
import {UserRoundPen, Clock} from 'lucide-vue-next'
import {useProfileI18n} from '../composables/useProfileI18n';

defineComponent({
  name: "ProfileBadge"
});

const props = withDefaults(defineProps<{
  fullWidth?: boolean
}>(), {
  fullWidth: false
});

const {t} = useProfileI18n();
const currentRoute = useRoute().name;
const $settings = useSettings();

const user = computed(() => $settings.getUser());
const firstname = computed(() => user.value?.name.split(' ')[0]);
const lastname = computed(() => user.value?.name.split(' ')[1] || "");
const pendingEmail = computed(() => user.value?.pendingEmail);

</script>

<template>
  <NuxtLink
      to="/profile"
      class="w-full md:w-fit block cursor-default"
      :style="{ width : fullWidth ? '100%' : '' }"
  >
    <div
        class="profile-badge__container"
        :style="{ width : fullWidth ? '100%' : '' }"
        :class="{ 'profile-badge_hover-effects' : currentRoute !== 'profile' }"
    >
      <Avatar class="profile-badge__avatar">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn"/>
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>

      <div class="flex flex-col">
        <span class="font-bold">{{ firstname }} {{ lastname }}</span>
        <span>{{ user?.email }}</span>
        <span v-if="pendingEmail" class="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
          <Clock class="w-3 h-3"/>
          {{ pendingEmail }}
        </span>
      </div>

      <UserRoundPen class="profile-badge__edit-icon"/>
    </div>
  </NuxtLink>
</template>

<style scoped>

.profile-badge__container {
  @apply flex gap-x-4 p-3 rounded-xl border-2 relative
  border-input w-full md:w-[350px] items-center
  transition-all duration-200
}

.profile-badge__avatar {
  @apply w-[60px] h-[60px]
}

.profile-badge__edit-icon {
  @apply absolute right-3 top-3
}

.profile-badge_hover-effects {
  @apply hover:shadow-md hover:border-gray-200 cursor-pointer
}

</style>