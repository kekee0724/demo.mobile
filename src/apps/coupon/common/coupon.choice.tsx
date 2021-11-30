import React from "react";
import ReactDOM from "react-dom";

import { List, Button, Flex, NavBar, Modal, Toast } from "antd-mobile-v2";

import { template, formatDate } from "@reco-m/core";

import { ViewComponent, Container } from "@reco-m/core-ui";

import { couponchiceModel, Namespaces } from "@reco-m/coupon-models";

export namespace CouponChoice {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        isOpen: () => boolean;
        close: () => void;
        selectedcallback: (data: any) => void;
        sceneCode: any;
        orderAmount: any;
    }

    export interface IState extends ViewComponent.IState, couponchiceModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = "选择优惠券";
        namespace = Namespaces.couponchice;
        time;

        componentWillUnmount() {}

        componentDidMount(): void {
            setTimeout(() => {
                $(".am-stepper-input").attr("readonly", "readonly");
            }, 1000);
            this.dispatch({
                type: `initPage`,
                data: {
                    sceneValue: [this.props.sceneCode, "all"],
                    orderAmount: this.props.orderAmount && Number(this.props.orderAmount),
                },
            });
        }

        confirm() {
            let { state } = this.props;
            let selectCouponTypeID = state!.selectCouponTypeID || [];
            let selectID = state!.selectID;
            let couponData = state!.couponData;

            let resultData: any = [],
                totalPrice = 0,
                couponNum = selectCouponTypeID.length,
                couponIDs = [];
            selectCouponTypeID &&
                selectCouponTypeID.forEach((item) => {
                    let temItem: any = {};
                    couponData.forEach((itm) => {
                        if (item === itm.id) {
                            temItem = { ...itm };
                        }
                    });
                    temItem.selectCouponsID = selectID[item];
                    resultData.push(temItem);
                    totalPrice = totalPrice + temItem.denomination;
                    couponIDs = couponIDs.concat(selectID[item]);
                });
            if (couponNum) {
                this.props.selectedcallback({
                    seletItems: resultData,
                    deductionPrice: totalPrice,
                    couponNum: couponNum,
                    couponIDs: selectCouponTypeID,
                });
            } else {
                this.props.selectedcallback(null);
            }
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

        getListState(id) {
            let { state } = this.props;
            let selectCouponTypeID = state!.selectCouponTypeID;
            let isInclude = false;

            if (selectCouponTypeID && selectCouponTypeID.length) {
                isInclude = selectCouponTypeID.some((itm) => {
                    return itm === id;
                });
            }
            return isInclude ? "list-no-border margin-bottom-sm coupon-list active" : "list-no-border margin-bottom-sm coupon-list";
        }
        couponSteperOnChange(couponData, item) {
            let { state } = this.props;
            let selectCouponTypeID = state!.selectCouponTypeID;
            let selectID = state!.selectID;
            let currentSelectCouponTypeID: any = selectCouponTypeID ? [...selectCouponTypeID] : [],
                tempSelectID: any = [],
                currentSelectID = selectID ? { ...selectID } : {};
            const isSelected = currentSelectCouponTypeID.findIndex((x) => x === item.id) !== -1 ? true : false;
            if (!isSelected) {
                // 点击了加
                let totalPrice = 0;
                currentSelectCouponTypeID &&
                    currentSelectCouponTypeID.forEach((item) => {
                        let temItem: any = {};
                        couponData.forEach((itm) => {
                            if (item === itm.id) {
                                temItem = { ...itm };
                            }
                        });
                        temItem.selectCouponsID = selectID[item];
                        totalPrice = totalPrice + temItem.denomination;
                    });
                if (totalPrice < this.props.orderAmount) {
                    // 优惠券总价不能大于商品总价
                    let isInclude = false;
                    if (selectCouponTypeID && selectCouponTypeID.length) {
                        isInclude = selectCouponTypeID.some((itm) => {
                            return itm === item.id;
                        });
                    }
                    if (!isInclude) {
                        currentSelectCouponTypeID.push(item.id);
                    }
                    if (selectID) {
                        tempSelectID = currentSelectID[item.id] ? [...currentSelectID[item.id]] : [];
                        // tempSelectID.push(item.id);
                        item.couponTicketIdList && item.couponTicketIdList.length > 0 && tempSelectID.push(item.couponTicketIdList[tempSelectID.length]);
                        currentSelectID[item.id] = tempSelectID;
                    }
                    this.dispatch({
                        type: "input",
                        data: { selectCouponTypeID: currentSelectCouponTypeID, selectID: currentSelectID },
                    });
                } else {
                    Toast.fail("可抵扣金额已满");
                }
            } else {
                // 点击了减
                currentSelectCouponTypeID = currentSelectCouponTypeID.filter((itm) => {
                    return itm !== item.id;
                });
                tempSelectID = currentSelectID[item.id] ? [...currentSelectID[item.id]] : [];
                tempSelectID.pop();
                currentSelectID[item.id] = tempSelectID;
                this.dispatch({
                    type: "input",
                    data: { selectCouponTypeID: currentSelectCouponTypeID, selectID: currentSelectID },
                });
            }
        }
        renderCouponList(couponData): React.ReactNode {
            // let { state } = this.props;
            // let selectID = state!.selectID;
            if (couponData) {
                return couponData.map((item, index) => {
                    return (
                        <List className={this.getListState(item.id)} key={index}>
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
                                onClick={() => this.couponSteperOnChange(couponData, item)}
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
                            {/* <Flex className="coupon-bottom">
                                <Flex.Item>
                                    <Flex>
                                        <Flex.Item className="gray-two-color size-14">{item.countNumber}张可用</Flex.Item>
                                        <div className="use-number">
                                            <span>使用数量：</span>
                                            <Stepper
                                                key={index}
                                                className="room-stepper"
                                                showNumber
                                                min={0}
                                                max={item.countNumber}
                                                value={selectID && selectID[item.id] && selectID[item.id].length ? selectID[item.id].length : 0}
                                                onChange={(val) => {
                                                    this.couponSteperOnChange(val, couponData, item);
                                                }}
                                            />
                                        </div>
                                    </Flex>
                                </Flex.Item>
                            </Flex> */}
                        </List>
                    );
                });
            } else {
                return <div></div>;
            }
        }

        noSelectCoupon() {
            this.dispatch({
                type: "update",
                data: { selectCouponTypeID: [], selectID: {} },
            });
        }

        couponScroll(el) {
            if ($("html").hasClass("theme-white")) {
                $(el).off("scroll", this.scrollFn).on("scroll", this.scrollFn);
            }
        }

        scrollFn() {
            const top = $(this).scrollTop() || 0;
            $(this)
                .parents()
                .find(".am-navbar")
                .css({
                    boxShadow: `0 3px 4px rgba(0,0,0, ${top * 0.001 < 0.1 ? top * 0.001 : 0.1})`,
                });
        }

        renderUnUseCouponData(): React.ReactNode {
            let { state } = this.props;
            let unUseCouponData = state!.unUseCouponData;
            return (
                unUseCouponData &&
                unUseCouponData.map((item, index) => {
                    return (
                        <List className="list-no-border margin-bottom-sm coupon-list end" key={index}>
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
                            {/* <Flex className="coupon-bottom">
                                <Flex.Item>
                                    <Flex>
                                        <Flex.Item className="gray-two-color size-14">{item.countNumber}张可用</Flex.Item>
                                        <div className="use-number">
                                            <span>使用数量:</span>
                                            <a>-</a>
                                            <div>{0}</div>
                                            <a>+</a>
                                        </div>
                                    </Flex>
                                </Flex.Item>
                            </Flex> */}
                        </List>
                    );
                })
            );
        }
        renderCoupon(): React.ReactNode {
            let { state } = this.props;
            let selectCouponTypeID = state!.selectCouponTypeID;
            let couponData = state!.couponData;
            let unUseCouponData = state!.unUseCouponData;
            return (
                <Container.Component fill direction={"column"}>
                    {<NavBar className="park-nav">选择优惠券</NavBar>}
                    <div className="container container-fill container-scrollable" style={{ backgroundColor: "#efeff4" }} ref={(el) => this.couponScroll(ReactDOM.findDOMNode(el))}>
                        <List
                            className={
                                selectCouponTypeID && selectCouponTypeID.length !== 0 && selectCouponTypeID.length !== undefined
                                    ? "list-no-border margin-bottom-sm coupon-list"
                                    : "list-no-border margin-bottom-sm coupon-list active"
                            }
                        >
                            <Button onClick={this.noSelectCoupon.bind(this)} className="no-coupon">
                                不使用优惠券
                            </Button>
                        </List>
                        {couponData && couponData.length ? <div className="coupon-header">选择可用的的优惠券</div> : <div></div>}
                        {this.renderCouponList(couponData)}
                        {unUseCouponData && unUseCouponData.length ? <div className="coupon-header">以下优惠券此订单不可用</div> : <div></div>}
                        {this.renderUnUseCouponData()}
                    </div>
                    {this.renderButton()}
                </Container.Component>
            );
        }

        render(): React.ReactNode {
            return (
                <Modal popup visible={this.props.isOpen()} maskClosable={false} animationType="slide-up" className="coupon-modal-popup">
                    {this.renderCoupon()}
                </Modal>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.couponchice]);
}
