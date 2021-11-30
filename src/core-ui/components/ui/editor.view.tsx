import React from "react";

import {PureComponent} from "@reco-m/core";

export namespace EditorView {
    export interface IProps extends PureComponent.IProps {
        padding?: boolean,
        className?: string,
    }

    export interface IState extends PureComponent.IState {

    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static defaultProps: any = {
            padding: true,
            className: ""
        };
        render() {
            return <div className={`reco-edit-view ck-content ${this.props.padding && "padding"} ${this.props.className}`}>
                {this.props.children}
            </div>;
        }
    }
}
