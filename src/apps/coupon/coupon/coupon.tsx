import React from "react";

import { Tabs, List, Flex, Progress, Button } from "antd-mobile-v2";

import { template, formatDate, getLocalStorage } from "@reco-m/core";
import { ListComponent, setEventWithLabel } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";

import { coupongetModel, CouponTicketSourceEnum, Namespaces, CouponTypeEnum, CouponScenceEnum } from "@reco-m/coupon-models";

import { ResourceTypeEnum } from "@reco-m/ipark-common";

export namespace Coupon {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, coupongetModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = false;
        headerContent = "领券中心";
        namespace = Namespaces.couponget;

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

        gainCoupon(item) {
            let { state } = this.props;
            let scenceCode = state!.scenceCode;
            this.dispatch({
                type: "gainCoupon",
                data: {
                    CouponID: item.id,
                },
                params: {
                    obtainSource: CouponTicketSourceEnum.system,
                },
                gainSuccess: () => {
                    setEventWithLabel(statisticsEvent.couponReceive);
                    this.getCouponPage(scenceCode, 1);
                },
            });
        }

        componentDidMount(): void {
            setEventWithLabel(statisticsEvent.goToCouponView);
            setEventWithLabel(statisticsEvent.couponAllView);

            this.dispatch({
                type: "initCouponPage",
                data: {
                    parkId: getLocalStorage("parkId"),
                    sceneValueList: [""],
                    status: 0,
                    isShowInVoucherCenter: true,
                    pageSize: 10,
                    pageIndex: 1,
                },
            });
        }

        componentReceiveProps(nextProps: Readonly<P>): void {
            this.shouldUpdateData(nextProps.state);
        }

        getCouponPage(sceneCode, pageIndex) {
            this.dispatch({
                type: "couponGetListPage",
                data: {
                    parkId: getLocalStorage("parkId"),
                    sceneValueList: [sceneCode],
                    status: 0,
                    isShowInVoucherCenter: true,
                    pageSize: 10,
                    pageIndex: pageIndex,
                },
            });
        }

        /**
         * 刷新列表
         */
        pullToRefresh() {
            const { state } = this.props;
            let scenceCode = state!.scenceCode;
            this.getCouponPage(scenceCode, 1);
        }

        /**
         * 上拉刷新
         */
        onEndReached() {
            const { state } = this.props;
            let scenceCode = state!.scenceCode;
            this.getCouponPage(scenceCode, (state!.currentPage || 0) + 1);
        }

        renderItemsContent(item: any): React.ReactNode {
            return (
                <List className="list-no-border margin-bottom-sm coupon-list">
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
                                有效期：{formatDate(item.startTime)} - {formatDate(item.endTime)}
                            </div>
                        ) : (
                            <div className="gray-three-color size-12 omit omit-1">有效期：{item.duration}天 （自领取日期开始计算）</div>
                        )}
                    </List.Item>
                    <Flex className="coupon-bottom">
                        <Flex.Item>
                            <Flex>
                                <Flex.Item className="progress-color">
                                    <Progress percent={((item.receivedCount || 0) / item.totalNumber) * 100} position="normal" />
                                </Flex.Item>
                                <div className="margin-left-xs size-12 gray-three-color" aria-hidden="true">
                                    已领取<span className="gray-one-color size-14">{Math.ceil(((item.receivedCount || 0) / item.totalNumber) * 100)}</span>%
                                </div>
                                {item.isReceived === true ? (
                                    <Button size="small" className="margin-left-lg margin-bottom-0 orange-button" onClick={() => this.useCoupon(item)}>
                                        立即使用
                                    </Button>
                                ) : item.receivedCount === item.totalNumber ? (
                                    <Button size="small" className="margin-left-lg margin-bottom-0 gray-button">
                                        已抢光
                                    </Button>
                                ) : (
                                    <Button
                                        activeClassName="orange-button-border-hover"
                                        size="small"
                                        className="margin-left-lg margin-bottom-0 orange-button-border"
                                        onClick={() => this.gainCoupon(item)}
                                    >
                                        立即领取
                                    </Button>
                                )}
                            </Flex>
                        </Flex.Item>
                    </Flex>
                </List>
            );
        }

        renderBody(): React.ReactNode {
            let { state } = this.props,
                { tabs  } = state as any;
            return tabs && (
                <div className="container-body apply-container coupon-tabs">
                    <Tabs
                        swipeable={false}
                        tabs={tabs}
                        initialPage={0}
                        onChange={(tab) => {
                            if (tab.sub === CouponTypeEnum.couponAllView) setEventWithLabel(statisticsEvent.couponAllView);
                            else if (tab.sub === CouponTypeEnum.couponCurrencyView) setEventWithLabel(statisticsEvent.couponCurrencyView);
                            else if (tab.sub === CouponTypeEnum.couponTemporaryParkingView) setEventWithLabel(statisticsEvent.couponTemporaryParkingView);
                            else if (tab.sub === CouponTypeEnum.couponParkingSpaceRechargeView) setEventWithLabel(statisticsEvent.couponParkingSpaceRechargeView);
                            else if (tab.sub === CouponTypeEnum.couponRoomView) setEventWithLabel(statisticsEvent.couponRoomView);
                            else if (tab.sub === CouponTypeEnum.couponFieldView) setEventWithLabel(statisticsEvent.couponFieldView);
                            else if (tab.sub === CouponTypeEnum.couponStationView) setEventWithLabel(statisticsEvent.couponStationView);
                            else if (tab.sub === CouponTypeEnum.couponAdvertisingSpaceView) setEventWithLabel(statisticsEvent.couponAdvertisingSpaceView);
                        }}
                        onTabClick={(tab) => {
                            this.dispatch({ type: "input", data: { scenceCode: tab.scenceCode } });
                            this.getCouponPage(tab.scenceCode, 1);
                        }}
                    >
                        {this.getListView()}
                    </Tabs>
                </div>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.couponget]);
}
