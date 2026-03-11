import {defineNuxtPlugin} from "#app";

export default defineNuxtPlugin(async () => {
    const MarkdownIt = await import("markdown-it").then((md) => md.default || md);

    const lightTheme = window?.Telegram?.WebApp?.colorScheme === 'light';
    // if (process.client) {
    //     let theme;
    //
    //     const isTelegram =
    //         window.Telegram &&
    //         window.Telegram.WebApp &&
    //         window.Telegram.WebApp.initData;
    //
    //     if (isTelegram) {
    //         theme = window.Telegram.WebApp.colorScheme;
    //         window.Telegram.WebApp.onEvent('themeChanged', () => {
    //             loadHLJSTheme(window.Telegram.WebApp.colorScheme);
    //         });
    //     } else {
    //         theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    //         window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    //             loadHLJSTheme(e.matches ? 'dark' : 'light');
    //         });
    //     }
    //
    //     loadHLJSTheme(theme);
    //
    //     function loadHLJSTheme(theme) {
    //         if (theme === 'light') {
    //             import('highlight.js/styles/atom-one-light.min.css');
    //         } else {
    //             import('highlight.js/styles/atom-one-dark.min.css');
    //         }
    //     }
    // }

    import('highlight.js/styles/atom-one-dark.min.css');

    const md = new MarkdownIt("default", {
        html: false,
        linkify: true,
        breaks: true,
        typographer: true,
    });

    const underliner = await import("../markdown/underliner");
    md.use(underliner.default);

    const highlightjs = await import("../markdown/highlightjs/src/index");
    md.use(highlightjs?.default?.default || highlightjs?.default || highlightjs);

    // @ts-ignore
    const codewrap = await import("markdown-it-codewrap");
    md.use(codewrap.default, {
        hasToolbar: true,
        toolbarTag: "div",
        toolbarClass: "code-toolbar",
        toolbarLabel: (
            tokens: any,
            idx: any,
            options: any,
            env: any,
            self: any,
        ) => {
            let toolbarLabel = tokens[idx].info.toLowerCase();
            return `<span class="code-lang">${toolbarLabel}</span>`;
        },
        hasCopyButton: true,
        isButtonInToolbar: true,
        copyButtonAttrs: {
            class: "code-copy",
        },
        copyButtonLabel: (
            tokens: any,
            idx: any,
            options: any,
            env: any,
            self: any,
        ) => {
            return `
            <span class="code-copy">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 48 48">
                    <g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2.5">
                        <path stroke-linecap="round" d="M13 12.432v-4.62A2.813 2.813 0 0 1 15.813 5h24.374A2.813 2.813 0 0 1 43 7.813v24.375A2.813 2.813 0 0 1 40.188 35h-4.672"/>
                        <path d="M32.188 13H7.811A2.813 2.813 0 0 0 5 15.813v24.374A2.813 2.813 0 0 0 7.813 43h24.375A2.813 2.813 0 0 0 35 40.188V15.811A2.813 2.813 0 0 0 32.188 13Z"/>
                    </g>
                </svg>
            </span>`;
        },
        inlineCopyHandler: true,
    });

    const markdownItKatex = await import("../markdown/katexer");

    // @ts-ignore
    md.use(markdownItKatex?.default?.default || markdownItKatex.default, {
        enableBareBlocks: true,
        enableMathBlockInHtml: true,
        enableMathInlineInHtml: true,
        enableFencedBlocks: true,
        throwOnError: false,
    });

    const defaultParagraphRenderer =
        md.renderer.rules.paragraph_open ||
        ((tokens, idx, options, env, self) =>
            self.renderToken(tokens, idx, options));
    md.renderer.rules.paragraph_open = function (
        tokens,
        idx,
        options,
        env,
        self,
    ) {
        let result = "";
        if (idx > 1) {
            const inline = tokens[idx - 2];
            const paragraph = tokens[idx];
            if (
                inline.type === "inline" &&
                inline.map &&
                inline.map[1] &&
                paragraph.map &&
                paragraph.map[0]
            ) {
                const diff = paragraph.map[0] - inline.map[1];
                if (diff > 0) {
                    result = "<br>".repeat(diff);
                }
            }
        }
        return result + defaultParagraphRenderer(tokens, idx, options, env, self);
    };

    return {
        provide: {
            mdRenderer: md,
        },
    };
});