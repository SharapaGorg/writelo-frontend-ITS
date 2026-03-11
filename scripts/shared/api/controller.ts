import type {UserType} from "~/scripts/shared/types/user";
import {ApiAliases, RequestMethod} from "~/scripts/shared/types";
import type {ConfigType} from "~/scripts/shared/types/common";
import type {CurrentPopupType} from "~/scripts/shared/types/communication";
import type {
    ConversationType,
    CreateConversationResponse,
    FileTypesResponse,
    ShortConversationType,
    UploadFileResponse
} from "~/lib-modules/conversations";
import type {SendMessageBody} from "~/scripts/shared/types/private";
import type {CreatePaymentType, PaymentProvider} from "~/scripts/shared/types/payment";
import {toastError, toastForbidden, toastRateLimit, toastGenericError} from "~/scripts/features/utils/toater";
import {process} from "std-env";
import {useAttachMedia} from "~/composables/useAttachMedia";
import type {UserGift} from "~/lib-modules/profile/types";
import {unref} from "vue";

type ResponseError = {
    name: string,
    status?: number,
    statusCode?: number,
    data: {
        detail?: string | null,
        details?: string | null,
        message?: string | null
    }
}

const handleUnauthorized = () => {
    const $user = useUserController();
    $user.clearToken();

    if (process.client) {
        navigateTo('/auth');
    }
};

const handleForbidden = () => {
    if (process.client) {
        toastForbidden();
    }
};

export class ApiController {
    private get domain(): string {
        try {
            const config = useRuntimeConfig();
            return `${config.public.appBaseUrl}/api/`;
        } catch {
            // Fallback if called outside Nuxt context
            return process.env.NODE_ENV === 'production'
                ? 'https://writelo.io/api/'
                : 'https://nv2.radolyn.com/api/';
        }
    }

    constructor() {

    }

    /**
     * Determine auth header prefix based on token format
     * - InitData (Telegram Mini App): contains "auth_date=" → TMiniApp
     * - JWT (web auth): base64 with dots → Bearer
     */
    private getAuthHeader(token: string): string {
        // InitData format contains auth_date= parameter
        if (token && token.includes('hash=')) {
            return `TMiniApp ${token}`
        }
        // Otherwise it's a JWT from web auth

        return `Bearer ${token}`
    }

    async request(
        url: string,
        method: RequestMethod = RequestMethod.GET,
        data = {},
        streaming: boolean = false
    ): Promise<ReadableStream<Uint8Array> | any | null> {
        const $user = useUserController();

        await $user.whenReady();

        try {
            const token = $user.getToken();
            const isAuthRequest = url.includes('auth/');

            if (!token && !isAuthRequest) {
                // жесткий волл, разрешаем отправлять только запросы на авторизацию
                return;
            }


            let opts: any = {
                method: method,
                headers: {
                    "Authorization": this.getAuthHeader(token)
                }
            }

            if (method === RequestMethod.POST || method === RequestMethod.PATCH) {
                opts.body = data
            }

            if (method === RequestMethod.GET) {
                opts.query = data;
            }

            // For streaming requests, we need to handle errors differently
            if (streaming) {
                const response = await fetch(`${this.domain}/${url}`, {
                    ...opts,
                    body: typeof opts.body === 'object' ? JSON.stringify(opts.body) : opts.body,
                    headers: {
                        ...opts.headers,
                        'Content-Type': 'application/json'
                    }
                });

                // Check if the response is OK before trying to read the stream
                if (!response.ok) {
                    // Handle 401 - token expired
                    if (response.status === 401) {
                        handleUnauthorized();
                        return;
                    }

                    // Handle 403 - insufficient subscription
                    if (response.status === 403) {
                        handleForbidden();
                        return;
                    }

                    const errorData = await response.json();
                    const error = {
                        data: errorData,
                        status: response.status,
                        statusText: response.statusText
                    };

                    if (errorData?.detail) {
                        toastError(errorData.detail);
                    }

                    throw error;
                }

                return response.body;
            } else {
                opts.responseType = 'json';
                return await $fetch(`${this.domain}/${url}`, opts);
            }

        } catch (e: ResponseError) {
            console.warn('[ApiController] request failed', e);

            // $fetch uses statusCode, while fetch uses status
            const errorStatus = e?.status || e?.statusCode;

            // Handle 401 - token expired (for non-streaming requests)
            if (errorStatus === 401) {
                handleUnauthorized();
                return;
            }

            // Extract error message from server response
            const serverMessage = e?.data?.detail || e?.data?.details || e?.data?.message;

            // Handle 403 - show server message if available, otherwise show generic forbidden
            if (errorStatus === 403) {
                console.error("!!! HANDLING ERROR STATUS 403 !!!")

                if (serverMessage) {
                    toastError(serverMessage);
                } else {
                    handleForbidden();
                }
                throw e;
            }

            // Handle 429 - rate limit
            if (errorStatus === 429) {
                if (serverMessage) {
                    toastError(serverMessage);
                } else {
                    toastRateLimit();
                }
                throw e;
            }

            // Show error toast for other errors (4xx)
            if (!streaming) {
                if (serverMessage) {
                    toastError(serverMessage);
                } else if (errorStatus && errorStatus >= 400 && errorStatus < 500) {
                    toastGenericError();
                }
            }

            // For streaming requests, throw the error so it can be handled by the caller
            if (streaming) {
                throw e;
            }

            // Always throw the error so it can be caught by the calling code
            throw e
        }
    }

