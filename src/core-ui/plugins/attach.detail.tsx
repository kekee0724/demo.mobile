import React from "react";

import { BaseAttachDetail } from "@reco-m/core";

import { getDefaultProps } from "./util";
import { UploadWrap } from "./upload.wrap";

export namespace AttachDetail {
    export interface IProps extends BaseAttachDetail.IProps {}

    export interface IState extends BaseAttachDetail.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends BaseAttachDetail.Component<P, S> {
        static defaultProps = getDefaultProps();

        render(): React.ReactNode {
            return <UploadWrap.Component {...this.props} readonly />;
        }
    }
}
