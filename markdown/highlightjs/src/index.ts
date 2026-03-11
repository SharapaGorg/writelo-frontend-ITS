import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import core from "./core.js";
import type {HighlightOptions} from "./core.js";
import vue from "../vue"

export default function highlightjs(
    md: MarkdownIt,
    opts?: HighlightOptions,
): void {
    opts = {...highlightjs.defaults, ...opts};

    if (opts.hljs == null) {
        opts.hljs = hljs;
    }

    if (process.client) {
        opts.hljs.registerLanguage("vue", vue);
    }

    return core(md, opts);
}

highlightjs.defaults = {
    auto: true,
    code: true,
    inline: false,
    ignoreIllegals: true,
    register: {}
};
