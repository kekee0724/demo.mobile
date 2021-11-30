import { HttpService, resolveService, getLocalStorage } from "@reco-m/core";
export class PolicyHttpService extends HttpService {
    protected configPromise: any;
    constructor() {
        super("policy/policy");
    }

    getApplyTags(data) {
        return this.httpGet("getApplyTags", this.resolveRequestParams(data));
    }

    /**
     * 获取配置
     * @returns
     */
    getConfig() {
        this.configPromise || (this.configPromise = this.httpGet("getConfig"));

        return this.configPromise || Promise.resolve({});
        // return Promise.resolve({ declareMode: 1 });
    }
}

export const policyService = resolveService(PolicyHttpService);

export class PolicyServiceHttpService extends HttpService {
    constructor() {
        super("policy/implementation-detail");
    }
    /**
     * 政策申报列表
     * @param [data]
     * @returns
     */
    getPolicyServiceList(data?: any) {
        return this.httpGet("declare-implementation-detail-list", this.resolveRequestParams(data));
    }
    /**
     * 政策申报详情
     * @param [data]
     * @returns
     */
    getPolicyServiceDetail(id?: any) {
        return this.httpGet(id);
    }
}

export const policyServiceHttpService = resolveService(PolicyServiceHttpService);

/**
 * 查询标签列表
 */
export class PolicyTagHttpService extends HttpService {
    constructor() {
        super("policy/portrait-tag");
    }
}

export const policyTagHttpService = resolveService(PolicyTagHttpService);
/**
 * 查询标签项
 */
export class PolicyTagItemHttpService extends HttpService {
    constructor() {
        super("policy/portrait-tag-item");
    }
}

export const policyTagItemHttpService = resolveService(PolicyTagItemHttpService);
/**
 * 政策计算器
 */
export class PolicyMatchHttpService extends HttpService {
    constructor() {
        super("policy/calculator");
    }
    /**
     * 政策计算器模拟计算
     * @param [data]
     * @returns
     */
    postPolicyMatchResult(data?: any) {
        return this.httpPost("policy-match-predict-result", data);
    }
    /**
     * 获取政策计算器列表
     */
    getPolicyMatchList(data) {
        return this.httpGet("match-implementation-detail-list", this.resolveRequestParams(data));
    }
    /**
     * 政策计算器模拟操作记录
     * @param [data]
     * @returns
     */
    getPolicyMatchLog() {
        return this.httpGet("last-calculate-tag", this.resolveRequestParams({ parkId: getLocalStorage("parkId") }));
    }
    /**
     * 获取政策匹配默认标签
     * @returns
     */
    getPolicyMatchDefaultTagList() {
        return this.httpGet("policy-match-default-tag-list");
    }
}

export const policyMatchHttpService = resolveService(PolicyMatchHttpService);

/**
 * 我的申报
 */
export class MyPolicyMatchHttpService extends HttpService {
    constructor() {
        super("special/project");
    }
    /**
     * 获取我的申报
     * @param [data]
     * @returns
     */
    getMyPolicy(data) {
        return this.httpGet("get-apply-list", this.resolveRequestParams(data));
    }
}

export const myPolicyMatchHttpService = resolveService(MyPolicyMatchHttpService);

/**
 * 数据标签
 */
export class DatatagClassHttpService extends HttpService {
    constructor() {
        super("datatag/data-tag-class");
    }
}
export const datatagClassService = resolveService(DatatagClassHttpService);
/**
 * 数据标签分组
 */
 export class DatatagGroupHttpService extends HttpService {
    constructor() {
        super("datatag/data-tag-group");
    }
}
export const datatagGroupService = resolveService(DatatagGroupHttpService);

/**
 * 数据标签项
 */
export class DatatagHttpService extends HttpService {
    constructor() {
        super("datatag/data-tag");
    }
}
export const datatagService = resolveService(DatatagHttpService);

/**
 * 政策标签项
 */
export class PolicySubscribeHttpService extends HttpService {
    constructor() {
        super("policy/policy-subscribe");
    }

    /**
     * 获取当前用户已配置的订阅
     * @returns
     */
    getByUser() {
        return this.httpGet("by-user");
    }

    /**
     * 获取当前用户政策订阅列表
     * @param data
     * @returns
     */
    getSubscribePaged(data?) {
        return this.httpGet("subscribe-paged", this.resolveRequestParams(data));
    }
}

export const policySubscribeService = resolveService(PolicySubscribeHttpService);
/**
 * 政策标签项
 */
 export class SpecialHttpService extends HttpService {
    constructor() {
        super("special/special");
    }

    /**
     * 获取当前复杂版政策申报列表
     * @param data
     * @returns
     */
    getSpecialDetailList(data?) {
        return this.httpGet("special-detail-list", this.resolveRequestParams(data));
    }

    /**
     * 检查申报频率
     * @param id
     * @returns
     */
    checkApplyFrequency(id: any, data?) {
        return this.httpGet(`check-apply-frequency/${id}`, this.resolveRequestParams(data));
    }
}

export const policySpecialService = resolveService(SpecialHttpService);
/**
 * 政策申报
 */
 export class PolicyDeclareHttpService extends HttpService {
    constructor() {
        super("policy/declare");
    }

    getPolicyPaged(data) {
        return this.httpGet("get-policy-paged", this.resolveRequestParams(data));
    }

    /**
     * 判断是否申报过
     * @param customerId
     * @param detailId
     * @returns
     */
    getValidDeclareStatus(customerId, detailId) {
        return this.httpGet("valid-declare-status/" + customerId + "/" + detailId);
    }
}

export const policyDeclareService = resolveService(PolicyDeclareHttpService);
