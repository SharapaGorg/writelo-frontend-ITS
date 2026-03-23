// types/telegram-webapp.d.ts
interface TelegramWebAppUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
}

type WebappPopupButton = {
    type: "destructive",
    text: string
}

interface TelegramWebApp {
    // https://core.telegram.org/bots/webapps#initializing-mini-apps
    initData: string;
    initDataUnsafe: {
        user?: TelegramWebAppUser;
        start_param?: string;
        auth_date: number;
        hash: string;
    };

    disableVerticalSwipes(): void;

    lockOrientation(): void;

    requestFullscreen(): void;

    expand(): void;

    addToHomeScreen(): void;

    ready(): void;

    /** close webapp ? **/
    close(): void;

    openInvoice(url: string, callback: (status: any) => {}): void;

    sendData(data: string): void;

    showPopup(data: {
        title: string,
        message: string,
        buttons: WebappPopupButton[]
    }) : void;
}

interface Telegram {
    WebApp: TelegramWebApp;

}

declare global {
    interface Window {
        Telegram?: Telegram;
    }
}