    /**
     *
     * @param messageText text of message
     * @param addFiles whether add 'files' field to the body or not
     *
     * @private
     *
     * @returns request body for streaming send-message type of request
     */
    private sendMessageBody(
        messageText: string | undefined = undefined,
        addFiles: boolean = false
    ): SendMessageBody {
        let files: string[] = [];

        const {attachedFiles} = useAttachMedia();
        const filesArray = unref(attachedFiles);
        if (addFiles && filesArray.length > 0) {
            files = filesArray.map(file => file.hash);
        }

        return <SendMessageBody>{
            message: messageText || '',
            files: files.length > 0 ? files : undefined
        }
    }


    // ====== GET REQUESTS ======
    // async getMyLimit(): Promise<UserLimits> {
    //     return this.request(ApiAliases.myLimits);
    // }

    async getMe(): Promise<UserType> {
        return this.request(ApiAliases.me);
    }

    // async getSettings(): Promise<UserSettingsType> {
    //     return this.request(ApiAliases.meSettings);
    // }

    async getConfig(): Promise<ConfigType> {
        return this.request(ApiAliases.config);
    }

    async getUserGifts(offset: number, limit: number): Promise<UserGift[]> {
        return this.request(ApiAliases.meGifts, RequestMethod.GET, {offset, limit});
    }

    async activateGift(hash: string): Promise<void> {
        return this.request(`${ApiAliases.meGifts}/${hash}/activate`, RequestMethod.POST);
    }

    async generateImage(prompt: string, aspectRatio: string): Promise<{ imageId: string; accessHash: string }> {
        return this.request(ApiAliases.imagesGenerate, RequestMethod.POST, {prompt, aspectRatio});
    }

    async editImage(prompt: string, sourceImage: string, aspectRatio: string): Promise<{
        imageId: string;
        accessHash: string
    }> {
        return this.request(ApiAliases.imagesEdit, RequestMethod.POST, {prompt, sourceImage, aspectRatio});
    }

    async improvePrompt(prompt: string): Promise<{ prompt: string }> {
        return this.request(ApiAliases.promptImprove, RequestMethod.POST, {prompt});
    }

    async getGeneratedImage(imageId: string, accessHash: string): Promise<Blob> {
        const token = useUserController().getToken()
        const response = await fetch(`${this.domain}/images/${imageId}_${accessHash}`, {
            headers: {
                'Authorization': this.getAuthHeader(token)
            }
        });
        if (!response.ok) {
            if (response.status === 401) {
                handleUnauthorized();
                throw new Error('Unauthorized');
            }
            if (response.status === 403) {
                handleForbidden();
                throw new Error('Forbidden');
            }
            throw new Error('Failed to fetch image');
        }
        return response.blob();
    }

