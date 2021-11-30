import { HttpService, resolveService, getLocalStorage } from "@reco-m/core";
import { ServiceSourceEnum } from "@reco-m/ipark-common";
export class MemberHttpService extends HttpService {
    currentUser: any;

    constructor() {
        super("member/authentication");
    }

    getMember(accountId, parkId) {
        return this.httpGet(accountId + "/" + parkId);
    }
    cancelCertify(id) {
        return this.httpPut("cancel/" + id, this.resolveRequestParams({ operateSource: ServiceSourceEnum.app }));
    }
    unbindCertify(id) {
        return this.httpPut("unbind/" + id + "/" + getLocalStorage("parkId"), this.resolveRequestParams({ operateSource: ServiceSourceEnum.app }));
    }
    pageCompanyStaff(data) {
        return this.httpGet("page-company-staff", this.resolveRequestParams(data));
    }
    updateCompanyUserType(id, parkid, companyUserTypeId, data) {
        return this.httpPut("update-company-user-type/" + id + "/" + parkid + "/" + companyUserTypeId, data);
    }
    audit(data) {
        return this.httpPut("audit", data);
    }

    /**
     * 获取账户认证园区列表
     * @param accountId
     */
    getCertifyPark(accountId) {
        return this.httpGet("account-park/" + accountId);
    }

    getCurrentUser() {
        return this.currentUser ? this.currentUser : this.httpGet("GetCurrentUser").then((d) => (this.currentUser = d));
    }

    clearCurrentUser() {
        delete this.currentUser;
    }

    getCertifyDetail(accountId, parkId) {
        return this.httpGet(`${accountId}/${parkId}`);
    }

    config(data: any) {
        return this.httpPut("config", data);
    }
}

export const memberService = resolveService(MemberHttpService);

export class MemberCompanyHttpService extends HttpService {
    currentUser: any;

    constructor() {
        super("member/company");
    }

    /**
     * 校验统一社会信用代码
     * @param data {creditCode}
     * @returns
     */
    validateCreditcode(data) {
        return this.httpGet("isvalid-creditcode", this.resolveRequestParams(data));
    }

    userPage(data: any) {
        return this.httpGet("user-page", this.resolveRequestParams(data));
    }
    setUserManager(data: any) {
        return this.httpPut(`set-user-as-manager/${data.companyId}/${data.accountId}/${data.oldAccountId}`);
    }
    /**
     * 赋值附件
     * @param data
     * @returns
     */
    generateAttach(data) {
        return this.httpPost("generateAttach", data);
    }
}
export const memberCompanyHttpService = resolveService(MemberCompanyHttpService);


export class MemberCompanyUserTypeHttpService extends HttpService {
    currentUser: any;

    constructor() {
        super("member/company-user-type");
    }
    list() {
        return this.httpGet("list", this.resolveRequestParams({isSupportFrontAuth: true}));
    }
}

export const memberCompanyUserTypeHttpService = resolveService(MemberCompanyUserTypeHttpService);

export class IntegralSetHttpService extends HttpService {
    currentUser: any;

    constructor() {
        super("integral/set");
    }
    companySet(companyId: any) {
        return this.httpGet("company-set/" + companyId);
    }
    personalSet(accountId: any) {
        return this.httpGet("personal-set/" + accountId);
    }
}

export const integralSetHttpService = resolveService(IntegralSetHttpService);

export class IntegralintegralHttpService extends HttpService {
    currentUser: any;

    constructor() {
        super("integral/integral");
    }
    intergralChart(data) {
        return this.httpGet("sum", this.resolveRequestParams(data));
    }
    /**
     * 触发个人积分事件
     * @param data
     * @returns
     */
    operateMemberIntegral(data) {
        return this.httpPut("operate-member-integral", data);
    }
    refundMemberIntegral(data) {
        return this.httpPost(`refund-member-integral?accountId=${data.accountId}&eventCode=${data.eventCode}&times=${data.times}`);
    }
}

export const integralintegralHttpService = resolveService(IntegralintegralHttpService);
export class IntegralConfigHttpService extends HttpService {
    currentUser: any;

    constructor() {
        super("integral/config");
    }
    getConfig() {
        return this.httpGet("detail");
    }
}

export const integralConfigHttpService = resolveService(IntegralConfigHttpService);
export class MemberSignHttpService extends HttpService {
    currentUser: any;

    constructor() {
        super("member/sign");
    }
    signInfo(setId) {
        return this.httpGet("sign-info/" + setId);
    }
    sign(setId) {
        return this.httpPost("sign/" + setId);
    }
}

export const memberSignHttpService = resolveService(MemberSignHttpService);
export class IntegralEventHttpService extends HttpService {
    currentUser: any;

    constructor() {
        super("integral/event");
    }
    integralEvent(data) {
        return this.httpGet("category-integral-event", this.resolveRequestParams(data));
    }
}

export const integralEventHttpService = resolveService(IntegralEventHttpService);

export class IntegralOperateHttpService extends HttpService {
    currentUser: any;

    constructor() {
        super("integral/operate");
    }
}

export const integralOperateHttpService = resolveService(IntegralOperateHttpService);

export class AddMemberHttpService extends HttpService {
    currentUser: any;

    constructor() {
        super("member/member");
    }
    addMember(id) {
        return this.httpPost(id);
    }
}

export const addMemberService = resolveService(AddMemberHttpService);

export class MemberSocialInfoHttpService extends HttpService {
    currentUser: any;

    constructor() {
        super("member-service/user-social-information");
    }
    /**
     * 个人主页各项数量
     */
    getMyCount(id: any) {
        return this.httpGet(`social-info/${id}/${getLocalStorage("parkId")}/${getLocalStorage("parkId")}`);
    }
}

export const memberSocialInfoHttpService = resolveService(MemberSocialInfoHttpService);
