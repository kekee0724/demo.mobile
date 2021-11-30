export enum Namespaces {
    myCertify = "myCertify",
    certifyForm = "certifyForm",
    certifyDetail = "certifyDetail",
    staffmanagerList = "staffmanagerList",
    staffmanagerDetail = "staffmanagerDetail",
    staffmanagerApproval = "staffmanagerApproval",
    staffmanagerApprovalDetail = "staffmanagerApprovalDetail",
    selectCompany = "selectCompany",
    selectCompanyUser = "selectCompanyUser",
    intergral = "intergral",
    member = "member",
    certifyCompanyForm = "certifyCompanyForm",
}
/**
 * 认证状态
 */
export enum CertifyStatusEnum {
    /**
     * 未认证
     */
    nocertify = 1,
    /**
     * 待审核
     */
    noConfim = 2,
    /**
     * 审核通过
     */
    allow = 3,
    /**
     * 审核拒绝
     */
    bounced = 4,
}
/**
 * 会员类型
 */
export enum MemberTypeEnum {
    /** 管理元 */
    admin = "企业管理员",

    /** 员工 */
    staff = "企业员工",
}

export const changeCounters: any = {
    articleChangeCounter: 0,
    articles: [],
    integral: {},
};

export enum MemberRoleEnum {
    common = 1,
    realName = 2,
    company = 3,
}

export const tabs = () => [
    { title: "积分简介", sub: "1" },
    { title: "积分获取", sub: "2" },
    { title: "积分使用", sub: "3" },
];

export function getCertifyStatusEnum(currentMember: any) {
    if ((currentMember && currentMember.status === CertifyStatusEnum.nocertify) || !currentMember || !currentMember.id) {
        // 未认证
        return false;
    } else if (currentMember && currentMember.status === CertifyStatusEnum.noConfim) {
        // 待确认
        return false;
    } else if (currentMember && currentMember.status === CertifyStatusEnum.allow) {
        // 已通过
        return true;
    } else {
        // 已退回
        return false;
    }
}

export function getCertifyCompanyName(currentMember: any) {
    let certifyName = "";
    if ((currentMember && currentMember.status === CertifyStatusEnum.nocertify) || !currentMember || !currentMember.id) {
        // 未认证
    } else if (currentMember && currentMember.status === CertifyStatusEnum.noConfim) {
        // 待确认
    } else if (currentMember && currentMember.status === CertifyStatusEnum.allow) {
        certifyName = currentMember.companyName;
    } else {
        // 已退回
    }
    return certifyName;
}

export function multisort(array, ...compairers) {
    return array.sort((a, b) => {
        for (const c of compairers) {
            const r = c(a, b);
            if (r !== 0) {
                return r;
            }
        }
    });
}

export enum RuleTypeEnum {
    earn = 0,
    expend = 1,
}
export enum CurrentIntergralTypeEnum {
    person = 0,
    company = 1,
}

/**
 * 积分事件代码枚举
 */
export enum loyaltyEventCodeEnum {
    Order_ruzsq = "Order_ruzsq",
}
