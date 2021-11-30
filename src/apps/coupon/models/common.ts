export enum Namespaces {
    couponchice = "couponchice",
    couponget = "couponget",
    mycoupon = "mycoupon",
}
/**
 * 优惠券场景
 */
export enum CouponScenceEnum {
    /**
     * 所有
     */
    all = "ALL",
    /**
     * 会议室
     */
    meeting = "MEETINGROOM",
    /**
     * 场地
     */
    yard = "YARD",
    /**
     * 工位
     */
    station = "STATION",
    /**
     * 广告位
     */
    adsense = "ADSENSE",
}
/**
 * 优惠券状态text枚举
 */
export enum CouponStateTextEnum {
    /**
     * 未使用
     */
    useImmediately = 1,
    /**
     * 已使用
     */
    used = 2,
    /**
     * 已停用
     */
    stopUse = 3,
    /**
     * 已转送
     */
    transferred = 4,
    /**
     * 已过期
     */
    overDue = 5,
}
/**
 * 优惠券状态text枚举
 */
export enum CouponTypeEnum {
    /**
     * 全部
     */
    couponAllView = 0,
    /**
     * 通用
     */
    couponCurrencyView = 1,
    /**
     * 临停
     */
    couponTemporaryParkingView = 2,
    /**
     * 车位充值
     */
    couponParkingSpaceRechargeView = 3,
    /**
     * 会议室
     */
    couponRoomView = 4,
    /**
     * 场地
     */
    couponFieldView = 5,
    /**
     * 工位
     */
    couponStationView = 6,
    /**
     * 广告位
     */
    couponAdvertisingSpaceView = 7,
}

/**
 * 优惠券状态枚举
 */
export enum CouponStatusEnum {
    /**
     * 有效
     */
    inUse = 0,

    /**
     * 已过期
     */
    overDue = 1,

    /**
     * 已下架
     */
    offShelf = 2,

    /**
     * 已停用
     */
    stopUse = 3,

    /**
     * 可使用且在时间内
     */
    canUse = 4,
}

/**
 * 优惠券获取方式枚举
 */
export enum CouponTicketSourceEnum {
    /**
     * 系统发放
     */
    system = 1,

    /**
     * 他人转赠
     */
    others = 3,

    /**
     * 活动领取
     */
    selfGet = 2,
}

export const stateTabs = () => [
    { title: "未使用", state: 1 },
    { title: "已使用", state: 2 },
    { title: "已停用", state: 3 },
    { title: "已转赠", state: 4 },
    { title: "已过期", state: 5 },
];
