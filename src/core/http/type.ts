export type HttpObserve = "body" | "events" | "response";

export type IDParam = number | string;

export type IDsParam = number[] | string[] | IDParam[];

export interface RequestOptionsArgs extends RequestInit {
    observe?: HttpObserve;
    params?: string | URLSearchParams | { [key: string]: any | any[] };
    responseType?: "arraybuffer" | "blob" | "json" | "text";
    allowAnonymous?: boolean;
    ignoreNetError?: boolean;
    timeout?: number;
    disableTimeout?: boolean;
    unitId?: IDParam;
    parkId?: IDParam;
}

export type SearchParams = string | URLSearchParams | { [key: string]: any | any[] };

export type HeaderParams = Headers | { [name: string]: any } | null;
