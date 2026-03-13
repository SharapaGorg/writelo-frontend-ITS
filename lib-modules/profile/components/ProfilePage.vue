<script setup lang="ts">
import {defineComponent} from 'vue'
import {ProfileBadge} from "~/lib-modules/profile";
import {GoogleZone, TelegramZone, YandexZone} from './alternativeAuthZones'
import DangerousZone from './DangerousSection.vue'
import EditAccountZone from "./EditAccountZone.vue";
import TariffPlanZone from "./TariffPlanZone.vue";
import GiftsSection from "./GiftsSection.vue";
import {isInTelegramApp} from "~/scripts/features/utils";
import {useDemoMode} from "~/lib-modules/demo-mode";

defineComponent({
  name: "ProfilePage"
})

const {isGuestDemo} = useDemoMode()
</script>

<template>
  <div class="profile-page__container">
    <ProfileBadge :full-width="true"/>
    <TariffPlanZone/>
    <GiftsSection/>
    <EditAccountZone/>
    <TelegramZone/>
    <!--    <YandexZone/>-->
    <GoogleZone/>
    <DangerousZone v-if="!isInTelegramApp"/>
  </div>
</template>

<style scoped>

.profile-page__container {
  @apply w-full md:w-[600px] mx-auto pt-10 pb-20 px-2
  flex flex-col gap-y-6
}

</style>