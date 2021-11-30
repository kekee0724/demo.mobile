import { HttpService, resolveService } from "@reco-m/core";

export class AppModuleService extends HttpService {
    constructor() {
        super("app/module")
    }

    getModules(param: any) {
        return this.httpGet("all", this.resolveRequestParams(param))
    }
    getHomeModules(param: any) {
        return this.httpGet("home", this.resolveRequestParams(param))
    }
    getDefaultModules(param: any) {
        return this.httpGet("default", this.resolveRequestParams(param))
    }
    postHomeModules(param: any) {
        return this.httpPost("home", param)
    }
    getConfig() {
        return this.httpGet("getConfig")
    }
}

export const appModuleService = resolveService(AppModuleService);

