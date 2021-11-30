import { getDate, formatDateTime, formatDateTimeSend } from "@reco-m/core";
import { OrderTypeEnum, CertifyEnum, ResourceTypeEnum } from "@reco-m/ipark-common";
/**
 * 价格单位
 */
export enum MaxDayBookingTypeEnum {
    /**
     * 个人
     */
    person = 1,
    /**
     * 企业
     */
    company = 2,
}
/**
 * 价格单位
 */
export enum PriceUnitEnum {
    /**
     * 元/半小时
     */
    halfHour = 1,
    /**
     * 元/小时
     */
    perHour = 2,
    /**
     * 元/天
     */
    perDay = 3,
    /**
     * 元/月
     */
    perMonth = 4,
    /**
     * 元/时段
     */
    timeSlot = 15,
}
/**
 * 预订时长单位
 */
export enum BookDayUnitEnum {
    /**
     * 天
     */
    day = 1,
    /**
     * 周
     */
    week = 2,
    /**
     * 月
     */
    month = 3,
    /**
     * 年
     */
    year = 4,
}
export enum PriceUnitNameEnum {
    "元/半小时" = 1,
    "元/小时" = 2,
    "元/天" = 3,
    "元/月" = 4,
    "元/时段" = 15,
}
/**
 * 资源类型
 */
export enum ResourceOrderTypeEnum {
    /**
     * 工位
     */
    workingType = 64,
    /**
     * 会议室
     */
    meetingType = 32,
    /**
     * 广告位
     */
    advertisementType = 2048,
    /**
     * 场地
     */
    squareType = 1024,
}
/**
 * 支付类型
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
/**
 * 支付状态
 */
export enum OrderStatusEnum {
    /**
     * 待支付
     */
    unpaid = 2,
    /**
     * 待审核
     */
    check = 1,
    /**
     * 待使用
     */
    unapproval = 512,
    /**
     * 使用中
     */
    using = 1024,
    /**
     * 审核失败
     */
    checkFaild = 8,
    /**
     * 已完成
     */
    complete = 4,
    /**
     * 订单取消
     */
    cancel = 32,
    /**
     * 待退款
     */
    unrefund = 64,
    /**
     * 退款成功
     */
    refund = 128,
    /**
     * 退款失败
     */
    refundFaild = 256,
    /**
     * 待评论
     */
    comment = -1,
}
/**
 * 评论状态
 */
export enum EvaluateStatusEnum {
    noevaluate = 1, // 不能评论
    evaluate = 2, // 待评论
    comment = 3, // 已评论
}

export enum Namespaces {
    room = "room",
    roomdetail = "roomdetail",
    roomdetailcomment = "roomdetailcomment",
    detailcommentlist = "detailcommentlist",
    roomorder = "roomorder",
    position = "position",
    positiondetail = "positiondetail",
    positiondetailcomment = "positiondetailcomment",
    positiondetailfooter = "positiondetailfooter",
    positionorder = "positionorder",
    myorder = "myorder",
    myordersearch = "myordersearch",
    myorderdetail = "myorderdetail",
    myordercountdown = "myordercountdown",
    myordercount = "myordercount",
    orderPayback = "orderPayback",
    myorderrefundorder = "myorderrefundorder",
    myorderrefundorderdetail = "myorderrefundorderdetail",
    ordersubmit = "ordersubmit",
}

/**
 * 资源预订发票类型
 */
export enum ResourceOrderIInvoiceTypeEnum {
    /**
     * 公司
     */
    company = 1,
    /**
     * 个人
     */
    person = 2,
}

/**
 * 预订时积分类型枚举
 */
export enum ResourceOrderIntergralTypeEnum {
    /**
     * 不选
     */
    none = 0,
    /**
     * 个人
     */
    person = 1,
    /**
     * 企业
     */
    company = 2,
}
/**
 * 积分选择方式
 */
export enum IntgralSelectEnum {
    /**
     * 不使用积分
     */
    none = 0,
    /**
     * 个人积分
     */
    person = 1,
    /**
     * 企业积分
     */
    company = 2,
}
export enum SkuTypeEnum {
    /**
     * 主品
     */
    goods = 1,
    /**
     * 赠品
     */
    gift = 2,
    /**
     * 服务
     */
    service = 3,
    /**
     * 折扣
     */
    discount = 4,
    /**
     * 积分
     */
    intergral = 5,
    /**
     * 卡券
     */
    coupon = 6,
}
export enum AppPaySheetEnum {
    aliPay = 0,
    wechatPay = 1,
}
export enum RoomTypeEnum {
    workingType = 2,
    meetingType = 3,
    advertisementType = 4,
    squareType = 6,
}

// 我的订单搜索判断去的页面
export enum SearchGoOrderPageTypeEnum {
    goOrderRoom = 3,
    goAreaOrderRoom = 6,
}

export enum MyOrderSearchIsLoadingEnum {
    isLoading = 1,
}

export const TIMES = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
];
export const AMs = [0, 1, 2, 3, 4];
export const PMs = [5, 6, 7, 8, 9];

export const START_TIME = " 00:00:00";
export const END_TIME = " 23:59:00";
export const START_TIME2 = " 08:00:00";
export const END_TIME2 = " 18:00:00";
export const DAY_START_TIME = " 00:00:00";
export const DAY_END_TIME = " 23:59:59";

