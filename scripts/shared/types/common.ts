export enum Language {
    ru = 'ru',
    en = 'en',
}

export type ModelType = {
    "name": string,
    "title": string,
    "short_description"?: string,
    "description"?: string,
    isPremium?: boolean,
    isAvailable?: boolean,
}

export enum FeatureType {
    math = 'math',
    python = 'python',
    search = 'search',
    projects = 'projects',
    responseStyle = 'response-style',
    model = 'model',
    roles = 'roles',
    role = 'role' // e.g. role#NAME_OF_ROLE
}

export type SubscriptionType = {
    "id": number,
    "title": string,
    "price": number,
    "duration": string, // P3D
    description: string,
    features: (FeatureType | string)[],
    "featuresText": string[]
}

export type ResponseStyleType = {
    "id": number,
    "title": string,
    "description": string
}

export type LocalesType = {
    [key in Language]: string
}

export type ChatRole = {
    "id": number,
    "icon": "default" | string,
    "name": string,
    "description": string
}

export type ConfigType = {
    "models": ModelType[],
    "subscriptions": SubscriptionType[],
    responseStyles: ResponseStyleType[],
    languages: LocalesType,
    roles: ChatRole[],
    "projectsConfig": {
        "maxCustomInstructionsLength": number
    },
    "imagesConfig": {
        "aspectRatios": string[]
    }
}

