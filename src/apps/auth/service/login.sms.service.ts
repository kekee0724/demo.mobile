import { HttpService, resolveService } from "@reco-m/core";

export class LoginSMSHttpService extends HttpService {
    constructor() {
        super(server.auth!.oauth2Url);
    }

    // 手机号登录
    loginNew(data: any) {
        return this.httpGet(
            "access_token",
            this.resolveRequestParams(
                {
                    client_id: server.apiKey!.apiKey,
                    client_secret: server.apiKey!.secret,
                    grant_type: "authorization_mobile",
                    ...data
                },
                { allowAnonymous: true }
            )
        );
    }

    // 获取验证码
    getLoginCode(data: any) {
        return this.httpGet(
            "authorize",
            this.resolveRequestParams({
                client_id: server.apiKey!.apiKey,
                client_secret: server.apiKey!.secret,
                response_type: "mobile",
                username: data.username
            },
            { allowAnonymous: true })
        );
    }

    refreshToken(token, iskeep?: boolean) {
        this.http.authProvider.refreshToken(token, iskeep);
    }
}
export const loginSMSService = resolveService(LoginSMSHttpService);
