

import React from "react";

import { Button, WhiteSpace, List, NoticeBar, NavBar, Icon } from "antd-mobile-v2";

import { template, formatDateTime } from "@reco-m/core";

import { ViewComponent, popstateHandler } from "@reco-m/core-ui";

import { ResourceTypeEnum } from "@reco-m/ipark-common";

import { Namespaces, getResourceTitle, PayWayEnum, orderPaybackModel } from "@reco-m/order-models";

export namespace PaySucceed {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

    export interface IState extends ViewComponent.IState, orderPaybackModel.StateType { }

    let payWay: any = "";

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.orderPayback;
        componentReceiveProps(nextProps: Readonly<IProps>): void {
            let locationChanged = nextProps.location !== this.props.location;

            if (locationChanged && this.props.location!.pathname!.length > nextProps.location!.pathname!.length) {
                popstateHandler.popstateListener(() => {
                    history.go(-2);
                }, "success");
            }
        }
        componentDidMount() {
            popstateHandler.popstateListener(() => {
                history.go(-2);
            }, "success");
            this.dispatch({ type: `initPage`, data: { id: this.props.match!.params.id } });
            if (this.props.location!.search) payWay = this.getSearchParam("payWay");
        }

        getTime(type: number, date: any) {
            if (type === ResourceTypeEnum.advertisement || type === ResourceTypeEnum.working) {
                return formatDateTime(date, "yyyy/MM/dd");
            } else {
                return formatDateTime(date, "yyyy/MM/dd hh:mm");
            }
        }
        getEndTime(type: number, date: any) {
            if (type === ResourceTypeEnum.advertisement || type === ResourceTypeEnum.working) {
                return formatDateTime(date, "yyyy/MM/dd");
            } else {
                return formatDateTime(date, "hh:mm");
            }
        }
        renderHeader(): React.ReactNode {
            const { state } = this.props,
                order = state!.order;

            return (
                <NavBar
                    className="park-nav"
                    icon={<Icon type="left" />}
                    onLeftClick={() => {
                        history.go(-2);
                    }}
                >
                    {order ? `${getResourceTitle(order.orderSubType)}预订` : ""}
                </NavBar>
            );
        }

        renderInfo(order: any): React.ReactNode {
            return (
                <List className="pay-success-list">
                    <List.Item thumb={<div className="pay-name red">支付信息</div>} onClick={() => { }}>
                        <div className="pay-wz red">{order.subject}</div>
                        <div className="pay-wz red not-notice-bar-style">
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                {this.getTime(order.orderSubType, order.serviceStartDate)}-{this.getEndTime(order.orderSubType, order.serviceEndDate)}
                            </NoticeBar>
                        </div>
                    </List.Item>
                    <List.Item thumb={<div className="pay-name">付款方式</div>} onClick={() => { }}>
                        <div className="pay-wz">{Number(payWay) === PayWayEnum.alipay ? "支付宝" : (Number(payWay) === PayWayEnum.wechat ? "微信" : "系统抵扣")}</div>
                    </List.Item>
                    <List.Item thumb={<div className="pay-name">付款金额</div>} onClick={() => { }}>
                        <div className="pay-wz">{order.totalAmount}元</div>
                    </List.Item>
                    <List.Item thumb={<div className="pay-name">积分信息</div>} onClick={() => { }}>
                        <div className="pay-wz">订单完成后，将获得10积分</div>
                    </List.Item>
                </List>
            );
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                order = state!.order;

            return (
                order && (
                    <div>
                        <div className="pay-content border-bottom-1px">
                            <div className="pay-icon">
                                <i className="icon icon-xuanzhong" />
                            </div>
                            <div className="pay-state">支付成功</div>
                            <div className="pay-price">{order.totalAmount}元</div>
                        </div>
                        <WhiteSpace size="md" />
                        {this.renderInfo(order)}
                        <div
                            className="pay-button"
                            onClick={() => {
                                popstateHandler.removePopstateListener("success").then(() => {
                                    this.goTo(`orderDetails/${this.props.match!.params.id}`);
                                });
                            }}
                        >
                            <Button type={"primary"}>查看订单详情</Button>
                        </div>
                    </div>
                )
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.orderPayback]);
}
