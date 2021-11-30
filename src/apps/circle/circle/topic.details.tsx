import React from "react";

import { List, Flex, WhiteSpace } from "antd-mobile-v2";

import { template, friendlyTime, isAnonymous, transformImageUrl } from "@reco-m/core";
import { ViewComponent, getSharePicture, callModal, setEventWithLabel, setNavTitle } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";

import { circleTopicDetailModel, Namespaces } from "@reco-m/ipark-white-circle-models";

import { CommentFooter, CommentList } from "@reco-m/comment";
import { IParkBindTableNameEnum, htmlContentTreatWord } from "@reco-m/ipark-common";
import { Namespaces as iparkCommonNameSpace } from "@reco-m/ipark-common-models";
import { Namespaces as memberNamespaces } from "@reco-m/member-models";

import { Bigpictur } from "./big.pictur";

export namespace TopicDetails {
    let thirdShareconfig = false;

    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, circleTopicDetailModel.StateType {
        viewRef?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        isRoot = true;
        showLoading = true;
        bodyClass = "white-bg";
        namespace = Namespaces.circleTopicDetail;
        view;
        showback = false;
        commentRef;
        headerContent = "动态详情";

        componentDidMount() {
            setNavTitle.call(this, this.headerContent);
            setEventWithLabel(statisticsEvent.parkCircleDynamicDetailView);
            thirdShareconfig = false;
            this.dispatch({
                type: "initPage",
                circleID: this.props.match!.params.id,
                topicID: this.props.match!.params.topicID,
            });
        }
        componentReceiveProps(nextProps): void {
            setNavTitle.call(this, this.headerContent, nextProps);
        }

        renderHeaderRight() {
            return window.location.href.indexOf("IPark_Share") > -1 ? null : (
                <i
                    className="icon icon-share"
                    onClick={() => {
                        this.dispatch({
                            type: "startShareATopicDetail",
                            callback: () => setEventWithLabel(statisticsEvent.parkCircleDynamicshare),
                            callback2: () => this.dispatch({ type: `${memberNamespaces.intergral}/operateMemberIntegral`, eventCode: "ThirdShare" }),
                        });
                    }}
                />
            );
        }

        renderHeaderContent(): React.ReactNode {
            return <span>动态详情</span>;
        }

        /**
         * 获取评论列表
         */
        renderCommentCList() {
            const { state } = this.props,
                firstTopicComment = state!.firstTopicComment;
            let content = firstTopicComment && htmlContentTreatWord(firstTopicComment.postContent),
                subContent = content ? content.substring(0, 10) : "";

            const tprops = {
                bindTableName: IParkBindTableNameEnum.post,
                bindTableId: this.props.match!.params.topicID,
                scroll: this.scroll,
                scrollTop: this.refs.scrollTop,
                replyCommentSuccess: () => setEventWithLabel(statisticsEvent.parkHeadlineReplyComments),
                delCommentSuccess: () => setEventWithLabel(statisticsEvent.parkHeadlineDeleteComment),
                deleteCommentReplySuccess: () => {},
                title: subContent,
            };
            return this.renderEmbeddedView(CommentList.Page as any, { ...tprops });
        }

        // 回复评论
        renderChildComment(item): React.ReactNode {
            return item.ChildTopicPost.length > 0 ? (
                <div className="comment-reply-list size-13">
                    {item.ChildTopicPost.map((list, j) => {
                        return (
                            <div className="reply-text" key={j}>
                                <span className="color-a">{list.Inputer}</span>回复 <span className="color-a">{item.Inputer}</span>：<span>{list.ContentHTML}</span>
                            </div>
                        );
                    })}
                    {item.ChildTopicPost.length > 0 ? <div className="reply-text color-a">-查看全部回复 {item.ChildTopicPost.length} 条</div> : ""}
                </div>
            ) : (
                ""
            );
        }

        // 评论
        commentList(): React.ReactNode {
            return (
                <>
                    <List
                        renderHeader={"最新评论"}
                        ref={(input) => {
                            if (!this.commentRef) {
                                this.commentRef = input;
                                this.dispatch({ type: "input", data: { random: Math.random() } });
                            }
                        }}
                    ></List>

                    {this.renderCommentCList()}
                </>
            );
        }

        refScroll(el) {
            super.refScroll(el);
            if ($("html").hasClass("theme-white")) {
                $(el).off("scroll", this.scrollFn).on("scroll", this.scrollFn);
            }
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
        setThirdShare() {
            const { state } = this.props,
                firstTopicComment = state!.firstTopicComment;
            if (firstTopicComment && !thirdShareconfig) {
                thirdShareconfig = true;
                let contentHTML = firstTopicComment.postContent || "话题分享";

                const img = getSharePicture(firstTopicComment && firstTopicComment.pictureUrlList && firstTopicComment.pictureUrlList[0], contentHTML, client.thirdshareLogo);

                let articleContent = contentHTML && contentHTML.replace(/<\/?.+?\/?>/g, ""),
                    shareArticleContent = articleContent ? articleContent.substring(0, 40) : "";

                this.dispatch({
                    type: `${iparkCommonNameSpace.wechat}/thirdShare`,
                    title: shareArticleContent,
                    img: img,
                    desc: shareArticleContent,
                    wx: wx,
                });
            }
        }
        cancelFollow(e) {
            const { state } = this.props,
                firstTopicComment = state!.firstTopicComment;
            isAnonymous()
                ? this.goTo("login")
                : callModal("确认要取消关注吗?", () => {
                      this.dispatch({
                          type: "cancelFollow",
                          id: firstTopicComment && firstTopicComment.inputerId,
                          callback: () => {
                              setEventWithLabel(statisticsEvent.parkCircleCancelfollowUser);
                              this.dispatch({ type: "getfirstTopicComment", data: this.props.match!.params.topicID });
                              const data = { IsParkAccount: false, pageIndex: 1, pageSize: 10 };
                              const id = this.props.match!.params.id;
                              this.dispatch({
                                  type: "circleDetail/getCircleTopic",
                                  data,
                                  id,
                              });
                          },
                      });
                  });
            e.stopPropagation();
        }
        follow(e) {
            const { state } = this.props,
                firstTopicComment = state!.firstTopicComment;
            isAnonymous()
                ? this.goTo("login")
                : this.dispatch({
                      type: "follow",
                      data: {
                          bindTableName: IParkBindTableNameEnum.sysaccount,
                          bindTableId: firstTopicComment.inputerId,
                      },
                      callback: () => {
                          setEventWithLabel(statisticsEvent.parkCirclefollowUser);
                          this.dispatch({ type: "getfirstTopicComment", data: this.props.match!.params.topicID });
                          const data = { IsParkAccount: false, pageIndex: 1, pageSize: 10 };
                          const id = this.props.match!.params.id;
                          this.dispatch({
                              type: "circleDetail/getCircleTopic",
                              data,
                              id,
                          });
                      },
                  });
            e.stopPropagation();
        }
        renderFollow(): React.ReactNode {
            const { state } = this.props,
                firstTopicComment = state!.firstTopicComment,
                user = state!.user,
                currentUser = user && user.currentUser;
            return (firstTopicComment && firstTopicComment.inputerId) !== (currentUser && currentUser.id) ? (
                firstTopicComment && firstTopicComment.isFollow ? (
                    <div
                        className="tag type2"
                        onClick={(e) => {
                            this.cancelFollow(e);
                        }}
                    >
                        已关注
                    </div>
                ) : (
                    <div
                        className="tag type1 "
                        onClick={(e) => {
                            this.follow(e);
                        }}
                    >
                        关注
                    </div>
                )
            ) : (
                ""
            );
        }
        renderBigPictur() {
            const { state } = this.props,
                firstTopicComment = state!.firstTopicComment;
            return firstTopicComment && firstTopicComment.pictureUrlList && firstTopicComment.pictureUrlList.length === 1 ? (
                <Bigpictur.Component src={firstTopicComment && firstTopicComment.pictureUrlList && firstTopicComment.pictureUrlList} />
            ) : firstTopicComment && firstTopicComment.pictureUrlList && firstTopicComment.pictureUrlList.length === 2 ? (
                <Flex>{<Bigpictur.Component src={firstTopicComment.pictureUrlList} width="95%" height="100px" />}</Flex>
            ) : firstTopicComment && firstTopicComment.pictureUrlList ? (
                firstTopicComment.pictureUrlList && (
                    <div className="grid-img">
                        <Bigpictur.Component src={firstTopicComment && firstTopicComment.pictureUrlList} width="100%" height="100px" />
                    </div>
                )
            ) : (
                ""
            );
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                firstTopicComment = state!.firstTopicComment;
            this.setThirdShare();

            return firstTopicComment ? (
                <>
                    <List>
                        <List.Item wrap>
                            <Flex>
                                <div className="circle-user-img">
                                    <img
                                        src={
                                            firstTopicComment && firstTopicComment.avatarPictureUrl && firstTopicComment.avatarPictureUrl.length
                                                ? transformImageUrl(firstTopicComment.avatarPictureUrl, 35, 35)
                                                : "assets/images/myBackgroundview1.png"
                                        }
                                    />
                                </div>
                                <Flex.Item>
                                    <span className="size-13 color-black">{firstTopicComment && firstTopicComment.inputer}</span>
                                    <div className="gray-three-color">
                                        <span className="size-12 g">{friendlyTime(firstTopicComment && firstTopicComment.inputTime)}</span>
                                    </div>
                                </Flex.Item>
                                {this.renderFollow()}
                            </Flex>
                            <div className="fize-14" style={{ whiteSpace: "pre-wrap" }}>
                                {firstTopicComment && firstTopicComment.postContent.replace(/<br\/>/g, "\n").replace(/<br>/g, "\n")}
                            </div>
                            {this.renderBigPictur()}
                            <WhiteSpace />
                        </List.Item>
                    </List>
                    <WhiteSpace className="whitespace-gray-bg" />
                    {this.commentList()}
                </>
            ) : null;
        }

        // 新版尾部样式
        renderFooter(): React.ReactNode {
            const { state } = this.props,
                firstTopicComment = state!.firstTopicComment;
            let content = firstTopicComment && htmlContentTreatWord(firstTopicComment.postContent),
                subContent = content ? content.substring(0, 10) : "";
            return firstTopicComment && (
                this.commentRef &&
                this.renderEmbeddedView(CommentFooter.Page as any, {
                    bindTableName: IParkBindTableNameEnum.post,
                    bindTableId: this.props.match!.params.topicID,
                    title: subContent,
                    bindTableValue: subContent,
                    scroll: this.scroll,
                    scrollTop: this.commentRef,
                    commentSuccess: () => setEventWithLabel(statisticsEvent.parkHeadlineSendComments),
                })
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.circleTopicDetail]);
}
