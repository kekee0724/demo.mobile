import React from "react";

import { Radio } from "antd-mobile-v2";

import { template } from "@reco-m/core";

import { ViewComponent } from "@reco-m/core-ui";

import { invoiceSelectModel, Namespaces } from "@reco-m/invoice-models";

export namespace InvoiceSelectButton {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        key: any;
        title: any;
        invoice: any;
    }

    export interface IState extends ViewComponent.IState, invoiceSelectModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.invoiceSelect;

        render(): React.ReactNode {
            const { state } = this.props;
            return (
                <Radio.RadioItem
                    key={this.props.key}
                    checked={state!.item && state!.item.id === this.props.invoice.id}
                    onChange={() => {
                        this.dispatch({ type: "input", data: { item: this.props.invoice } });
                    }}
                >
                    {this.props!.title}
                </Radio.RadioItem>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.invoiceSelect]);
}
