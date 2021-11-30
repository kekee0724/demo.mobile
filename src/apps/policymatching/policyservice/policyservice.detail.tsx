import React from "react";

import Rater from "react-rater";

import { Flex, Tabs, List, WingBlank, WhiteSpace, Button, Modal } from "antd-mobile-v2";

import { template, formatDate, removeHtmlTag, getLocalStorage, browser } from "@reco-m/core";

import { ViewComponent, HtmlContent, setEventWithLabel, getSharePicture, shareType, Mobclick, share, stringCopy, setNavTitle } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import {
    policyserviceDetailModel,
    Namespaces,
    CashTypeValueEnum,
    getPolicyDetailDeadline,
    getPolicyStatus,
    PolicyStatusEnum,
    PolicyDeclareModeEnum,
} from "@reco-m/policymatching-models";

import { FavoritesLink } from "@reco-m/favorites-common";
import { IParkBindTableNameEnum } from "@reco-m/ipark-common";
import { Namespaces as memberNamespaces } from "@reco-m/member-models";
import { MsgReachAuthBindModal } from "@reco-m/msgreach-common";
export namespace PolicyserviceDetails {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, policyserviceDetailModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.policyservicedetail;
        showloading = false;
        headerContent = "申报详情";
        id;
        matchDegree;
        time;
        /**
         * 信息触达传递权限
         */
        viewRange = this.getSearchParam("viewRange");
        componentDidMount() {
            setNavTitle.call(this, "申报详情");
            this.matchDegree = this.getSearchParam("matchDegree");
            this.initData();
            this.time = setInterval(() => {
                this.dispatch("input", { random: Math.random() });
            }, 1000);
        }
        componentReceiveProps(nextProps: Readonly<IProps>): void {
            setNavTitle.call(this, "申报详情", nextProps);
        }
        componentWillUnmount() {
            this.dispatch({ type: "init" });
            clearInterval(this.time);
            this.time = null;
        }
        initData() {
            this.id = this.props.match!.params.id;
            this.dispatch({ type: `initPage`, id: this.id });
        }
        share() {
            let { state } = this.props,
                { policyserviceDetail = {} } = state as any;
            setEventWithLabel(statisticsEvent.parkPolicyShare);

            let detail = removeHtmlTag(policyserviceDetail?.declareCondition)!;
            const result = share(
                policyserviceDetail.implementationDetailTitle,
                detail?.substring(0, 40),
                getSharePicture(null, policyserviceDetail?.declareCondition, client.thirdshareLogo),
                window.location.href + `?parkId=${getLocalStorage("parkId")}`
            );
            result!.then((data) => {
                this.dispatch({ type: `${memberNamespaces.intergral}/operateMemberIntegral`, eventCode: "ThirdShare" });
                data === shareType.qq
                    ? setEventWithLabel(statisticsEvent.myActivityQQShare)
                    : data === shareType.weixin
                    ? setEventWithLabel(statisticsEvent.myActivityWeChatShare)
                    : data === shareType.weibo
                    ? setEventWithLabel(statisticsEvent.myActivityWeiboShare)
                    : data === shareType.qqspace && setEventWithLabel(statisticsEvent.myActivitySpaceShare);
            });
            Mobclick().onEventWithLabel("thirdshare", "第三方分享");
        }
        renderMsgReachAuthBindModal(): React.ReactNode {
            const { state } = this.props,
                policyserviceDetail = state!.policyserviceDetail || [],
                { parkVMList = [] } = policyserviceDetail || {},
                authBindOpen = state!.authBindOpen,
                authBindProps: any = {
                    viewRange: this.viewRange,
                    parkList: parkVMList,
                    isOpen: () => authBindOpen,
                    close: () => {},
                    confirmSelect: () => {
                        this.dispatch({ type: "input", data: { authBindOpen: false } });
                    },
                };
            return this.renderEmbeddedView(MsgReachAuthBindModal.Page, { ref: "msgReachAuthBindModal", ...authBindProps });
        }
        renderHeader(headerContent?: any): React.ReactNode {
            let { state } = this.props,
                { policyserviceDetail = {}, zhengcjb = {}, declareMode } = state as any;

            return (
                <>
                    {super.renderHeader(headerContent)}
                    <List className=" not-card-border">
                        <List.Item wrap>
                            <div className="omit omit-2 size-15">{policyserviceDetail.implementationDetailTitle}</div>

                            <Flex>
                                <Flex.Item>
                                    {policyserviceDetail.cashTypeValue === CashTypeValueEnum.amountSubsidy ? (
                                        <div style={{ fontSize: "14px", color: "orange" }} className="mt8 mb8">
                                            <i className={"icon icon-love size-12 mr5"} style={{ color: "#FF9933" }} />
                                            最高{policyserviceDetail.amountSubsidy}万元
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: "14px", color: "orange" }} className="mt8 mb8">
                                            <i className={"icon icon-love size-12 mr5"} style={{ color: "#FF9933" }} />
                                            {policyserviceDetail.qualificationIdentification}
                                        </div>
                                    )}
                                </Flex.Item>
                                {declareMode !== PolicyDeclareModeEnum.none && getPolicyDetailDeadline(policyserviceDetail.declareStartTime, policyserviceDetail.declareEndTime)}
                            </Flex>

