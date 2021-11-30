function transform(url?: string) {
    if (url && url.startsWith("//")) {
        let baseUrl = getAssetsUrl(),
            protocol = baseUrl.split("//")[0];
        return protocol + url;
    }
    return url && url.charAt(0) === "~" ? ((url = url.substr(2)), `${getApiUrl()}${url}`) : url;
}

export function getApiUrl() {
    return server.url || "";
}

export function transformUrl(url?: string, def?: string) {
    return url && (transform(url) || transform(def));
}

export function transformImageUrl(url: string, width: number, height: number, def?: string) {
    const v = 2;
    return url && `${transformAssetsUrl(url, def)}?width=${width * v}&height=${height * v}`;
}

function transformAssets(url?: string) {
    if (url && url.startsWith("//")) {
        let baseUrl = getAssetsUrl(),
            protocol = baseUrl.split("//")[0];
        return protocol + url;
    }
    return url && url.charAt(0) === "~" ? ((url = url.substr(2)), `${getAssetsUrl()}${url}`) : url;
}

export function getAssetsUrl() {
    return server.assetsUrl || getApiUrl();
}

export function transformAssetsUrl(url?: string, def?: string) {
    return url && (transformAssets(url) || transformAssets(def));
}
