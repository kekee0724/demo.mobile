import { HttpService, resolveService } from "@reco-m/core";

export class BusinessBillHttpService extends HttpService {
  constructor() {
    super("businessbill/business-bill");
  }
  /**
   * 已读
   */
  read(data?: any) {
    return this.httpPost("read", data);
  }
  getConfig() {
    return this.httpGet("get-config");
  }

}

export const businessBillHttpService = resolveService(BusinessBillHttpService);

