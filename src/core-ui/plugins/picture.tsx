import React from "react";

import { BasePicture } from "@reco-m/core";

import { Toast } from "antd-mobile";

import { getPictureDefaultProps } from "./util";
import { PictureUploadWrap } from "./picture-upload.wrap";

export namespace Picture {
    export interface IProps extends BasePicture.IProps {
        customUpload?: boolean;
    }

    export interface IState extends BasePicture.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends BasePicture.Component<P, S> {
        static defaultProps = getPictureDefaultProps();

        protected onShowErrorMessage(msg: string): void {
            Toast.show({ icon: "fail", content: msg });
        }

        render(): React.ReactNode {
            return <PictureUploadWrap.Component {...(this.props as any)} />;
        }
    }
}
