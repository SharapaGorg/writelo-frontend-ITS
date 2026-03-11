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
    // myLimits = 'me/limits',
    // meSettings = 'me/settings',
    conversations = 'conversations',
    file = 'files',
    config = 'app/config',
    payment = 'payment',
    popup = 'crm/popup/current',
    viewPopup = 'crm/popup/view',
    crmOpen = 'crm/open',
    reroll = 'reroll',
    stop = 'stop',
    share = 'share',
    fileTypes = 'files/types',
    projects = 'projects',
    images = 'images',
    imagesGenerate = 'images/generate',
    imagesEdit = 'images/edit',
    promptImprove = 'prompt/improve',
    // updateRole = 'me/role'
}

export enum Routes {
    index = '/',
    newConversation = '/conversations/new',
    conversations = '/conversations/'
}