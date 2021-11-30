import React from "react";

import { List, Flex, Modal, Toast, InputItem, NavBar, Icon, WhiteSpace } from "antd-mobile-v2";

import { template, isAnonymous, friendlyTime, browser, transformImageUrl, getLocalStorage } from "@reco-m/core";

import { ListComponent, shake, HtmlContent, setScrollViewZoomOpen, setScrollViewZoomClose, NoData, androidExit, popstateHandler, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, commentModel, CommentTypeEnum, getCommentAuditStatus } from "@reco-m/comment-models";

import { debounce, ServiceSourceEnum, ServiceSourceTextEnum, CommentAuditStatusEnum } from "@reco-m/ipark-common";

import { CommentItemDeletList } from "./comment.item.delet";

export namespace CommentList {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {
        bindTableName?: any;
        bindTableId?: any;
        replyId?: any;
        scroll?: any;
        scrollTop?: any;
        replyCommentSuccess?: any;
        delCommentSuccess?: any;
        deleteCommentReplySuccess?: any;
        title: any;
    }

    export interface IState extends ListComponent.IState, commentModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showheader = false;
        namespace = Namespaces.comment;
        scrollTop = -1;
        middle = true;
        text: any;
        NoDataText = "暂无评论，快来发表你的看法吧~";
        time;
        ispreview;
        debounCommentListLikeCommentCircle = debounce(this.commentListLikeComment.bind(this), 1000);
        debouncommentReplyListLikeComment = debounce(this.commentReplyListLikeComment.bind(this), 1000);
        componentDidMount() {
            const { bindTableName, bindTableId } = this.props,
                data = {
                    bindTableName: bindTableName,
                    bindTableId: bindTableId,
                    replyId: 0,
                    pageIndex: 1,
                    isPublic: true
                };
            this.dispatch({ type: `initPage`, data });
            this.ispreview = this.getSearchParam("ispreview");
        }
        oncommentSuccessInit() {
            this.dispatch({ type: "changeState", data: { commentSuccess: false } });
            this.getCommentList(1);
        }
        onReplySuccessInit(e) {
            this.dispatch({ type: "input", data: { replyContent: "" } });
            this.reloadCommentReply();
            Toast.success(e, 1);
            this.props.replyCommentSuccess && this.props.replyCommentSuccess();
        }

        componentReceiveProps(nextProps: IProps) {
            this.shouldUpdateData(nextProps.state);
            nextProps.state!.commentSuccess && this.oncommentSuccessInit();
        }

        componentWillUnmount() {
            this.dispatch({
                type: "changeState",
                data: {
                    showModal: false,
                    commentSelected: {},
                },
            });
        }

        getCommentList(index: number) {
            const { bindTableName, bindTableId } = this.props,
                data = {
                    bindTableName: bindTableName,
                    bindTableId: bindTableId,
                    replyId: 0,
                    pageIndex: index,
                    isPublic: true
                };
            this.dispatch({ type: "getAppCommentList", data: data });
        }

        /**
         * 刷新列表
         */
        onRefresh() {
            this.getCommentList(1);
        }

        pullToRefresh() {
            this.getCommentList(1);
        }

        /**
         * 下拉刷新
         */
        onEndReached() {
            const { state } = this.props;
            this.getCommentList((state!.CurrentPage || 0) + 1);
        }

        deleteOneComment(commentData: any) {
            if (this.ispreview) {
                return;
            }
            Modal.alert("操作提示", `确定删除评论？`, [
                {
                    text: "取消",
                    onPress: () => {},
                },
                {
                    text: "确定",
                    onPress: () => {
                        setEventWithLabel(statisticsEvent.parkCircleDeleteComment);
                        this.dispatch({
                            type: "deleteOneComment",
                            data: commentData.id,
                            fail: (e) => Toast.fail(e.errmsg),
                            callback: (e) => {
                                this.deleteCommentSuccess(e);
                            },
                        });
                    },
                },
            ]);
        }

