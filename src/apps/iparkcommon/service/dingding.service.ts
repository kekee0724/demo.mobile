import { HttpService, resolveService } from "@reco-m/core";
export class DingTalkJSHttpService extends HttpService {
    constructor() {
        super("dingtalk/jsapi");
    }

    // 钉钉配置
    getConfig(data: any) {
        return this.httpGet("config", this.resolveRequestParams(data));
    }
}
export const dingTalkJSService = resolveService(DingTalkJSHttpService);

export class DingdingHttpService extends HttpService {
    constructor() {
        super("dingtalk/dingtalk");
    }

    accessToken(code) {
        // document.write(JSON.stringify({
        //     grant_type: "verification_code",
        //     client_id: server.apiKey!.apiKey,
        //     client_secret: server.apiKey!.secret,
        //     code: code
        // }))
        return this.httpPost("access_token", {
            grant_type: "verification_code",
            client_id: server.apiKey!.apiKey,
            client_secret: server.apiKey!.secret,
            code: code
        });
    }
    bind(openId) {
        return this.httpPost("bind", {
            openId
        });
    }
}

export const dingdingHttpService = resolveService(DingdingHttpService);

