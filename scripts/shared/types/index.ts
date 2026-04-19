// Re-export workspace types
export * from './workspace'

export enum RequestMethod {
    GET = "GET",
    POST = "POST",
    PATCH = "PATCH",
    DELETE = 'DELETE'
}

export enum ApiAliases {
    // Profile endpoints (unchanged)
    me = 'me',
    mePassword = 'me/password',
    meGifts = 'me/gifts',
    meLinkGoogle = 'me/link/google',
    meLinkTelegram = 'me/link/telegram',
    meUnlink = 'me/unlink', // + /{provider}
    meEmailChange = 'me/email/change',
    meEmailResend = 'me/email/resend',
    meEmailPending = 'me/email/pending',

    // Config (unchanged)
    config = 'app/config',

    // Payment (unchanged)
    payment = 'payment',

    // CRM (unchanged)
    popup = 'crm/popup/current',
    viewPopup = 'crm/popup/view',
    crmOpen = 'crm/open',

    // Auth endpoints
    authSignup = 'auth/signup',
    authSignin = 'auth/signin',
    authGoogle = 'auth/google',
    authTelegram = 'auth/telegram',
    authVerify = 'auth/verify',
    authResendVerification = 'auth/resend-verification',
    authForgotPassword = 'auth/forgot-password',
    authResetPassword = 'auth/reset-password',

    // Workspaces
    workspaces = 'workspaces',

    // Workspace-scoped endpoints (use template: workspaces/{workspaceId}/...)
    // Conversations
    workspaceConversations = 'workspaces/{workspaceId}/conversations',
    workspaceConversation = 'workspaces/{workspaceId}/conversations/{conversationId}',
    workspaceConversationMessages = 'workspaces/{workspaceId}/conversations/{conversationId}/messages',
    workspaceConversationMessage = 'workspaces/{workspaceId}/conversations/{conversationId}/messages/{messageId}',
    workspaceConversationReroll = 'workspaces/{workspaceId}/conversations/{conversationId}/reroll',
    workspaceConversationStop = 'workspaces/{workspaceId}/conversations/{conversationId}/stop',

    // File uploads
    workspaceUploadsInit = 'workspaces/{workspaceId}/uploads/init',
    workspaceUploadsFinalize = 'workspaces/{workspaceId}/uploads/finalize',
    workspaceStorageDownload = 'workspaces/{workspaceId}/storage-objects/{objectId}/download-url',
    workspaceTemporaryFiles = 'workspaces/{workspaceId}/temporary-files',

    // Images
    workspaceImages = 'workspaces/{workspaceId}/images',
    workspaceImage = 'workspaces/{workspaceId}/images/{imageId}',
    workspaceImagesGenerate = 'workspaces/{workspaceId}/images/generate',
    workspaceImagesEdit = 'workspaces/{workspaceId}/images/edit',
    workspaceImageDownload = 'workspaces/{workspaceId}/images/{imageId}/download-url',

    // Social accounts
    workspaceSocialAccounts = 'workspaces/{workspaceId}/social-accounts',
    workspaceSocialAccount = 'workspaces/{workspaceId}/social-accounts/{socialAccountId}',

    // Calendar (deferred but keeping endpoints ready)
    workspaceCalendarEvents = 'workspaces/{workspaceId}/calendar/events',
    workspaceCalendarEvent = 'workspaces/{workspaceId}/calendar/events/{eventId}',
    workspaceCalendarDayItems = 'workspaces/{workspaceId}/calendar/day-items',
    workspaceCalendarDayItem = 'workspaces/{workspaceId}/calendar/day-items/{dayItemId}',
    workspaceCalendarDayItemsReorder = 'workspaces/{workspaceId}/calendar/day-items/reorder',

    // Tags
    workspaceTags = 'workspaces/{workspaceId}/tags',
    workspaceTag = 'workspaces/{workspaceId}/tags/{tagId}',

    // Posts
    workspacePosts = 'workspaces/{workspaceId}/posts',
    workspacePost = 'workspaces/{workspaceId}/posts/{postId}',
    workspacePostMedia = 'workspaces/{workspaceId}/posts/{postId}/media',
    workspacePostComments = 'workspaces/{workspaceId}/posts/{postId}/comments',

    // Members & Invites
    workspaceMembers = 'workspaces/{workspaceId}/members',
    workspaceMember = 'workspaces/{workspaceId}/members/{userId}',
    workspaceInvites = 'workspaces/{workspaceId}/invites',
    workspaceInvite = 'workspaces/{workspaceId}/invites/{inviteId}',

    // Activity log
    workspaceActivityLog = 'workspaces/{workspaceId}/activity-log',

    // === DEPRECATED (old endpoints, kept for reference during migration) ===
    /** @deprecated Use workspaceConversations */
    conversations = 'conversations',
    /** @deprecated Use workspaceUploadsInit/Finalize */
    file = 'files',
    /** @deprecated Use workspaceConversationReroll */
    reroll = 'reroll',
    /** @deprecated Use workspaceConversationStop */
    stop = 'stop',
    /** @deprecated Sharing removed in new API */
    share = 'share',
    /** @deprecated Use filesConfig from config endpoint */
    fileTypes = 'files/types',
    /** @deprecated Replaced by workspaces */
    projects = 'projects',
    /** @deprecated Use workspaceImages */
    images = 'images',
    /** @deprecated Use workspaceImagesGenerate */
    imagesGenerate = 'images/generate',
    /** @deprecated Use workspaceImagesEdit */
    imagesEdit = 'images/edit',
    /** @deprecated Removed in new API */
    promptImprove = 'prompt/improve',
}

export enum Routes {
    landing = '/',
    app = '/app',
    newConversation = '/app/conversations/new',
    conversations = '/app/conversations/',
    imageGenerator = '/app/image-generator',
    profile = '/app/profile',
}

/**
 * Replace URL template parameters with actual values
 * @example buildUrl(ApiAliases.workspaceConversations, { workspaceId: '123' })
 * // Returns: 'workspaces/123/conversations'
 */
export function buildUrl(
    template: ApiAliases | string,
    params: Record<string, string>
): string {
    let url = template as string
    for (const [key, value] of Object.entries(params)) {
        url = url.replace(`{${key}}`, value)
    }
    return url
}