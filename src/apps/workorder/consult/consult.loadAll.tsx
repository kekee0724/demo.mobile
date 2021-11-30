import React from "react";

import { List, WhiteSpace, Accordion } from "antd-mobile-v2";

import { template } from "@reco-m/core";

import { ViewComponent, HtmlContent } from "@reco-m/core-ui";

import { consultModel, Namespaces } from "@reco-m/workorder-models";

export namespace ConsultLoadAll {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        num: number;
        data: any;
    }

    export interface IState extends ViewComponent.IState, consultModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.consult;

        getHtmlContent(html: string) {
            return html.replace(/href=\"\/\//g, 'href="http://').replace(/src=\"\/\//g, 'src=" http://');
        }

        render(): React.ReactNode {
            const { data, num } = this.props,
                detail = data.answer || ""
            const { state } = this.props,
                activeKey = state!.activeKey;

            return (
                <>
                    <WhiteSpace className="back" />
                    <Accordion style={{ transform: "translateZ(0)" }} activeKey={+num === +activeKey ? "0" : "2"} className="my-accordion" key={num} onChange={() => {
                        this.dispatch({
                            type: "input",
                            data: { activeKey: +num === +activeKey ? "-1" : num, random: Math.random() }
                        })
                    }}>
                        <Accordion.Panel header={<div className="no-omit">{"Q. " + data.question}</div>}>
                            <List.Item className="policyItem">
                                <List.Item.Brief style={{ marginTop: "0" }}>
                                    <div style={{ display: "flex" }}>
                                        <span style={{ marginTop: "23px", marginRight: "5px", lineHeight: 2 }}>A.</span>

                                        <HtmlContent.Component
                                            className={!data.checked || data.checked === false ? "down html-details" : "downColor html-details"}
                                            html={this.getHtmlContent(detail)}
                                        />
                                    </div>

                                </List.Item.Brief>
                            </List.Item>
                        </Accordion.Panel>
                    </Accordion>
                </>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.consult]);
}
