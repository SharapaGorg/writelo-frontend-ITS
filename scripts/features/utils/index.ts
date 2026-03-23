import {v4 as uuidv4} from 'uuid';
import {ScreenSize} from "~/scripts/features/utils/types";

export * from './telegram'

export const generateUUID = (): string => {
    return uuidv4();
}


export const getScreenSize = (): ScreenSize | number => {
    if (process.client) {
        const width = window.innerWidth;
        if (width < 640) {
            return ScreenSize.sm
        } else if (width < 768) {
            return ScreenSize.md;
        } else if (width < 1024) {
            return ScreenSize.lg;
        } else {
            return ScreenSize.xl;
        }
    }

    return 400;
};

export function downloadFile(data: any, filename: string, mimeType: string) {
    const content = typeof data === 'string' ? data : JSON.stringify(data);

    const blob = new Blob([content], {type: mimeType});

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}


export const isIOS = (): boolean => {
    // Проверяем, запущен ли код в браузере
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return false
    }

    // Проверка на iPhone
    const isIPhone = /iPhone/i.test(navigator.userAgent)

    // Альтернативная проверка для более новых iPadOS,
    // которые представляются как macOS, но имеют поддержку touch
    const isPossibleIPad =
        /iPad|Macintosh/i.test(navigator.userAgent) &&
        navigator.maxTouchPoints > 0

    return isIPhone || isPossibleIPad
}

export const isAndroid = (): boolean => {
    // Check if code is running in browser
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return false
    }

    return /Android/i.test(navigator.userAgent)
}

export const isMobile = (): boolean => {
    // Check if code is running in browser
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return false
    }

    // Check for iOS or Android
    if (isIOS() || isAndroid()) {
        return true
    }

    // Additional checks for other mobile devices
    return /webOS|BlackBerry|Windows Phone/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints > 0 && window.innerWidth <= 768)
}