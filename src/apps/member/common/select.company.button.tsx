import React from "react";

import { Radio } from "antd-mobile-v2";

import { template } from "@reco-m/core";
import { ViewComponent } from "@reco-m/core-ui";
import { Namespaces, selectCompanyModel } from "@reco-m/member-models";

export namespace SelectCompanyButton {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        key: any;
        onClick: any;
        customer: any;
    }

    export interface IState extends ViewComponent.IState, selectCompanyModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.selectCompany;

        render(): React.ReactNode {
            const { state } = this.props;

            return this.props.customer && (
                <Radio.RadioItem
                    key={this.props.key}
                    checked={state!.selectitem && state!.selectitem.customerId === this.props.customer.customerId}
                    onClick={() => {
                        this.dispatch({ type: "input", data: { selectitem: this.props.customer } });
                        this.props.onClick();
                    }}
                >
                    {this.props.customer.customerName}
                </Radio.RadioItem>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.selectCompany]);
}