        deleteOneCommentReply(reply: any) {
            Modal.alert("操作提示", `确定删除评论？`, [
                {
                    text: "取消",
                    onPress: () => {},
                },
                {
                    text: "确定",
                    onPress: () => {
                        setEventWithLabel(statisticsEvent.parkCircleDeleteComment);
                        this.dispatch({
                            type: "deleteOneComment",
                            data: reply.id,
                            callback: (e) => this.deleteCommentReplySuccess(e),
                        });
                        this.onRefresh();
                    },
                },
            ]);
        }

        deleteCommentSuccess(e: any) {
            Toast.success(e, 1);
            this.getCommentList(1);

            this.dispatch({ type: "commentFooter/changeCommentNum", data: CommentTypeEnum.reduce }); // 删除评论成功，更新评论数量展示

            this.props.delCommentSuccess && this.props.delCommentSuccess();
        }

        deleteCommentReplySuccess(e: any) {
            Toast.success(e, 1);
            this.reloadCommentReply();

            this.props.deleteCommentReplySuccess && this.props.deleteCommentReplySuccess();
        }

        reloadCommentReply() {
            const { state } = this.props,
                commentSelected = state!.commentSelected;

            commentSelected && commentSelected.id && this.getCommentReplyList(commentSelected);
        }

        getCommentReplyList(commentData: any) {
            const { bindTableName, bindTableId } = this.props;
            const data = {
                bindTableName: bindTableName,
                bindTableId: bindTableId,
                replyId: commentData.id,
                pageIndex: 1,
                isPublic: true
            };

            this.dispatch({ type: "getCommentReplyList", data: data });
        }

        commentOnClick(commentData: any) {

            if (this.ispreview || commentData.auditStatus !== CommentAuditStatusEnum.pass) {
                return;
            }
            this.getCommentReplyList(commentData);
            this.dispatch({ type: "update", data: { showModal: true, commentSelected: commentData } });
            // // 解决android返回
            const callback = () => {
                this.dispatch({ type: "changeState", data: { showModal: false, replyContent: "" } });
                this.getCommentList(1);
            };
            androidExit(true, callback);
        }

        commentOnClose() {
            this.dispatch({ type: "changeState", data: { showModal: false, replyContent: "" } });
            this.getCommentList(1);
            // 解决android返回
            const callback = () => this.dispatch({ type: "input", data: { showModal: false } });
            androidExit(false, callback);
        }
        commentListLikeComment(commentData) {
            this.dispatch({
                type: "likeComment",
                comment: commentData,
                likecallback: () => {
                    this.getCommentList(1);
                },
            });
        }
        renderLikeButton(commentData): React.ReactNode {

            return commentData.auditStatus === CommentAuditStatusEnum.pass ? (
                this.isAuth() &&
                (!commentData.isAgreed ? (
                    <>
                        <i
                            className="icon icon-newzan pr5 size-16"
                            onClick={(e) => {
                                if (this.ispreview) {
                                    return;
                                }
                                shake();
                                this.debounCommentListLikeCommentCircle(commentData);
                                e.stopPropagation();
                            }}
                        />
                        <span className="size-12">{commentData.agreeCount ? commentData.agreeCount : ""}</span>{" "}
                    </>
                ) : (
                    <>
                        <i
                            className="icon icon-newzan size-16 primary-color pr5"
                            onClick={(e) => {
                                if (this.ispreview) {
                                    return;
                                }
                                shake();
                                this.debounCommentListLikeCommentCircle(commentData);
                                e.stopPropagation();
                            }}
                        />
                        <span className="size-13 primary-color">{commentData.agreeCount ? commentData.agreeCount : ""}</span>{" "}
                    </>
                ))
            ) : <span className={`margin-left-xs size-12 color-${getCommentAuditStatus(commentData.auditStatus, "class")}`}>{getCommentAuditStatus(commentData.auditStatus)}</span>;
        }
        renderCommentListItem(commentData: any, i: number): React.ReactNode {

            return (
                <List className="comment-list border-none">
                    <List.Item
                        wrap
                        thumb={
                            <div className="circle-user-img">
                                <img
                                    src={transformImageUrl(
                                        commentData.avatarPicUrl && commentData.avatarPicUrl !== "" ? commentData.avatarPicUrl : "assets/images/myBackgroundview1.png",
                                        35,
                                        35
                                    )}
                                ></img>
                            </div>
                        }
                    >
                        <Flex align="center">
                            <Flex.Item onClick={this.commentOnClick.bind(this, commentData)}>
                                <span className="size-13 color-black omit omit-1 pr15">{commentData.commentUser ? commentData.commentUser : "网站会员"}</span>
                            </Flex.Item>
                            <div>{this.renderLikeButton(commentData)}</div>
                        </Flex>
                        <div className="gray-one-color omit omit-2" onClick={this.commentOnClick.bind(this, commentData)}>
                            <HtmlContent.Component html={commentData.commentContent && commentData.commentContent.replace(/\n/g, "<br>")} />
                        </div>
                        <Flex align="center">
                            <Flex.Item onClick={this.commentOnClick.bind(this, commentData)}>
                                <span className="gray-three-color size-12">{friendlyTime(commentData.commentTime)}</span>
                            </Flex.Item>
                            {this.renderEmbeddedView(CommentItemDeletList.Page as any, {
                                commentData,
                                deleteOneComment: this.deleteOneComment.bind(this, commentData),
                            })}
                        </Flex>
                        {this.renderChildComment(commentData, commentData.commentDetailVMList, i)}
                    </List.Item>
                </List>
            );
        }

