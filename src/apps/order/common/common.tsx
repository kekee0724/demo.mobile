import React from "react";
import { CommentAuditStatusEnum } from "@reco-m/ipark-common";
import { ActionSheet, Badge } from "antd-mobile-v2";

import { getDate } from "@reco-m/core";

import { setEventWithLabel } from "@reco-m/core-ui";
import { PayWayEnum } from "@reco-m/ipark-common";
import { Namespaces, OrderStatusEnum, EvaluateStatusEnum, isRoom, isPosition, AppPaySheetEnum } from "@reco-m/order-models";

import { statisticsEvent } from "@reco-m/ipark-statistics";

export const PAY_OPTIONS = [
    { url: "assets/images/alipay.png", title: "支付宝" },
    { url: "assets/images/wechatpay.png", title: "微信" },
];

export function appPaySheet(order, weakthis, _cancelJump, paysuccess?, payerr?) {
    // console.log(999, order);
    ActionSheet.showShareActionSheetWithOptions(
        {
            options: PAY_OPTIONS.map((obj) => ({
                icon: <img src={obj.url} alt={obj.title} width="36" />,
                title: obj.title,
            })),
            title: `支付金额￥${order.totalAmount}`,
            message: "请选择您的支付方式",
        },
        (...args) => {
            if (args[0] === AppPaySheetEnum.aliPay) {
                // 支付宝支付
                weakthis.dispatch({
                    type: `${Namespaces.ordersubmit}/apppay`,
                    payway: PayWayEnum.alipay,
                    order,
                    weakthis: weakthis,
                    paysuccess,
                    payerr,
                });
            } else if (args[0] === AppPaySheetEnum.wechatPay) {
                // 微信支付
                weakthis.dispatch({
                    type: `${Namespaces.ordersubmit}/apppay`,
                    payway: PayWayEnum.wechat,
                    order,
                    weakthis,
                    paysuccess,
                    payerr,
                });
            } else {
                // if (cancelJump) {
                //     weakthis.goTo(`resourceSubmitSucceed/${order.id}/submit`);
                // }
                ActionSheet.close();
            }
        }
    );
}

export function appPaySheetClose(weakthis) {
    ActionSheet.close();
    weakthis.dispatch({
        type: `${Namespaces.ordersubmit}/clearTime`
    });
}

export function getStatus(status: any, commentStatus: any): React.ReactNode {
    if (status === OrderStatusEnum.unpaid) {
        return <div className="color-waiting">待支付</div>;
    } else if (status === OrderStatusEnum.unapproval) {
        return <div className="color-waiting">待使用</div>;
    } else if (status === OrderStatusEnum.using) {
        return <div className="color-waiting">使用中</div>;
    } else if (status === OrderStatusEnum.complete) {
        if (commentStatus === EvaluateStatusEnum.evaluate) {
            return <div className="color-success">待评价</div>;
        } else {
            return <div className="color-success">已评价</div>;
        }
    } else if (status === OrderStatusEnum.cancel) {
        return <div className="color-cancel">已取消</div>;
    } else if (status === OrderStatusEnum.unrefund) {
        return <div className="color-waiting">待退款</div>;
    } else if (status === OrderStatusEnum.refund) {
        return <div className="color-waiting">退款成功</div>;
    } else if (status === OrderStatusEnum.check) {
        return <div className="color-cancel">待审核</div>;
    } else if (status === OrderStatusEnum.checkFaild) {
        return <div className="color-failure">审核失败</div>;
    } else if (status === OrderStatusEnum.refundFaild) {
        return <div className="color-failure">退款失败</div>;
    }
    return <div className="color-waiting">待使用</div>;
}

export function getRefundStatus(status: any) {
    if (status === OrderStatusEnum.unapproval) {
        return "";
    } else if (status === OrderStatusEnum.unrefund) {
        return <div className="color-waiting">处理中</div>;
    } else if (status === OrderStatusEnum.refund) {
        return <div className="color-waiting">退款成功</div>;
    } else if (status === OrderStatusEnum.refundFaild) {
        return <div className="color-failure">退款失败</div>;
    }
    return "";
}

