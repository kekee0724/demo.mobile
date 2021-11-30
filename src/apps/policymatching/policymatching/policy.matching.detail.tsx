import React from "react";

import { List, WingBlank, Flex, Button, Tabs, WhiteSpace, Tag, Popover } from "antd-mobile-v2";

import { template, removeHtmlTag, formatDate, getLocalStorage } from "@reco-m/core";

import { getSharePicture, ViewComponent, HtmlContent, share, shareType, NoData, Mobclick, setEventWithLabel, setNavTitle } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, policymatchingdetailModel, PolicyTabTypeEnum } from "@reco-m/policymatching-models";

import { FavoritesLink } from "@reco-m/favorites-common";
import { MsgReachViewLimitEnum } from "@reco-m/msgreach-models";
import { MsgReachAuthBindModal } from "@reco-m/msgreach-common";
import { IParkBindTableNameEnum, isDingding, htmlContentTreatWord } from "@reco-m/ipark-common";
import { Namespaces as iparkCommonNameSpace } from "@reco-m/ipark-common-models";
import { Namespaces as memberNamespaces } from "@reco-m/member-models";

const ddkit = window["dd"];
export namespace PolicyMatchingDetail {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, policymatchingdetailModel.StateType {
        policyDetail?: any;
        isLoading?: boolean;
        show?: boolean;
        tabsNumber?: any;
    }

    let thirdShareconfig = false;

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = "政策详情";
        namespace = Namespaces.policymatchingdetail;

        slider: any;

        get id(): number {
            return this.getSearchParam("id") ? this.getSearchParam("id") : this.props.match!.params.id;
        }

        /**
         * 是否是预览
         */
        get isPreview() {
            return this.getSearchParam("ispreview");
        }

        /**
         * 信息触达传递权限
         */
        viewRange = this.getSearchParam("viewRange");

        componentDidMount() {
            setEventWithLabel(statisticsEvent.parkPolicyDetailView);
            setNavTitle.call(this, this.headerContent);
            thirdShareconfig = false;

            this.dispatch({
                type: `initPage`,
                data: this.id,
                callback: () => {
                    if (!client.isBiParkApp) {
                        // 不在ipark的app中
                        // 微信和其他浏览器
                        if (!this.isAuth()) {
                            this.dispatch({ type: "input", data: { authBindOpen: true } });
                        }
                    }
                    if (isDingding() && !this.viewRange) {
                        this.dingdingShare();
                    }
                },
            });
        }
        componentReceiveProps(nextProps): void {
            setNavTitle.call(this, this.headerContent, nextProps);
        }

