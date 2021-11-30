import React from "react";

import { Carousel, Flex, NavBar, Icon } from "antd-mobile-v2";

import { template, formatDateTime } from "@reco-m/core";

import { ViewComponent, ImageAuto, setEventWithLabel } from "@reco-m/core-ui";

import { Namespaces, ActivityModeEnum, activityDetailModel } from "@reco-m/activity-models";

import { Namespaces as memberNamespaces } from "@reco-m/member-models";

import { statisticsEvent } from "@reco-m/ipark-statistics";
export namespace ActivityDetailSignResult {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, activityDetailModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = true;
        namespace = Namespaces.activityDetail;
        id: any;
        componentDidMount() {
            this.id = this.getSearchParam("id") || this.props.match!.params.id;
        }
        shareActivity() {
            this.dispatch({
                type: "startShareActivity",
                id: this.id,
                callback: () => {
                    this.dispatch({ type: `${memberNamespaces.intergral}/operateMemberIntegral`, eventCode: "ThirdShare" });
                },
            });
            setEventWithLabel(statisticsEvent.myActivityShare);
        }
        renderHeaderRight(): React.ReactNode {
            const { state } = this.props,
                activityDetail = state!.activityDetail;
            const { activityVM = {} } = activityDetail || {};
            return activityVM.isValid ? (
                <i
                    className="icon icon-share"
                    onClick={() => {
                        this.shareActivity();
                    }}
                />
            ) : null;
        }
        renderOneViewPic(marketingPic): React.ReactNode {
            return marketingPic && marketingPic.length > 1 ? (
                <Carousel dots autoplay infinite>
                    {marketingPic &&
                        marketingPic.map((item, index) => {
                            return <ImageAuto.Component cutWidth="150" cutHeight="150" key={index} width="150px" height="150px" src={item.filePath} />;
                        })}
                </Carousel>
            ) : (
                <ImageAuto.Component cutWidth="150" cutHeight="150" width="150px" height="150px" src={marketingPic && marketingPic[0] && marketingPic[0].filePath} />
            );
        }
        renderOneView(activityVM, activityDetailVM): React.ReactNode {
            const { state } = this.props,
                marketingPic = state!.marketingPic;
            return (
                <>
                    {<div className="pay-state">{activityVM.isApply && activityVM.isApplyAudit ? "待审核" : "您已成功报名！"}</div>}
                    <div className="pay-text">
                        <div className="title omit omit-3 margin-h margin-bottom">{activityDetailVM.marketingRemark ? activityDetailVM.marketingRemark : ""}</div>
                        <div className="pay-tips" style={{ fontSize: "12px" }}>
                            {this.renderOneViewPic(marketingPic)}
                        </div>
                    </div>
                </>
            );
        }
        renderAddress(activityVM) {
            return (
                <Flex className="margin-bottom" align={"start"}>
                    <span>活动地点：</span>
                    <Flex.Item className="color-black">{activityVM.activityModeValue === ActivityModeEnum.online ? "线上直播" : activityVM.address}</Flex.Item>
                </Flex>
            );
        }
        renderTwoView(activityVM, activityDetailVM): React.ReactNode {
            return (
                <>
                    <div className="pay-state">{activityVM.isApply && activityVM.isApplyAudit ? "待审核" : "您已成功报名！"}</div>
                    <div className="pay-text">
                        <div className="size-16 margin-h mb20 omit omit-3"> {activityVM.activityName}</div>
                        <div className="padding-h gray-three-color pay-infos-panel">
                            <Flex className="margin-bottom" align={"start"}>
                                <span>时间：</span>
                                <Flex.Item className="color-black">
                                    <span>
                                        {formatDateTime(activityVM.startTime, "yyyy-MM-dd hh:mm")}
                                        &nbsp;至&nbsp;
                                        {formatDateTime(activityVM.endTime, "yyyy-MM-dd hh:mm")}
                                    </span>
                                </Flex.Item>
                            </Flex>
                            {this.renderAddress(activityVM)}
                            {activityDetailVM.organizerHost && (
                                <Flex align={"start"}>
                                    <span>主办方：</span>
                                    <Flex.Item className="color-black">{activityDetailVM.organizerHost}</Flex.Item>
                                </Flex>
                            )}
                        </div>
                    </div>
                </>
            );
        }

        renderHeader(): React.ReactNode {
            return (
                <NavBar
                    className="park-nav"
                    icon={<Icon type="left" />}
                    rightContent={this.renderHeaderRight() as any}
                    onLeftClick={() => {
                        if (location.href.indexOf("signOrder") !== -1) {
                            history.go(-3);
                        } else if (location.href.indexOf("sign") !== -1) {
                            history.go(-2);
                        } else {
                            history.go(-1);
                        }
                    }}
                ></NavBar>
            );
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                marketingPic = state!.marketingPic,
                activityDetail = state!.activityDetail;
            const { activityVM = {}, activityDetailVM = {} } = activityDetail || {};
            if (!this.getSearchParam("sign")) {
                return (
                    <div className="pay-content new">
                        <div className="pay-icon " style={{ backgroundColor: "#00c500" }}>
                            <i className={"icon icon-duihao"} />
                        </div>
                        <>
                            {<div className="pay-state">{ "已签到"}</div>}
                            <div className="pay-text">
                                <div className="title omit omit-3 margin-h margin-bottom">{activityDetailVM.marketingRemark ? activityDetailVM.marketingRemark : ""}</div>
                                <div className="pay-tips" style={{ fontSize: "12px" }}>
                                    {this.renderOneViewPic(marketingPic)}
                                </div>
                            </div>
                        </>
                    </div>
                );
            }
            return (
                <div className="pay-content new">
                    <div className="pay-icon " style={{ backgroundColor: activityVM.isApply && activityVM.isApplyAudit ? "#FF9A1B" : "#00c500" }}>
                        <i className={activityVM.isApply && activityVM.isApplyAudit ? "icon icon-point" : "icon icon-duihao"} />
                    </div>
                    {activityVM.isApplyMarketing ? this.renderOneView(activityVM, activityDetailVM) : this.renderTwoView(activityVM, activityDetailVM)}
                </div>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.activityDetail]);
}