        // 回复评论
        renderChildComment(commentData, childcommentData, i): React.ReactNode {
            // childcommentData = childcommentData
            //     ? childcommentData.filter((item) => {
            //           return item.isPublic;
            //       })
            //     : [];

            return childcommentData && childcommentData.length > 0 ? (
                <div className="comment-reply-list size-13" key={i} onClick={this.commentOnClick.bind(this, commentData)}>
                    {childcommentData.map((list, j) => {
                        return j < 3 ? (
                            <div className="reply-text" key={j}>
                                <span className="color-a">{list.inputer ? list.inputer : "网站会员"}</span> ：
                                <span>{list.commentContent.replace(/<br\/>/g, "\n").replace(/<br>/g, "\n")}</span>
                            </div>
                        ) : null;
                    })}
                    {childcommentData.length > 0 ? (
                        <div className="reply-text color-a" onClick={this.commentOnClick.bind(this, commentData)}>
                            -查看全部回复 {childcommentData.length} 条
                        </div>
                    ) : (
                        ""
                    )}
                </div>
            ) : (
                ""
            );
        }

        renderItemsContent(commentData: any, i: number) {
            return this.renderCommentListItem(commentData, i);
        }

        renderCommentReplyList(): React.ReactNode {
            const { state } = this.props,
                commentReplyList = state!.commentReplyList;

            return (
                <List renderHeader="全部回复" className="comment-list">
                    {commentReplyList && commentReplyList.items && commentReplyList.items.length ? (
                        commentReplyList.items.map((reply, i) => this.renderCommentReplyListItem(reply, i))
                    ) : (
                        <NoData.Component text="暂无评论"></NoData.Component>
                    )}
                </List>
            );
        }
        commentReplyListLikeComment(reply) {
            this.dispatch({
                type: "likeComment",
                comment: reply,
                likecallback: () => {
                    const { state } = this.props,
                        commentSelected = state!.commentSelected;
                    this.getCommentReplyList(commentSelected);
                },
            });
        }
        renderCommentReplyLike(reply): React.ReactNode {
            return reply.auditStatus === CommentAuditStatusEnum.pass ?(
                this.isAuth() &&
                (!reply.isAgreed ? (
                    <>
                        <i
                            className="icon icon-newzan pr5 size-16"
                            onClick={(e) => {
                                this.debouncommentReplyListLikeComment(reply);
                                e.stopPropagation();
                            }}
                        />
                        <span className="size-12">{reply.agreeCount ? reply.agreeCount : ""}</span>{" "}
                    </>
                ) : (
                    <>
                        <i
                            className="icon icon-newzan size-16 primary-color pr5"
                            onClick={(e) => {
                                this.debouncommentReplyListLikeComment(reply);
                                e.stopPropagation();
                            }}
                        />
                        <span className="size-12 primary-color">{reply.agreeCount ? reply.agreeCount : ""}</span>{" "}
                    </>
                ))
            ): <span className={`margin-left-xs size-12 color-${getCommentAuditStatus(reply.auditStatus, "class")}`}>{getCommentAuditStatus(reply.auditStatus)}</span>;
        }
        renderCommentReplyListItem(reply: any, i: number): React.ReactNode {
            return (
                <List className="comment-list border-none mv5" key={i}>
                    <List.Item
                        wrap
                        thumb={
                            <div className="circle-user-img">
                                <img
                                    src={transformImageUrl(reply.avatarPicUrl && reply.avatarPicUrl !== "" ? reply.avatarPicUrl : "assets/images/myBackgroundview1.png", 35, 35)}
                                ></img>
                            </div>
                        }
                    >
                        <Flex>
                            <Flex.Item>
                                <span className="size-15 color-black omit omit-1 pr15">{reply.commentUser ? reply.commentUser : "网站会员"}</span>
                                <span style={{ color: "gray" }}>{reply.isAdminReply ? "(管理员回复)" : ""}</span>
                            </Flex.Item>
                            <div>{this.renderCommentReplyLike(reply)}</div>
                        </Flex>
                        <div className="gray-one-color" style={{ whiteSpace: "pre-wrap" }}>
                            {reply.commentContent.replace(/<br\/>/g, "\n").replace(/<br>/g, "\n")}
                        </div>
                        <Flex align="center">
                            <Flex.Item>
                                <span className="gray-three-color size-12">{friendlyTime(reply.commentTime)}</span>
                            </Flex.Item>
                            {this.renderEmbeddedView(CommentItemDeletList.Page as any, {
                                commentData: reply,
                                deleteOneComment: this.deleteOneCommentReply.bind(this, reply),
                            })}
                        </Flex>
                    </List.Item>
                </List>
            );
        }

