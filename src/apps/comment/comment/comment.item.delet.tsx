import React from "react";

import { Popover } from "antd-mobile-v2";

import { template } from "@reco-m/core";

import { ViewComponent } from "@reco-m/core-ui";

import { commentModel, Namespaces } from "@reco-m/comment-models";
const Item = Popover.Item;

export namespace CommentItemDeletList {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        deleteOneComment: any;
        commentData?: any
    }
    export interface IState extends ViewComponent.IState, commentModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {

        namespace = Namespaces.comment;

        render(): React.ReactNode {
            const { state, commentData } = this.props,
                commentListDelet = state![`${commentData!.id}Delet`];
            const props = { overlayClassName: "del-popover" }
            return commentData!.isMyComment ? (
                <Popover
                    {...props}
                    mask
                    visible={commentListDelet}
                    overlay={[<Item key={1}>删除</Item>]}
                    align={{
                        overflow: { adjustY: 0, adjustX: 0 },
                        offset: [-10, 0]
                    } as any}
                    onVisibleChange={visible => {
                        let dataobj = {};
                        dataobj[`${commentData!.id}Delet`] = visible
                        this.dispatch({ type: "input", data: dataobj });
                    }}
                    onSelect={() => {
                        let dataobj = {};
                        dataobj[`${commentData!.id}Delet`] = false;
                        this.dispatch({ type: "input", data: dataobj });
                        this.props.deleteOneComment(commentData);
                    }}
                >
                    <i
                        className="icon icon-more size-16 del-box"
                    />
                </Popover>
            ) : null;
        }
    }
    export const Page = template(Component, state => state[Namespaces.comment]);
}
