// Re-export workspace types
export * from './workspace'

export enum RequestMethod {
    GET = "GET",
    POST = "POST",
    PATCH = "PATCH",
    DELETE = 'DELETE'
}

export enum ApiAliases {
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

    // Payments
    payments = 'payments',

    // Auth endpoints
    authSignup = 'auth/signup/email',
    authSignin = 'auth/signin/email',
    authGoogle = 'auth/signin/google',
    authTelegram = 'auth/signin/telegram',
    authVerify = 'auth/email/verify',
    authResendVerification = 'auth/email/resend',
    authForgotPassword = 'auth/password/forgot',
    authResetPassword = 'auth/password/reset',

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
    workspaceSocialAccountsLink = 'workspaces/{workspaceId}/social-accounts/link',

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
    workspacePostMediaItem = 'workspaces/{workspaceId}/posts/{postId}/media/{mediaId}',
    workspacePostComments = 'workspaces/{workspaceId}/posts/{postId}/comments',
    workspacePostPublishNow = 'workspaces/{workspaceId}/posts/{postId}/publish-now',

    // Publish — platform-specific (API 23.04)
    workspaceInstagramPublishPost = 'workspaces/{workspaceId}/instagram/{socialAccountId}/posts',
    workspaceInstagramPublishReel = 'workspaces/{workspaceId}/instagram/{socialAccountId}/reels',
    workspaceInstagramPublishStory = 'workspaces/{workspaceId}/instagram/{socialAccountId}/stories',
    workspaceTelegramPublishPost = 'workspaces/{workspaceId}/telegram/{socialAccountId}/posts',
    workspaceTelegramPublishStory = 'workspaces/{workspaceId}/telegram/{socialAccountId}/stories',

    // Members & Invites
    workspaceMembers = 'workspaces/{workspaceId}/members',
    workspaceMember = 'workspaces/{workspaceId}/members/{userId}',
    workspaceInvites = 'workspaces/{workspaceId}/invites',
    workspaceInvite = 'workspaces/{workspaceId}/invites/{inviteId}',
    workspaceInviteRevoke = 'workspaces/{workspaceId}/invites/{inviteId}/revoke',
    // Token-based (publicly previewable; accept/decline require auth):
    workspaceInvitePreview = 'workspace-invites/{token}',
    workspaceInviteAccept = 'workspace-invites/{token}/accept',
    workspaceInviteDecline = 'workspace-invites/{token}/decline',

    // Activity log
    workspaceActivityLog = 'workspaces/{workspaceId}/activity-log',

    // Short-video analyses
    workspaceShortVideoAnalyses = 'workspaces/{workspaceId}/short-video-analyses',
    workspaceShortVideoAnalysesRun = 'workspaces/{workspaceId}/short-video-analyses/run',
    workspaceShortVideoAnalysesHistory = 'workspaces/{workspaceId}/short-video-analyses/history',

    // Trending Reels (Instagram)
    workspaceTrendingReelsGlobal = 'workspaces/{workspaceId}/trending-reels/global',
    workspaceTrendingReelsDetail = 'workspaces/{workspaceId}/trending-reels/{reelId}',

    // Workspace usage limits
    workspaceLimits = 'workspaces/{workspaceId}/limits',

    // Dev-only endpoints (available only on staging/local backend)
    devUserSubscription = 'dev/users/{userId}/subscription',

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