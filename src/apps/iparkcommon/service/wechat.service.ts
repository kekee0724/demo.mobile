import { HttpService, resolveService } from "@reco-m/core";
export class WechatMPJSHttpService extends HttpService {
    constructor() {
        super("wechatmp/jsapi");
    }
    getConfig(data) {
        return this.httpGet("config", this.resolveRequestParams(data));
    }
}

export const wechatMPJSService = resolveService(WechatMPJSHttpService);

export class WechatMPHttpService extends HttpService {
    constructor() {
        super("wechatmp/wechatmp");
    }

    accessToken(code) {
        return this.httpPost("access_token", {
            grant_type: "verification_code",
            client_id: server.apiKey!.apiKey,
            client_secret: server.apiKey!.secret,
            code: code
        });
    }
    bind(openId) {
        return this.httpPost("bind?openId=" + openId);
    }
}

export const wechatMPHttpService = resolveService(WechatMPHttpService);