import { HttpClient } from "./http.client";

import { RequestOptionsArgs, HeaderParams, SearchParams } from "./type";
import { HttpRequest } from "./http.request";

export class BaseHttpService {
    static http: HttpClient;

    protected http: HttpClient;
    public apiVersion: number = 10;

    constructor(protected readonly controllerName: string, http?: HttpClient) {
        this.http = http ? (BaseHttpService.http = http) : BaseHttpService.http || (BaseHttpService.http = new HttpClient());
    }

    protected httpGet(url: string, options?: RequestOptionsArgs) {
        return this.http.get(this.transformUrl(url), options);
    }

    protected httpPost(url: string, body: any = null, options?: RequestOptionsArgs) {
        return this.http.post(this.transformUrl(url), body, options);
    }

    protected httpPut(url: string, body: any = null, options?: RequestOptionsArgs) {
        return this.http.put(this.transformUrl(url), body, options);
    }

    protected httpDelete(url: string, options?: RequestOptionsArgs) {
        return this.http.delete(this.transformUrl(url), options);
    }

    protected httpPatch(url: string, body: any = null, options?: RequestOptionsArgs) {
        return this.http.patch(this.transformUrl(url), body, options);
    }

    protected httpHead(url: string, options?: RequestOptionsArgs) {
        return this.http.head(this.transformUrl(url), options);
    }

    protected httpOptions(url: string, options?: RequestOptionsArgs) {
        return this.http.options(this.transformUrl(url), options);
    }

    protected httpUpload(url: string, data: any, options?: RequestOptionsArgs) {
        return this.httpPost(url, data, this.resolveRequestHeaders({}, options));
    }

    /**
     * 文件下载
     * @param url 下载地址
     * @param  filename 文件名
     * @param  options 配置项
     * @return  响应等待对象
     */
    protected httpGetDownload(url: string, options?: RequestOptionsArgs, filename?: string) {
        return this.http.get(this.transformUrl(url), { observe: "response", ...options }).then(downloadFile.bind(this, filename));
    }

    /**
     * 文件下载
     * @param  url 下载地址
     * @param  body 数据
     * @param  filename 文件名
     * @param  options 配置项
     * @return  响应等待对象
     */
    protected httpPostDownload(url: string, body: any = null, options?: RequestOptionsArgs, filename?: string) {
        return this.http.post(this.transformUrl(url), body, { observe: "response", ...options }).then(downloadFile.bind(this, filename));
    }

    protected transformRequestUrl(url: string | HttpRequest): string | HttpRequest {
        if (url instanceof HttpRequest) {
            (url as any).urls = this.transformUrl(url.url);

            return url;
        }

        return this.transformUrl(url);
    }

    protected resolveRequestContentType(contentType: string = "application/json;charset=UTF-8", options?: RequestOptionsArgs): RequestOptionsArgs {
        return this.resolveRequestHeaders({ "Content-Type": contentType }, options);
    }

    protected resolveRequestHeaders(headers: HeaderParams, options: RequestOptionsArgs = {}): RequestOptionsArgs {
        return { ...options, headers: { ...options.headers, ...(headers as any) } };
    }

    protected resolveRequestParams(params: SearchParams, options: RequestOptionsArgs = {}): RequestOptionsArgs {
        return { ...options, params: { ...(options.params as any), ...(params as any) } };
    }

    resolveUrl(...args: any[]): string {
        return args.join("/");
    }

    transformUrl(url: string = ""): string {
        return this.controllerName + "/" + url;
    }

    getRootUrl(url: string = ""): string {
        return this.http.transformUrl(url);
    }
}

/**
 * 文件下载
 * @param  filename 文件名
 * @param  response 接口响应对象
 */
function downloadFile(filename: string | string[], response: Response) {
    if (!filename && (filename = response.headers.get("Content-Disposition")!) && (filename = filename.match(/(filename)=(.*);\s?(?:\1\*=UTF-8''(.*))?$/i)!)) {
        filename = decodeURIComponent(filename[3] || filename[2]);
    }

    filename = filename || "文件下载";

    response.blob().then((blob) => {
        if ("msSaveOrOpenBlob" in window.navigator) {
            (window.navigator as any).msSaveOrOpenBlob(blob, filename as string);
        } else {
            const a = document.createElement("a"),
                url = window.URL.createObjectURL(blob);

            a.href = url;
            a.download = filename as string;
            a.type = response.headers.get("Content-Type")!;

            a.click();

            window.URL.revokeObjectURL(url);
        }
    });
}
