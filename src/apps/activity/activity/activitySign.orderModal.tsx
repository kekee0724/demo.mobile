import React from "react";

import { Button, Toast, List, Radio, Flex, WhiteSpace } from "antd-mobile-v2";

import { template, formatDateTime } from "@reco-m/core";

import { ViewComponent, setEventWithLabel, ImageAuto } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, activityDetailModel } from "@reco-m/activity-models";

import { PayWayEnum } from "@reco-m/ipark-common";
export namespace ActivitySignOrderModal {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        isRegisted?: any;
        activityDetailData?: any;
        currentUser?: any;
    }

    export interface IState extends ViewComponent.IState, activityDetailModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.activityDetail;
        headerContent = "订单确认";

        signUpSuccess(e: any) {
            e &&
                Toast.success("提交成功!", 1, () => {
                    this.goTo("sresult");
                });

            this.dispatch({ type: "activityDetail/getActivityDetail", data: this.props.match!.params.id });
        }

        /**
         * 确认报名
         */
        sureSubmit(activityDetailData: any) {
            const { state } = this.props,
                payWay = state!.payWay;
            const { activityVM = {} } = activityDetailData || ({} as any);
            if (activityVM.applyCharge !== 0) {
                this.dispatch({
                    type: "apppay",
                    payway: payWay,
                    order: activityVM,
                    paysuccess: (_) => {
                        if (payWay === PayWayEnum.alipay) {
                            this.signSubmit(activityDetailData);
                        } else if (payWay === PayWayEnum.wechat) {
                            this.signSubmit(activityDetailData);
                        }
                    },
                    payerr: () => {
                        if (payWay === PayWayEnum.alipay) {
                            Toast.fail("支付失败!")!;
                        } else if (payWay === PayWayEnum.wechat) {
                            Toast.fail("支付失败!")!;
                        }
                    },
                });
            } else {
                this.signSubmit(activityDetailData);
            }
        }
        signSubmit(activityDetailData: any) {
            const { state } = this.props;
            /**
             * 报名
             */
            this.dispatch({
                type: "signUpActivity",
                state,
                activityDetailData: activityDetailData,
                callback: (e) => {
                    setEventWithLabel(statisticsEvent.parkActivityEnrollment);
                    this.signUpSuccess(e);
                },
            });
        }
        /**
         * 报名信息
         */
        renderRemarkFormView(): React.ReactNode {
            const { state } = this.props,
                mobile = state!.mobile,
                userName = state!.userName;
            return (
                <>
                    <WhiteSpace className="default-gray-bg gray" />
                    <List renderHeader="报名信息">
                        <List.Item wrap>
                            <div className="gray-three-color omit omit-3 size-14">
                                <span className="mr5">{userName}</span> | <span className="ml5">{mobile}</span>
                            </div>
                        </List.Item>
                    </List>
                </>
            );
        }

        /**
         * 订单信息
         */
        renderOrderView(): React.ReactNode {
            const { state } = this.props,
                activityDetailData = state!.activityDetail;

            const { activityVM = {} } = activityDetailData || ({} as any),
                title = activityVM.activityName,
                isApplyCharge = activityVM.isApplyCharge,
                applyCharge = activityVM.applyCharge;
            let coverPictureUrl = activityVM.coverUrl ? activityVM.coverUrl : activityVM.pictureUrlList[0];
            return (
                <List>
                    <List.Item wrap>
                        <Flex>
                            <ImageAuto.Component cutWidth="95" cutHeight="60" width="95px" height="60px" src={coverPictureUrl} />
                            <Flex.Item>
                                <div className="size-16 omit omit-2">{title}</div>
                                <div className="size-14 omit omit-1 gray-three-color">{formatDateTime(new Date(), "yyyy MM dd hh:mm")}</div>
                            </Flex.Item>
                        </Flex>
                        <WhiteSpace />
                        <Flex className="size-14" align={"end"}>
                            <Flex.Item>票价</Flex.Item>
                            <Flex.Item className="primary-color size-26 text-right">{isApplyCharge ? `¥${applyCharge}` : "免费"}</Flex.Item>
                        </Flex>
                    </List.Item>
                </List>
            );
        }

        /**
         * 退款说明
         */
        renderRefundRemarkView(): React.ReactNode {
            return (
                <>
                    <WhiteSpace className="default-gray-bg gray" />
                    <List renderHeader="退款说明">
                        <List.Item wrap>
                            <div className="gray-three-color omit omit-3 size-14">由于平台方要求，本活动一经售出后不支持退款，请确认后提交，感谢理解</div>
                        </List.Item>
                    </List>
                </>
            );
        }

        /**
         * 支付方式
         */
        renderPayView(): React.ReactNode {
            const { state } = this.props,
                payWay = state!.payWay;
            return (
                <>
                    <WhiteSpace className="default-gray-bg gray" />
                    <List className=" " renderHeader="支付方式">
                        <Radio.RadioItem
                            checked={PayWayEnum.alipay === payWay}
                            onChange={() => {
                                this.dispatch({ type: "input", data: { payWay: PayWayEnum.alipay } });
                            }}
                        >
                            支付宝
                        </Radio.RadioItem>
                        {/* <Radio.RadioItem
                            checked={PayWayEnum.wechat === payWay}
                            onChange={() => {
                                this.dispatch({ type: "input", data: { payWay: PayWayEnum.wechat } });
                            }}
                        >
                            微信
            </Radio.RadioItem> */}
                    </List>
                    <WhiteSpace className="default-gray-bg gray" />
                </>
            );
        }

        renderSignUpFrom(): React.ReactNode {
            return (
                <>
                    {/* 订单信息 */}
                    {this.renderOrderView()}
                    {/* 报名信息 */}
                    {this.renderRemarkFormView()}
                    {/* 退款说明 */}
                    {this.renderRefundRemarkView()}
                    {/* 支付方式 */}
                    {this.renderPayView()}
                </>
            );
        }

        renderFooter(): React.ReactNode {
            const { state } = this.props,
                activityDetailData = state!.activityDetail,
                isSubmitting = state!.isSubmitting;

            return (
                <Flex key="b" onClick={(e) => e.stopPropagation()} className={`flex-collapse row-collapse`}>
                    <Flex.Item>
                        <Button
                            type="primary"
                            onClick={() => {
                                this.goBack();
                            }}
                        >
                            取消
                        </Button>
                    </Flex.Item>
                    <Flex.Item>
                        <Button
                            type="primary"
                            onClick={() => {
                                !isSubmitting ? this.sureSubmit(activityDetailData) : null;
                            }}
                        >
                            {isSubmitting ? "提交中..." : "确认报名"}
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                activityDetailData = state!.activityDetail;
            const { activityVM } = activityDetailData || ({} as any);
            return activityVM ? this.renderSignUpFrom() : null;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.activityDetail]);
}
