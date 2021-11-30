import { HttpService, resolveService, getLocalStorage } from "@reco-m/core";
export class CashAliPayHttpService extends HttpService {
    constructor() {
        super("cash/alipay");
    }

    pay(params: any) {
        return this.httpPost(getLocalStorage("parkId") + "/pay", params);
    }
    payConfirm(params: any) {
        return this.httpPost(getLocalStorage("parkId") + "/pay-confirm", params);
    }
}
export const cashAliPayService = resolveService(CashAliPayHttpService);
export class WechatPayService extends HttpService {
    constructor() {
        super("cash/wechatpay");
    }
    pay(params: any) {
        return this.httpPost(getLocalStorage("parkId") + "/pay", params);
    }
    payConfirm(params: any) {
        return this.httpPost(getLocalStorage("parkId") + "/pay-confirm", params);
    }
}

export const wechatPayService = resolveService(WechatPayService);

