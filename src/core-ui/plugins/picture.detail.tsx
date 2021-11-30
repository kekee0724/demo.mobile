import React from "react";

import { BasePictureDetail } from "@reco-m/core";

import { getPictureDefaultProps } from "./util";
import { PictureUploadWrap } from "./picture-upload.wrap";

export namespace PictureDetail {
    export interface IProps extends BasePictureDetail.IProps {}

    export interface IState extends BasePictureDetail.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends BasePictureDetail.Component<P, S> {
        static defaultProps = getPictureDefaultProps();

        render(): React.ReactNode {
            return <PictureUploadWrap.Component {...this.props} readonly />;
        }
    }
}
