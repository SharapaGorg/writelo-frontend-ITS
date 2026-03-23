import type {ModelType, ResponseStyleType} from "~/scripts/shared/types/common";
import {OAuthProvider} from "~/lib-modules/web-auth";

export type UserType = {
    "id": string,
    "name": string,
    "email": string | null,
    "pendingEmail": string | null,
    "oAuthProviders": OAuthProvider[],
    "currentModel": string,
    "currentRole": number,
    "currentStyle": number | null,
    "language": string,
    "searchEnabled": boolean,
    "subscriptionId": number,
    "subscribedAt": string, // date
    "limits": UserLimits & {
        resetAt: string; // date
    }
}

export type UserSettingsType = {
    "response_style_id": null | number,
    "language": "ru" | "en"
}

export type UserSettingsClientType = { //  client-side user settings
    responseStyle: ResponseStyleType,
    language: "en" | "ru", // temp
    llm: ModelType
}


export type UserLimitInformation = {
    left: number,
    total: number
}

type UserLimitDivisions = 'basic' | 'premium';

export type UserLimits = { [key in UserLimitDivisions]: UserLimitInformation };