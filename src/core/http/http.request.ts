import { RequestOptionsArgs } from "./type";

import { urlEncodeParams, resolveUrl } from "./utils";
import { getCurrentToken } from "./token";
import { getStorage } from "../funcs/storage";

export class HttpRequest {
    readonly responseType: "arraybuffer" | "blob" | "json" | "text" = "json";

    readonly options?: RequestOptionsArgs;

    constructor(public url: string, options: RequestOptionsArgs = {}) {
        this.responseType = options.responseType || this.responseType;
        this.options = options;
    }

    get request() {
        const { headers: rawHeaders, body, params } = this.options!,
            headers = this.getHeaders(rawHeaders);

        return new Request(resolveUrl(this.url, this.getUrlEncodeParams(params)), {
            ...this.options,
            body: body === undefined ? undefined : body instanceof FormData ? (delete headers["Content-Type"], body) : JSON.stringify(body),
            headers,
        } as any);
    }

    protected getUrlEncodeParams(params) {
        return typeof params === "object" ? urlEncodeParams(params) : params;
    }

    protected getHeaders(headers: any) {
        headers = this.attachAuthorization({
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json; charset=utf-8",
            ...headers,
        });

        this.attachUnitId(headers);
        this.attachParkId(headers);

        return headers;
    }

    protected attachAuthorization(headers: any) {
        const { allowAnonymous } = this.options!;

        if (!allowAnonymous && !headers.Authorization) {
            const authorization = getCurrentToken();

            if (authorization) {
                headers.Authorization = authorization;
            }
        }

        return headers;
    }

    protected attachUnitId(headers: any) {
        const { unitId = getStorage("unitId") } = this.options!;

        delete headers.unitId;

        unitId && (headers.unitId = unitId);
    }

    protected attachParkId(headers: any) {
        const { parkId = getStorage("parkId") } = this.options!;

        delete headers.parkId;

        parkId && (headers.parkId = parkId);
    }

    clone(): HttpRequest {
        return new HttpRequest(this.url, this.options);
    }
}
