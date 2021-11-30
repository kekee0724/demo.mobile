import { HttpService, resolveService } from "@reco-m/core";

import { authService } from "./auth.service";

export class LoginHttpService extends HttpService {
    constructor() {
        super(server.auth!.oauth2Url);
    }

    login(data: any) {
        return this.httpPost(
            "access_token",
            {
                client_id: server.apiKey!.apiKey,
                client_secret: server.apiKey!.secret,
                grant_type: "password",
                ...data
            },
            { allowAnonymous: true }
        );
    }
    refreshToken(token, iskeep?: boolean) {
        authService.clearCurrentUser(), this.http.authProvider.refreshToken(token, iskeep);
    }
    refreshUID(uid) {
        this.http.authProvider.refreshUID(uid);
    }
    account_access(data) {
        return this.httpGet("current-access", this.resolveRequestParams(data));
    }
}

export const loginService = resolveService(LoginHttpService);

