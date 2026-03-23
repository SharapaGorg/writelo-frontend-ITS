import { useImageGeneratorStore } from '../stores'
import { useDemoMode, DEMO_IMAGE_INPUT_URL, DEMO_IMAGE_OUTPUT_URL } from '~/lib-modules/demo-mode'

const isInitialized = ref(false)

async function urlToFile(url: string, filename: string): Promise<File> {
  const response = await fetch(url)
  const blob = await response.blob()
  return new File([blob], filename, { type: blob.type })
}

export function useDemoImageGenerator() {
  const { isDemoMode } = useDemoMode()
  const store = useImageGeneratorStore()
  const { t } = useI18n()

  const initializeDemoState = async () => {
    if (!isDemoMode.value || isInitialized.value) return

    try {
      // Load demo images
      const [inputFile, outputFile] = await Promise.all([
        urlToFile(DEMO_IMAGE_INPUT_URL, 'example-input.jpg'),
        urlToFile(DEMO_IMAGE_OUTPUT_URL, 'example-output.jpg')
      ])

      // Set demo state
      store.setImage(inputFile)
      store.setPrompt(t('imageGenerator.demo.prompt'))
      store.setOutputFile(outputFile)

      isInitialized.value = true
    } catch (e) {
      console.error('Failed to initialize demo image generator:', e)
    }
  }

  return {
    initializeDemoState,
    isDemoMode
  }
}
