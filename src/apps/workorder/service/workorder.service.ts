import { HttpService, resolveService, getLocalStorage } from "@reco-m/core";

/**
 * 问题库管理
 */
export class WorkQuestionService extends HttpService {
    constructor() {
        super("problem/problem");
    }
    /**
     * 问题库-查询数量
     */
    getProblemCount() {
        return this.httpGet("count");
    }
    /**
     * 问题库-查询全部
     */
    getProblemList() {
        return this.httpGet("list");
    }
}
export const workQuestionService = resolveService(WorkQuestionService);
export class WorkOrderHttpService extends HttpService {
    constructor() {
        super("workorder/workorder");
    }
    getStatisticsByUser(data?: any) {
        return this.httpGet("statistics-by-user", this.resolveRequestParams(Object.assign({}, data, { IsStateOrder: true })));
    }

    getByUser(data?: any) {
        return this.httpGet("by-user", this.resolveRequestParams(Object.assign({}, data, { IsStateOrder: true })));
    }

    finish(id: number) {
        return this.httpPut(this.resolveUrl("finish", id));
    }

    refuse(data: any) {
        return this.httpPut(this.resolveUrl("withdraw"), data);
    }

    /**
     * 取消工单申请
     */
    cancelApplay(data: any) {
        return this.httpPost("cancel/" + data.orderID, data.remark);
    }

    /**
     * 提醒管理员审核工单
     */
    remindAdmin(data: any) {
        return this.httpPut(data.orderID + "/remind");
    }

    /**
     * 获取加载进度
     */
    getLog(id: number) {
        return this.httpGet(id + "/logs");
    }

    /**
     * 获取费用
     */
    getBill(id: number) {
        return this.httpGet(id + "/bill");
    }

    getCatalogDTO(code) {
        return this.httpGet(`catalogue?catalogueCode=${code}`);
    }

    getStatisticsByCatalogue() {
        return this.httpGet("statistics-by-catalogue");
    }

    getRepairCost(data) {
        return this.httpGet(this.resolveUrl("GetRepairCost"), this.resolveRequestParams(data));
    }
}

export class MyMarketInHttpService extends HttpService {
    constructor() {
        super("service-alliance/service-institution");
    }
    /**
     * 服务机构校验手机
     */
    getValidateMobile(mobile) {
        return this.httpGet("validate-institution-mobile/" + mobile + "/" + getLocalStorage("parkId"));
    }

    getMyInstitution() {
        return this.httpGet("my-service-institution", this.resolveRequestParams({}, { parkId: getLocalStorage("parkId") }));
    }
    messageVerifiCode(mobile, auditId) {
        return this.httpGet(`message-verification-code/${mobile}/${auditId}`);
    }
    validateMessageCode(mobile, auditId, data) {
        return this.httpGet(`validate-message-verification-code/${mobile}/${auditId}`, this.resolveRequestParams(data));
    }
    sendMessageCode(mobile) {
        return this.httpGet(`send-message-verification-code/${mobile}`);
    }
    confirminstitution(institutionId, mobile, messagecode) {
        return this.httpPut(`confirm-institution-handler/${institutionId}/${mobile}/${messagecode}`);
    }
    institutionContactPerson(id) {
        return this.httpGet(`institution-contact-person-change-record/${id}`);
    }
    acceptanceMode() {
        return this.httpGet("acceptance-mode");
    }
   
    modifyContact(id, data) {
        return this.httpPost("institution-contact-person/" + id, data);
    }

    getWorkOrder(data: any) {
        return this.httpGet(`my-institution-and-product-work-order`, this.resolveRequestParams(data));
    }

    getConfig() {
        return this.httpGet("institution-service-agreement");
    }
}

export class CompanyHttpService extends HttpService {
    constructor() {
        super("customer/company");
    }

    getCompanyInfo(customerId) {
        return this.httpGet(customerId + "/business-info");
    }
}


export class ServiceProductService extends HttpService {
    constructor() {
        super("service-alliance/service-product");
    }
    onService(id, isOnService) {
        return this.httpPut("on-service/" + id + "/" + isOnService);
    }
    getConfig() {
        return this.httpGet("product-service-agreement");
    }
    cancelProductAudit(id: any) {
        return this.httpPut(`cancel-product-audit/${id}`);
    }
    serviceNum(data: any) {
        return this.httpGet("service-product-status-number", this.resolveRequestParams(data));
    }
}

export class ParkCatalogueHttpService extends HttpService {
    constructor() {
        super("organization/parkcatalog");
    }
}

export class MemberServiceHttpService extends HttpService {
    constructor() {
        super("member-service/member-service");
    }
    visitorOrder(data: any) {
        return this.httpGet("visitor-order-paged", this.resolveRequestParams(data));
    }
    pendingBusiness(data: any) {
        return this.httpGet("pending-business", this.resolveRequestParams(data));
    }
}

export const workOrderService = resolveService(WorkOrderHttpService);
export const parkcatalogueService = resolveService(ParkCatalogueHttpService);
export const myMarketInHttpService = resolveService(MyMarketInHttpService);
export const serviceProductService = resolveService(ServiceProductService);
export const companyHttpService = resolveService(CompanyHttpService);
export const memberServiceHttpService = resolveService(MemberServiceHttpService);
