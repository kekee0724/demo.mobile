import React from "react";

import { List, WhiteSpace } from "antd-mobile-v2";

import { template, friendlyTime } from "@reco-m/core";

import { ViewComponent, HtmlContent, setEventWithLabel, getSharePicture, setNavTitle } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { CommentFooter, CommentList } from "@reco-m/comment";

import { articleDetailModel, Namespaces } from "@reco-m/article-models";
import { MsgReachViewLimitEnum } from "@reco-m/msgreach-models";
import { MsgReachAuthBindModal } from "@reco-m/msgreach-common";
import { IParkBindTableNameEnum, isDingding, htmlContentTreatWord } from "@reco-m/ipark-common";
import { Namespaces as iparkCommonNameSpace } from "@reco-m/ipark-common-models";
import { Namespaces as memberNamespaces } from "@reco-m/member-models";

const ddkit = window["dd"];

export namespace ArticleDetail {
    let thirdShareconfig = false;

    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, articleDetailModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.articleDetail;
        showloading = true;
        key: any;
        articleId: any;
        isShare = this.props.match!.params.isShare ? this.props.match!.params.isShare : this.getSearchParam("isShare");
        commentRef;
        headerContent = "资讯详情";
        /**
         * 信息触达传递权限
         */
        viewRange = this.getSearchParam("viewRange");
        /**
         * 是否是预览
         */
        get isPreview() {
            return this.getSearchParam("ispreview");
        }

        componentDidMount() {
            setNavTitle.call(this, this.headerContent);
            let type = this.getSearchParam("type");
            // 如果是通知公告
            if (type) {
                setEventWithLabel(statisticsEvent.noticeListDetailView);
            } else {
                setEventWithLabel(statisticsEvent.parkHeadlineDetailView);
            }
            thirdShareconfig = false;
            const id = this.getSearchParam("id");
            this.articleId = id ? id : this.props.match!.params.id;
            this.key = this.getSearchParam("key");
            this.dispatch({
                type: `initPage`,
                id: this.articleId,
                callback: () => {
                    if (!client.isBiParkApp) {
                        // 不在ipark的app中
                        // 微信和其他浏览器
                        if (!this.isAuth()) {
                            this.dispatch({ type: "input", data: { authBindOpen: true } });
                        }
                    }
                    setTimeout(() => {
                        this.dingdingShare();
                    }, 100);
                    return
                    if (isDingding() && !this.viewRange) {
                        this.dingdingShare();
                    }
                },
            });
            this.addViewCounts(id ? id : this.articleId);
        }
        componentReceiveProps(nextProps): void {
            setNavTitle.call(this, this.headerContent, nextProps);
        }
        /**
         * 增加阅读次数
         */
        addViewCounts(articleId: number) {
            this.dispatch({
                type: "addViewCounts",
                articleId: articleId,
                callback: () => {},
            });
        }

        componentWillUnmount() {
            this.dispatch({ type: "init" });
            this.dispatch({
                type: "article/input",
                data: { updataCommentCount: true },
            });
        }

