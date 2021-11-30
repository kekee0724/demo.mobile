import { HttpService, resolveService, getLocalStorage } from "@reco-m/core";

export class ResourceHttpService extends HttpService {
    constructor() {
        super("resource/resource");
    }

    getResource(data: any) {
        return this.httpGet("", this.resolveRequestParams(data));
    }

    getResourceDetail(id: number, data: any) {
        return this.httpGet("" + id, data);
    }
    getResourceConfig(id: number) {
        return this.httpGet(id + "/config");
    }

    getResourceStatus(data: any) {
        return this.httpPost("status", data);
    }
    getResourceSpace(data: any) {
        return this.httpGet("space", this.resolveRequestParams(data, { parkId: getLocalStorage("parkId")}));
    }
    canBook(id: any) {
        return this.httpGet("can-book/" + id);
    }
}

export class ResourceOrderHttpService extends HttpService {
    constructor() {
        super("order/resource");
    }
    cancelOrder(id: any) {
        return this.httpPost(id + "/cancel");
    }
    getOrderLog(id: any) {
        return this.httpGet(id + "/logs");
    }
    cancelRefundOrder(id: any) {
        return this.httpPost(id + "/cancel-refund");
    }
    reRefundOrder(id: any) {
        return this.httpPost(id + "/again-refund");
    }

    resourceOrder(data: any) {
        return this.httpPut("Order", data);
    }

    orderOperate(data: any) {
        return this.httpPost("operate", data);
    }
    todayRemainingTime(data: any) {
        return this.httpGet("order-hour-duration", this.resolveRequestParams(data));
    }
}

export const resourceService = resolveService(ResourceHttpService);

export const myOrderService = resolveService(ResourceOrderHttpService);
