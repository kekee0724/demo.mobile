export enum Namespaces {
    activity = "activity",
    activityDetail = "activityDetail",
    activitySign = "activitySign",
    activitySigned = "activitySigned",
    myActivity = "myActivity",
}
/**
 * 活动状态
 */
export enum ActivityTypeEnum {
    /**
     * 报名中
     */
    signUp = 0,
    /**
     * 进行中
     */
    onGoing = 1,
    /**
     * 已结束
     */
    finish = 2,
    /**
     * 未发布
     */
    unPublish = "false",
}
/**
 * 签到状态
 */
export enum SignTypeEnum {
    /**
     * 待签到
     */
    waitSignIn = 0,
    /**
     * 已签到
     */
    signIn = 1,
}
/**
 * 审核状态
 */
export enum ReviewTypeEnum {
    /**
     * 待审核
     */
    toBeReview = 0,
    /**
     * 审核未通
     */
    reviewNotPass = 1,
    /**
     * 审核通过
     */
    reviewPass = 2,
}

/**
 * 报名表单字段类型枚举
 */
export enum SignFormFieldTypeEnum {
    /**
     * 普通文本框
     */
    text = 1,
    /**
     * 下拉框
     */
    select = 2,
    /**
     * 日期选择框
     */
    date = 3,
    /**
     * 单选框
     */
    radio = 4,
    /**
     * 复选框
     */
    check = 5,
    /**
     * 多行文本框
     */
    textArea = 6,
}
/**
 * 文本框类型枚举
 */
export enum TextTypeEnum {
    /**
     * 字符串
     */
    string = 1,
    /**
     * 数字
     */
    number = 2,
}

/**
 * 活动类型枚举
 */
export enum ActivityModeEnum {
    /**
     * 线上活动
     */
    online = 1,
    /**
     * 线下活动
     */
    offline = 2,
}

export const activityStatus = [0, 1, 2, 5];

/**
 * 报名状态text
 */
export enum BadgeEnum {
    /**
     * 报名中
     */
    registration = "报名中",
    /**
     * 进行中
     */
    equal = "进行中",
    /**
     * 已结束
     */
    over = "已结束",
    /**
     * 未发布
     */
    released = "未发布",
}