        gotoLogin() {
            if (browser.versions.android) {
                popstateHandler.removePopstateListener().then(() => {
                    this.goTo("login");
                });
            } else {
                this.goTo("login");
            }
            this.dispatch({ type: "changeState", data: { showModal: false } });
        }

        replyOnClick(replyContent: string) {
            const { bindTableName, bindTableId, state, title } = this.props,
                commentSelected = state!.commentSelected;
            const data = {
                bindTableName: bindTableName,
                bindTableId: bindTableId,
                replyId: commentSelected.id,
                source: ServiceSourceTextEnum.app,
                sourceValue: ServiceSourceEnum.app,
                parkId: getLocalStorage("parkId"),
                commentContent: replyContent,
                bindTableValue: title,
            };

            !replyContent
                ? Toast.fail("请输入回复内容！")
                : isAnonymous()
                ? this.gotoLogin()
                : this.dispatch({ type: "submitReplyContent", data: data, callback: (e) => this.onReplySuccessInit(e) });
        }

        renderModalTitle(commentSelected: any, _commentReplyList: any): React.ReactNode {
            return (
                <List className="comment-list">
                    <List.Item
                        wrap
                        thumb={
                            <div className="circle-user-img">
                                <img
                                    src={transformImageUrl(
                                        commentSelected.avatarPicUrl && commentSelected.avatarPicUrl !== "" ? commentSelected.avatarPicUrl : "assets/images/myBackgroundview1.png",
                                        35,
                                        35
                                    )}
                                ></img>
                            </div>
                        }
                    >
                        <Flex>
                            <Flex.Item>
                                <span className="size-15 color-black omit omit-1 pr15">{commentSelected.commentUser ? commentSelected.commentUser : "网站会员"}</span>
                            </Flex.Item>
                        </Flex>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div className="gray-three-color">
                                <span className="size-12 g">{friendlyTime(commentSelected.commentTime)}</span>
                            </div>
                        </div>
                        <List.Item.Brief>
                            <div className="text">
                                <HtmlContent.Component html={commentSelected.commentContent && commentSelected.commentContent.replace(/\n/g, "<br>")} />
                            </div>
                        </List.Item.Brief>
                    </List.Item>
                </List>
            );
        }

