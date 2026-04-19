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
import Spinner from "~/components/atoms/Spinner.vue";
import SettingsSwtichers from "~/components/organisms/SettingsSwtichers.vue";
import {useI18n} from 'vue-i18n'
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

const language = ref(""); // current language
const languages = ref<Record<string, string>>({});

const beenChanged = ref(false);
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

const initSettings = async () => {
  let config = $settings.getConfig();
  if (!config) return;

  languages.value = config.languages

  // Fetching data from user settings controller
  language.value = $settings.getLanguage();

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

watch(language, (lang) => {
  beenChanged.value = $settings.isBeenChanged(lang);
})

const saveChanges = async () => {
  if (!beenChanged.value) {
    return;
  }

  // In demo mode, just update locale locally without API call
  if (isGuestDemo.value) {
    locale.value = language.value as typeof locale.value;
    localStorage.setItem('preferred-locale', language.value);
    beenChanged.value = false;
    return;
  }

  // Save previous value for rollback
  const prevLanguage = language.value;
  const prevLocale = locale.value;

  locale.value = language.value as typeof locale.value;
  beenChanged.value = false;

  try {
    await $settings.saveLanguage(language.value);
  } catch (error) {
    // Rollback to previous value on error
    language.value = prevLanguage;
    locale.value = prevLocale;
    beenChanged.value = true;
  }
}

watch(isDrawerOpened, async (value) => {
  if (!value) {
    return;
  }

  // Sync local value with store on drawer open
  language.value = $settings.getLanguage();

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