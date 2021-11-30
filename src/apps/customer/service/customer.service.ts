import { HttpService, resolveService } from "@reco-m/core";

export class CustomerHttpService extends HttpService {
    constructor() {
        super("customer/customer");
    }

    getCustomers(data) {
        return this.httpGet("GetSimple", this.resolveRequestParams(data));
    }
    getCompanyInfo(data) {
      return this.httpGet("Get/" + data);
    }
}

export const customerService = resolveService(CustomerHttpService);

