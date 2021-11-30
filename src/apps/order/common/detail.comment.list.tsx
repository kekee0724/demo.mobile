import React from "react";

import Rater from "react-rater";

import { List } from "antd-mobile-v2";

import { template, friendlyTime } from "@reco-m/core";

import { ImageAuto, ListComponent, HtmlContent } from "@reco-m/core-ui";

import { detailcommentlistModel, Namespaces } from "@reco-m/order-models";

import {noPassByName, CommentAuditStatusEnum} from "@reco-m/ipark-common"

import { getCommentAuditStatus } from "./common";
export namespace DetailCommentList {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> { }

    export interface IState extends ListComponent.IState, detailcommentlistModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        headerContent = `${this.getSearchParam("title")}评论`;
        namespace = Namespaces.detailcommentlist;

        componentMount() {
            const id = this.getSearchParam("detailId");
            this.dispatch({ type: `initPage`, data: { id } });
        }

        getDate(pageIndex: number) {
            const id = this.getSearchParam("detailId");

            this.dispatch({ type: "getCommentsDetailAction", params: { bindTableIdList: id, pageIndex: pageIndex, pageSize: 10 } });
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            this.shouldUpdateData(nextProps.state);
        }

        componentWillUnmount(): void {
            this.dispatch({ type: "input", data: { comments: null, pageIndex: 1, hasMore: false } });
        }

        pullToRefresh() {
            this.getDate(1);
        }

        onEndReached() {
            let { state } = this.props;
            this.getDate((state!.currentPage || 0) + 1);
        }

        renderItemsContent(comment, i): React.ReactNode {
            return (
                <List.Item key={i} thumb={<ImageAuto.Component cutWidth="50" cutHeight="50" src={comment.avatarPicUrl ? comment.avatarPicUrl : "assets/images/myBackgroundview1.png"} width="50px" height="50px" />}>
                    <div className="showRater">
                        <div style={{ width: "100%" }}>
                            {comment.isAnonymous ? noPassByName(comment.inputer) : comment.inputer}
                            <div style={{ float: "right" }}>
                                <Rater total={5} interactive={false} rating={comment.score} />
                            </div>
                        </div>
                        <List.Item.Brief>
                            <HtmlContent.Component className="size-16 gray-two-color" html={comment.rateContent} />
                            <div style={{ marginTop: "10px" }}>{comment.inputTime && friendlyTime(comment.inputTime)}
                            {comment.auditStatus !== CommentAuditStatusEnum.pass && (
                                        <span className={`margin-left-xs size-12 color-${getCommentAuditStatus(comment.auditStatus, "class")}`}>
                                            {getCommentAuditStatus(comment.auditStatus)}
                                        </span>
                                    )}</div>
                        </List.Item.Brief>
                    </div>
                </List.Item>
            );
        }

        renderBody(): React.ReactNode {
            return <div className="container-fill container-column apply-container">{this.getListView()}</div>;
        }
    }

    export const Page = template(Component, state => state[Namespaces.detailcommentlist]);
}
