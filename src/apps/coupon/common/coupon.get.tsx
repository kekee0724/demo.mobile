import React from "react";
import ReactDOM from "react-dom";
import { List, Button, Flex, NavBar, Modal, Progress, Icon } from "antd-mobile-v2";

import { template, formatDate, getLocalStorage } from "@reco-m/core";

import { ViewComponent, Container } from "@reco-m/core-ui";

import { coupongetModel, CouponStatusEnum, CouponTicketSourceEnum, Namespaces } from "@reco-m/coupon-models";

export namespace CouponGet {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        isOpen: () => boolean;
        close: () => void;
        selectedcallback: (data: any) => void;
        sceneCode: any;
        resourceName: any;
        resourceCode: any;
        resourceID: any;
        bindTableData: any;
    }

    export interface IState extends ViewComponent.IState, coupongetModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.couponget;
        time;

        componentDidMount(): void {
            this.dispatch({
                type: `initPage`,
                data: {
                    parkId: getLocalStorage("parkId"),
                    sceneValueList: [this.props.sceneCode, "all"],
                    status: CouponStatusEnum.inUse,
                    isShowInBusinessDetail: true,
                    pageSize: 500,
                    orderBy: "isReceived,inputTime"
                },
            });
        }

        getCouponPage() {
            this.dispatch({
                type: "couponGetPage",
                data: {
                    parkId: getLocalStorage("parkId"),
                    sceneValueList: [this.props.sceneCode, "all"],
                    status: CouponStatusEnum.inUse,
                    isShowInBusinessDetail: true,
                    pageSize: 500,
                    orderBy: "isReceived,inputTime"
                },
            });
        }

        confirm() {
            this.props.selectedcallback(null);
        }

        renderButton(): React.ReactNode {
            return (
                <Flex className="flex-collapse row-collapse">
                    <Flex.Item>
                        <Button
                            onClick={() => {
                                this.props.close();
                            }}
                        >
                            取消
                        </Button>
                    </Flex.Item>
                    <Flex.Item>
                        <Button type={"primary"} onClick={this.confirm.bind(this)}>
                            确定
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }

        gainCoupon(item) {
            this.dispatch({
                type: "gainCoupon",
                data: {
                    CouponID: item.id,
                },
                params: {
                    obtainSource: CouponTicketSourceEnum.selfGet,
                    ...this.props.bindTableData,
                },
                gainSuccess: () => this.getCouponPage(),
            });
        }
        renderCouponListItem(item, i): React.ReactNode {
            return (
                <List className="list-no-border margin-bottom-sm coupon-list" key={i}>
                    <List.Item
                        key={i}
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
                                    <Button size="small" className="margin-left-lg margin-bottom-0 gray-button">
                                        已领取
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
        renderCouponList(): React.ReactNode {
            let { state } = this.props;
            const couponData = state!.couponData;
            if (couponData && couponData.items) {
                return couponData.items.map((item, i) => {
                    return this.renderCouponListItem(item, i);
                });
            } else {
                return <div />;
            }
        }

        couponScroll(el) {
            if ($("html").hasClass("theme-white")) {
                $(el).off("scroll", this.scrollFn).on("scroll", this.scrollFn);
            }
        }

        scrollFn() {
            const top = $(this).scrollTop() || 0;
            $(this).prevAll(".am-navbar").find("#nav_box_Shadow").length <= 0 && $(this).prevAll(".am-navbar").append('<span id="nav_box_Shadow"></span>');
            $(this)
                .prevAll(".am-navbar")
                .find("#nav_box_Shadow")
                .css({
                    background: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, ${
                        top * 0.001 < 0.1 ? top * 0.001 : 0.1
                    }) 100%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%)`,
                });
        }

        getCoupon(): React.ReactNode {
            return (
                <Container.Component fill direction={"column"}>
                    {
                        <NavBar
                            icon={<Icon type="left" />}
                            onLeftClick={() => {
                                this.confirm();
                            }}
                            className="park-nav"
                        >
                            选择优惠券
                        </NavBar>
                    }
                    <div className="container container-fill container-scrollable" style={{ backgroundColor: "#efeff4" }} ref={(el) => this.couponScroll(ReactDOM.findDOMNode(el))}>
                        {this.renderCouponList()}
                    </div>
                </Container.Component>
            );
        }

        setStopPropagation() {
            if (this.props.isOpen()) {
                clearTimeout(this.time);
                this.time = setTimeout(() => {
                    $(".coupon-modal-popup")
                        .on("touchstart", (e) => {
                            e.stopPropagation();
                        })
                        .on("touchend", (e) => {
                            e.stopPropagation();
                        })
                        .on("touchmove", (e) => {
                            e.stopPropagation();
                        });
                }, 500);
            }
        }
        render(): React.ReactNode {
            this.setStopPropagation();
            return (
                <Modal popup visible={this.props.isOpen()} maskClosable={false} animationType="slide-up" className="coupon-modal-popup">
                    {this.getCoupon()}
                </Modal>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.couponget]);
}
