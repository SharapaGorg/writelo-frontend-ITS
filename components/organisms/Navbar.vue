<template>
  <div class="grid grid-cols-3 justify-items-end p-4 relative" v-show="$env.navbarVisible.value">
    <div class="flex items-center gap-x-3 w-full">
      <DialogsSection/>
      <ImageGeneratorNavbarButton/>
    </div>

    <div class="w-full flex justify-center items-center">
      <!--      <PopupAds>-->
      <!--        <Button size="sm">Тест попапа</Button>-->
      <!--      </PopupAds>-->

      <CrmPopup @click-action="clickActionButton"/>

      <ClientSelector v-if="useSettings().isPaidUser()" @open-create="showClientCreate = true" />

      <ProjectCreateWindow
        v-model:open="showClientCreate"
        @save="onClientCreated"
      />

      <TiersWindow @select-tier="selectTier">
        <Button size="sm" variant="premium" v-if="!useSettings().isPaidUser()" ref="getPlusButton">
          <Crown/>
          <div>{{ $t('premium-btn') }}</div>
        </Button>
      </TiersWindow>

      <PaymentProviders @select-method="checkOut">
        <div class="hidden" ref="providersButton"></div>
      </PaymentProviders>
    </div>

    <div class="flex items-center gap-x-3">
      <SettingsSection/>

      <Button size="icon" variant="secondary" @click="useCurrentConversation().makeNewChat()">
        <MessageCirclePlus/>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">

import {Crown, MessageCirclePlus} from "lucide-vue-next";
import SettingsSection from "~/components/templates/SettingsSection.vue";
import TiersWindow from "~/components/templates/TiersWindow.vue";
import {useI18n} from 'vue-i18n'
import PaymentProviders from "~/components/atoms/PaymentProviders.vue";
import {PaymentProvider} from "~/scripts/shared/types/payment";
import {ApiController} from "~/scripts/shared/api/controller";
import CrmPopup from "~/components/molecules/CrmPopup.vue";
import {ImageGeneratorNavbarButton} from "~/lib-modules/imageGenerator";
import {DialogsSection, useCurrentConversation} from "~/lib-modules/conversations";
import ClientSelector from "~/components/molecules/ClientSelector.vue";
import {ProjectCreateWindow, useProjectsStore} from "~/lib-modules/projects";

const {t} = useI18n()

const $env = useEnv();
const apiController = new ApiController();
const showClientCreate = ref(false);

const onClientCreated = async (projectId: string) => {
  const store = useProjectsStore();
  await store.fetchProjects();
  store.selectProject(projectId);
}

const getPlusButton: Ref<HTMLElement | null> = ref(null);

const selectedTierId: Ref<number | null> = ref(null);

const providersButton: Ref<HTMLElement | null> = ref(null);

const selectTier = (tier_id: number) => {
  selectedTierId.value = tier_id;
  (providersButton.value as HTMLElement).click();
}

const checkOut = async (method: PaymentProvider) => {
  try {
    let response = await apiController.createPayment(selectedTierId.value, method);

    if (method !== PaymentProvider.stars) {
      window.location.href = response.url;
      return;
    }

    if (response?.url?.length) {
      window.Telegram?.WebApp.openInvoice(response.url, async (status) => {
        if (status === 'paid') {
          window.Telegram?.WebApp.close();

          // window.Telegram?.WebApp.showPopup({
          //   title: t("success-payment"),
          //   message: "",
          //   buttons: [{type: "destructive", text: t('close')}],
          // });
        }
      })

    }
  } catch (e) {
    console.error("Error creating invoice link:", e);
    window.Telegram?.WebApp.showPopup({
      title: t("500"),
      message: t("500"),
      buttons: [{type: "destructive", text: t('close')}],
    });
  }
}

/**
 * Click action button in crm
 */
const clickActionButton = () => {
  (getPlusButton.value as HTMLElement).$el.click();
}

</script>


<style scoped>

</style>