        commentFocus() {
            if (!browser.versions.ios) {
                // 非IOS系统
                $("#comment").css({ position: "relative", opacity: "1" });
                $("#autoFocus").focus();
            } else {
                const handler = window["webkit"] && webkit && webkit.messageHandlers["bridgeMessage"];

                if (handler) {
                    // 是在iOS壳子里
                    window["setHeightComment"] = (height) => {
                        $(".comment-reply").css({ top: "auto", bottom: height + "px", position: "absolute", opacity: "1" });
                    };
                    return;
                }
            }
        }

        commentBlur() {
            setScrollViewZoomClose();
            setTimeout(() => {
                $("#commentInputItem").hide();
                $("#commentInputDiv").show();
                window["setHeightComment"] = null;
                $(".comment-reply").attr("style", "");
            }, 100);
        }

        renderModalInput(replyContent: any): React.ReactNode {
            return (
                <Flex className="comment-reply">
                    <Flex.Item>
                        <div className="input-box" id="comment">
                            <div
                                id="commentInputDiv"
                                style={{ fontSize: "15px" }}
                                onClick={() => {
                                    setScrollViewZoomOpen(); // 设置wkwebview的frame到键盘上方
                                    $("#commentInputItem").show();
                                    $("#commentInputDiv").hide();
                                    const handler = window["webkit"] && webkit && webkit.messageHandlers["bridgeMessage"];
                                    if (handler) {
                                        // 是在iOS壳子里
                                        $(".comment-reply").css({ top: "auto", bottom: "1000px", position: "absolute", opacity: "1" });
                                    }
                                    this.dispatch({ type: "input", data: { comment: true } });
                                    this.text.focus();
                                }}
                            >
                                {replyContent ? replyContent : "回复..."}
                            </div>
                            <InputItem
                                maxLength={500}
                                id="commentInputItem"
                                style={{ display: "none", fontSize: "15px" }}
                                ref={(el) => (this.text = el)}
                                placeholder="回复..."
                                onFocus={this.commentFocus.bind(this)}
                                onBlur={this.commentBlur.bind(this)}
                                clear={true}
                                value={replyContent}
                                onChange={(e) => this.dispatch({ type: "changeState", data: { replyContent: e } })}
                            />
                        </div>
                    </Flex.Item>
                    <div className="btn-box">
                        <span
                            onClick={() => {
                                this.replyOnClick(replyContent);
                                setEventWithLabel(statisticsEvent.parkCircleReplyComments);
                            }}
                            className="issue-btn"
                        >
                            发布
                        </span>
                    </div>
                </Flex>
            );
        }

        renderModelHeaderLeft(): React.ReactNode {
            return <Icon onClick={this.commentOnClose.bind(this)} type="left" />;
        }
        renderModelHeaderRight(): React.ReactNode {
            return <Icon onClick={this.commentOnClose.bind(this)} type="cross-circle" />;
        }

        renderModal(): React.ReactNode {
            const { state } = this.props,
                showModal = state!.showModal,
                commentSelected = state!.commentSelected,
                commentReplyList = state!.commentReplyList,
                replyContent = state!.replyContent;
            if (showModal) {
                clearTimeout(this.time);
                this.time = setTimeout(() => {
                    $(".am-modal")
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
            return (
                <Modal popup visible={showModal} maskClosable={true} animationType="slide-up" className="comment-modal">
                    <div className="comment-modal-bd">
                        {client.showheader ? (
                            <NavBar leftContent={this.renderModelHeaderLeft() as any} className="park-nav">
                                评论详情
                            </NavBar>
                        ) : (
                            <NavBar rightContent={this.renderModelHeaderRight() as any} className="park-nav">
                                评论详情
                            </NavBar>
                        )}
                        <div className="comment-modal-details">
                            {this.renderModalTitle(commentSelected, commentReplyList)}
                            <WhiteSpace className="whitespace-gray-bg" />
                            {this.renderCommentReplyList()}
                        </div>
                        {this.renderModalInput(replyContent)}
                    </div>
                </Modal>
            );
        }

        render(): React.ReactNode {

            return (
                <>
                    {this.getListView()}
                    {this.renderModal()}
                </>
            );
        }
    }
    export const Page = template(Component, (state) => state[Namespaces.comment]);
}
