import React from "react";

import { Radio } from "antd-mobile-v2";

import { template } from "@reco-m/core";
import { ViewComponent } from "@reco-m/core-ui";
import { Namespaces, selectCompanyUserModel } from "@reco-m/member-models";

export namespace SelectCompanyUserButton {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        key: any;
        onClick: any;
        customer: any;
    }

    export interface IState extends ViewComponent.IState, selectCompanyUserModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.selectCompanyUser;

        render(): React.ReactNode {
            const { state } = this.props;
            return this.props.customer && (
                <Radio.RadioItem
                    key={this.props.key}
                    checked={state!.selectitem && state!.selectitem.accountId === this.props.customer.accountId}
                    onClick={() => {
                        this.dispatch({ type: "input", data: { selectitem: this.props.customer } });
                        this.props.onClick();
                    }}
                >
                    {this.props.customer.realName}
                </Radio.RadioItem>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.selectCompanyUser]);
}
