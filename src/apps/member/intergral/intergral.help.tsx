import React from "react";

import { Card, Tabs, WingBlank } from "antd-mobile-v2";

import { template } from "@reco-m/core";
import { ViewComponent, HtmlContent, Container } from "@reco-m/core-ui";

import { intergralModel, Namespaces, tabs } from "@reco-m/member-models";

export namespace IntergralHelp {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

    export interface IState extends ViewComponent.IState, intergralModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        headerContent = "帮助说明";
        namespace = Namespaces.intergral;
        showloading = false;

        componentDidMount() {
            this.dispatch({ type: `loyalGetConfig` });
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                intergralConfigure = state!.intergralConfigure;
            return (
                intergralConfigure && (
                    <Container.Component body>
                        <Tabs tabs={tabs()} initialPage={0} tabBarPosition="bottom" renderTab={tab => <span>{tab.title}</span>}>
                            <Card key={1} className="help-card">
                                <WingBlank>
                                    <HtmlContent.Component className="html-details" html={intergralConfigure.integralProfile} />
                                </WingBlank>
                            </Card>
                            <Card key={2} className="help-card">
                                <WingBlank>
                                    <HtmlContent.Component className="html-details" html={intergralConfigure.integralObtain} />
                                </WingBlank>
                            </Card>
                            <Card key={3} className="help-card">
                                <WingBlank>
                                    <HtmlContent.Component className="html-details" html={intergralConfigure.integralUse} />
                                </WingBlank>
                            </Card>
                        </Tabs>
                    </Container.Component>
                )
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.intergral]);
}
