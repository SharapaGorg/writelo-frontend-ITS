import {useImageGeneratorStore} from '../stores'
import {ApiController} from "~/scripts/shared/api/controller";
import {useImageHistory} from './useImageHistory';
import {
    toastImageCopySuccess, 
    toastImageCopyError, 
    toastImageDownloadSuccess, 
    toastImageDownloadError, 
    toastImageConvertError, 
    toastImageLoadError
} from '../helpers/toaster';
import type {Composer} from "vue-i18n";

// Accepted image types
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const loading = ref<boolean>(false);
const uploadProgress = ref<number>(0);
const error = ref<string | null>(null);

export const useImageGenerator = () => {
    const $store = useImageGeneratorStore();
    const $api = new ApiController();

    const validateImageFile = (file: File, t_?: Composer['t']): { valid: boolean; error?: string } => {
        // Check file type
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            return {
                valid: false,
                error: t_ ? t_('imageGenerator.attachZone.error.invalidType') : 'Invalid file format. Supported: JPEG, PNG, GIF, WebP'
            };
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return {
                valid: false,
                error: t_ ? t_('imageGenerator.attachZone.error.tooLarge', { maxSize: MAX_FILE_SIZE / 1024 / 1024 }) : `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
            };
        }

        return {valid: true};
    };

    const attachImage = async (file: File, t_?: Composer['t']) => {
        error.value = null;

        // Validate file
        const validation = validateImageFile(file, t_);
        if (!validation.valid) {
            error.value = validation.error!;
            return false;
        }

        loading.value = true;
        uploadProgress.value = 0;

        try {
            $store.setImage(file);

            // Auto-prompt for img2img mode
            if (!$store.prompt || $store.prompt.trim() === '') {
                $store.setPrompt('Сделай похожую картинку');
            }

            return true;
        } catch (e) {
            error.value = 'Ошибка загрузки файла';
            console.error('Image upload error:', e);
            return false;
        } finally {
            loading.value = false;
            uploadProgress.value = 0;
        }
    };

    const removeImage = () => {
        $store.clearImage();
        error.value = null;
    };

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                // Remove data:image/xxx;base64, prefix
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const generate = async () => {
        if (!$store.isFilled || $store.isGenerating) {
            return;
        }

        $store.setIsGenerating(true);

        try {
            let response: { imageId: string; accessHash: string };

            if ($store.attachedImage) {
                // img2img - user has attached an image
                const base64Image = await fileToBase64($store.attachedImage);
                response = await $api.editImage($store.prompt, base64Image, $store.ratio);
            } else {
                // txt2img - only prompt
                response = await $api.generateImage($store.prompt, $store.ratio);
            }

            if (response?.imageId && response?.accessHash) {
                // Fetch the actual image
                const blob = await $api.getGeneratedImage(response.imageId, response.accessHash);
                const file = new File([blob], `generated-${response.imageId}.png`, {type: blob.type});
                $store.setOutputFile(file);

                // Add to history
                const {addToHistory} = useImageHistory();
                addToHistory({
                    id: response.imageId,
                    prompt: $store.prompt,
                    accessHash: response.accessHash,
                    aspectRatio: $store.ratio,
                    model: '',
                    success: true,
                    createdAt: new Date().toISOString()
                });
            }
        } catch (e: any) {
            // Error toast already handled in ApiController
            console.error('Image generation error:', e);
        } finally {
            $store.setIsGenerating(false);
        }
    }

    const downloadImage = async (format: 'jpeg' | 'png' = 'jpeg', t_?: Composer['t']) => {
        if (!$store.outputFile) {
            console.error('No image to download');
            return false;
        }

        try {
            const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
            const extension = format === 'jpeg' ? 'jpg' : 'png';

            // If the file is already in the requested format, download directly
            if ($store.outputFile.type === mimeType) {
                downloadBlob($store.outputFile, `generated-image.${extension}`);

                if (t_) {
                    toastImageDownloadSuccess(t_, extension.toUpperCase());
                }
                return true;
            }

            // Convert to requested format
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            return new Promise((resolve) => {
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            downloadBlob(blob, `generated-image.${extension}`);

                            if (t_) {
                                toastImageDownloadSuccess(t_, extension.toUpperCase());
                            }
                            resolve(true);
                        } else {
                            if (t_) {
                                toastImageConvertError(t_);
                            }
                            resolve(false);
                        }
                    }, mimeType, format === 'jpeg' ? 0.95 : undefined);
                };

                img.onerror = () => {
                    if (t_) {
                        toastImageLoadError(t_);
                    }
                    resolve(false);
                };

                if ($store.outputFile) {
                    img.src = URL.createObjectURL($store.outputFile);
                }
            });
        } catch (err) {
            console.error('Failed to download image:', err);
            if (t_) {
                toastImageDownloadError(t_);
            }
            return false;
        }
    };

    const copyImage = async (t_?: Composer['t']) => {
        if (!$store.outputFile) {
            console.error('No image to copy');
            return false;
        }

        try {
            // Convert File to blob for clipboard
            const blob = new Blob([$store.outputFile], {type: $store.outputFile.type});

            // Create ClipboardItem with the image blob
            const clipboardItem = new ClipboardItem({
                [blob.type]: blob
            });

            // Write to clipboard
            await navigator.clipboard.write([clipboardItem]);

            console.log('Image copied to clipboard');
            if (t_) {
                toastImageCopySuccess(t_);
            }
            return true;
        } catch (err) {
            console.error('Failed to copy image:', err);

            // Fallback: try to copy as PNG if the original format fails
            try {
                const img = new Image();
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                return new Promise((resolve) => {
                    img.onload = async () => {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx?.drawImage(img, 0, 0);

                        canvas.toBlob(async (blob) => {
                            if (blob) {
                                const clipboardItem = new ClipboardItem({
                                    'image/png': blob
                                });
                                await navigator.clipboard.write([clipboardItem]);
                                console.log('Image copied to clipboard as PNG');
                                if (t_) {
                                    toastImageCopySuccess(t_);
                                }
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        }, 'image/png');
                    };

                    if ($store.outputFile) {
                        img.src = URL.createObjectURL($store.outputFile);
                    }
                });
            } catch (fallbackErr) {
                console.error('Fallback copy also failed:', fallbackErr);
                if (t_) {
                    toastImageCopyError(t_);
                }
                return false;
            }
        }
    };

    return {
        // Store data
        prompt: $store.prompt,
        ratio: $store.ratio,
        attachedImage: $store.attachedImage,
        outputFile: $store.outputFile,
        isFilled: $store.isFilled,
        isGenerating: $store.isGenerating,

        // Actions
        setPrompt: $store.setPrompt,
        setRatio: $store.setRatio,
        attachImage,
        removeImage,
        generate,
        copyImage,
        downloadImage,
        setOutputFile: $store.setOutputFile,

        // UI state
        loading: computed(() => loading.value),
        uploadProgress: computed(() => uploadProgress.value),
        error: computed(() => error.value),

        // Validation
        validateImageFile,
        ACCEPTED_IMAGE_TYPES,
        MAX_FILE_SIZE
    };
};