export enum Namespaces {
    msgreach = "msgreach",
}

/**
 * 信息触达绑定表名枚举
 */
export enum MsgReachBindTableNameEnum {
    /**
     * 企业
     */
    msgReach = "std_info_push_subject",
    /**
     * 推送记录
     */
    msgReachPushRecord = "std_info_push_record",
}

/**
 * 信息触达推送类型枚举
 */
export enum MsgReachReachCanalEnum {
    /**
     * 短信
     */
    message = 2,
    /**
     * 邮件
     */
    mail = 4,
    /**
     * 钉钉
     */
    dingTalk = 8,
    /**
     * App
     */
    app = 16,
    /**
     * H5链接
     */
    h5Link = 32,
    /**
     * 微信公众号
     */
    wechatMP = 64,
    /**
     * 站内信 通知
     */
    notice = 128,
}

/**
 * 推送记录状态枚举
 */
export enum PushLogStatusEnum {
    /**
     * 成功
     */
    success = 1,
    /**
     * 失败
     */
    fail = -1,
}

/**
 * 访问限制枚举
 */
export enum MsgReachViewLimitEnum {
    /**
     * 无
     */
    none = 0,
    /**
     * 需注册
     */
    register = 1,
    /**
     * 需注册并认证
     */
    registerAndCertify = 2,
}

/**
 * 推送用户枚举
 */
export enum MsgReachPushModeEnum {
    /**
     * 系统用户
     */
    system = 1,

    /**
     * 上传企业名单
     */
    customer = 2,

    /**
     * 上传用户名单
     */
    user = 3,
}

/**
 * 信息触达状态枚举
 */
export enum MsgReachPushStatusEnum {
    /**
     * 草稿
     */
    draft = 0,

    /**
     * 已发送
     */
    send = 1,

    /**
     * 开始准备
     */
    startReadyIng = 5,

    /**
     * 准备完毕
     */
    endReadyIng = 10,

    /**
     * 正在发送
     */
    sending = 15,

    /**
     * 发送完毕
     */
    complete = 20,
}

/**
 * 收件人类型枚举
 */
export enum MsgReachUserFlagEnum {
    /**
     * 用户
     */
    user = 1,
    /**
     * 企业
     */
    customer = 2,
}

/**
 * 企业收件类型
 */
export enum MsgReachCustomerReceiverTypeEnum {
    /**
     * 管理员
     */
    admin = 1,
    /**
     * 企业员工
     */
    staff = 2,
}

/**
 * 附件枚举
 */
export enum MsgReachAttachCustomTypeEnum {
    /**
     * logo
     */
    logo = 0,

    /**
     * 分享
     */
    share = 1,

    /**
     * 上传企业名单附件
     */
    customer = 2,

    /**
     * 上传用户名单附件
     */
    user = 3,
}
