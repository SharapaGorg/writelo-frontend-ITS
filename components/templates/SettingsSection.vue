<template>
  <Drawer v-model:open="isDrawerOpened">
    <DrawerTrigger>
      <Button id="settings-button" variant="outline" size="icon">
        <Settings/>
      </Button>
    </DrawerTrigger>
    <DrawerContent class="bg-white dark:bg-black">
      <div id="settings-section">
        <DrawerHeader>
          <DrawerTitle>{{ $t('settings') }}</DrawerTitle>

          <Spinner v-show="!$settings.loaded.value"/>

          <DrawerDescription v-show="$settings.loaded.value">
            <DrawerHeader class="text-start pl-0 pb-1.5">{{ $t('settings-lang') }}</DrawerHeader>

            <MultiChoiceContainer
                v-model="language"
                :default-value="language"
                placeholder="Выберите язык"
            >
              <SelectItem
                  v-for="lang in Object.keys(languages)"
                  :key="lang"
                  :value="lang"
              >
                {{ languages[lang] }}

              </SelectItem>
            </MultiChoiceContainer>

            <SettingsSwtichers class="mt-5"/>

            <ProfileBadge/>

            <!-- <RequestCounter
                :basic-remaining="userLimit?.basic?.left"
                :basic-total="userLimit?.basic?.total"
                :premium-remaining="userLimit?.premium?.left"
                :premium-total="userLimit?.premium?.total"
                class="-mt-2"
            /> -->

            <!--          <UserSettingsSheet class="-mt-2"/>-->
          </DrawerDescription>
        </DrawerHeader>


        <DrawerFooter>
          <DrawerClose class="mx-auto flex items-center gap-x-2">
            <Button
                variant="secondary"
                size="sm"
                :disabled="!beenChanged"
                @click="saveChanges"
            >{{ $t('save') }}
            </Button>

            <Button variant="outline">
              {{ $t('close') }}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>

<script setup lang="ts">


import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader, DrawerTitle,
  DrawerTrigger
} from "~/components/ui/drawer";

import {Settings} from "lucide-vue-next";
import MultiChoiceContainer from "~/components/molecules/MultiChoiceContainer.vue";
import {FeatureType, type ModelType, type ResponseStyleType} from "~/scripts/shared/types/common";
import Spinner from "~/components/atoms/Spinner.vue";
import SettingsSwtichers from "~/components/organisms/SettingsSwtichers.vue";
import RequestCounter from "~/components/atoms/RequestCounter.vue";
import {toastFeatureUnavailable} from "~/scripts/features/utils/toater";
import {useI18n} from 'vue-i18n'
import type {Ref} from "vue";
import {ApiController} from "~/scripts/shared/api/controller";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "~/components/ui/select";
import type {UserLimits} from "~/scripts/shared/types/user";
import {useOnboarding} from "~/lib-modules/onboarding";
import {ProfileBadge} from "~/lib-modules/profile";
import {useDemoMode} from "~/lib-modules/demo-mode";

const {t, locale} = useI18n({ useScope: 'global' })
const {isGuestDemo} = useDemoMode()
const onboarding = useOnboarding()
const route = useRoute()

const $api = new ApiController();

const llm = ref(""); // name of LL model
const language = ref(""); // title of language
const responseStyle: Ref<number | string> = ref(""); // id of response style

const models: Ref<ModelType[]> = ref<ModelType[]>([]);
const responseStyles: Ref<ResponseStyleType[]> = ref([]);
const languages = ref({});

const beenChanged = ref(false);
// const isDrawerOpened = ref<boolean>(false);
const isDrawerOpened = computed({
  get() {
    return useEnv().settingsMenuOpened.value;
  },
  set(value: boolean) {
    useEnv().settingsMenuOpened.value = value;
  }
})

let $settings = useSettings();
const userLimit = ref<UserLimits | null>(null);

const clickResponseStyles = () => {
  if (!useSettings().hasFeature(FeatureType.responseStyle)) {
    toastFeatureUnavailable(t);
  }
}

const initSettings = async () => {
  let config = $settings.getConfig();
  if (!config) return;

  models.value = config.models;

  responseStyles.value = config.responseStyles

  languages.value = config.languages

  // Fetching data from user settings controller
  llm.value = $settings.getLlm()?.title;
  language.value = $settings.getLanguage();
  responseStyle.value = $settings.getResponseStyle()?.id || null;

  await nextTick(() => {
    beenChanged.value = false;
  })
}

if ($settings.loaded.value) {
  await initSettings();
}

watch($settings.loaded, async value => {
  if (!value) {
    return;
  }

  await initSettings();
})

watch([llm, language, responseStyle], ([llmName, lang, style_id,]) => {
  beenChanged.value = $settings.isBeenChanged(lang, style_id, llmName);
})

const llmNames = computed(() => {
  return models.value.map(item => item.title);
})

const saveChanges = async () => {
  if (!beenChanged.value) {
    return;
  }

  // In demo mode, just update locale locally without API call
  if (isGuestDemo.value) {
    locale.value = language.value;
    localStorage.setItem('preferred-locale', language.value);
    beenChanged.value = false;
    return;
  }

  // Save previous values for rollback
  const prevLlm = llm.value;
  const prevLanguage = language.value;
  const prevResponseStyle = responseStyle.value;
  const prevLocale = locale.value;

  locale.value = language.value;
  beenChanged.value = false;

  const newStyle: ResponseStyleType = responseStyles.value.find(item => item.id === responseStyle.value);
  const newLlm = models.value.find(item => item.title === llm.value);
  const newLang = language.value;

  try {
    await $settings.saveChanges(newLang, newStyle, newLlm);
    // Save to localStorage on success (same as LanguageSelector)
    localStorage.setItem('preferred-locale', newLang);
  } catch (error) {
    // Rollback to previous values on error
    llm.value = prevLlm;
    language.value = prevLanguage;
    responseStyle.value = prevResponseStyle;
    locale.value = prevLocale;
    beenChanged.value = true;
  }
}

watch(isDrawerOpened, async (value) => {
  if (!value) {
    return;
  }

  // Sync local values with store on drawer open
  llm.value = $settings.getLlm()?.title;
  language.value = $settings.getLanguage();
  responseStyle.value = $settings.getResponseStyle()?.id || null;

  await nextTick(() => {
    beenChanged.value = false;
  });

  // Skip API call in demo mode
  if (isGuestDemo.value) {
    return;
  }

  // Refetch user limits
  const me = await $api.getMe();
  userLimit.value = me.limits;
})

// Close drawer on route change
watch(() => route.fullPath, () => {
  isDrawerOpened.value = false;
})

</script>

<style scoped>

</style>