import React from "react";

import { Modal, Toast, List, Button } from "antd-mobile-v2";

import { template, formatDateTime } from "@reco-m/core";

import { ListComponent, ImageAuto, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, OrderStatusEnum, EvaluateStatusEnum, isRoom, myorderrefundorderModel } from "@reco-m/order-models";

import { getRefundStatus, refundorderTabs } from "@reco-m/order-common";

export namespace RefundOrder {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, myorderrefundorderModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        namespace = Namespaces.myorderrefundorder;
        bodyClass = "container-height";
        status;
        commentStatus;
        showheader = false;

        componentMount() {
            let type = this.props.match!.params.type;
            type = parseInt(type, 10);

            this.dispatch({ type: `initPage`, data: { isAfterSale: refundorderTabs[0].isAfterSale } });

            setEventWithLabel(statisticsEvent.refundafter);
        }

        componentWillUnmount() {
            this.dispatch({ type: "input", data: [] });
        }

        getDataList(index?: number, status?: any, commentStatus?: any, isAfterSale?: any) {
            this.dispatch({ type: "input", data: { status, commentStatus, isAfterSale } });
            this.dispatch({
                type: "getOrdersAction",
                index: index,
                status: status,
                commentStatus: commentStatus,
                isAfterSale: isAfterSale,
            });
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            this.shouldUpdateData(nextProps.state);
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged) {
                const status = nextProps.state!.status,
                    isAfterSale = nextProps.state!.isAfterSale,
                    commentStatus = nextProps.state!.commentStatus;
                this.getDataList(1, status, commentStatus, isAfterSale);
            }
        }

        onEndReached() {
            let { state } = this.props;
            this.getDataList((state!.currentPage || 0) + 1, state!.status, state!.commentStatus, state!.isAfterSale);
        }

        pullToRefresh() {
            let { state } = this.props;
            this.getDataList(1, state!.status, state!.commentStatus, state!.isAfterSale);
        }

        /**
         * 退款申请
         */
        renderRefundApplyButtonModal(order: any) {
            Modal.alert(
                "退款提示",
                <div>
                    本次申请退款金额为<span style={{ color: "red" }}>￥{order.totalAmount}</span>,是否继续？
                </div>,
                [
                    {
                        text: "取消",
                    },
                    {
                        text: "确定",
                        onPress: () => {
                            this.dispatch({ type: "cancelOrder", cancel: { id: order.id } });
                            Toast.success("您已提交退款申请成功。", 1, () => {
                                this.pullToRefresh();
                            });

                            setEventWithLabel(statisticsEvent.applyRefund);
                        },
                    },
                ]
            );
        }
        renderRefundApplyButton(order: any): React.ReactNode {
            if (order.orderStatus === OrderStatusEnum.unapproval) {
                return (
                    <div className="my-apply-btn my-order-button">
                        <Button
                            type="primary"
                            size="small"
                            inline
                            style={{ borderRadius: "30px" }}
                            onClick={() => {
                                this.renderRefundApplyButtonModal(order)
                            }}
                        >
                            <span>
                                <i className="icon icon-shenhe size-14" /> 申请退款
                            </span>
                        </Button>
                    </div>
                );
            }

            return null;
        }

        /**
         * 待退款取消
         */
        renderCancelrefundApplyButtonModal(order) {
            Modal.alert("操作提示", "取消后管理员将无法收到此退款申请，是否确认取消申请？", [
                {
                    text: "取消",
                },
                {
                    text: "确定",
                    onPress: () => {
                        this.dispatch({ type: "cancelRefundOrder", cancelrefund: { id: order.id } });
                        Toast.success("退款申请已取消成功。", 1, () => {
                            this.pullToRefresh();
                        });

                        setEventWithLabel(statisticsEvent.cancellationRefundApplication);
                    },
                },
            ]);
        }
        renderCancelrefundApplyButton(order: any): React.ReactNode {
            if (order.orderStatus === OrderStatusEnum.unrefund) {
                return (
                    <div className="my-apply-btn my-order-button">
                        <Button
                            type="primary"
                            size="small"
                            style={{ borderRadius: "30px" }}
                            inline
                            onClick={() => {
                                this.renderCancelrefundApplyButtonModal(order);
                            }}
                        >
                            <span>
                                <i className="icon icon-shenhe size-14" /> 取消申请
                            </span>
                        </Button>
                    </div>
                );
            }
            return null;
        }
        renderRerefundApplyButtonModal(order) {
            Modal.alert(
                "退款提示",
                <div>
                    本次申请退款金额为<span style={{ color: "red" }}>￥{order.totalAmount}</span>,是否继续？
                </div>,
                [
                    {
                        text: "取消",
                    },
                    {
                        text: "确定",
                        onPress: () => {
                            this.dispatch({ type: "reRefundOrder", rerefund: { id: order.id } });
                            Toast.success("您已提交退款申请成功。", 1, () => {
                                this.pullToRefresh();
                            });

                            setEventWithLabel(statisticsEvent.applyRefund);
                        },
                    },
                ]
            );
        }
        renderRerefundApplyButton(order: any): React.ReactNode {
            if (order.orderStatus === OrderStatusEnum.refundFaild) {
                return (
                    <div className="my-apply-btn my-order-button">
                        <Button
                            type="primary"
                            size="small"
                            inline
                            onClick={() => {
                                this.renderRerefundApplyButtonModal(order);
                            }}
                        >
                            <span>
                                <i className="icon icon-shenhe size-14" /> 重新申请
                            </span>
                        </Button>
                    </div>
                );
            }

            return null;
        }

        renderItemsContentDetail(order: any): React.ReactNode {
            let { state } = this.props;
            const status = state!.status,
                commentStatus = state!.commentStatus;
            let isComplete = false;
            if (status === OrderStatusEnum.complete && commentStatus === EvaluateStatusEnum.noevaluate) {
                isComplete = true;
            }
            return (
                <>
                    <div className="my-order-text">
                        <div className="omit omit-1 size-14">{order.subject}</div>
                        <div className="color-orange size-14">
                            ￥<span style={{ marginLeft: "2px" }}>{order.totalAmount}</span>
                        </div>
                        <div className="gray-three-color size-12">
                            <div className="omit omit-1">
                                <i className="icon icon-shijian1 size-12" />
                                &nbsp;
                                {isRoom(order.orderSubType)
                                    ? formatDateTime(order.serviceStartDate, "yyyy-MM-dd hh:mm") + formatDateTime(order.serviceEndDate, "~ hh:mm")
                                    : formatDateTime(order.serviceStartDate, "yyyy-MM-dd") + " ~ " + formatDateTime(order.serviceEndDate, "yyyy-MM-dd")}
                            </div>
                            <div className="omit omit-1">
                                <i className="icon icon-newadds size-12" /> {order.roomAddress}
                            </div>
                        </div>
                    </div>
                    <div onClick={() => this.goTo({ pathname: `detail/${order.id}/${order.roomId}` })} className="size-14">
                        {isComplete ? "已完成" : getRefundStatus(order.orderStatus)}
                    </div>
                </>
            );
        }

        renderItemsContent(order?: any, _?: any): React.ReactNode {
            return <List key={"a"} className="line-border-no my-oder-list my-apply-list">
            <List.Item>
                <div className="order-content" onClick={() => this.goTo({ pathname: `detail/${order.id}` })}>
                    <div className="order-images">
                        <ImageAuto.Component cutWidth="80" cutHeight="80" src={order.coverUrl ? order.coverUrl : ""} height="80px" width="80px" />
                    </div>
                    {this.renderItemsContentDetail(order)}
                </div>

                <div key={"b"}>
                    {this.renderRefundApplyButton(order)}
                    {this.renderCancelrefundApplyButton(order)}
                    {this.renderRerefundApplyButton(order)}
                </div>
            </List.Item>
        </List>;
        }

        render(): React.ReactNode {
            return this.getListView();
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.myorderrefundorder]);
}
