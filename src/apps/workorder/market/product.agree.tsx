import React from "react";

import { template } from "@reco-m/core";

import { ViewComponent, HtmlContent } from "@reco-m/core-ui";

import { Namespaces, productAddModel } from "@reco-m/workorder-models";

import { WingBlank } from "antd-mobile-v2";

export namespace ProductAgreement {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

    export interface IState extends ViewComponent.IState, productAddModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        headerContent = "产品发布协议";
        showloading = false;
        namespace = Namespaces.productAdd;

        renderBody(): React.ReactNode {
            const { state } = this.props,
                agreementConfig = state!.agreementConfig;
            return agreementConfig ? (
                <WingBlank>
                    <HtmlContent.Component className="html-details" html={agreementConfig} />
                </WingBlank>
            ) : (
                    null
                );
        }
    }
    export const Page = template(Component, state => state[Namespaces.productAdd]);
}