export const MAX_CAPACITY = [
    { maxCapacity: 4, minCapacity: 0 },
    { maxCapacity: 8, minCapacity: 5 },
    { maxCapacity: 12, minCapacity: 8 },
    { maxCapacity: 20, minCapacity: 12 },
    { maxCapacity: null, minCapacity: 20 },
];

export const PAY_OPTIONS = [
    { url: "OpHiXAcYzmPQHcdlLFrc", title: "支付宝" },
    // { url: "umnHwvEgSyQtXlZjNJTt", title: "微信" },
];

export function getResourceTitle(type: number) {
    if (Number(type) === ResourceTypeEnum.meeting) {
        return "会议室";
    } else if (Number(type) === ResourceTypeEnum.square) {
        return "场地";
    } else if (Number(type) === ResourceTypeEnum.working) {
        return "工位";
    } else if (Number(type) === ResourceTypeEnum.advertisement) {
        return "广告位";
    } else {
        return "";
    }
}

export function isRoom(type: number) {
    return Number(type) === ResourceTypeEnum.meeting || Number(type) === ResourceTypeEnum.square;
}

export function isPosition(type: number) {
    return Number(type) === ResourceTypeEnum.working || Number(type) === ResourceTypeEnum.advertisement;
}

export function getHour(startDate, endDate) {
    if (startDate !== undefined) {
        let start = getDate(startDate)!;
        let end = getDate(endDate)!;
        if (formatDateTime(end, "hh:mm") === "23:59") {
            let end2 = getDate(formatDateTime(end, "yyyy-MM-dd 00:00"))!.dateAdd("d", 1);
            end = end2;
        }
        let hour = end.dateDiffDecimals("h", start);
        return hour;
    }
}

export function getRequestParams(props: any, startDate?: any, endDate?: any) {
    let { resourceType, roomid } = props.match!.params;
    let params = {
        resourceType: resourceType,
        roomId: [roomid],
    };
    let start = decodeURI(startDate);
    let end = decodeURI(endDate);
    params = Object.assign(params, {
        startDate: start && formatDateTimeSend(getDate(start)!),
        endDate: end && formatDateTimeSend(getDate(end)!),
    });
    return params;
}

export function isVisitorCertify(permission) {
    for (let i = 0; i < permission.length; i++) {
        if (permission[i].id === CertifyEnum.businessAdmin || permission[i].id === CertifyEnum.admin) {
            return true;
        }
    }
    return false;
}

export const times = [
    "00:00",
    "00:30",
    "01:00",
    "01:30",
    "02:00",
    "02:30",
    "03:00",
    "03:30",
    "04:00",
    "04:30",
    "05:00",
    "05:30",
    "06:00",
    "06:30",
    "07:00",
    "07:30",
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
    "22:30",
    "23:00",
    "23:30",
    "24:00",
];

export const day = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export const isChargeDatas = [
    { label: "免费", id: "10011", charge: false },
    { label: "收费", id: "10010", charge: true },
];

export function getPriceUnit(priceUnit) {
    if (priceUnit === PriceUnitEnum.halfHour) {
        return "元/半小时";
    } else if (priceUnit === PriceUnitEnum.perHour) {
        return "元/小时";
    } else if (priceUnit === PriceUnitEnum.perDay) {
        return "元/天";
    } else if (priceUnit === PriceUnitEnum.perMonth) {
        return "元/月";
    } else if (priceUnit === PriceUnitEnum.timeSlot) {
        return "元/时段";
    }
}
/**
 * 根据资源类型判断订单类型
 * @param orderSubType
 */
export function getOrderType(orderSubType: any) {
    switch (orderSubType) {
        case ResourceTypeEnum.working:
            return OrderTypeEnum.station;
        case ResourceTypeEnum.meeting:
            return OrderTypeEnum.meetingRoom;
        case ResourceTypeEnum.advertisement:
            return OrderTypeEnum.advertising;
        case ResourceTypeEnum.square:
            return OrderTypeEnum.venue;
        default:
            return null;
    }
}
/**
 * 获取抵扣集合
 * @param couponSelect  优惠券抵扣
 * @param selectDucType 选中的积分抵扣类型
 * @param loyaltyDeu    积分抵扣
 * @returns
 */
export function getDeductionItems(couponSelect, selectDucType, loyaltyDeu) {
    let OrderItem: any = [];

    if (couponSelect?.couponNum) {
        couponSelect?.seletItems.forEach((item) => {
            let itm = {
                content: item.name,
                pcs: item.countNumber,
                unitPrice: 0 - Number(item.denomination),
                unit: `满${item.minUsefulAmount}元可用`,
            };
            OrderItem.push(itm);
        });
    }

    if (selectDucType && loyaltyDeu) {
        let itm = {
            content: (selectDucType === ResourceOrderIntergralTypeEnum.person ? "个人" : "企业") + "积分抵扣",
            pcs: 1,
            unitPrice: 0 - Number(loyaltyDeu),
            unit: `元`,
        };
        OrderItem.push(itm);
    }

    return OrderItem;
}
/**
 * 会议室各时间段状态
 */
export enum MeetingStatusEnum {
    /**
     * 空闲
     */
    free = 0,

    /**
     * 已预订
     */
    booked = 1,

    /**
     * 未开放
     */
    unoppened = 3,

    /**
     * 未设置
     */
    noSet = 4,
}
