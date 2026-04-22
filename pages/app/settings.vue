<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { SelectItem } from '~/components/ui/select'
import MultiChoiceContainer from '~/components/molecules/MultiChoiceContainer.vue'
import Spinner from '~/components/atoms/Spinner.vue'
import { Button } from '~/components/ui/button'
import { useDemoMode } from '~/lib-modules/demo-mode'
import { AppNavbar } from '~/lib-modules/app-layout'

definePageMeta({
  layout: 'app'
})

const { t, locale } = useI18n({ useScope: 'global' })
const { isGuestDemo } = useDemoMode()
const $settings = useSettings()

const language = ref('')
const languages = ref<Record<string, string>>({})
const beenChanged = ref(false)

const initSettings = async () => {
  const config = $settings.getConfig()
  if (!config) return

  languages.value = config.languages
  language.value = $settings.getLanguage()

  await nextTick(() => {
    beenChanged.value = false
  })
}

if ($settings.loaded.value) {
  await initSettings()
}

watch($settings.loaded, async (value) => {
  if (!value) return
  await initSettings()
})

watch(language, (lang) => {
  beenChanged.value = $settings.isBeenChanged(lang)
})

const saveChanges = async () => {
  if (!beenChanged.value) return

  if (isGuestDemo.value) {
    locale.value = language.value as typeof locale.value
    localStorage.setItem('preferred-locale', language.value)
    beenChanged.value = false
    return
  }

  const prevLanguage = language.value
  const prevLocale = locale.value

  locale.value = language.value as typeof locale.value
  beenChanged.value = false

  try {
    await $settings.saveLanguage(language.value)
  } catch {
    language.value = prevLanguage
    locale.value = prevLocale
    beenChanged.value = true
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <AppNavbar :breadcrumbs="[{ label: $t('settings') }]" />

    <div class="flex-1 overflow-y-auto">
      <div class="max-w-2xl w-full px-4 sm:px-6 py-6 flex flex-col gap-8">
        <Spinner v-show="!$settings.loaded.value" />

        <div v-show="$settings.loaded.value" class="flex flex-col gap-6">
          <section class="flex flex-col gap-2">
            <h2 class="text-sm font-medium text-muted-foreground">{{ $t('settings-lang') }}</h2>
            <MultiChoiceContainer
              v-model="language"
              :default-value="language"
              placeholder="Выберите язык"
            >
              <SelectItem v-for="lang in Object.keys(languages)" :key="lang" :value="lang">
                {{ languages[lang] }}
              </SelectItem>
            </MultiChoiceContainer>
          </section>

          <div class="flex gap-2">
            <Button variant="secondary" size="sm" :disabled="!beenChanged" @click="saveChanges">
              {{ $t('save') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
