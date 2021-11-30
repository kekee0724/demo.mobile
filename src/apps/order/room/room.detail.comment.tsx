import React from "react";

import Rater from "react-rater";

import { List, Button, WingBlank, WhiteSpace } from "antd-mobile-v2";

import { template, friendlyTime } from "@reco-m/core";

import { ImageAuto, ViewComponent, NoData, HtmlContent } from "@reco-m/core-ui";

import { Namespaces, roomdetailcommentModel } from "@reco-m/order-models";

import { getCommentAuditStatus } from "@reco-m/order-common";

import { noPassByName, CommentAuditStatusEnum } from "@reco-m/ipark-common";
export namespace RoomDetailComment {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        id: any;
        title: any;
    }

    export interface IState extends ViewComponent.IState, roomdetailcommentModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.roomdetailcomment;

        componentMount() {
            this.dispatch({ type: `initPage`, data: { id: this.props.id } });
        }

        componentWillUnmount(): void {
            this.dispatch({ type: "input", data: { comments: null, hasMore: false } });
        }

        renderResourceDetailComment() {
            const { state } = this.props;
            const comments = state!.comments;

            if (comments && comments.length > 0) {
                return comments.map((comment: any, i: number) => (
                    <List.Item
                        key={i}
                        thumb={
                            <ImageAuto.Component
                                cutWidth="50"
                                cutHeight="50"
                                src={comment.avatarPicUrl ? comment.avatarPicUrl : "assets/images/myBackgroundview1.png"}
                                width="50px"
                                height="50px"
                            />
                        }
                    >
                        <div className="showRater">
                            <div style={{ width: "100%" }}>
                                {comment.isAnonymous ? noPassByName(comment.inputer) : comment.inputer}
                                <div style={{ float: "right" }}>
                                    <Rater total={5} interactive={false} rating={comment.score} />
                                </div>
                            </div>
                            <List.Item.Brief>
                                <HtmlContent.Component className="size-16 gray-two-color" html={comment.rateContent} />
                                <div style={{ marginTop: "10px" }}>
                                    {comment.inputTime && friendlyTime(comment.inputTime)}
                                    {comment.auditStatus !== CommentAuditStatusEnum.pass && (
                                        <span className={`margin-left-xs size-12 color-${getCommentAuditStatus(comment.auditStatus, "class")}`}>
                                            {getCommentAuditStatus(comment.auditStatus)}
                                        </span>
                                    )}
                                </div>
                            </List.Item.Brief>
                        </div>
                    </List.Item>
                ));
            } else {
                return <NoData.Component />;
            }
        }

        renderLoadMore(): React.ReactNode {
            let { state } = this.props;
            const comments = state!.comments,
                hasMore = state!.hasMore;
            return comments && comments.length >= 1 && hasMore ? (
                <div className="back">
                    <WingBlank>
                        <WhiteSpace />
                        <Button
                            size="small"
                            style={{ marginRight: "4px" }}
                            onClick={() => this.goTo(`roomCommentList?title=${this.props.title && this.props.title}&detailId=${this.props.id}`)}
                        >
                            更多
                        </Button>
                        <WhiteSpace />
                    </WingBlank>
                </div>
            ) : null;
        }

        render(): React.ReactNode {
            return (
                <List renderHeader={() => (<div>用户评价</div>) as any}>
                    {this.renderResourceDetailComment()}
                    {this.renderLoadMore()}
                </List>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.roomdetailcomment]);
}
