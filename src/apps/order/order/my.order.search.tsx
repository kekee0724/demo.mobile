import React from "react";

import { List, SearchBar, Button, Flex } from "antd-mobile-v2";

import { template, formatDateTime } from "@reco-m/core";

import { ListComponent, ImageAuto, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";


import { OrderStatusEnum, EvaluateStatusEnum, isRoom, Namespaces, SearchGoOrderPageTypeEnum, MyOrderSearchIsLoadingEnum, myordersearchModel } from "@reco-m/order-models";

import { getStatus, getTimed } from "@reco-m/order-common";

export namespace MyOrderSearch {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> { }

    export interface IState extends ListComponent.IState, myordersearchModel.StateType {
        form?;
        dataSource?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = false;
        headerContent = "我的订单";
        namespace = Namespaces.myordersearch;

        componentMount() {
            this.dispatch({ type: `initPage` });
        }

        componentWillUnmount() {
            this.dispatch({
                type: "input",
                data: {
                    key: "",
                    items: "",
                    showList: false
                }
            });
            this.getDataList(1, "");
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            this.shouldUpdateData(nextProps.state);
        }

        getDataList(index?: number, key?: any) {
            if (index === MyOrderSearchIsLoadingEnum.isLoading) this.dispatch({ type: "input", data: { isLoading: true } });
            this.dispatch({ type: "getOrdersAction", index, key });
        }

        pullToRefresh() {
            let { state } = this.props;
            this.getDataList(1, state!.key);
        }

        onEndReached() {
            let { state } = this.props;
            this.getDataList((state!.currentPage || 0) + 1, state!.key);
        }

        goOrderPage(order: any) {
            if (order.ResourceType === SearchGoOrderPageTypeEnum.goOrderRoom) {
                this.goTo({
                    pathname: `orderRoom/${order.ResourceID}/${order.ResourceType}`
                });
            } else if (order && order.ResourceType === SearchGoOrderPageTypeEnum.goAreaOrderRoom) {
                this.goTo({
                    // 场地预订
                    pathname: `areaorderRoom/${order.ResourceID}/${order.ResourceType}`
                });
            } else {
                this.goTo({
                    pathname: `orderPosition/${order.ResourceID}/${order.ResourceType}`
                });
            }
        }

        renderButton(order: any): React.ReactNode {
            return order.orderStatus === OrderStatusEnum.complete && order.commentStatus === EvaluateStatusEnum.evaluate && getTimed(order) < 0 ? (
                <div className="my-apply-btn">
                    <Button
                        type="primary"
                        size="small"
                        inline
                        onClick={e => {
                            e.stopPropagation();
                            this.goTo(`evaluate/${order.id}/1/${order.totalAmount}/${order.bindTableId}`);
                        }}
                    >
                        去评价
                    </Button>
                </div>
            ) : (
                    null
                );
        }


        renderImageAutoContent(items: any): React.ReactNode {
            return (
                <Flex.Item>
                    <div className="omit omit-1">{items.subject}</div>
                    <div className="color-orange">
                        ￥<span style={{ marginLeft: "2px" }}>{items.totalAmount}</span>&nbsp;&nbsp;&nbsp;
                            {items.originalAmount ? (
                            <s style={{ color: "lightgray" }}>
                                ￥<span>{items.originalAmount}</span>
                            </s>
                        ) : (
                                ""
                            )}
                    </div>
                    <div className="gray-three-color size-14">
                        <div className="omit omit-1">
                            <i className="icon icon-shijian1 size-14" />
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
            );
        }

        renderItemsContentDetail(items: any): React.ReactNode {
            let { state } = this.props;
            const status = state!.status,
                commentStatus = state!.commentStatus;
            let isComplete = false;
            if (status === OrderStatusEnum.complete && commentStatus === EvaluateStatusEnum.noevaluate) {
                isComplete = true;
            }
            return (
                <div className="my-order-flex">
                    <ImageAuto.Component
                        cutWidth="80" cutHeight="80"
                        src={items.coverUrl}
                        height="80px"
                        width="80px"
                    />
                    <Flex align="start">
                        {this.renderImageAutoContent(items)}
                        <div className="size-14">{isComplete ? "已完成" : getStatus(items.orderStatus, items.commentStatus)}</div>
                    </Flex>
                </div>
            );
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
                        {this.renderItemsContentDetail(items)}
                        {this.renderButton(items)}
                    </List.Item>
                </List>
            );
        }

        renderHistory(): React.ReactNode {
            let { state } = this.props;
            const searchHistory = state!.searchHistory;
            return (
                searchHistory && (
                    <List>
                        {searchHistory.map((item: any, i: number) => {
                            return (
                                <List.Item
                                    key={i}
                                    extra={
                                        <i
                                            className="icon icon-shanchu"
                                            onClick={e => {
                                                e.stopPropagation();
                                                this.dispatch({ type: "removeSearchHistory", item, searchHistory });
                                            }}
                                        />
                                    }
                                    onClick={() => {
                                        this.dispatch({ type: "input", data: { key: item.key, showList: true } });
                                        this.getDataList(1, item.key);
                                    }}
                                >
                                    {item.key}
                                </List.Item>
                            );
                        })}
                    </List>
                )
            );
        }

        renderSearchBody(): React.ReactNode {
            let { state } = this.props;
            const showList = state!.showList;

            if (showList && showList) {
                return this.getListView();
            } else {
                return (
                    <div className="search-display-style">
                        <div style={{ padding: "0 15px" }}>
                            <h3>
                                历史记录{" "}
                                <i
                                    className="icon icon-lajitong  size-16"
                                    style={{ float: "right" }}
                                    onClick={() => {
                                        this.dispatch({ type: "removeAll" });
                                    }}
                                />
                            </h3>
                        </div>
                        <div className="container-column container-fill container-scrollable">{this.renderHistory()}</div>
                    </div>
                );
            }
        }

        renderBody(): React.ReactNode {
            let { state } = this.props;
            const key = state!.key;
            return (
                <div className="container-prop container-column container-fill">
                    <SearchBar
                        className="autoFocus"
                        placeholder="搜索"
                        value={key !== null ? key : ""}
                        onFocus={() => { }}
                        onBlur={() => {
                            if (key !== "") {
                                this.dispatch({ type: "addSearchHistory", key });
                                setEventWithLabel(statisticsEvent.myOrderSearch);
                            }
                        }}
                        onChange={value => {
                            this.dispatch({ type: "input", data: { key: value, showList: true } });
                            this.getDataList(1, value);
                        }}
                        onSubmit={value => {
                            this.dispatch({ type: "input", data: { key: value, showList: true } });
                            this.getDataList(1, value);
                        }}
                        onCancel={() => {
                            this.dispatch({ type: "input", data: { key: "", showList: false } });
                            this.getDataList(1, "");
                        }}
                    />
                    {this.renderSearchBody()}
                </div>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.myordersearch]);
}
