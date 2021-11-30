export enum Namespaces {
    apply = "apply",
    applyDetail = "applyDetail",
    consult = "consult",
    market = "market",
    marketSearch = "marketSearch",
    marketDetail = "marketDetail",
    marketDetailFooter = "marketDetailFooter",
    marketApply = "marketApply",
    marketIn = "marketIn",
    marketInDetail = "marketInDetail",
    myVisitor = "myVisitor",
    myVisitorDetail = "myVisitorDetail",
    product = "product",
    productSearch = "productSearch",
    productDetail = "productDetail",
    productApply = "productApply",
    wrokorderCreate = "wrokorderCreate",
    productAdd = "productAdd",
    wrokorderDetail = "wrokorderDetail",
    marketEdit = "marketEdit",
    productList = "productList",
    marketauth = "marketauth",
}
/**
 * 我的访客状态
 */
export enum MyVisitorTypeEnum {
    /**
     * 全部
     */
    all = "",
    /**
     * 待审核
     */
    wating = 0,
    /**
     * 处理中
     */
    hadling = 1,
    /**
     * 已完成
     */
    finish = 5,
    /**
     * 待评论
     */
    toBeEvaluate = "",
    /**
     * 已退回
     */
    back = -1,
    allBack = -8,
    /**
     * 已取消
     */
    cancel = -5,
}

/**
 * 服务机构筛选
 */
export enum MarketTypeEnum {
    /**
     * 服务类型
     */
    serviceType = 1,
    /**
     * 服务城市
     */
    serviceCity = 2,
    /**
     * 只能排序
     */
    intelligenceSort = 3,
    /**
     * 时间排序
     */
    timeSort = 1,
    /**
     * 热度排序
     */
    heatSort = 2,
    /**
     * 收费类型
     */
    chargType = 4,
    /**
     * 免费
     */
    chargFree = 1,
    /**
     * 面议
     */
    chargDiscuss = 2,
    /**
     * 收费
     */
    chargToll = 3,
}

/**
 * 机构类型
 */
export enum ServiceInstitutionAcceptanceModeEnum {
    /**
     * 机构资质完善，线上受理工单的流程
     */
    institution = 1,
    /**
     * 平台机构&服务产品只做展示，不开启服务申请功能
     */
    showOnly = 2,
    /**
     * 平台初始化机构信息，平台方进行服务统一受理
     */
    platform = 3,
}
/**
 * 访客预约类型
 */
export enum VisitorTypeEnum {
    /**
     * 受访者
     */
    respondent = 1,
    /**
     * 访客
     */
    visitor = 2,
}
/**
 * 我的申请状态
 */
export enum MyApplyTabTypeEnum {
    /**
     * 全部
     */
    all = "",
    /**
     * 待受理
     */
    wating = 0,
    /**
     * 处理中
     */
    hadling = 1,
    /**
     * 已完成
     */
    finish = 5,
    /**
     * 待评论
     */
    toBeEvaluate = "",
    /**
     * 已退回
     */
    back = -1,
    allBack = -8,
    /**
     * 已取消
     */
    cancel = -5,
}
/**
 * 我的访客tab
 */
export enum MyApplyTabTypeIndexEnum {
    /**
     * 全部
     */
    all = 0,
    /**
     * 待受理
     */
    wating = 1,
    /**
     * 处理中
     */
    hadling = 2,
    /**
     * 已完成
     */
    finish = 3,
    /**
     * 待评论
     */
    toBeEvaluate = 4,
    /**
     * 已取消
     */
    cancel = 5,
    /**
     * 已退回
     */
    back = 6,
}
/**
 * 我的申请评价状态
 */
export enum MyApplyTopicStatusEnum {
    /**
     * 未评价
     */
    topicStatus = "6",
    /**
     * 已评价
     */
    finishTopicStatus = "7",
}
/**
 * 服务机构类型
 */
export enum MarketTagIdEnum {
    /**
     * 公司注册
     */
    companyRegistered = 1,
    /**
     * 财税服务
     */
    fiscalTaxationService = 2,
    /**
     * 法律服务
     */
    legalServices = 3,
    /**
     * 人力培训
     */
    manpowerTraining = 4,
    /**
     * it服务
     */
    itServices = 5,
    /**
     * 品牌创意
     */
    brandCreativity = 6,
    /**
     * 知识产权
     */
    intellectualPropertyRights = 7,
    /**
     * 其他
     */
    other = 8,
}

export const defaultApprovers = [{ id: 1, name: "system" }];

