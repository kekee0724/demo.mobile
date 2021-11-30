import { HttpService, resolveService } from "@reco-m/core";

export class WechatHttpService extends HttpService {
    constructor() {
        super("wechat/wechat");
    }
    getWechatAccount(data?: any) {
        return this.httpGet("getpaged", this.resolveRequestParams(data));
    }

    getWechatLogin(data?: any) {
        return this.httpGet("access_token", this.resolveRequestParams(data));
    }

    getWechatLoginPost(data?: any) {
        return this.httpPost("access_token", data);
    }

    unbindWechatAccount(data?: any) {
        return this.httpPut("unbind?openId=" + data.openId);
    }

    bindWechatAccount(data?: any) {
        return this.httpPost("bind?openId=" + data.openId);
    }
}

export class GetQQHttpService extends HttpService {
    constructor() {
        super("qq/qq");
    }

    getQQAccount(data?: any) {
        return this.httpGet("getpaged", this.resolveRequestParams(data));
    }

    getQQLogin(data?: any) {
        return this.httpGet("access_token", this.resolveRequestParams(data));
    }

    getQQLoginPost(data?: any) {
        return this.httpPost("access_token", data);
    }

    unbindQQAccount(data?: any) {
        return this.httpPut("unbind?openId=" + data.openId);
    }

    bindQQAccount(data?: any) {
        return this.httpPost("bind?openId=" + data.openId);
    }
}

export class GetWeiBoHttpService extends HttpService {
    constructor() {
        super("weibo/weibo");
    }

    getWeiBoAccount(data?: any) {
        return this.httpGet("getpaged", this.resolveRequestParams(data));
    }

    getWeiBoLogin(data?: any) {
        return this.httpGet("access_token", this.resolveRequestParams(data));
    }

    getWeiBoLoginPost(data?: any) {
        return this.httpPost("access_token", data);
    }

    unbindWeiboAccount(data?: any) {
        return this.httpPut("unbind?openId=" + data.openId);
    }

    bindWeiboAccount(data?: any) {
        return this.httpPost("bind?openId=" + data.openId);
    }
}

export const weChatService = resolveService(WechatHttpService);

export const getQQService = resolveService(GetQQHttpService);

export const getWeiBoService = resolveService(GetWeiBoHttpService);
