import React from "react";

import { Tabs, List, Flex, Button } from "antd-mobile-v2";

import { template, formatDateTime, getLocalStorage } from "@reco-m/core";

import { ListComponent, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { mycouponModel, Namespaces, stateTabs, CouponStateTextEnum, CouponScenceEnum } from "@reco-m/coupon-models";

import { ResourceTypeEnum } from "@reco-m/ipark-common";

export namespace MyCoupon {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, mycouponModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = true;
        headerContent = "我的优惠券";
        namespace = Namespaces.mycoupon;
        bodyClass = "container-height";
        componentDidMount(): void {
            setEventWithLabel(statisticsEvent.couponNotUseView);
            this.dispatch({
                type: `initPage`,
                data: {
                    pageIndex: 1,
                    pageSize: 15,
                    status: 1,
                    parkId: getLocalStorage("parkId"),
                },
            });
        }

        getCouponPage(pageIndex?: number, status?: any) {
            this.dispatch({
                type: "mycouponGetListPage",
                data: {
                    pageIndex: pageIndex,
                    pageSize: 15,
                    status: status,
                    parkId: getLocalStorage("parkId"),
                },
            });
        }

        componentReceiveProps(nextProps: Readonly<P>): void {
            this.shouldUpdateData(nextProps.state);

            if (nextProps.location !== this.props.location) {
                this.pullToRefresh();
            }
        }

        /**
         * 刷新列表
         */
        pullToRefresh() {
            const { state } = this.props;
            let couponState = state!.couponState;
            this.getCouponPage(1, couponState);
        }

        /**
         * 上拉刷新
         */
        onEndReached() {
            const { state } = this.props;
            let couponState = state!.couponState;
            this.getCouponPage((state!.currentPage || 0) + 1, couponState);
        }
        getTextOfButton(state) {
            if (state === CouponStateTextEnum.useImmediately) {
                return "立即使用";
            } else if (state === CouponStateTextEnum.used) {
                return "已使用";
            } else if (state === CouponStateTextEnum.stopUse) {
                return "已停用";
            } else if (state === CouponStateTextEnum.transferred) {
                return "已转赠";
            } else if (state === CouponStateTextEnum.overDue) {
                return "已过期";
            }
        }
        renderItemsContentBasic(item: any): React.ReactNode {
            return (
                <List.Item
                    align={"top"}
                    thumb={
                        <div className="chunk-box">
                            <div>
                                <span className="size-22">{item.denomination}</span>元
                            </div>
                            <div className="coupon-desc">{item.minUsefulAmount ? `满${item.minUsefulAmount}元可用` : "无门槛"}</div>
                        </div>
                    }
                    multipleLine
                    wrap
                >
                    <Flex align="start">
                        <Flex.Item className="omit omit-1">{item.name}</Flex.Item>
                    </Flex>
                    <div className="gray-two-color size-14 omit omit-1">{item.scene}</div>
                    {item.startTime ? (
                        <div className="gray-three-color size-12 omit omit-1">
                            <Flex align="start">
                                <span>有效期：</span>
                                <Flex.Item>
                                    <div> {formatDateTime(item.startTime)} </div>
                                    <div> {formatDateTime(item.endTime)} </div>
                                </Flex.Item>
                            </Flex>
                        </div>
                    ) : (
                        <div className="gray-three-color size-12 omit omit-1">有效期：{item.duration}天 （自领取日期开始计算）</div>
                    )}
                </List.Item>
            );
        }
        renderItemsContentFooter(item: any): React.ReactNode {
            return (
                <Flex className="coupon-bottom">
                    <Flex.Item>
                        <Flex>
                            <Flex.Item className="gray-two-color size-14">数量 × 1</Flex.Item>
                            {item.tabIndex === CouponStateTextEnum.useImmediately && (
                                <Button
                                    size="small"
                                    className="margin-bottom-0"
                                    onClick={() => {
                                        this.dispatch({ type: "input", data: { giftCoupon: item } });
                                        this.goTo(`gift`);
                                    }}
                                >
                                    转赠
                                </Button>
                            )}
                            {+item.tabIndex === CouponStateTextEnum.useImmediately ? (
                                <Button
                                    activeClassName="orange-button-border-hover"
                                    size="small"
                                    className="margin-left-xs margin-bottom-0 orange-button-border"
                                    onClick={() => this.useCoupon(item)}
                                >
                                    {this.getTextOfButton(item.tabIndex)}
                                </Button>
                            ) : (
                                <Button size="small" className="margin-left-xs margin-bottom-0 end-button">
                                    {this.getTextOfButton(item.tabIndex)}
                                </Button>
                            )}
                        </Flex>
                    </Flex.Item>
                </Flex>
            );
        }

        renderItemsContent(item: any): React.ReactNode {
            return (
                <List
                    className={
                        item.tabIndex === CouponStateTextEnum.useImmediately ? "list-no-border margin-bottom-sm coupon-list" : "list-no-border margin-bottom-sm coupon-list end"
                    }
                >
                    {this.renderItemsContentBasic(item)}
                    {this.renderItemsContentFooter(item)}
                </List>
            );
        }

        useCoupon(item) {
            setEventWithLabel(statisticsEvent.couponUse);
            if (item.sceneValue === CouponScenceEnum.all) {
                this.goTo("/service");
            } else if (item.sceneValue === CouponScenceEnum.meeting) {
                this.goTo(`resource/room/${ResourceTypeEnum.meeting}`);
            } else if (item.sceneValue === CouponScenceEnum.yard) {
                this.goTo(`resource/room/${ResourceTypeEnum.square}`);
            } else if (item.sceneValue === CouponScenceEnum.station) {
                this.goTo(`resource/position/${ResourceTypeEnum.working}`);
            } else if (item.sceneValue === CouponScenceEnum.adsense) {
                this.goTo(`resource/position/${ResourceTypeEnum.advertisement}`);
            }
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                showList = state!.showList;
            return (
                <div className="container-body apply-container">
                    <Tabs
                        tabs={stateTabs()}
                        initialPage={0}
                        swipeable={false}
                        onTabClick={(tab) => {
                            if (tab.state === CouponStateTextEnum.useImmediately) setEventWithLabel(statisticsEvent.couponNotUseView);
                            else if (tab.state === CouponStateTextEnum.used) setEventWithLabel(statisticsEvent.couponAlreadyUseView);
                            else if (tab.state === CouponStateTextEnum.overDue) setEventWithLabel(statisticsEvent.couponExpireView);
                            else if (tab.state === CouponStateTextEnum.stopUse) setEventWithLabel(statisticsEvent.couponStopUseView);
                            else if (tab.state === CouponStateTextEnum.transferred) setEventWithLabel(statisticsEvent.couponGiveView);
                            this.dispatch({ type: "input", data: { couponState: tab.state, showList: false } });
                            this.getCouponPage(1, tab.state);
                        }}
                    >
                        {!showList ? null : this.getListView()}
                    </Tabs>
                </div>
            );
        }

        renderFooter(): React.ReactNode {
            return (
                <div className="tag-footer-coupon">
                    <span onClick={() => this.goTo("coupon")}>去领券中心看看</span>
                </div>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.mycoupon]);
}
