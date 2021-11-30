

import React from "react";

import { Button, NavBar, Icon, Toast, List, NoticeBar, WhiteSpace } from "antd-mobile-v2";

import { LocationDescriptorObject } from "history";

import { ViewComponent, popstateHandler } from "@reco-m/core-ui";

import { template, formatDateTime } from "@reco-m/core";

import { ResourceTypeEnum } from "@reco-m/ipark-common";

import { Namespaces, getResourceTitle, orderPaybackModel } from "@reco-m/order-models";

import { appPaySheet } from "@reco-m/order-common";

export namespace PaySubmit {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, orderPaybackModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.orderPayback;
        path: any;
        componentReceiveProps(nextProps: Readonly<IProps>): void {
            let locationChanged = nextProps.location !== this.props.location;

            if (locationChanged && this.props.location!.pathname!.length > nextProps.location!.pathname!.length) {
                popstateHandler.popstateListener(() => {
                    history.go(-2);
                }, "submmit");
            }
        }
        componentDidMount() {
            popstateHandler.popstateListener(() => {
                history.go(-2);
            }, "submmit");
            this.dispatch({ type: `initPage`, data: { id: this.props.match!.params.id } });
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
                return formatDateTime(date, "yyyy/MM/dd hh:mm");
            }
        }

        renderHeader(): React.ReactNode {
            let { state } = this.props;
            let order = state!.order;
            return (
                <NavBar
                    className="park-nav"
                    icon={<Icon type="left" />}
                    onLeftClick={() => {
                        history.go(-2);
                    }}
                >
                    {order ? `${getResourceTitle(order.ResourceType)}预订` : ""}
                </NavBar>
            );
        }

        protected __goTo(path: string | LocationDescriptorObject, state?: any) {
            if (this.props.match!.params.type === "submit" || this.props.match!.params.type === "review" || this.props.match!.params.type === "freesuccess") {
                popstateHandler.removePopstateListener("submmit").then(() => {
                    this.props.history && this.props.history.push(path as any, state);
                });
            } else {
                let index = `${this.props.match!.url}}`.indexOf("resourcePayErr");
                let result = `${this.props.match!.url}}`.substr(0, index);
                this.props.history && this.props.history.replace(`${result}${this.path}` as any, state);
            }
        }

        showPayActionSheet(order: any) {
            if (order.TotalAmount !== 0) {
                appPaySheet(
                    order,
                    this,
                    false,
                    (path) => {
                        this.path = path;
                        this.goTo(path);
                    },
                    (path) => {
                        this.path = path;
                        this.goTo(path);
                    }
                );
            } else {
                Toast.success("预订成功", 1, () => history.go(-2));
            }
        }

        renderImmediatePay(order: any): React.ReactNode {
            return (
                order && (
                    <div>
                        <div className="pay-content">
                            <div className="pay-icon">
                                <i className="icon icon-newtime1" />
                            </div>
                            <div className="pay-state">提交成功</div>
                            <div className="pay-tips">您的订单已提交成功，请尽快前往支付</div>
                        </div>
                        <div
                            className="pay-button"
                            onClick={() => {
                                this.showPayActionSheet(order);
                            }}
                        >
                            <Button style={{ borderRadius: 45 }} type={"primary"}>
                                立即支付
                            </Button>
                        </div>
                        <div
                            className="pay-detail-button"
                            onClick={() => {
                                this.goTo(`orderDetails/${this.props.match!.params.id}`);
                            }}
                        >
                            <Button style={{ borderRadius: 45, backgroundColor: "#f4f4f4" }} className="button-gray">
                                查看订单详情
                            </Button>
                        </div>
                    </div>
                )
            );
        }

        renderRePay(order: any): React.ReactNode {
            return (
                <div>
                    <div className="pay-content">
                        <div className="pay-icon " style={{ color: "red" }}>
                            <i className="icon icon-cuo" />
                        </div>
                        <div className="pay-state">支付失败</div>
                    </div>
                    <div
                        className="pay-button"
                        onClick={() => {
                            this.showPayActionSheet(order);
                        }}
                    >
                        <Button type="primary">重新支付</Button>
                    </div>
                </div>
            );
        }
        renderReview(order: any): React.ReactNode {
            return (
                order && (
                    <div>
                        <div className="pay-content">
                            <div className="pay-icon">
                                <i className="icon icon-newtime1" />
                            </div>
                            <div className="pay-state">待审核</div>
                            <div className="pay-tips">服务人员将尽快为您审核~</div>
                        </div>
                        <List className="pay-success-list list-not-border">
                            <List.Item thumb={<div className="pay-name">会议时间</div>} onClick={() => {}}>
                                <div className="pay-wz red not-notice-bar-style">
                                    <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                        {this.getTime(order.orderSubType, order.serviceStartDate)}-{this.getEndTime(order.orderSubType, order.serviceEndDate)}
                                    </NoticeBar>
                                </div>
                            </List.Item>
                            <List.Item thumb={<div className="pay-name">会议地点</div>} onClick={() => {}}>
                                <div className="pay-wz">{order.roomAddress}</div>
                            </List.Item>
                        </List>
                        <WhiteSpace size="md" />
                        <div
                            className="pay-detail-button"
                            onClick={() => {
                                this.goTo(`orderDetails/${this.props.match!.params.id}`);
                            }}
                        >
                            <Button className={"margin-top-lg"} type="primary" style={{ borderRadius: 45 }}>
                                查看订单详情
                            </Button>
                        </div>
                    </div>
                )
            );
        }
        rendersuccess(order: any): React.ReactNode {
            return (
                order && (
                    <div>
                        <div className="pay-content">
                            <div className="pay-icon">
                                <i className="icon icon-newtime1" />
                            </div>
                            <div className="pay-state">预订成功</div>
                        </div>
                        <List className="pay-success-list  list-not-border">
                            <List.Item thumb={<div className="pay-name">会议时间</div>} onClick={() => {}}>
                                <div className="pay-wz red not-notice-bar-style">
                                    <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                        {this.getTime(order.orderSubType, order.serviceStartDate)}-{formatDateTime(order.serviceEndDate, "hh:mm")}
                                    </NoticeBar>
                                </div>
                            </List.Item>
                            <List.Item thumb={<div className="pay-name">会议地点</div>} onClick={() => {}}>
                                <div className="pay-wz">{order.roomAddress}</div>
                            </List.Item>
                        </List>
                        <WhiteSpace size="md" />
                        <div
                            className="pay-detail-button"
                            onClick={() => {
                                this.goTo(`orderDetails/${this.props.match!.params.id}`);
                            }}
                        >
                            <Button className={"margin-top-lg"} type="primary" style={{ borderRadius: 45 }}>
                                查看订单详情
                            </Button>
                        </div>
                    </div>
                )
            );
        }
        renderBody(): React.ReactNode {
            const { state } = this.props,
                order = state!.order;
            let type = this.props.match!.params.type;
            if (type === "submit") {
                return this.renderImmediatePay(order);
            } else if (type === "review") {
                return this.renderReview(order);
            } else if (type === "freesuccess") {
                return this.rendersuccess(order);
            } else {
                return this.renderRePay(order);
            }
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.orderPayback]);
}
