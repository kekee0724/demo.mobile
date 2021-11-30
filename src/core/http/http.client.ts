import { getApiUrl } from "../funcs/transform.url";

import { HttpRequest } from "./http.request";

import { RequestOptionsArgs } from "./type";
import { httpRequest } from "./http.network";
import { verifyAuth, refreshTokens } from "./auth";
import { logout, logoutAndJump, refreshSystemToken, refreshUID, cycleRefreshToken, getCurrentToken } from "./token";

function addBody<T>(options: RequestOptionsArgs, body: T | null): any {
    return {
        ...options,
        body,
        referrerPolicy: options.referrerPolicy || "no-referrer",
    };
}

export class HttpClient {
    logout = logout;
    logoutAndJump = logoutAndJump;

    authProvider = { refreshToken: refreshSystemToken, refreshUID, getCurrentToken };

    transformUrl(url: string = ""): string {
        return /^\s?(https?:)?\/\//i.test(url) ? url : `${getApiUrl()}${url}`;
    }

    request<T = any>(first: string | HttpRequest, url?: string, options: RequestOptionsArgs = {}): Promise<T> {
        return verifyAuth(options.allowAnonymous).then(
            (verify) => (verify ? this.handleRequest<T>(first, url, options) : Promise.reject({ status: 408, errmsg: "会话超时，请重新登录.。" })),
            (error) => Promise.reject({ status: 401, errmsg: "会话超时，请重新登录..。", error })
        );
    }

    delete<T = any>(url: string, options: RequestOptionsArgs = {}): Promise<T> {
        return this.request<T>("DELETE", url, options as any);
    }

    get<T = any>(url: string, options: RequestOptionsArgs = {}): Promise<T> {
        return this.request<T>("GET", url, options as any);
    }

    head<T = any>(url: string, options: RequestOptionsArgs = {}): Promise<T> {
        return this.request<T>("HEAD", url, options as any);
    }

    options<T = any>(url: string, options: RequestOptionsArgs = {}): Promise<T> {
        return this.request<T>("OPTIONS", url, options as any);
    }

    patch<T = any>(url: string, body: any | null, options: RequestOptionsArgs = {}): Promise<T> {
        return this.request<T>("PATCH", url, addBody(options, body));
    }

    post<T = any>(url: string, body: any | null, options: RequestOptionsArgs = {}): Promise<T> {
        return this.request<T>("POST", url, addBody(options, body));
    }

    put<T = any>(url: string, body: any | null, options: RequestOptionsArgs = {}): Promise<T> {
        return this.request<T>("PUT", url, addBody(options, body));
    }

    protected handleRequest<T = any>(first: string | HttpRequest, url?: string, options: RequestOptionsArgs = {}): Promise<T> {
        const req = this.transformRequest(first, url, options);

        cycleRefreshToken();

        return this.transformResponse(first, req, httpRequest(req)).then(null, (error: any) => this.handleResponseError(error, first, req));
    }

    protected handleResponseError(error: any, first: string | HttpRequest, req: HttpRequest) {
        return new Promise((resolve, reject) => {
            const { headers } = req.options!;
            if (
                !req.options!.allowAnonymous &&
                !(headers && (headers as any).Authorization) &&
                (error.status === 401 || error.status === 405 || error.errcode === "USERNAME_NOT_FOUND" || error.errcode === "ACCESS_DENIED")
            ) {
                this.retryRequest(first, req).then(resolve, reject);
            } else {
                reject(error);
            }
        });
    }

    protected retryRequest(first: string | HttpRequest, req: HttpRequest) {
        return refreshTokens().then(() => this.transformResponse(first, req, httpRequest(req)));
    }

    protected transformRequestInfo(first: string, url: string, options: RequestOptionsArgs = {}) {
        return new HttpRequest(this.transformUrl(url), ((options.method = first), options));
    }

    protected transformRequest(first: string | HttpRequest, url?: string, options: RequestOptionsArgs = {}) {
        return first instanceof HttpRequest ? (((first as any).urls = this.transformUrl(first.url)), first) : this.transformRequestInfo(first, url!, options);
    }

    protected transformResponse(first: string | HttpRequest, req: HttpRequest, events$: Promise<Response>) {
        if (first instanceof HttpRequest || req.options!.observe === "events") {
            return events$ as any;
        }

        switch (req.options!.observe || "body") {
            case "body":
                switch (req.responseType) {
                    case "arraybuffer":
                        return events$.then((res) => res.arrayBuffer()) as any;
                    case "blob":
                        return events$.then((res) => res.blob()) as any;
                    case "text":
                        return events$.then((res) => res.text()) as any;
                    case "json":
                    default:
                        return events$.then((res) =>
                            res.status === 204
                                ? undefined
                                : res.json().then(
                                      (d) => d,
                                      () => undefined
                                  )
                        ) as any;
                }
            case "response":
                return events$ as any;
            default:
                throw new Error(`Unreachable: unhandled observe type ${req.options!.observe}}`);
        }
    }
}
