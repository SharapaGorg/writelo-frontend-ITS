/**
 * Workspace-related types for the new Writelo API
 * These types support the workspace-scoped architecture
 */

// Workspace role enum
export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer'

// Workspace invite role (subset of WorkspaceRole)
export type WorkspaceInviteRole = 'admin' | 'editor' | 'viewer'

// Workspace DTO from API
export interface WorkspaceDto {
  id: string
  name: string
  contentLanguage: string | null
  features: string[]
  industry: string | null
  businessDescription: string | null
  targetAudience: string | null
  toneOfVoice: string | null
  stopWords: string[]
  examplePosts: string | null
  role: WorkspaceRole
  isSuspended: boolean
  createdAt: string
  modifiedAt: string
}

// Create workspace request
export interface CreateWorkspaceRequest {
  name: string
  contentLanguage?: string | null
}

// Update workspace request
export interface UpdateWorkspaceRequest {
  name?: string
  contentLanguage?: string | null
  industry?: string | null
  businessDescription?: string | null
  targetAudience?: string | null
  toneOfVoice?: string | null
  stopWords?: string[]
  examplePosts?: string | null
}

// Auth session response (new auth format)
export interface AuthSessionDto {
  token: string
  user: UserDto
}

// Updated User DTO with new fields
export interface UserDto {
  id: string
  name: string
  email: string | null
  emailVerified: boolean
  hasPassword: boolean
  pendingEmail: string | null
  oAuthProviders: string[] // OAuthProvider enum values ('telegram' | 'google' | 'yandex')
  currentRole: number
  language: string
  searchEnabled: boolean
  subscriptionId: number
  subscribedAt: string
  limits: UsageLimitsDto
  primaryWorkspaceId?: string
}

// Usage limits
export interface UsageLimitsDto {
  basic: UsageLimitInfo
  premium: UsageLimitInfo
  resetAt: string
}

export interface UsageLimitInfo {
  left: number
  total: number
}

// Generic paged response wrapper
export interface PagedResponse<T> {
  items: T[]
  total: number
  offset: number
  limit: number
  hasMore: boolean
}

// File upload types
export interface InitUploadRequest {
  fileName: string
  contentType: string
  sizeBytes: number
}

export interface InitUploadResponse {
  objectId: string
  url: string
  formFields: Record<string, string>
  expiresAt: string
}

export interface FinalizeUploadRequest {
  objectId: string
  fileName: string
}

export interface FinalizeUploadResponse {
  id: string
  storageObjectId: string
  type: MessageFileType
}

export type PostMediaFileType = 'image' | 'video'

export interface UpsertPostMediaRequest {
  storageObjectId: string
  thumbnailObjectId?: string | null
  fileType: PostMediaFileType
  sortOrder: number
}

export type MessageFileType = 'text' | 'image' | 'audio' | 'video' | 'document' | 'raw'

// Signed asset for file/image downloads
export interface SignedAssetDto {
  url: string
  expiresAt: string
}

// Download URL response
export interface DownloadUrlResponse {
  url: string
  expiresAt: string
}

// Updated Config DTO
export interface NewConfigDto {
  subscriptions: SubscriptionDto[]
  roles: RolePromptDto[]
  languages: Record<string, string>
  workspacePresets: WorkspacePresetsConfigDto
  filesConfig: FilesConfigDto
  imagesConfig: ImagesConfigDto
}

export interface SubscriptionDto {
  id: number
  title: string
  price: number
  duration: string
  description: string
  features: string[]
  featuresText: string[]
}

export interface RolePromptDto {
  id: number
  icon: string
  name: string
  description: string
}

export interface WorkspacePresetsConfigDto {
  industries: string[]
  tones: string[]
}

export interface FilesConfigDto {
  extensions: Record<string, string[]>
  maxFilesPerRequest: number
  maxFileSizeBytes: number
}

export interface ImagesConfigDto {
  aspectRatios: string[]
}

// Conversation types (updated for workspace context)
export interface ConversationListItemDto {
  id: string
  workspaceId: string
  title: string
  createdAt: string
  modifiedAt: string
}

export interface ConversationDetailDto {
  id: string
  workspaceId: string
  title: string
  messages: MessageDto[]
  hasOlderMessages: boolean
  createdAt: string
  modifiedAt: string
}

export interface MessageDto {
  id: number
  role: 'assistant' | 'user'
  isService: boolean
  text: string | null
  files: MessageFileDto[]
  createdAt: string
}

export interface MessageFileDto {
  id: string
  name: string
  type: MessageFileType
  storageObjectId: string
  asset: SignedAssetDto | null
}

export interface CreateConversationRequest {
  title?: string | null
}

export interface GenerateMessageRequest {
  message: string
  files?: string[] | null
}

// Image generation types (updated)
export type GeneratedImageStatus = 'pending' | 'done' | 'failed'

export interface GeneratedImageDto {
  id: string
  prompt: string
  aspectRatio: string
  success: boolean
  status: GeneratedImageStatus
  resultObjectId: string | null
  sourceImageObjectId: string | null
  result: SignedAssetDto | null
  errorMessage: string | null
  createdAt: string
}

export interface GenerateImageRequest {
  prompt: string
  aspectRatio?: string
}

export interface EditImageRequest {
  prompt: string
  sourceImageObjectId: string
  aspectRatio?: string
}

// User summary (for activity log, etc.)
export interface UserSummaryDto {
  id: string
  name: string
  avatarUrl: string | null
}

// === Members & Invites & Activity Log ===

export type WorkspaceInviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked'

export interface WorkspaceMemberDto {
  userId: string
  name: string
  email: string | null
  role: WorkspaceRole
  joinedAt: string
}

export interface WorkspaceInviteDto {
  id: string
  email: string
  role: WorkspaceInviteRole
  status: WorkspaceInviteStatus
  expiresAt: string
  createdAt: string
  invitedBy: UserSummaryDto | null
}

export interface WorkspaceInvitePreviewDto {
  id: string
  workspaceId: string
  workspaceName: string
  role: WorkspaceInviteRole
  status: WorkspaceInviteStatus
  expiresAt: string
  invitedBy: UserSummaryDto
}

export interface CreateWorkspaceInviteRequest {
  email: string
  role: WorkspaceInviteRole
}

export interface UpdateWorkspaceMemberRequest {
  role: WorkspaceRole
}

export interface ActivityLogItemDto {
  id: string
  userId: string | null
  actor: UserSummaryDto | null
  entityType: string
  entityId: string
  action: string
  payload: unknown | null
  createdAt: string
}

// Backend can return int32 fields as `number | string` (.NET serialization). Keep
// the union here so `Number(left)` is the canonical way to read these.
export interface WorkspaceUsageLimitDto {
  total: number | string
  left: number | string
  resetAt: string | null
}

export interface WorkspaceLimitsDto {
  modelRequests: WorkspaceUsageLimitDto
  searchRequests: WorkspaceUsageLimitDto
  shortVideoAnalysisRequests: WorkspaceUsageLimitDto
}