    async getImageHistory(offset: number = 0, limit: number = 20): Promise<any[]> {
        return this.request(ApiAliases.images, RequestMethod.GET, {offset, limit});
    }

    async getConversations(offset: number = 0, count: number = 20): Promise<ShortConversationType[]> {
        return this.request(ApiAliases.conversations + `?offset=${offset}&limit=${count}`);
    }

    /**
     * Get allowed extensions of files, which can be attached to the request
     */
    async getFileTypes(): Promise<FileTypesResponse> {
        return this.request(ApiAliases.fileTypes);
    }

    /**
     * @param file_id
     * @param accessHash
     *
     * @returns The contents of the file, if present and access is allowed
     */
    async getFileContent(fileId: string, accessHash: string): Promise<string> {
        return this.request(ApiAliases.file + '/' + `${fileId}_${accessHash}`);
    }

    /**
     * @param conversation_id id of the conversation
     * @returns brief information about the conversation
     */
    async getConversationMetadata(conversationId: string): Promise<ShortConversationType> {
        return this.request(ApiAliases.conversations + `?conversationId=${conversationId}`);
    }

    /**
     * @param conversation_id id of the conversion
     * @returns metadata about conversation and its messages and groups (???)
     */
    async getConversation(conversationId: string): Promise<ConversationType> {
        return this.request(ApiAliases.conversations + '/' + conversationId);
    }

    /**
     * @returns Current popup object if it must be shown for a user and null otherwise
     */
    async getCurrentPopup(): Promise<CurrentPopupType | null> {
        return this.request(ApiAliases.popup);
    }

    // ====== POST REQUESTS ======

    /**
     * Create an empty conversation
     * @param projectId optional project ID to associate with the conversation
     * @returns id of the new conversation
     */
    async createConversation(projectId?: string | null): Promise<CreateConversationResponse> {
        console.warn('[POST] Create Conversation')

        return this.request(ApiAliases.conversations, RequestMethod.POST, {
            title: null,
            projectId: projectId || null
        });
    }

    /**
     *  Basically removing conversation
     */
    async deleteConversation(conversationId: string): Promise<void> {
        return this.request(ApiAliases.conversations + '/' + conversationId, RequestMethod.DELETE);
    }

    /**
     *
     * @param conversation_id - id of the conversation to be shared
     * @returns share_id, which is simply shared id of the conversation
     */
    async shareConversation(conversationId: string): Promise<ConversationType> {
        return this.request(ApiAliases.conversations + '/' + conversationId + '/' + ApiAliases.share, RequestMethod.POST);
    }

    /**
     * Unshare a conversation
     * @param conversation_id - id of the conversation to be unshared
     * @returns response from unshare API
     */
    async unshareConversation(conversationId: string): Promise<ConversationType> {
        return this.request(ApiAliases.conversations + '/' + conversationId + '/' + ApiAliases.share, RequestMethod.DELETE);
    }

    /**
     * Send message in a conversation
     *
     * @param conversationId id of current conversation
     * @param messageText content of new message
     * @param requestUuid uuid of question message (used locally)
     * @param responseUuid uuid of expected answer message (used locally)
     * @returns streaming response
     */
    async sendMessage(
        conversationId: string,
        messageText: string,
        requestUuid: string,
        responseUuid: string
    ): Promise<ReadableStream<Uint8Array>> {
        const body = this.sendMessageBody(messageText, true);
        return this.request(
            ApiAliases.conversations + '/' + conversationId + '/messages',
            RequestMethod.POST,
            body,
            true);
    }

    /**
     * @param conversationId
     * @param messageId
     * @param newText new text of a message
     * @param responseId uuid of response message (used locally)
     * @returns streaming response
     */
    async editMessage(conversationId: string, messageId: number, newText: string, responseId: string): Promise<ReadableStream<Uint8Array>> {
        return this.request(ApiAliases.conversations + '/' + conversationId + '/messages/' + messageId, RequestMethod.PATCH, {
            message: newText
        }, true)
    }

