<script lang="ts">
import {defineComponent} from 'vue'
import {YandexAuthButton} from "~/lib-modules/web-auth";
import ProfilePageBlock from "~/lib-modules/profile/components/ProfilePageBlock.vue";

export default defineComponent({
  name: "YandexZone",
  components: {ProfilePageBlock, YandexAuthButton}
})
</script>

<template>
  <ProfilePageBlock>
    <template #header>Yandex</template>
    <template #content>
      <YandexAuthButton/>
    </template>
  </ProfilePageBlock>
</template>

<style scoped>

</style>