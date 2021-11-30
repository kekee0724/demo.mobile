import { HttpService, resolveService } from "@reco-m/core";


export class ParkHttpService extends HttpService {
    constructor() {
        super("space/park")
    }
    /**
     * 园区详情
     */
    getParkDetail(id?: any) {
        return this.httpGet(id)
    }
}



export const parkService = resolveService(ParkHttpService);
