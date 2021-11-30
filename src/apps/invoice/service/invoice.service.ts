import { HttpService, resolveService } from "@reco-m/core";

export class CashInvoiceHttpService extends HttpService {
  constructor() {
    super('cash/invoice')
  }
  deleteInvoice(id: number) {
    return this.httpDelete('' + id)
  }
  getInvoiceDetail(id: number) {
    return this.httpGet('' + id)
  }
  modifyITitle(data: any) {
    return this.httpPut('' + data.id, data.data)
  }

}

export class CashPayHttpService extends HttpService {
  constructor() {
    super('cash/pay')
  }

  getPayMessage(data: any) {
    return this.httpGet('list', this.resolveRequestParams(data))
  }
  getCashPay(id: any) {
    return this.httpGet('' + id)
  }
}

export const cashInvoiceService = resolveService(CashInvoiceHttpService)
export const cashPayService = resolveService(CashPayHttpService)
