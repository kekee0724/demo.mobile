import React from "react";

import { NavBar, List, Flex, Button, Icon, Tabs, Modal, Toast } from "antd-mobile-v2";

import { template, formatDateTime } from "@reco-m/core";

import { ImageAuto, ListComponent, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { OrderStatusEnum, EvaluateStatusEnum, isRoom, Namespaces, myorderModel } from "@reco-m/order-models";

import { getStatus, tabs, myOrderTabsStatistics /* getCancelTimed */ } from "@reco-m/order-common";

import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

import { RefundOrder } from "./my.order.refundorder";

export namespace MyOrder {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, myorderModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        namespace = Namespaces.myorder;
        bodyClass = "container-hidden";
        key: any;
        componentDidMount() {
            const index = this.props.match!.params.index;
            this.key = this.getSearchParam("key");
            this.dispatch({ type: `initPage`, data: { status: tabs[index].status, commentStatus: tabs[index].commentStatus, key: this.key && decodeURI(this.key) } });
            setEventWithLabel(statisticsEvent.myOrderListBrowse);
        }

        componentWillUnmount(): void {
            this.dispatch({ type: "init" });
        }

        getDataList(index?: number, status?: any, commentStatus?: any) {
            this.key = this.getSearchParam("key");
            this.dispatch({ type: "input", data: { status, commentStatus } });
            this.dispatch({
                type: "getOrdersAction",
                index: index,
                status: status,
                commentStatus: commentStatus,
                key: this.key && decodeURI(this.key),
            });
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            this.shouldUpdateData(nextProps.state);

            if (nextProps.location !== this.props.location) {
                const status = nextProps.state!.status,
                    commentStatus = nextProps.state!.commentStatus;

                this.getDataList(1, status, commentStatus);
            }
        }

        onEndReached() {
            const { state } = this.props;
            this.getDataList((state!.currentPage || 0) + 1, state!.status, state!.commentStatus);
        }

        pullToRefresh() {
            const { state } = this.props;
            this.getDataList(1, state!.status, state!.commentStatus);
        }

        renderButton(order: any): React.ReactNode {
            return order.orderStatus === OrderStatusEnum.complete && order.commentStatus === EvaluateStatusEnum.evaluate /* && getTimed(order) < 0 */ ? (
                <div className="my-apply-btn">
                    <Button
                        type="primary"
                        size="small"
                        inline
                        onClick={(e) => {
                            e.stopPropagation();
                            this.goTo({
                                pathname: `evaluate`,
                                state: {
                                    bindTable: [
                                        {
                                            bindTableId: order.id,
                                            bindTableName: IParkBindTableNameEnum.order,
                                        },
                                        {
                                            bindTableId: order.bindTableId,
                                            bindTableName: order.bindTableName,
                                        },
                                    ],
                                    title: order.subject,
                                    bindTableValue: order.subject,
                                },
                            });
                        }}
                    >
                        去评价
                    </Button>
                </div>
            ) : null;
        }

        renderItemsContentDetail(items: any): React.ReactNode {
            const { state } = this.props,
                status = state!.status,
                commentStatus = state!.commentStatus,
                isComplete = status === OrderStatusEnum.complete && commentStatus === EvaluateStatusEnum.noevaluate ? true : false;

            return (
                <Flex align="start">
                    <Flex.Item>
                      <Flex>
                        <Flex.Item>
                          <div className="omit omit-1">{items.subject}sada萨达发顺丰撒勾搭上发文千万人飞洒发搜房网天气我法萨芬王企鹅sada萨达发顺丰撒勾搭上发文千万人飞洒发搜房网天气我法萨芬王企鹅sada萨达发顺丰撒勾搭上发文千万人飞洒发搜房网天气我法萨芬王企鹅</div>
                        </Flex.Item>
                        <div className="size-14">{isComplete ? "已完成" : getStatus(items.orderStatus, items.commentStatus)}</div>
                      </Flex>
                        {!(items.totalAmount === items.originalAmount && items.totalAmount === 0) ? (
                            <div className="color-orange">
                                ￥<span style={{ marginLeft: "2px" }}>{items.totalAmount}</span>&nbsp;&nbsp;&nbsp;
                                {items.originalAmount && items.originalAmount!== items.totalAmount? (
                                    <s style={{ color: "lightgray" }}>
                                        ￥<span>{items.originalAmount}</span>
                                    </s>
                                ) : (
                                    ""
                                )}
                            </div>
                        ) : (
                            <div className="color-orange">免费</div>
                        )}
                        <div className="gray-three-color size-14">
                            <div className="omit omit-1" style={{ paddingRight: 0 }}>
                                <i className="icon icon-shijian size-14" />
                                &nbsp;
                                {isRoom(items.orderSubType)
                                    ? formatDateTime(items.serviceStartDate, "yyyy-MM-dd hh:mm") + formatDateTime(items.serviceEndDate, "~ hh:mm")
                                    : formatDateTime(items.serviceStartDate, "yyyy-MM-dd") + " ~ " + formatDateTime(items.serviceEndDate, "yyyy-MM-dd")}
                            </div>
                            <div className="omit omit-1">
                                <i className="icon icon-newadds size-14" /> {items.roomAddress}
                            </div>
                        </div>
                    </Flex.Item>
                </Flex>
            );
        }
        /**
         * 待使用取消申请
         */
        renderCancelrefundButton(order: any): React.ReactNode {
            const status = order.orderStatus;
            // const millisecond = order.noResponCancelTime * 60 * 1000;
            const params = { id: order.id };
            const type = "cancelOrder";
            if (
                status === OrderStatusEnum.check ||
                ((status === OrderStatusEnum.unapproval  || status === OrderStatusEnum.using) &&
                    order.totalAmount ===
                        0) /* && getCancelTimed(order.serviceStartDate, order.orderSubType) > millisecond */ /* status === OrderStatusEnum.unapproval && order.totalAmount === 0 && getCancelTimed(order.serviceStartDate, order.orderSubType) > millisecond */
            ) {
                return (
                    <div className="my-apply-btn my-order-button">
                        <Button
                            type="primary"
                            size="small"
                            inline
                            onClick={(e) => {
                                e.stopPropagation();
                                Modal.alert("操作提示", "确认取消订单？", [
                                    {
                                        text: "取消",
                                    },
                                    {
                                        text: "确定",
                                        onPress: () => {
                                            this.dispatch({
                                                type: type,
                                                params: params,
                                                callBack: () => {
                                                    Toast.success("您的订单已取消成功，欢迎再次预订。", 1, () => {
                                                        this.pullToRefresh();
                                                    });
                                                },
                                            });
                                        },
                                    },
                                ]);
                            }}
                        >
                            <span>
                                <i className="icon icon-shenhe size-14" /> 取消订单
                            </span>
                        </Button>
                    </div>
                );
            }
            return null;
        }
        renderItemsContent(items: any, i?: number): React.ReactNode {
            return (
                <List className="my-apply-list extra-auto">
                    <List.Item
                        key={i}
                        multipleLine
                        wrap
                        onClick={() => {
                            this.goTo(`orderDetails/${items.id}`);

                            setEventWithLabel(statisticsEvent.myOrderDetailView);
                        }}
                    >
                        <div className="my-order-flex">
                            <ImageAuto.Component cutWidth="80" cutHeight="80" src={items.coverUrl} height="80px" width="80px" />
                            {this.renderItemsContentDetail(items)}
                        </div>
                        {this.renderButton(items)}
                        {this.renderCancelrefundButton(items)}
                    </List.Item>
                </List>
            );
        }

        renderHeader(): React.ReactNode {
            return (
                <NavBar
                    className="park-nav"
                    icon={<Icon type="left" />}
                    onLeftClick={() => this.goBack()}
                    rightContent={<Icon type="search" onClick={() => this.goTo(`orderSearch`)} />}
                >
                    我的订单
                </NavBar>
            );
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                showList = state!.showList,
                isRefund = state!.isRefund;
            return (
                <div className="container-body apply-container">
                    <Tabs
                        tabs={tabs}
                        swipeable={false}
                        initialPage={parseInt(this.props.match!.params.index, 10)}
                        onTabClick={(tab) => {
                            // console.log(tab)
                            // 判端是否退款逻辑
                            let isRefund = tab.status === OrderStatusEnum.refund ? true : false;
                            // 解决切换数据闪屏
                            this.dispatch({ type: "input", data: { showList: false, isRefund } });
                            // 解决切换数据闪屏
                            setTimeout(() => {
                                this.getDataList(1, tab.status, tab.commentStatus);
                            }, 100);
                            myOrderTabsStatistics(tab.status);
                        }}
                    >
                        {/* 其他or退款售后 */}
                        {!isRefund ? (showList ? this.getListView() : null) : showList ? this.renderEmbeddedView(RefundOrder.Page) : null}
                    </Tabs>
                </div>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.myorder]);
}
