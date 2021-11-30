import React from "react";

import { template, formatDate, removeHtmlTag, getLocalStorage, browser } from "@reco-m/core";

import { ViewComponent, HtmlContent, setEventWithLabel, getSharePicture, shareType, Mobclick, share, setNavTitle } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { policyserviceOriginalDetailModel, Namespaces } from "@reco-m/policymatching-models";

import { Flex, List, WhiteSpace, Button, WingBlank, Tabs } from "antd-mobile-v2";

import { Namespaces as memberNamespaces } from "@reco-m/member-models";

import { FavoritesLink } from "@reco-m/favorites-common";

import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

import { MsgReachAuthBindModal } from "@reco-m/msgreach-common";
export namespace PolicyserviceOriginalDetails {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, policyserviceOriginalDetailModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.policyserviceoriginaldetail;
        showloading = false;
        headerContent = "政策原文详情";
        policyid;
        /**
         * 信息触达传递权限
         */
        viewRange = this.getSearchParam("viewRange");
        componentDidMount() {
            setNavTitle.call(this, this.headerContent);
            this.initData();
        }
        componentReceiveProps(nextProps: Readonly<IProps>): void {
            setNavTitle.call(this, this.headerContent, nextProps);

        }
        initData() {
            this.policyid = this.props.match!.params.policyId;
            this.dispatch({ type: `initPage`, id: this.policyid });
        }
        renderNavHeader(_headerContent?: any): React.ReactNode {
            let { state } = this.props,
                { policyDetail = {} } = state as any;
            return (
                <div>
                    <List className=" not-card-border">
                        <List.Item wrap>
                            <div className="omit omit-2 size-14">{policyDetail.title}</div>
                            <div className="omit omit-1">
                                <div className="default-tag mr10">{policyDetail.policyType}</div> <div className="default-tag mr10">{policyDetail.policyRank}</div>
                            </div>
                            <div className="mt10 size-12 gray-three-color">
                                <i className="icon icon-huabanfuben size-12 mr10" />
                                {formatDate(policyDetail.publishTime)} {policyDetail.publishUnit && <span className="margin-h">|</span>} {policyDetail.publishUnit}
                            </div>
                            <div className="mt5 size-12 gray-three-color">
                                <i className="icon icon-wenjian size-12 mr10" />
                                {policyDetail.policyNo}
                            </div>
                            <div className="mt5 size-12 gray-three-color">
                                <i className="icon icon-baoming2 size-12 mr10" />
                                截止至 {formatDate(policyDetail.expirationTime)}
                            </div>
                        </List.Item>
                    </List>
                    <WhiteSpace className="dark" />
                </div>
            );
        }
        share() {
            let { state } = this.props,
                { policyDetail = {} } = state as any,
                content = policyDetail.content || {};
            setEventWithLabel(statisticsEvent.parkPolicyShare);

            let detail = removeHtmlTag(content?.content)!;
            const result = share(
                policyDetail.title,
                detail?.substring(0, 40),
                getSharePicture(null, content?.content, client.thirdshareLogo),
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
        renderHeaderRight(): React.ReactNode {
            return window.location.href.indexOf("IPark_Share") > -1 ? null : (
                <div>
                    <i className="icon icon-share" onClick={() => this.share()} />
                </div>
            );
        }
        refScroll(el) {
            super.refScroll(el);
            $(el).scroll(() => {
                this.heightCalculation();
            });
        }

        heightCalculation() {
            const sd = $(".not-card-border").find(".am-tabs-tab-bar-wrap");
            const picHeight: any = $(".tabs-content").position().top;
            const s: any = 0;

            if (s > picHeight && picHeight) {
                sd.css({
                    position: "fixed",
                    display: "block",
                    top: "45px",
                    left: "0",
                    right: "0",
                    zIndex: "999",
                    transform: "translateZ(0)",
                });
            } else if (s < picHeight) {
                sd.attr("style", "");
            }
        }
        renderTel(): React.ReactNode {
            let { state } = this.props,
                { policyDetail = {} } = state as any,
                content = policyDetail.content || {};

            return (
                (!!content.technologyConsult || !!content.policyConsult || !!content.otherConsult) && (
                    <>
                        <List className="list-no-border">
                            {content.technologyConsult && (
                                <List.Item>
                                    <div className="omit omit-1 size-14">
                                        <a>
                                            <i className="icon icon-dianhua1 size-14 mr10" />
                                        </a>
                                        技术咨询：{content.technologyConsult}
                                    </div>
                                </List.Item>
                            )}
                            {content.policyConsult && (
                                <List.Item>
                                    <div className="omit omit-1 size-14">
                                        <a>
                                            {" "}
                                            <i className="icon icon-dianhua1 size-14 mr10" />
                                        </a>
                                        政策咨询：{content.policyConsult}
                                    </div>
                                </List.Item>
                            )}
                            {content.otherConsult && (
                                <List.Item>
                                    <div className="omit omit-1 size-14">
                                        <a>
                                            {" "}
                                            <i className="icon icon-dianhua1 size-14 mr10" />
                                        </a>
                                        其他咨询：{content.otherConsult}
                                    </div>
                                </List.Item>
                            )}
                        </List>
                        <WhiteSpace className="dark" />
                    </>
                )
            );
        }
        renderMsgReachAuthBindModal(): React.ReactNode {
            const { state } = this.props,
            policyDetail = state!.policyDetail || [],
                { parkVMList = [] } = policyDetail || {},
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
        renderBody(): React.ReactNode {
            let { state } = this.props,
                { policyDetail = {} } = state as any,
                content = policyDetail.content || {};
            let tabs: any = [];

            if (content.content) {
                tabs.push({ title: "政策原文" });
            }
            if (content.conditions) {
                tabs.push({ title: "申报条件" });
            }
            if (content.support) {
                tabs.push({ title: "扶持力度" });
            }
            if (content.process) {
                tabs.push({ title: "申报程序" });
            }
            if (content.documents) {
                tabs.push({ title: "提交材料" });
            }
            if (content.service) {
                tabs.push({ title: "受理服务" });
            }
            return (
                <div className="container-scrollable container-fill body" ref={(e) => this.refScroll(e)}>
                    {this.renderNavHeader()}
                    {this.renderTel()}
                    <List className="not-card-border tabs-content">
                        {tabs.length > 1 ? (
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
                                    <HtmlContent.Component html={content.content} />
                                </WingBlank>
                                <WingBlank>
                                    <HtmlContent.Component html={content.conditions} />
                                </WingBlank>
                                <WingBlank>
                                    <HtmlContent.Component html={content.support} />
                                </WingBlank>
                                <WingBlank>
                                    <HtmlContent.Component html={content.process} />
                                </WingBlank>
                                <WingBlank>
                                    <HtmlContent.Component html={content.documents} />
                                </WingBlank>
                                <WingBlank>
                                    <HtmlContent.Component html={content.service} />
                                </WingBlank>
                            </Tabs>
                        ) : (
                            <List.Item wrap>
                                <HtmlContent.Component html={content.content} />
                            </List.Item>
                        )}
                    </List>
                    {this.viewRange && this.renderMsgReachAuthBindModal()}
                </div>
            );
        }
        renderFavoritesLinkPage(id, title) {
            id = id ? id : this.policyid;

            return id
                ? this.renderEmbeddedView(FavoritesLink.Page as any, {
                      bindTableName: IParkBindTableNameEnum.policy,
                      bindTableId: id,
                      bindTableValue: title,
                      favoriteSuccess: () => {},
                      unFavoriteSuccess: () => {},
                  })
                : null;
        }
        renderFooter(): React.ReactNode {
            let { state } = this.props,
                { policyDetail = {} } = state as any;
            return (
                <Flex className="flex-collapse white">
                    <Flex.Item className="tag-ft-btn">{this.renderFavoritesLinkPage(this.policyid, policyDetail.title)}</Flex.Item>
                    <Flex.Item>
                        <Button
                            type={"primary"}
                            onClick={() => {
                                if (this.isAuth()) {
                                    this.goTo(`create/zczx?ZCZT=${policyDetail.title}&noclosewxmini=1`);
                                } else {
                                    if (!browser.versions.weChatMini) {
                                        this.goTo("login");
                                    } else {
                                        wx["miniProgram"].redirectTo({url: '/apps-auth/login/login'})
                                    };
                                }
                            }}
                        >
                            政策咨询
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.policyserviceoriginaldetail]);
}
