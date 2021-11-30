import { HttpService, resolveService } from "@reco-m/core";

export class AppVersionService extends HttpService {
    constructor() {
        super("app/version");
    }

    getAppVersion(data?: any) {
        return this.httpGet("new-version", this.resolveRequestParams(data));
    }
}

export const appVersionService = resolveService(AppVersionService);
