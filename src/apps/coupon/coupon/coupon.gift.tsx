import React from "react";

import { Picker, List, Flex, Button, WingBlank, WhiteSpace, Toast } from "antd-mobile-v2";

import { template, formatDateTime } from "@reco-m/core";

import { ViewComponent, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { CouponTicketSourceEnum, mycouponModel, Namespaces } from "@reco-m/coupon-models";

export namespace CouponGift {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, mycouponModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = "转赠优惠券";
        namespace = Namespaces.mycoupon;

        id: any;

        componentDidMount(): void {
            this.dispatch({
                type: "initGiftPage",
            });
        }
        componentWillUnmount(): void {
            this.dispatch({ type: "input", data: { selectCouponGiftNum: "" } });
        }
        componentReceiveProps(nextProps: IProps) {
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged) {
                this.getData();
            }
        }
        getData() {
            this.dispatch({
                type: "getstaffmanagerList",
            });
        }
        giveCoupon() {
            const { state } = this.props!;
            let giftCoupon = state!.giftCoupon;
            let certifyMember = state!.certifyMember || [{}];
            let certigyMemberName = state!.certigyMemberName || [""];
            // let selectCouponGiftNum = state!.selectCouponGiftNum;

            const certifyObj = certifyMember[0].find((x) => x.value === certigyMemberName[0]);

            if (certigyMemberName.length === 0) {
                Toast.fail("选择转赠对象");
                return;
            }
            this.dispatch({
                type: "givenCoupon",
                id: giftCoupon.id,
                data: {
                    obtainSource: CouponTicketSourceEnum.others, // 他人赠送
                    operateCount: 1,
                    userId: certifyObj?.value,
                    userName: certifyObj?.label,
                },
                successCall: () => {
                    setEventWithLabel(statisticsEvent.couponGive);
                    Toast.success("转增成功", 1, this.goBack.bind(this));
                },
            });
            // if (selectCouponGiftNum) {
            //     if (!/(^[1-9]\d*$)/.test(selectCouponGiftNum)) {
            //         Toast.fail("转赠数量只能为整数");
            //         return false;
            //     }
            //     if (selectCouponGiftNum > giftCoupon.countNumber) {
            //         Toast.fail("转赠数量不能大于拥有数量");
            //         return;
            //     }
            //     this.dispatch({
            //         type: "givenCoupon",
            //         id: giftCoupon.id,
            //         data: {
            //             obtainSource: CouponTicketSourceEnum.others, // 他人赠送
            //             operateCount: 1,
            //             userId: certifyObj?.value,
            //             userName: certifyObj?.label,
            //         },
            //         successCall: () => {
            //             setEventWithLabel(statisticsEvent.couponGive);
            //             Toast.success("转增成功", 1, this.goBack.bind(this));
            //         },
            //     });
            // } else {
            //     Toast.fail("请输入转赠数量");
            // }
        }
        rendercertigyMember(): React.ReactNode {
            const { state } = this.props!;
            let certifyMember = state!.certifyMember;
            let certigyMemberName = state!.certigyMemberName;
            // let selectCouponGiftNum = state!.selectCouponGiftNum;
            return (
                <>
                    <Picker
                        data={certifyMember}
                        title="选择转赠对象"
                        cascade={false}
                        extra="选择转赠对象"
                        value={certigyMemberName}
                        onOk={(v) => {
                            this.dispatch({ type: "input", data: { certigyMemberName: v } });
                        }}
                    >
                        <List.Item arrow="horizontal">
                            <span className="coupon-name">
                                转赠对象<span className="infoset-tips">(转赠对象为同企业的其他用户)</span>
                            </span>
                        </List.Item>
                    </Picker>
                    {/* <InputItem
                        className="list-picker"
                        value={selectCouponGiftNum}
                        placeholder="选择转赠数量"
                        type={"number"}
                        moneyKeyboardAlign="right"
                        onChange={(val) => this.dispatch({ type: "input", data: { selectCouponGiftNum: val } })}
                    >
                        转赠数量
                    </InputItem> */}
                </>
            );
        }
        rendercertigyNoMember(): React.ReactNode {
            const { state } = this.props!;
            let certifyMember = state!.certifyMember;
            let certigyMemberName = state!.certigyMemberName;
            // let selectCouponGiftNum = state!.selectCouponGiftNum;
            return (
                <div
                    onClick={() => {
                        Toast.info("暂无其他用户", 2);
                    }}
                >
                    <Picker data={certifyMember} title="选择转赠对象" cascade={false} extra="选择转赠对象" value={certigyMemberName} disabled>
                        <List.Item arrow="horizontal">
                            <span className="coupon-name">转赠对象</span>
                        </List.Item>
                    </Picker>
                    {/* <InputItem
                        className="list-picker"
                        value={selectCouponGiftNum}
                        placeholder="选择转赠数量"
                        type="money"
                        disabled
                        moneyKeyboardAlign="right"
                        onChange={(val) => this.dispatch({ type: "input", data: { selectCouponGiftNum: val } })}
                    >
                        转赠数量
                    </InputItem> */}
                </div>
            );
        }
        rendercertigyMemberName(): React.ReactNode {
            const { state } = this.props!;
            let certifyMemberArr = state!.certifyMemberArr;
            let certigyMemberName = state!.certigyMemberName;

            return (
                certigyMemberName && (
                    <List renderHeader={() => "选择转赠对象" as any} className="button-no-radius list-no-border margin-bottom-sm coupon-list">
                        {certifyMemberArr && certifyMemberArr.length > 0 ? this.rendercertigyMember() : this.rendercertigyNoMember()}
                    </List>
                )
            );
        }
        renderBody(): React.ReactNode {
            const { state } = this.props!;
            let giftCoupon = state!.giftCoupon;
            return giftCoupon ? (
                <>
                    <List renderHeader={() => "转赠的优惠券" as any} className="button-no-radius list-no-border margin-bottom-sm coupon-list">
                        <List.Item
                            align={"top"}
                            thumb={
                                <div className="chunk-box">
                                    <div>
                                        <span className="size-22">{giftCoupon.denomination}</span>元
                                    </div>
                                    <div className="coupon-desc">{giftCoupon.minUsefulAmount ? `满${giftCoupon.minUsefulAmount}元可用` : "无门槛"}</div>
                                </div>
                            }
                            multipleLine
                            wrap
                        >
                            <Flex align="start">
                                <Flex.Item className="omit omit-1">{giftCoupon.name}</Flex.Item>
                            </Flex>
                            <div className="gray-two-color size-14 omit omit-1">{giftCoupon.scene}</div>
                            {giftCoupon.startTime ? (
                                <div className="gray-three-color size-12 omit omit-1">
                                    <Flex align="start">
                                        <span>有效期：</span>
                                        <Flex.Item>
                                            <div> {formatDateTime(giftCoupon.startTime)} </div>
                                            <div> {formatDateTime(giftCoupon.endTime)} </div>
                                        </Flex.Item>
                                    </Flex>
                                </div>
                            ) : (
                                <div className="gray-three-color size-12 omit omit-1">有效期：{giftCoupon.duration}天 （自领取日期开始计算）</div>
                            )}
                        </List.Item>
                        {/* <Flex className="coupon-bottom">
                            <Flex.Item>
                                <Flex>
                                    <Flex.Item className="gray-two-color size-14">数量 × {giftCoupon.countNumber} </Flex.Item>
                                </Flex>
                            </Flex.Item>
                        </Flex> */}
                    </List>
                    <WhiteSpace className="whitespace-gray-bg" />
                    {this.rendercertigyMemberName()}
                    <WingBlank>
                        <WhiteSpace />
                        <Button className="white-btn-radius" type={"primary"} onClick={this.giveCoupon.bind(this)}>
                            确认提交
                        </Button>
                        <WhiteSpace />
                    </WingBlank>
                </>
            ) : null;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.mycoupon]);
}