export const tabs = [
    { title: "全部", i: 0, status: null, topicStatus: "" },
    { title: "待受理", i: 1, status: MyApplyTabTypeEnum.wating, topicStatus: "" },
    { title: "处理中", i: 2, status: MyApplyTabTypeEnum.hadling, topicStatus: "" },
    { title: "已完成", i: 3, status: MyApplyTabTypeEnum.finish, topicStatus: MyApplyTopicStatusEnum.finishTopicStatus },
    { title: "待评价", i: 4, status: MyApplyTabTypeEnum.finish, topicStatus: MyApplyTopicStatusEnum.topicStatus },
    { title: "已取消", i: 6, status: MyApplyTabTypeEnum.cancel, topicStatus: "" },
    { title: "已退回", i: 5, status: MyApplyTabTypeEnum.back, topicStatus: "" },
];
/**
 * 工单操作权限code
 */
export enum WorkOrderTriggerEnum {
    /**
     * 工单受理
     */
    workOrderAcceptTrigger = "WorkorderAcceptTrigger",
    /**
     * 工单指派
     */
    workOrderAssignTrigger = "WorkorderAssignTrigger",
    /**
     * 工单转派
     */
    workOrderTransferTrigger = "WorkorderTransferTrigger",
    /**
     * 取消工单
     */
    workOrderCancelTrigger = "WorkorderCancelTrigger",
    /**
     * 工单完成
     */
    workOrderFinishTrigger = "WorkorderFinishTrigger",
    /**
     * 工单退回
     */
    workOrderReturnTrigger = "WorkorderReturnTrigger",
    /**
     * 工单提交
     */
    workOrderSubmitTrigger = "WorkorderSubmitTrigger",
    /**
     * 转派第三方
     */
    workOrderTransferThirdPartyTrigger = "WorkorderTransferThirdPartyTrigger",
    /**
     *
     */
    workOrderRepairUserConfirmTrigger = "WorkorderRepairUserConfirmTrigger",
    /**
     * 物业报修评估
     */
    workOrderRepairAssessmentTrigger = "WorkorderRepairAssessmentTrigger",
    /**
     * 取消报修
     */
    workOrderRepairCancelTrigger = "WorkorderRepairCancelTrigger",
    /**
     * 继续报修
     */
    workOrderRepairContinueTrigger = "WorkorderRepairContinueTrigger",
    /**
     * 维修完成
     */
    workOrderRepairCompleteTrigger = "WorkorderRepairCompleteTrigger",
    /**
     * 维修成功
     */
    workOrderRepairSuccessTrigger = "WorkorderRepairSuccessTrigger",
    /**
     * 维修失败
     */
    workOrderRepairFailTrigger = "WorkorderRepairFailTrigger",
    /**
     * 重新提交
     */
    workOrderResubmitTrigger = "WorkorderResubmitTrigger",
    /**
     * 重新处理
     */
    workorderReprocessingTrigger = "WorkorderReprocessingTrigger",
    /**
     * 访客预约通过
     */
    workOrderVisitorApprovalTrigger = "WorkorderVisitorApprovalTrigger",
    /**
     * 受理并完成
     */
    workorderAcceptFinishTrigger = "WorkorderAcceptFinishTrigger",
}

/**
 * 我的入住申请状态
 */
export enum MyMarketinStatusEnum {
    /**
     * 退回
     */
    bounced = -1,
    /**
     * 待审核
     */
    wait = 0,
    /**
     * 通过
     */
    pass = 1,
    /**
     * 已取消
     */
    cancel = 2,
}
/**
 * 服务产品tab值
 */
export enum MyProductTabEnum {
    /**
     * 上架
     */
    sj = "0",
    /**
     * 下架
     */
    xj = "1",
    /**
     * 审核
     */
    sh = "2",
    /**
     * 退回
     */
    th = "3",
    /**
     * 取消
     */
    qx = "4",
}
/**
 * 默认工单图片枚举
 */
export enum ImagesCategoryEnum {
    fkyy = "访客预约",
    fkyy_fk = "访客预约（访客）",
    fkyy_sfz = "访客预约（受访者）",
    fwcp = "服务产品",
    fwjjrz = "服务机构入驻",
    fwjs = "服务集市",
    fwsq = "服务申请",
    qykb_hh = "企业开办（合伙）",
    qykb_yb = "企业开办（一般）",
    rzsq = "入驻申请",
    tswsq = "停车位申请",
    wpfx = "物品放行",
    wybx = "物业报修",
    wyts = "物业投诉",
    xqtb = "需求提报",
    yjbfw = "瑜伽班服务",
    yjfk = "意见反馈",
    yktsq = "一卡通申请",
    yqzx = "园区咨询",
    yykf = "预约看房",
    zczx = "政策咨询",
    zxsq = "装修申请",
}
