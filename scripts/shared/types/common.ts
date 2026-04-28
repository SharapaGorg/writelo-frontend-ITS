export enum Language {
    ru = 'ru',
    en = 'en',
}

export enum FeatureType {
    math = 'math',
    python = 'python',
    search = 'search',
    workspaces = 'workspaces',
    roles = 'roles',
    role = 'role', // e.g. role#NAME_OF_ROLE
    templates = 'templates',
    imageGeneration = 'image-generation',
    calendar = 'calendar',
    socialAccounts = 'social-accounts',
}

export type SubscriptionKind = 'personal' | 'business'

export type SubscriptionType = {
    id: number
    title: string
    type?: SubscriptionKind
    price: number
    duration: string // P3D
    description: string
    features: (FeatureType | string)[]
    featuresText: string[]
}

export type LocalesType = {
    [key in Language]: string
}

/**
 * Role prompt for AI conversations
 */
export type RolePromptDto = {
    id: number
    icon: string
    name: string
    description: string
    dialog: string
}

/**
 * Workspace preset item (for industries, tone of voice, etc.)
 */
export type WorkspacePresetDto = {
    id: number
    name: string
    description?: string | null
    sortOrder?: number
}

/**
 * Workspace presets catalog
 */
export type WorkspacePresetsConfig = {
    industries: WorkspacePresetDto[]
    toneOfVoice: WorkspacePresetDto[]
}

/**
 * File upload configuration
 */
export type FilesConfig = {
    /** Allowed extensions grouped by localized file type name */
    extensions: Record<string, string[]>
    maxFilesPerRequest?: number
    maxFileSizeBytes?: number
}

/**
 * Image generation configuration
 */
export type ImagesConfig = {
    aspectRatios: string[]
}

/**
 * Application configuration from /app/config
 */
export type ConfigType = {
    subscriptions: SubscriptionType[]
    roles: RolePromptDto[]
    languages: LocalesType
    workspacePresets: WorkspacePresetsConfig
    filesConfig: FilesConfig
    imagesConfig: ImagesConfig
}

