import { RequestOptionsArgs } from "./type";
import { URLSearchParams } from "./URLSearchParams";

export function urlEncodeParams(params: { [key: string]: any }): URLSearchParams {
    const searchParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
        const value = params[key];

        if (value && Array.isArray(value)) {
            value.forEach((element) => searchParams.append(key, element.toString()));
        } else if (value !== null && value !== void 0) {
            searchParams.append(key, value.toString());
        }
    });

    return searchParams;
}

export function resolveUrl(url: string = "", params: string = "") {
    const urls = url.split("?");

    if (urls.length > 1) params = urls[1] + params;

    return urls[0] + (params ? "?" : "") + params;
}

export function formatUrlParam(params?: string | URLSearchParams | { [key: string]: any | any[] } | null) {
    return typeof params === "object" ? urlEncodeParams(params!) : new URLSearchParams(params);
}

export function formatUrlParams(options?: RequestOptionsArgs): string {
    if (!options || !options.params) return "";

    const params = formatUrlParam(options.params).toString();

    delete options.params;

    return params;
}

export function onLine() {
    return "onLine" in navigator ? navigator.onLine : !0;
}
