import React from "react";

import { Empty } from "antd-mobile";

import { PureComponent } from "@reco-m/core";

import {Container} from "./container"

export namespace NoData {
    export interface IProps extends PureComponent.IProps {
        title?: any;
        text?: any;
    }

    export interface IState extends PureComponent.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static defaultProps: any = {
            text: "暂无数据",
        };

        render(): React.ReactNode {
            const {  text } = this.props;
            return <Container.Component range="center">
            <Empty description={<div>{text}</div>} />
          </Container.Component>
        }
    }
}
