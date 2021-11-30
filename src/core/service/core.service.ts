import { BaseHttpService, RequestOptionsArgs, SearchParams } from "../http";

import { IDParam, IDsParam } from "../http/type";

export class HttpService extends BaseHttpService {
    get(id?: IDParam, options?: RequestOptionsArgs) {
        return this.httpGet(this.resolveUrl(id), options);
    }

    getList(data?: SearchParams, options?: RequestOptionsArgs) {
        return this.httpGet(this.resolveUrl("list"), this.resolveRequestParams(data!, options));
    }

    getPaged(data: SearchParams, options?: RequestOptionsArgs) {
        return this.httpGet(this.resolveUrl(""), this.resolveRequestParams(data, options));
    }

    post(data: any, options?: RequestOptionsArgs) {
        return this.httpPost(this.resolveUrl(""), data, options);
    }

    put(id: IDParam, data: any, options?: RequestOptionsArgs) {
        return this.httpPut(this.resolveUrl(id), data, options);
    }

    delete(id: IDParam, options?: RequestOptionsArgs) {
        return this.httpDelete(this.resolveUrl(id), options);
    }

    batchdelete(data: IDsParam, options?: RequestOptionsArgs) {
        return this.httpPut(this.resolveUrl("batch-delete"), data, options);
    }

    valid(id: IDParam, isValid: number | boolean, options?: RequestOptionsArgs) {
        return this.httpPut(this.resolveUrl("valid", id), null, this.resolveRequestParams({ isValid }, this.resolveRequestContentType(undefined, options)));
    }

    sequence(data: any, options?: RequestOptionsArgs) {
        return this.httpPut(this.resolveUrl("sequence"), data, options);
    }

    enabled(id: IDParam, options?: RequestOptionsArgs) {
        return this.httpPut(this.resolveUrl("enabled", id), null, options);
    }

    disabled(id: IDParam, options?: RequestOptionsArgs) {
        return this.httpPut(this.resolveUrl("disabled", id), null, options);
    }

    publish(id: IDParam, options?: RequestOptionsArgs) {
        return this.httpPut(this.resolveUrl("publish", id), null, options);
    }

    batchEnabled(id: IDsParam, options?: RequestOptionsArgs) {
        return this.httpPut(this.resolveUrl("batch-enabled"), id, options);
    }

    batchDisabled(id: IDsParam, options?: RequestOptionsArgs) {
        return this.httpPut(this.resolveUrl("batch-disabled"), id, options);
    }

    batchPublish(id: IDsParam, options?: RequestOptionsArgs) {
        return this.httpPut(this.resolveUrl("batch-publish"), id, options);
    }
}
