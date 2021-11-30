import React from "react";

import { Radio } from "antd-mobile-v2";

import { template } from "@reco-m/core";
import { ViewComponent } from "@reco-m/core-ui";
import { Namespaces, selectCircleModel } from "@reco-m/ipark-white-circle-models";
export namespace SelectCircleItem {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        key: any;
        onClick: any;
        customer: any;
        item?: any;
    }

    export interface IState extends ViewComponent.IState, selectCircleModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.selectCircle;

        render(): React.ReactNode {
            const { state } = this.props;
            return <Radio.RadioItem
                key={this.props.key}
                checked={state!.item && state!.item!.id === this.props.customer.id}
                onClick={() => {
                    this.props.onClick();
                }}
            >
                {this.props.customer && this.props.customer.topicName}
            </Radio.RadioItem>;
        }
    }

    export const Page = template(Component, state => state[Namespaces.selectCircle]);
}
