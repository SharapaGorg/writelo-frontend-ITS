export const parseAspectRatio = (ratio: string): [number, number] | null => {
    if (ratio === 'auto') return null;
    const parts = ratio.split(':');
    if (parts.length !== 2) return null;
    return [parseInt(parts[0]), parseInt(parts[1])];
};

export const useImageGeneratorStore = defineStore('imageGenerator', () => {
    const attachedImage = ref<null | File>(null);
    const uploadedId = ref<string | null>(null);
    const ratio = ref<string>('1:1');
    const prompt = ref<string>("");
    const outputFile = ref<null | File>(null);
    const isGenerating = ref<boolean>(false);

    const setImage = (file: File) => {
        attachedImage.value = file;
    }

    const setUploadedId = (id: string) => {
        uploadedId.value = id;
    }

    const clearImage = () => {
        attachedImage.value = null;
        uploadedId.value = null;
    }

    const setRatio = (ratio_: string) => {
        ratio.value = ratio_;
    }

    const setPrompt = (prompt_: string) => {
        prompt.value = prompt_;
    }

    const setOutputFile = (file: File) => {
        outputFile.value = file;
    }

    const setIsGenerating = (value: boolean) => {
        isGenerating.value = value;
    }

    return {
        setImage,
        setUploadedId,
        clearImage,
        setRatio,
        setPrompt,
        setOutputFile,
        setIsGenerating,
        attachedImage: computed(() => attachedImage.value),
        uploadedId: computed(() => uploadedId.value),
        ratio: computed(() => ratio.value),
        prompt: computed(() => prompt.value),
        outputFile: computed(() => outputFile.value),
        isGenerating: computed(() => isGenerating.value),
        isFilled: computed(() => prompt.value.length > 0)
    }
})