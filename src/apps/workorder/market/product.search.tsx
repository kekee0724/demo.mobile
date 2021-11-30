import React from "react";

import { List, SearchBar, Button, Flex, Badge } from "antd-mobile-v2";

import { template, formatDateTime, getLocalStorage } from "@reco-m/core";

import { ListComponent, ImageAuto, setEventWithLabel } from "@reco-m/core-ui";

import { OrderStatusEnum, EvaluateStatusEnum, isRoom, SearchGoOrderPageTypeEnum } from "@reco-m/order-models";

import {  getTimed } from "@reco-m/order-common";

import { Namespaces, productSearchModel, MyMarketinStatusEnum, MarketTypeEnum } from "@reco-m/workorder-models";

import { statisticsEvent } from "@reco-m/ipark-statistics";

export namespace ProductSearch {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {
        location?: any;
    }

    export interface IState extends ListComponent.IState, productSearchModel.StateType {
        form?;
        dataSource?: any;
        location?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = false;
        headerContent = "服务产品";
        namespace = Namespaces.productSearch;
        catalogueIDs;
        componentMount() {
            this.catalogueIDs = this.props!.location!.state;
            this.dispatch({ type: `initPage` });
        }

        componentWillUnmount() {
            this.dispatch({
                type: "input",
                data: {
                    key: "",
                    items: "",
                    showList: false,
                },
            });
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            this.shouldUpdateData(nextProps.state);
        }

        /**
         * 请求列表
         */
        getDataList(index?: number, key?: any) {
            this.dispatch({
                type: "getProductList",
                data: {
                    status: MyMarketinStatusEnum.pass,
                    pageIndex: index,
                    key: key,
                    pageSize: 15,
                    parkId: getLocalStorage("parkId"),
                    isOnService: true,
                },
            });
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
                    pathname: `orderRoom/${order.ResourceID}/${order.ResourceType}`,
                });
            } else if (order && order.ResourceType === SearchGoOrderPageTypeEnum.goAreaOrderRoom) {
                this.goTo({
                    // 场地预订
                    pathname: `areaorderRoom/${order.ResourceID}/${order.ResourceType}`,
                });
            } else {
                this.goTo({
                    pathname: `orderPosition/${order.ResourceID}/${order.ResourceType}`,
                });
            }
        }

        renderButton(order: any): React.ReactNode {
            if (order.OrderStatus === OrderStatusEnum.complete && order.CommentStatus === EvaluateStatusEnum.evaluate && getTimed(order) < 0) {
                return (
                    <div className="my-apply-btn">
                        <Button
                            type="primary"
                            size="small"
                            inline
                            onClick={(e) => {
                                e.stopPropagation();
                                this.goTo(`evaluate/${order.id}/1/${order.ResourceName}/${order.ResourceID}`);
                            }}
                        >
                            去评价
                        </Button>
                    </div>
                );
            }

            return null;
        }

        renderImageAutoContent(items: any): React.ReactNode {
            return (
                <Flex.Item>
                    <div className="omit omit-1">{items.ResourceName}</div>
                    <div className="color-orange">
                        ￥<span style={{ marginLeft: "2px" }}>{items.TotalAmount}</span>&nbsp;&nbsp;&nbsp;
                        {items.OriginalPrice ? (
                            <s style={{ color: "lightgray" }}>
                                ￥<span>{items.OriginalPrice}</span>
                            </s>
                        ) : (
                            ""
                        )}
                    </div>
                    <div className="gray-three-color size-14">
                        <div className="omit omit-1">
                            <i className="icon icon-shijian1 size-14" />
                            &nbsp;
                            {isRoom(items.ResourceType)
                                ? formatDateTime(items.StartDate, "yyyy-MM-dd hh:mm") + formatDateTime(items.EndDate, "~ hh:mm")
                                : formatDateTime(items.StartDate, "yyyy-MM-dd") + " ~ " + formatDateTime(items.EndDate, "yyyy-MM-dd")}
                        </div>
                        <div className="omit omit-1">
                            <i className="icon icon-newadds size-14" /> {items.RoomAddress}
                        </div>
                    </div>
                </Flex.Item>
            );
        }

        gotoDetail(id: number) {
            if (this.isAuth()) {
                this.goTo(`detail/${id}/${this.props.match!.params.tagId}`);
            } else {
                this.goTo("login");
            }
        }
        renderOneItemContent(item: any): React.ReactNode {
            return (
                <>
                    <div className="omit omit-1  flex-service-clim">{item.serviceName}</div>
                    <div className="color-orange click-color-orange">
                        {item.serviceCategory &&
                            item.serviceCategory.split(",").map((item, i) => {
                                if (i < 3) {
                                    return <Badge text={item} key={i} className="badge-box" />;
                                }
                            })}
                    </div>
                    <div className="gray-three-color size-14 margin-top-xs flex-service-sub">
                        <div className="omit omit-1 margin-right-sm">
                            {+item.chargeModeValue === MarketTypeEnum.chargFree ? "免费" : +item.chargeModeValue === MarketTypeEnum.chargDiscuss ? "面议" : `${item.chargeMinPrice}-${item.chargeMaxPrice}${item.chargeUnit}`}
                        </div>
                    </div>
                </>
            );
        }
        renderItemsContent(institution: any): React.ReactNode {
            let picurl = institution.pictureUrlList && institution.pictureUrlList[0];
            return (
                <List.Item
                    onClick={() => {
                        this.goTo(`productdetail/${institution.id}`);
                    }}
                    extra={<div />}
                    align="top"
                    thumb={<ImageAuto.Component cutWidth="124" cutHeight="91" src={picurl ? picurl : ""} width="30vw" height="22vw" radius="8px" />}
                    multipleLine
                >
                    {this.renderOneItemContent(institution)}
                </List.Item>
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
                                            onClick={(e) => {
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
                        onFocus={() => {
                            this.dispatch({ type: "input", data: { key: "", showList: true } });
                            this.getDataList(1, "");
                        }}
                        onBlur={() => {
                            if (key !== "") {
                                this.dispatch({ type: "addSearchHistory", key });

                                setEventWithLabel(statisticsEvent.myOrderSearch);
                                setEventWithLabel(statisticsEvent.productSearch);
                            }
                        }}
                        onChange={(value) => {
                            this.dispatch({ type: "input", data: { key: value, showList: true } });
                            this.getDataList(1, value);
                        }}
                        onSubmit={(value) => {
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

    export const Page = template(Component, (state) => state[Namespaces.productSearch]);
}
