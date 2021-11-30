import React from "react";

import { Toast, Button, TextareaItem, List, WhiteSpace } from "antd-mobile-v2";

import { template, isAnonymous, getLocalStorage } from "@reco-m/core";

import { ViewComponent } from "@reco-m/core-ui";
import { ServiceSourceEnum, ServiceSourceTextEnum} from "@reco-m/ipark-common"
import { Namespaces, commentInputModel } from "@reco-m/comment-models";
export namespace CommentInput {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        bindTableName: any;
        bindTableId: any;
        title: any;
        commentSuccess?: any;
    }
    export interface IState extends ViewComponent.IState, commentInputModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.commentInput;

        dispatchAction(data: any) {
            this.dispatch({ type: "changeCommentState", data: data });
        }

        commentSuccess(e) {
            Toast.success(e, 1);

            this.dispatch({ type: "comment/changeState", data: { commentSuccess: true } }); // 评论成功，更新评论列表
        }

        commentFail(msg: string) {
            Toast.fail(msg, 1);
            this.dispatchAction({ msg: "" });
        }

        componentWillUnmount() {
            this.dispatch({ type: "changeCommentState", data: { commentContent: "" } });
        }

        formatCommentContent(commentContent: any) {
            commentContent = commentContent.replace(/\n/g, "<br>");
            !commentContent || commentContent === "" || commentContent === " " || commentContent === "<br/>"
                ? Toast.info("填写的内容不能为空", 1)
                : this.submitComment(commentContent);

            this.dispatchAction({ commentContent: "" });
        }

        submitComment(commentContent: any) {
            const { bindTableName, bindTableId, title } = this.props,
                data = {
                    bindTableName: bindTableName,
                    bindTableId: bindTableId,
                    bindTableValue: title,
                    replyId: 0,
                    source: ServiceSourceTextEnum.app,
                    sourceValue: ServiceSourceEnum.app,
                    commentContent: commentContent,
                    parkId: getLocalStorage("parkId"),
                };
            this.dispatch({
                type: "submitCommentContent",
                data: data,
                commentSuccess: (e) => {
                    this.props.commentSuccess!();
                    this.commentSuccess(e);
                },
                commentFail: (e) => this.commentFail(e),
            });
        }

        beforeSubmitComment(commentContent: any) {
            this.dispatchAction({ submitLoading: true });

            isAnonymous() ? this.goTo("login") : commentContent === null || commentContent === "" ? Toast.info("请填写评论", 1) : this.formatCommentContent(commentContent);

            this.dispatchAction({ submitLoading: false });
        }

        render(): React.ReactNode {
            const { state } = this.props,
                commentContent = state!.commentContent,
                submitLoading = state!.submitLoading;

            return (
                <div className="commenting">
                    <List className="border-none" renderHeader="评论">
                        <TextareaItem
                            maxLength={500}
                            style={{ border: "1px solid #f2f2f2" }}
                            rows={5}
                            placeholder="请说出您的想法"
                            count={300}
                            value={commentContent}
                            onChange={(e) => this.dispatchAction({ commentContent: e })}
                        />
                        <div className="commenting-btns">
                            <Button type="primary"  loading={submitLoading} onClick={() => this.beforeSubmitComment(commentContent)}>
                                <div>发表评论</div>
                            </Button>
                        </div>
                    </List>
                    <WhiteSpace></WhiteSpace>
                </div>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.commentInput]);
}
