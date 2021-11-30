const FIELDS_REGEXP = /\${\s*?(\w+(?:\.\w+)*)\s*?}/g,
    FIELD_REGEXP = /(\w+)(?:\.(\w+(?:\.\w+)*))*/;

export function tmpl(tmpl: string, data: any, cache: { [key: string]: any } = {}, fieldCache: { [key: string]: any } = {}) {
    return tmpl.replace(FIELDS_REGEXP, function(_m1, m2) {
        return m2 && data && fieldCache.hasOwnProperty(m2) ? fieldCache[m2] : (fieldCache[m2] = (cache.hasOwnProperty(m2) ? cache[m2] : (cache[m2] = fnParse(m2)))(data) || "");
    });
}

function fnParse(format: any): ((context: any) => any) | void {
    if (format) {
        format = FIELD_REGEXP.exec(format);

        const prefix = format[1],
            fn = fnParse(format[2]);

        return (context: any) => ((context = context[prefix]) !== undefined && fn ? fn(context) : context);
    }
}
