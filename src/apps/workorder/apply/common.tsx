import React from "react";

import { setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { MyApplyTabTypeEnum, MyApplyTopicStatusEnum, MyApplyTabTypeIndexEnum } from "@reco-m/workorder-models";

import { MyVisitorTypeEnum } from "@reco-m/workorder-models";

export function renderAllTabsLabel(order: any): React.ReactNode {
    const { status, topicStatus } = order;
    return (
        <div>
            {
                // 带审核
                status === MyApplyTabTypeEnum.wating && <div className="color-waiting">待受理</div>
            }
            {
                // 已通过
                status === MyApplyTabTypeEnum.hadling && allSpecialStatusText(order.flowStateStatus)
            }
            {
                // 已完成
                status === MyApplyTabTypeEnum.finish && topicStatus !== Number(MyApplyTopicStatusEnum.topicStatus) && <div className="color-success">已完成</div>
            }
            {
                // 待评价
                status === MyApplyTabTypeEnum.finish && topicStatus === Number(MyApplyTopicStatusEnum.topicStatus) && <div className="color-success">待评价</div>
            }
            {
                // 已退回
                status === MyApplyTabTypeEnum.back && <div className="color-cancel">已退回</div>
            }
            {
                // 已取消
                status === MyApplyTabTypeEnum.cancel && <div className="color-cancel">已取消</div>
            }
        </div>
    );
}
export function renderTabsLabel(order: any): React.ReactNode {
    const { status, topicStatus } = order;

    return (
        <div>
            {
                // 带审核
                status === MyApplyTabTypeEnum.wating && <div className="color-waiting">待受理</div>
            }
            {
                // 已通过
                status === MyApplyTabTypeEnum.hadling && specialStatusText(order)
            }
            {
                // 已完成
                status === MyApplyTabTypeEnum.finish && topicStatus !== Number(MyApplyTopicStatusEnum.topicStatus) && <div className="color-success">已完成</div>
            }
            {
                // 待评价
                status === MyApplyTabTypeEnum.finish && topicStatus === Number(MyApplyTopicStatusEnum.topicStatus) && <div className="color-success">待评价</div>
            }
            {
                // 已取消
                status === MyApplyTabTypeEnum.cancel && <div className="color-cancel">已取消</div>
            }
            {
                // 已退回
                status === MyApplyTabTypeEnum.back && <div className="color-cancel">已退回</div>
            }
        </div>
    );
}

function specialStatusText(order: any) {
    if (order.catalogueName !== "物业报修") {
        return <div className="color-failure">处理中</div>;
    } else {
        return (
            <div className="special-status">
                <span className="size-10" style={{ color: "#8E8E93" }}>
                    ({order.flowStateStatus})
                </span>
                <span className="color-failure size-16">处理中</span>
            </div>
        );
    }
}

function allSpecialStatusText(status: any) {
    if (status === "处理中" || status === "已完成") {
        return <div className="color-failure">{status}</div>;
    } else {
        return (
            <div className="special-status">
                <span className="size-10" style={{ color: "#8E8E93" }}>
                    ({status})
                </span>
                <span className="color-failure size-16">处理中</span>
            </div>
        );
    }
}

export function getStatusText(status: number, order: any) {
    switch (status) {
        case MyApplyTabTypeEnum.wating:
            return <div className="color-waiting">待受理</div>;
        case MyApplyTabTypeEnum.hadling:
            return specialStatusText(order.flowStateStatus);
        case MyApplyTabTypeEnum.back:
            return <div className="color-cancel">已退回</div>;
        case MyApplyTabTypeEnum.cancel:
            return <div className="color-cancel">已取消</div>;
        case MyApplyTabTypeEnum.finish: {
            if (order.topicStatus === Number(MyApplyTopicStatusEnum.topicStatus)) {
                return <div className="color-success">待评价</div>;
            }
            return <div className="color-success">已完成</div>;
        }

        default:
            return "";
    }
}

export function tabsStatisticsEvent(index: number) {
    index === MyApplyTabTypeIndexEnum.wating
        ? setEventWithLabel(statisticsEvent.viewAcceptanceWorkOrders)
        : index === MyApplyTabTypeIndexEnum.hadling
        ? setEventWithLabel(statisticsEvent.viewProcessWorkOrders)
        : index === MyApplyTabTypeIndexEnum.finish
        ? setEventWithLabel(statisticsEvent.viewCompletedWorkOrders)
        : index === MyApplyTabTypeIndexEnum.toBeEvaluate
        ? setEventWithLabel(statisticsEvent.viewEvaluationWorkOrders)
        : index === MyApplyTabTypeIndexEnum.cancel
        ? setEventWithLabel(statisticsEvent.viewCanceledWorkOrders)
        : index === MyApplyTabTypeIndexEnum.back && setEventWithLabel(statisticsEvent.viewReturnedWorkOrders);

    setEventWithLabel(statisticsEvent.worksheetListBrowse);
}

export function myVisitorTypeEnumComponent(status: number): React.ReactNode {
    return (
        <div>
            {
                // 带审核
                status === MyVisitorTypeEnum.wating && <div className="wait-color">待审核</div>
            }
            {
                // 已通过
                status === MyVisitorTypeEnum.finish && <div className="success-color">已通过</div>
            }
            {
                // 已退回
                status === MyVisitorTypeEnum.back && <div className="error-color">已退回</div>
            }
        </div>
    );
}

export const tabs = () => [
    { title: "全部", status: MyVisitorTypeEnum.all },
    { title: "待审核", status: MyVisitorTypeEnum.wating },
    { title: "已通过", status: MyVisitorTypeEnum.finish },
    { title: "已退回", status: MyVisitorTypeEnum.back },
];

// 物业报修流程编号
export const repairFlowCode = "WORKORDER_WYBX";
// 维修完成待确认
export const repairWaitConfirm = "维修完成待确认";
