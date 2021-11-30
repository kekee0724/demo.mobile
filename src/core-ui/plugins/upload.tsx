import React from "react";

import { List } from "antd-mobile";

import { BaseAttachUpload } from "@reco-m/core";

export namespace AttachUpload {
    export interface IProps extends BaseAttachUpload.IProps {}

    export interface IState extends BaseAttachUpload.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends BaseAttachUpload.Component<P, S> {
        renderBody(): React.ReactNode {
            const { content } = this.props as any;

            return <List.Item>{content}</List.Item>;
        }
    }
}