        /**
         * 钉钉分享
         */
        dingdingShare() {
            const { state } = this.props,
                articleDetail = state!.articleDetail;
                const pictureSrc = state!.pictureSrc;
            const { articleVM = {} } = articleDetail || {},
                title = articleVM.title;

            const contentHTML = articleDetail.content;
            let content = htmlContentTreatWord(contentHTML);

            let shareContent = content ? content.substring(0, 40) : "",
                img = getSharePicture(
                    pictureSrc,
                    contentHTML,
                    client.thirdshareLogo
                );



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

        renderHeaderContent(): React.ReactNode {
            let type = this.getSearchParam("type");
            if (type) {
                return <span>{decodeURI(type)}</span>;
            }
            return <span>资讯详情</span>;
        }
        renderHeaderRight(): React.ReactNode {
            return window.location.href.indexOf("IPark_Share") > -1 ? null : (
                <i
                    className="icon icon-share"
                    onClick={() => {
                        setEventWithLabel(statisticsEvent.parkHeadShare);
                        this.dispatch({
                            type: "startShareArticle",
                            id: this.articleId,
                            callback: () => {
                                this.dispatch({ type: `${memberNamespaces.intergral}/operateMemberIntegral`, eventCode: "ThirdShare" });
                            },
                        });
                    }}
                />
            );
        }

        /**
         * 获取评论列表
         */
        renderCommentCList(): React.ReactNode {
            const { state } = this.props,
                articleDetail = state!.articleDetail;
            const { articleVM = {} } = articleDetail || {};
            const tprops = {
                bindTableName: IParkBindTableNameEnum.article,
                bindTableId: this.articleId,
                scroll: this.scroll,
                scrollTop: this.refs.scrollTop,
                replyCommentSuccess: () => setEventWithLabel(statisticsEvent.parkHeadlineReplyComments),
                delCommentSuccess: () => {
                    this.dispatch({ type: `getArticleDetail`, data: { articleId: this.articleId } });
                    setEventWithLabel(statisticsEvent.parkHeadlineDeleteComment);
                },
                deleteCommentReplySuccess: () => {},
                title: articleVM.title,
            };
            return this.articleId && this.renderEmbeddedView(CommentList.Page as any, { ...tprops });
        }

        renderHeaderInfo(articleDetail: any, _number: number): React.ReactNode {
            const { state } = this.props,
                commentCount = state!.commentCount;
            const { articleVM = {} } = articleDetail || {};
            return (
                <div className="hd">
                    <div className="title">{articleVM.title}</div>
                    <div className="brief">
                        <span>{articleVM.publishTime && friendlyTime(articleVM.publishTime)}</span>
                        <span>
                            <em>{articleVM.viewCount ? articleVM.viewCount : 0}</em>人浏览
                        </span>
                        <span>
                            <em>{commentCount ? commentCount : 0}</em>人回复
                        </span>
                    </div>
                </div>
            );
        }

        setThirdShare(articleDetail) {
            const { state } = this.props;

            const pictureSrc = state!.pictureSrc;
            const { content } = articleDetail || {};
            const { articleVM = {} } = articleDetail || {};
            const title = articleVM.title;

            if (title && !thirdShareconfig && !this.viewRange) {

                let articleContent = htmlContentTreatWord(content),
                    sharearticleDetailContent = articleContent ? articleContent.substring(0, 40) : "";
                thirdShareconfig = true;
                this.dispatch({
                    type: `${iparkCommonNameSpace.wechat}/thirdShare`,
                    title: title,
                    img: getSharePicture(pictureSrc, content, client.thirdshareLogo),
                    desc: sharearticleDetailContent,
                    wx: wx,
                });
            }
        }

        renderArticleContent(articleDetail: any): React.ReactNode {
            const { content } = articleDetail || {};
            this.setThirdShare(articleDetail);

            return (
                <div className="bd">
                    <HtmlContent.Component html={content} />
                </div>
            );
        }

        refScroll(el) {
            super.refScroll(el);
            $(el).off("scroll", this.scrollFn).on("scroll", this.scrollFn);
        }

        scrollFn() {
            const top = $(this).scrollTop() || 0;
            $(this).parents(".container-page").find("#nav_box_Shadow").length <= 0 && $(this).prevAll(".am-navbar").append('<span id="nav_box_Shadow"></span>');
            $(this)
                .parents(".container-page")
                .find("#nav_box_Shadow")
                .css({
                    background: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, ${
                        top * 0.001 < 0.1 ? top * 0.001 : 0.1
                    }) 100%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%)`,
                });
        }

        renderMsgReachAuthBindModal(): React.ReactNode {
            const { state } = this.props,
                articleDetail = state!.articleDetail,
                { parkVMList = [] } = articleDetail || {},
                authBindOpen = state!.authBindOpen,
                authBindProps: any = {
                    viewRange: this.viewRange,
                    parkList: parkVMList,
                    isOpen: () => authBindOpen,
                    close: () => {},
                    confirmSelect: () => {
                        if (this.viewRange.toString() !== MsgReachViewLimitEnum.registerAndCertify.toString()) {
                            this.dispatch({ type: `initPage`, id: this.articleId });
                        }

                        this.dispatch({ type: "input", data: { authBindOpen: false } });
                    },
                };
            return this.renderEmbeddedView(MsgReachAuthBindModal.Page, { ref: "msgReachAuthBindModal", ...authBindProps });
        }

        renderContent(articleDetail): React.ReactNode {
            return (
                articleDetail && (
                    <>
                        <List className="news-details">
                            <List.Item wrap={true}>{this.renderArticleContent(articleDetail)}</List.Item>
                        </List>
                        <WhiteSpace className="whitespace-gray-bg" />
                        <div
                            ref={(input) => {
                                if (!this.commentRef) {
                                    this.commentRef = input;
                                    this.dispatch({ type: "input", data: { random: Math.random() } });
                                }
                            }}
                        >
                            <List className="comment-list" renderHeader="评论">
                                {this.renderCommentCList()}
                            </List>
                        </div>
                        <WhiteSpace size="md" />
                    </>
                )
            );
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                number = state!.number,
                articleDetail = state!.articleDetail,
                { parkVMList = [] } = articleDetail || {};

            return (
                <>
                    {/* {isDingding() && <i className="icon icon-share share-icon" onClick={() => (this.viewRange ? msgDingTalkConfigShare() : this.dingdingShare())}></i>} */}
                    <List className="news-details">
                        <List.Item wrap>
                            <WhiteSpace />
                            {this.renderHeaderInfo(articleDetail, number)}
                            <WhiteSpace />
                        </List.Item>
                    </List>
                    <WhiteSpace className="whitespace-gray-bg" />
                    {this.renderContent(articleDetail)}
                    {this.viewRange && parkVMList.length ? this.renderMsgReachAuthBindModal() : null}
                </>
            );
        }

        renderFooter(): React.ReactNode {
            const { state } = this.props,
                articleDetail = state!.articleDetail;
            const { articleVM = {} } = articleDetail || {};
            return (
                !this.isPreview &&
                this.articleId &&
                this.commentRef &&
                this.renderEmbeddedView(CommentFooter.Page as any, {
                    bindTableName: IParkBindTableNameEnum.article,
                    bindTableId: this.articleId,
                    title: articleVM.title,
                    bindTableValue: articleVM.title,
                    scroll: this.scroll,
                    scrollTop: this.commentRef,
                    commentSuccess: () => {
                        setEventWithLabel(statisticsEvent.myActivitySendComments);
                        this.dispatch({ type: `getArticleDetail`, data: { articleId: this.articleId } });
                        setEventWithLabel(statisticsEvent.parkHeadlineSendComments);
                    },
                })
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.articleDetail]);
}
