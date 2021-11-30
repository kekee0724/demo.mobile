import { HttpService, resolveService } from "@reco-m/core";

export class ParkHttpService extends HttpService {
    constructor() {
        super("organization/park");
    }

    get(data: any) {
        return this.httpGet("GetPaged", this.resolveRequestParams(data));
    }
    list(data: any) {
        return this.httpGet("list", this.resolveRequestParams(data));
    }
}

export const parkService = resolveService(ParkHttpService);

export class ParkBaseHttpService extends HttpService {
    constructor() {
        super("space/park");
    }
    getNearPark(data: any) {
        return this.httpGet("lately", this.resolveRequestParams(data));
    }
}
export const impressionService = resolveService(ParkBaseHttpService);
