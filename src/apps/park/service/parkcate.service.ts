import { HttpService, resolveService } from "@reco-m/core";

export class ParkCateHttpService extends HttpService {
    constructor() {
        super("organization/parkcatalog");
    }

    getCateByCode(code: string) {
        return this.httpGet("by-code/" + code);
    }
}

export const parkCateService = resolveService(ParkCateHttpService);