                            <Flex>
                                <Flex.Item>
                                    <div className="default-tag mr10">{policyserviceDetail.suitObject}</div> <div className="default-tag mr5">{zhengcjb.tagName}</div>
                                    <div className="default-tag mr10">{policyserviceDetail.cashTypeValue === CashTypeValueEnum.amountSubsidy ? "金额补贴" : "资质认定"}</div>
                                </Flex.Item>
                            </Flex>
                            <Flex className="margin-bottom-xs">
                                <Flex.Item>
                                    <div className=" size-12 gray-three-color">
                                        <a>
                                            <i className="icon icon-huabanfuben size-12 mr10"></i>
                                        </a>
                                        {formatDate(policyserviceDetail.inputTime)} {policyserviceDetail.policyPublishUnit && <span className="margin-h">|</span>}{" "}
                                        {policyserviceDetail.policyPublishUnit}
                                    </div>
                                </Flex.Item>
                                {this.matchDegree && (
                                    <Flex.Item >
                                        <div className="omit omit-1 size-14 gray-three-color mt5 match-rater" style={{ float: "right" }}>
                                            <Rater interactive={false} total={5} rating={this.matchDegree} />
                                        </div>
                                    </Flex.Item>
                                )}
                            </Flex>
                        </List.Item>
                    </List>
                    <WhiteSpace className="dark" />
                    {this.viewRange && this.renderMsgReachAuthBindModal()}
                </>
            );
        }
        renderHeaderRight(): React.ReactNode {
            return <i className="icon icon-share" onClick={() => this.share()} />;
        }

        renderBody(): React.ReactNode {
            let { state } = this.props,
                { policyserviceDetail = {} } = state as any;
            const tabs = [{ title: "政策导读" }, { title: "政策原文" }];
            const keywords = policyserviceDetail.keywords,
                keywordsArr = keywords && keywords.split(",");
            return (
                <>
                    <Tabs
                        tabs={tabs}
                        renderTabBar={(props) => <Tabs.DefaultTabBar {...props} page={4} />}
                        onChange={(_tab, _index) => {
                            // console.log("onChange", index, tab);
                        }}
                        onTabClick={(_tab, _index) => {
                            // console.log("onTabClick", index, tab);
                        }}
                    >
                        <WingBlank>
                            <div className="policy-box">
                                <div className="title">解读关键字</div>
                                <div className="text">
                                    {keywordsArr && (
                                        <div className=" mt10">
                                            {keywordsArr.map((item, index) => {
                                                return (
                                                    <div className="default-tag mr5 mt5" key={index}>
                                                        {item}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="policy-box">
                                <div className="title">适合我吗</div>
                                <div className="text">
                                    <HtmlContent.Component html={policyserviceDetail.declareObject} />
                                </div>
                            </div>
                            <div className="policy-box">
                                <div className="title">需要做什么</div>
                                <div className="text">
                                    <HtmlContent.Component html={policyserviceDetail.declareCondition} />
                                </div>
                            </div>
                            <div className="policy-box">
                                <div className="title">能获得什么</div>
                                <div className="text">
                                    <HtmlContent.Component html={policyserviceDetail.supportStandard} />
                                </div>
                            </div>
                            <WhiteSpace />
                        </WingBlank>
                        <WingBlank>
                            <div className="policy-box" onClick={() => this.goTo(`policyserviceoriginaldetails/${policyserviceDetail.policyId}`)}>
                                <div className="text">
                                    <div className="omit omit-2 size-14">{policyserviceDetail.policyTitle}</div>
                                    <div className="omit omit-1 margin-top-xs gray-three-color">
                                        {formatDate(policyserviceDetail.policyPublishTime)} {policyserviceDetail.policyPublishUnit && <span className="margin-h">|</span>}{" "}
                                        {policyserviceDetail.policyPublishUnit}
                                    </div>
                                </div>
                            </div>
                        </WingBlank>
                    </Tabs>
                </>
            );
        }
        renderFavoritesLinkPage(id, title) {
            id = id ? id : this.id;

            return id
                ? this.renderEmbeddedView(FavoritesLink.Page as any, {
                      bindTableName: IParkBindTableNameEnum.policyService,
                      bindTableId: id,
                      bindTableValue: title,
                      favoriteSuccess: () => {},
                      unFavoriteSuccess: () => {},
                  })
                : null;
        }

        renderFooter(): React.ReactNode {
            let { state } = this.props,
                { policyserviceDetail = {}, declareMode } = state as any;
            return (
                <Flex className="flex-collapse white">
                    <Flex.Item className="tag-ft-btn">{this.renderFavoritesLinkPage(this.id, policyserviceDetail.implementationDetailTitle)}</Flex.Item>
                    <Flex.Item>
                        <Button
                            disabled={
                                declareMode === PolicyDeclareModeEnum.none ||
                                getPolicyStatus(policyserviceDetail.declareStartTime, policyserviceDetail.declareEndTime) !== PolicyStatusEnum.declaring
                            }
                            type={"primary"}
                            onClick={() => {
                                Modal.alert(
                                    "提示",
                                    <div>
                                        <div style={{ color: "black", fontSize: "14px", marginBottom: "5px" }}>手机端暂不支持在线申报</div>
                                        <div className="gray-three-color" style={{ fontSize: "12px" }}>
                                            请移至电脑端查看申报内容
                                        </div>
                                    </div>,
                                    [
                                        {
                                            text: "好的",
                                            onPress: () => {},
                                        },
                                        {
                                            text: browser.versions.weChatMini ? "取消" : "复制链接",
                                            onPress: () => {
                                                stringCopy(server.weburl as any);
                                            },
                                        },
                                    ]
                                );
                            }}
                        >
                            {/* {declareMode === PolicyDeclareModeEnum.none ? "暂无法申报" : } */}
                            我要申报
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.policyservicedetail]);
}
