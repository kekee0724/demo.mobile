import React from "react";

import { BaseAttach } from "@reco-m/core";

import {ToastInfo} from "../utils/index"

import { getDefaultProps } from "./util";
import { UploadWrap } from "./upload.wrap";

export namespace Attach {
    export interface IProps extends BaseAttach.IProps {
        customUpload?: boolean;
    }

    export interface IState extends BaseAttach.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends BaseAttach.Component<P, S> {
        static defaultProps = getDefaultProps();

        protected onShowErrorMessage(msg: string): void {
            ToastInfo(msg);
        }

        render(): React.ReactNode {
            return <UploadWrap.Component {...this.props} />;
        }
    }
}
