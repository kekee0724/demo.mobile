/**
 * 页面打开方式
 */
export enum OpenTypeEnum {
    /**
     * app内打开
     */
    h5App = 0,
    /**
     * 壳子中打开
     */
    native = 1,
    /**
     * 浏览器打开
     */
    broswer = 2,
}
/**
 * 数据来源
 */
export enum ServiceSourceEnum {
    pc = 1,
    app = 2,
    miniApp = 3,
    web = 4,
    wechatMP = 5,
}
/**
 * 数据来源
 */
export enum ServiceSourceTextEnum {
    pc = "PC",
    app = "APP",
    miniApp = "MiniAPP",
    web = "Web",
    wechatMP = "WechatMP",
}
/**
 * 认证类型
 */
export enum CertifyEnum {
    admin = 1,
    companyStaff = 2,
    businessAdmin = 3,
}
/**
 * 会议室类型
 */
export enum ResourceTypeEnum {
    /**
     * 会议室
     */
    meeting = 32,
    /**
     * 场地
     */
    square = 1024,
    /**
     * 广告位
     */
    advertisement = 2048,
    /**
     * 工位
     */
    working = 64,
    /**
     * 停车位
     */
    parking = 5,
}
/**
 * 发票类型
 */
export enum InvoiceTitleTypeEnum {
    /**
     * 普通
     */
    commonInvoice = 1,
    /**
     * 增值税
     */
    speciallyInvoice = 2,
    /**
     * 个人
     */
    personInvoice = 3,
}
/**
 * 公司或个人标题类型
 */
export enum ComOrPerTitleTypeEnum {
    company = 1,
    person = 2,
}
/**
 * 订单状态
 */
export enum OrderStatusEnum {
    /**
     * 已取消
     */
    cancel = -5,

    /**
     * 待派单
     */
    noConfim = 0,

    /**
     * 处理中
     */
    processing = 1,

    /**
     * 已退回
     */
    bounced = -1,

    /**
     * 已完成
     */
    completed = 5,

    /**
     * 待评价
     */
    noEvaluate = 6,

    /**
     * 已评价
     */
    evaluate = 7,
}

/**
 * 订单类型
 */
export enum OrderTypeEnum {
    /**
     * 工位预订
     */
    station = 2,
    /**
     * 会议室预订
     */
    meetingRoom = 3,
    /**
     * 广告位预订
     */
    advertising = 4,
    /**
     * 场地预订
     */
    venue = 6,

    /**
     * 活动
     */
    activity = 8,
}
/**
 * 支付方式
 */
export enum PayWayEnum {
    /**
     * 支付宝
     */
    alipay = 1,
    /**
     * 微信
     */
    wechat = 2,
    /**
     * 现金
     */
    cash = 3,
    /**
     * 积分
     */
    integral = 4,
}
export enum PaymentTypeEnum {
    /**
     * PC
     */
    native = 0,
    /**
     * 手机
     */
    app = 1,
    /**
     * 服务号
     */
    jsApi = 2,
    /**
     * H5
     */
    h5 = 3,
    /**
     * 小程序
     */
    miniProgram = 4,
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
 * 支付状态
 */
export enum TradeStatusEnum {
    /**
     * 交易创建
     */
    created = 1,
    /**
     * 交易关闭
     */
    closed = 2,
    /**
     * 交易挂起
     */
    pending = 3,
    /**
     * 交易成功
     */
    success = 4,
    /**
     * 交易完成
     */
    finished = 5,
}
/**
 * 园区 资源  类型
 */
export enum IParkResourceTypeEnum {
    /**
     * 园区
     */
    park = 1,
    /**
     * 项目
     */
    project = 2,
    /**
     * 楼宇
     */
    building = 4,
    /**
     * 楼层
     */
    floor = 8,
    /**
     * 房间
     */
    room = 16,
    /**
     * 会议室
     */
    meetingRoom = 32,
    /**
     * 工位房间
     */
    cubicleRoom = 64,
    /**
     * 工位
     */
    cubile = 128,
    /**
     * 停车场
     */
    parkingLot = 256,
    /**
     * 停车位
     */
    parkingSpace = 512,
    /**
     * 场地
     */
    venue = 1024,
    /**
     * 广告位
     */
    advertisingSpace = 2048,
}

/**
 * 园区所用表 枚举  类型
 */
export enum IParkBindTableNameEnum {
    /**
     * 活动
     */
    activity = "bi_activity",
    /**
     * 资讯
     */
    article = "std_article",
    /**
     * 话题
     */
    circle = "std_topic",
    /**
     * 动态
     */
    post = "std_post",
    /**
     * 优惠券
     */
    coupon = "bi_coupon",
    /**
     * 服务机构
     */
    institution = "bi_service_institution",
    /**
     * 服务产品
     */
    product = "bi_service_product",
    /**
     * 会员
     */
    member = "std_member",
    /**
     * 企业认证
     */
    newCompany = "std_new_company",
    /**
     * 会员认证
     */
    certify = "std_member_authentication",
    /**
     * 订单
     */
    order = "bi_order",
    /**
     * 政策
     */
    policy = "bi_policy",
    /**
     * 政策细则
     */
    policyService = "bi_policy_implementation_detail",
    /**
     * 问题
     */
    problem = "bi_problem",
    /**
     * 资源
     */
    resource = "bi_resource",
    /**
     * 空间
     */
    space = "std_space",
    /**
     * 评论
     */
    comment = "std_comment",
    /**
     * 工单
     */
    workorder = "std_workorder",
    /**
     * 问卷
     */
    survey = "std_survey",
    /**
     * 已回答问卷
     */
    surveyanswer = "STDSurveyAnswer",
    /**
     * 我的话题
     */
    mycircle = "STDFollow",
    /**
     * 联系人
     */
    contact = "std_contact",
    /**
     * 账号
     */
    sysaccount = "sys_account",
    /**
     * 资讯，仅在信息触达中使用
     */
    articleInformation = "std_article_information",
    /**
     * 问卷，仅在信息触达中使用
     */
    questionnaire = "bi_questionnaire",
    /**
     * 服务机构入驻审核消息
     */
    biserviceauditrecord = "bi_service_audit_record",
    /**
     * 推送消息
     */
    stdinforeachobjectlog = "std_info_reach_object_log",
    /**
     * 粉丝关注消息
     */
    stdfollow = "std_follow",
    /**
     * 审核员工或管理员
     */
    memberAudit = "certifyslider",
    /**
     * 工单
     */
    stdFlowState = "StdFlowState",
    /**
     * 工单反馈
     */
    biWorkOrderLog = "BIWorkOrderLog",
    /**
     * 企业账单
     */
    businessBill = "bi_business_bill",
}
/**
 * 评论审核状态枚举
 */
export enum CommentAuditStatusEnum {
    /**
     * 待审核
     */
    waitAudit = 0,
    /**
     * 审核通过
     */
    pass = 1,
    /**
     * 审核退回
     */
    fail = 2,
}