    /**
     * Mark as viewed to not show already viewed popup next time
     *
     * @param id id of popup which visible for user currently
     */
    async viewCurrentPopup(id: number): Promise<void> {
        return this.request(ApiAliases.viewPopup, RequestMethod.POST, {
            id: id
        });
    }


    /**
     * Saving base settings
     *
     * @param language language of an interface
     * @param responseStyle current response style
     * @param model llm
     *
     * Other settings, like current model or enabled tools are fetched from the last request to LLM
     * (other settings are memorized from the previous requests)
     */
    async saveSettings(language: string, responseStyle: number | null, model: string | null): Promise<void> {
        return this.request(ApiAliases.me, RequestMethod.PATCH, {
            language: language,
            currentStyle: responseStyle,
            currentModel: model
        });
    }

    /**
     * Update search enabled setting
     * @param searchEnabled whether search is enabled
     */
    async updateSearchEnabled(searchEnabled: boolean): Promise<void> {
        return this.request(ApiAliases.me, RequestMethod.PATCH, {
            searchEnabled
        });
    }

    /**
     * Reroll last message of a conversation - send request with the same prompt to the LLM one more time
     *
     * @param conversationId id of conversation
     * @param responseUuid uuid of expected answer message (used locally)
     *
     * @returns streaming response
     */
    async rerollMessage(conversationId: string, responseUuid: string): Promise<ReadableStream<Uint8Array>> {
        return this.request(
            `${ApiAliases.conversations}/${conversationId}/${ApiAliases.reroll}`,
            RequestMethod.POST,
            {},
            true
        )
    }

    /**
     * @param subscription_id id of the tier
     * @param provider method of payment (e.x. bank card)
     *
     * @returns url for pay money for subscription
     */
    async createPayment(subscriptionId: number, provider: PaymentProvider): Promise<CreatePaymentType> {
        return this.request(ApiAliases.payment, RequestMethod.POST, {
            subscriptionId: subscriptionId,
            provider: provider
        });
    }

    /**
     * Interrupts generation of response
     * @param conversation_id
     */
    async stopGeneration(conversationId: string) {
        return this.request(
            ApiAliases.conversations + '/' + conversationId + '/' + ApiAliases.stop,
            RequestMethod.POST
        );
    }

    /**
     * Uploads file to the server in order to send it then
     * @param file object of a file
     */
    async uploadFile(file: File): Promise<UploadFileResponse> {
        const formData = new FormData();
        formData.append('File', file);

        return this.request(ApiAliases.file, RequestMethod.POST, formData);
    }

    /**
     *
     * @param role_id id of the Role (ChatRole type)
     */
    async changeChatRole(roleId: number | null) {
        return this.request(ApiAliases.me, RequestMethod.PATCH, {
            currentRole: roleId
        })
    }

    /**
     * Update user name
     * @param name new name to set
     */
    async updateName(name: string): Promise<void> {
        return this.request(ApiAliases.me, RequestMethod.PATCH, {
            name
        })
    }

    /**
     * Change user password
     * @param currentPassword current password for verification
     * @param newPassword new password to set
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        return this.request(ApiAliases.mePassword, RequestMethod.POST, {
            currentPassword,
            newPassword
        })
    }

    /**
     * Request email change (sends verification to new email)
     * @param email new email address
     */
    async changeEmail(email: string): Promise<void> {
        return this.request('me/email/change', RequestMethod.POST, {email})
    }

    /**
     * Resend email change verification (authenticated)
     */
    async resendEmailChangeVerification(): Promise<void> {
        return this.request('me/email/resend', RequestMethod.POST)
    }

    /**
     * Cancel pending email change
     */
    async cancelEmailChange(): Promise<void> {
        return this.request('me/email/pending', RequestMethod.DELETE)
    }
}