export function getTimed(order: any) {
    // 是否到期
    if (order.EndDate && order.StartDate) {
        let type = order.ResourceType;
        let now = getDate(new Date())!;
        let time = getDate(order.EndDate)!;

        if (isPosition(type)) {
            // 工位广告位
            time = getDate(order.StartDate)!;
        } else if (isRoom(type)) {
            time = getDate(order.EndDate)!;
        }
        return time.getTime() - now.getTime();
    } else {
        return "";
    }
}

export function getCancelTimed(time, _type: any) {
    let timeDate = getDate(time)!;
    let now = new Date();
    return timeDate.getTime() - now.getTime();
}

export const tabs = [
    { title: <Badge>全部</Badge>, status: "", commentStatus: "" },
    { title: <Badge>待支付</Badge>, status: OrderStatusEnum.unpaid, commentStatus: "" },
    { title: <Badge>待审核</Badge>, status: OrderStatusEnum.check, commentStatus: "" },
    { title: <Badge>待使用</Badge>, status: OrderStatusEnum.unapproval, commentStatus: "" },
    { title: <Badge>使用中</Badge>, status: OrderStatusEnum.using, commentStatus: "" },
    { title: <Badge>待评价</Badge>, status: OrderStatusEnum.complete, commentStatus: EvaluateStatusEnum.evaluate },
    { title: <Badge>已评价</Badge>, status: OrderStatusEnum.complete, commentStatus: EvaluateStatusEnum.comment },
    { title: <Badge>已取消</Badge>, status: OrderStatusEnum.cancel, commentStatus: "" },
    { title: <Badge>审核失败</Badge>, status: OrderStatusEnum.checkFaild, commentStatus: "" },
    { title: <Badge>退款售后</Badge>, status: OrderStatusEnum.refund, commentStatus: "" },
];

export function myOrderTabsStatistics(index: any) {
    index === OrderStatusEnum.unpaid
        ? setEventWithLabel(statisticsEvent.paidOrderView)
        : index === OrderStatusEnum.check
        ? setEventWithLabel(statisticsEvent.auditOrderView)
        : index === OrderStatusEnum.unapproval
        ? setEventWithLabel(statisticsEvent.usedOrderView)
        : index === OrderStatusEnum.complete
        ? setEventWithLabel(statisticsEvent.evaluateOrderView)
        : index === OrderStatusEnum.cancel && setEventWithLabel(statisticsEvent.cancelledOrderView);

    setEventWithLabel(statisticsEvent.myOrderListBrowse);
}
export const refundorderTabs = [
    { title: <Badge>售后申请</Badge>, status: "", commentStatus: "", isAfterSale: true },
    { title: <Badge>处理中</Badge>, status: OrderStatusEnum.unrefund, commentStatus: "", isAfterSale: false },
    { title: <Badge>申请记录</Badge>, status: `${OrderStatusEnum.refundFaild},${OrderStatusEnum.refund}`, commentStatus: "", isAfterSale: false },
];

export const myOrderCountData = [
    {
        icon: "daifukuan",
        text: "待支付",
        param: "待支付",
        url: `order/1`,
    },
    {
        icon: "yiwancheng",
        text: "待审核",
        param: "待审核",
        url: `order/2`,
    },
    {
        icon: "daipingjia",
        text: "待使用",
        param: "待使用",
        url: `order/3`,
    },
    {
        icon: "daipingjia",
        text: "待评价",
        param: "待评价",
        url: `order/4`,
    },
    {
        icon: "duxinye-huitui",
        text: "退款/售后",
        param: "退款/售后",
        url: `order/6`,
    },
];
/**
 * 获取评论审核状态
 * @param status
 * @param type
 * @returns
 */
export function getCommentAuditStatus(status, type: "label" | "class" = "label") {
    switch (status) {
        case CommentAuditStatusEnum.waitAudit:
            return type === "class" ? "5" : "待审核";
        case CommentAuditStatusEnum.fail:
            return type === "class" ? "4" : "审核退回";
        case CommentAuditStatusEnum.pass:
            return type === "class" ? "3" : "审核通过";
        default:
            return "--";
    }
}