        share() {
            const { state } = this.props;
            const Content = state!.content;
            const title = state!.title;
            setEventWithLabel(statisticsEvent.parkPolicyShare);

            let detail = removeHtmlTag(Content?.content)!;
            const result = share(
                title,
                detail?.substring(0, 40),
                getSharePicture(null, Content?.content, client.thirdshareLogo),
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

        componentWillUnmount() {
            const sd = $(".am-tabs-tab-bar-wrap");
            sd.attr("style", "");
            this.dispatch({
                type: "input",
                data: { title: "", ShortName: "", PublishTime: "", EffectTime: "", ExpirationTime: "", SourceUrl: "" },
            });
        }
        /**
         * 钉钉分享
         */
        dingdingShare() {
            const { state } = this.props,
                title = state!.title,
                contentHTML = state!.content;

            let content = contentHTML && htmlContentTreatWord(contentHTML),
                shareContent = content ? content.substring(0, 40) : "",
                img = getSharePicture(null, contentHTML, client.thirdshareLogo);

            ddkit.biz.navigation.setRight({
                show: true, // 控制按钮显示， true 显示， false 隐藏， 默认true
                control: true, // 是否控制点击事件，true 控制，false 不控制， 默认false
                text: "", // 控制显示文本，空字符串表示显示默认文本
                onSuccess: function () {
                    ddkit.biz.util.share({
                        type: 0, // 分享类型，0:全部组件 默认；1:只能分享到钉钉；2:不能分享，只有刷新按钮
                        url: location.href,
                        title: title,
                        content: shareContent,
                        image: img,
                        onSuccess: function () {
                            // onSuccess将在调起分享组件成功之后回调
                            /**/
                            // alert("success");
                        },
                        onFail: function () {
                            // alert(JSON.stringify(err));
                        },
                    });
                },
            });
        }

        renderHeaderRight(): React.ReactNode {
            return window.location.href.indexOf("IPark_Share") > -1 ? null : (
                <div>
                    <i className="icon icon-share" onClick={() => this.share()} />
                </div>
            );
        }

        renderTabChangeMap(tabs): React.ReactNode {
            return tabs.map((tab, i) => {
                return tab.content && (tab.content.indexOf("<p><br></p>") === -1 || tab.content.length !== "<p><br></p>".length) ? (
                    <div className="list-no-border" key={i}>
                        <List key={i}>
                            <WingBlank>
                                <HtmlContent.Component
                                    className="html-details"
                                    html={tab.content.replace(/href=\"\/\//g, 'href="http://').replace(/src=\"\/\//g, 'src=" http://')}
                                />
                            </WingBlank>
                        </List>
                    </div>
                ) : (
                    <NoData.Component key={i} />
                );
            });
        }

        renderTabNav() {
            const { state } = this.props,
                Content = state!.content;
            const tabs = [
                { title: PolicyTabTypeEnum.policyContent, content: Content && Content.content },
                { title: PolicyTabTypeEnum.policyCondition, content: Content && Content.conditions },
                { title: PolicyTabTypeEnum.policySupport, content: Content && Content.support },
                { title: PolicyTabTypeEnum.policyProcess, content: Content && Content.process },
                { title: PolicyTabTypeEnum.policyMatiral, content: Content && Content.documents },
                { title: PolicyTabTypeEnum.policyAcceptance, content: Content && Content.service },
            ];
            return (
                <Tabs
                    tabs={tabs}
                    initialPage={0}
                    page={this.state?.tabsNumber}
                    onTabClick={(tab, index) => {
                        tab;
                        this.setTabs(index);
                        $(".container-scrollable").animate({ scrollTop: 0 });
                    }}
                />
            );
        }

        renderTabChange(): React.ReactNode {
            const { state } = this.props,
                Content = state!.content;
            const tabs = [
                { title: PolicyTabTypeEnum.policyContent, content: Content && Content.content },
                { title: PolicyTabTypeEnum.policyCondition, content: Content && Content.conditions },
                { title: PolicyTabTypeEnum.policySupport, content: Content && Content.support },
                { title: PolicyTabTypeEnum.policyProcess, content: Content && Content.process },
                { title: PolicyTabTypeEnum.policyMatiral, content: Content && Content.documents },
                { title: PolicyTabTypeEnum.policyAcceptance, content: Content && Content.service },
            ];

            return (
                <Tabs
                    swipeable={false}
                    tabs={tabs}
                    initialPage={0}
                    page={this.state?.tabsNumber}
                    onTabClick={(tab, index) => {
                        tab;
                        this.setTabs(index);
                        $(".container-scrollable").animate({ scrollTop: 0 });
                    }}
                >
                    {this.renderTabChangeMap(tabs)}
                </Tabs>
            );
        }

        setTabs(e) {
            this.setState({
                tabsNumber: e,
            });
            this.heightCalculation();
        }

        renderLabelPop() {
            const { state } = this.props,
                policyTags = state!.policyTags,
                show = state!.show;
            let prop = { iparkoverlayClassName: "fortest", overlayStyle: { color: "currentColor" } };
            return (
                <Flex.Item>
                    {policyTags && policyTags.length ? (
                        <Popover
                            {...prop}
                            visible={false}
                            placement="bottomLeft"
                            overlay={
                                <div className="padding-sm container-scrollable">
                                    {policyTags.map((tagt: any, k) => {
                                        return (
                                            <Flex key={k} align={"center"} className={"margin-bottom-xs"}>
                                                <span className="size-12">
                                                    {tagt.tagClass}:
                                                </span>
                                                <Flex.Item>
                                                    {(tagt.arr || []).map((tag, t) => {
                                                        return (
                                                            <Tag small className="margin-right-xs tag-big" key={t}>
                                                                {tag.tagName}
                                                            </Tag>
                                                        );
                                                    })}
                                                </Flex.Item>
                                            </Flex>
                                        );
                                    })}
                                </div>
                            }
                            onVisibleChange={() => {
                                this.dispatch({ type: "input", data: { show: !show } });
                            }}
                        >
                            <span
                                className={show === true ? "pull-up on  margin-right-xs" : "pull-up  margin-right-xs"}
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                <i className="icon icon-xia size-12" />
                            </span>
                        </Popover>
                    ) : (
                        ""
                    )}
                </Flex.Item>
            );
        }

        renderLabel(): React.ReactNode {
            const { state } = this.props,
                ApplyTags = state!.ApplyTags;
            return (
                <Flex>
                    <div>
                        {ApplyTags &&
                            ApplyTags.map((item, t) => {
                                return (
                                    t < 2 && (
                                        <Tag small className="margin-right-xs tag-big" key={t}>
                                            {item.tagName}
                                        </Tag>
                                    )
                                );
                            })}
                    </div>
                    {this.renderLabelPop()}
                </Flex>
            );
        }

        refScroll(el) {
            super.refScroll(el);
            $(el).scroll(() => {
                this.heightCalculation();
            });
        }

        heightCalculation() {
            const sd = $(".tabs-nav");
            const picHeight: any = $(".tabs-content").position().top;
            const s: any = 0;
            if (s > picHeight && picHeight) {
                sd.css({
                    position: "absolute",
                    display: "block",
                    top: "0",
                    left: "0",
                    right: "0",
                    zIndex: "999",
                    transform: "translateZ(0)",
                });
            } else if (s < picHeight) {
                sd.attr("style", "");
            }
        }

        renderMsgReachAuthBindModal(): React.ReactNode {
            const { state } = this.props,
                parkList = state!.parkList || [],
                authBindOpen = state!.authBindOpen,
                authBindProps: any = {
                    viewRange: this.viewRange,
                    parkList: [...parkList],
                    isOpen: () => authBindOpen,
                    close: () => {},
                    confirmSelect: () => {
                        if (this.viewRange.toString() !== MsgReachViewLimitEnum.registerAndCertify.toString()) {
                            this.dispatch({ type: `initPage`, id: this.id });
                        }

                        this.dispatch({ type: "input", data: { authBindOpen: false } });
                    },
                };
            return this.renderEmbeddedView(MsgReachAuthBindModal.Page, { ref: "msgReachAuthBindModal", ...authBindProps });
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                title = state!.title,
                PublishTime = state!.publishTime,
                accepStarttime = state!.accepStarttime,
                accepEndtime = state!.accepEndtime,
                parkList = state!.parkList || [],
                start = formatDate(accepStarttime),
                end = formatDate(accepEndtime);
            const Content = state!.content;
            if (title && !thirdShareconfig && !this.viewRange) {
                thirdShareconfig = true;
                let detail = removeHtmlTag(Content.content)!.replace(/&nbsp;/gi, "");
                this.dispatch({
                    type: `${iparkCommonNameSpace.wechat}/thirdShare`,
                    title: title,
                    img: getSharePicture(null, Content.content, client.thirdshareLogo),
                    desc: detail.substring(0, 40),
                    wx: wx,
                });
            }
            return (
                <div className="container container-fill container-column">
                    <div className="tabs-nav">{this.renderTabNav()}</div>
                    <div className="container-scrollable container-fill body" ref={(e) => this.refScroll(e)}>
                        {/* {isDingding() && <i className="icon icon-share share-icon" onClick={() => (this.viewRange ? msgDingTalkConfigShare() : this.dingdingShare())}></i>} */}
                        <List>
                            <List.Item>
                                {title && <div className="size-18 no-omit">{title}</div>}
                                {this.renderLabel()}
                                <List.Item.Brief>
                                    {PublishTime && (
                                        <div className="size-12">
                                            <span className="mr15">发布日期</span>
                                            {formatDate(PublishTime)}
                                        </div>
                                    )}
                                    {!start && !end ? (
                                        ""
                                    ) : (
                                        <div className="size-12">
                                            <span className="mr15">有效期限</span>
                                            {start && !end ? `${start}起` : !start && end ? `${end}止` : `${start}~${end}`}
                                        </div>
                                    )}
                                </List.Item.Brief>
                            </List.Item>
                        </List>
                        <WhiteSpace size="md" className="whitespace-gray-bg" />
                        {this.viewRange && parkList.length > 0 && this.renderMsgReachAuthBindModal()}
                        <div className="tabs-content">{this.renderTabChange()}</div>
                    </div>
                </div>
            );
        }

        renderFavoritesLinkPage(id, title) {
            id = id ? id : this.id;

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

        renderFooter() {
            const { state } = this.props,
                title = state!.title;

            this.slider = this.getSearchParam("slider");

            return (
                !this.isPreview && (
                    <Flex className="flex-collapse white">
                        <Flex.Item className="tag-ft-btn">{this.renderFavoritesLinkPage(this.id, title)}</Flex.Item>
                        <Flex.Item>
                            <Button
                                type={"primary"}
                                onClick={() => {
                                    if (this.isAuth()) {
                                        this.goTo(`create/zczx?ZCZT=${title}`);
                                    } else {
                                        this.goTo("login");
                                    }
                                }}
                            >
                                政策咨询
                            </Button>
                        </Flex.Item>
                    </Flex>
                )
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.policymatchingdetail]);
}
