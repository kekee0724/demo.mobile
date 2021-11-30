import { html } from "../type";

export function htmlInjectEncode(html: html, tagExp = /<\/?(iframe|script|link|style|frameset|frame)\b[^>]*?>/gi) {
    return html && html.replace(tagExp, d => `&lt;${d.substr(1, d.length - 2)}&gt;`);
}

export function htmlInjectDecode(html: html, tagExp = /&lt;\/?(iframe|script|link|style|frameset|frame)\b.*?&gt;/gi) {
    return html && html.replace(tagExp, d => `<${d.substr(4, d.length - 8)}>`);
}

export function removeHtmlTag(html: html, tagExp = /<\/?[^>]*?>/g) {
    return html && html.replace(tagExp, "");
}

export function htmlEncode(html: html, tagExp = /<\/?[^>]*?>/g) {
    return html && html.replace(tagExp, d => `&lt;${d.substr(1, d.length - 2)}&gt;`);
}

export function htmlDecode(html: html, tagExp = /&lt;\/?.*?&gt;/g) {
    return html && html.replace(tagExp, d => `<${d.substr(4, d.length - 8)}>`);
}
