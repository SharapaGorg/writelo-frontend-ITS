import {FeatureType} from "~/scripts/shared/types/common";

export type FillNewConversationType = {
    message: string,
    tools: FeatureType[]
}

export type DialogTitleUpdated = {
    conversation_id: string,
    title: string
}