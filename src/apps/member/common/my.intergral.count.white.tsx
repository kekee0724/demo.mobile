import React from "react";

import { Flex } from "antd-mobile-v2";

import { template, setLocalStorage } from "@reco-m/core";
import { ViewComponent } from "@reco-m/core-ui";
import { intergralModel, Namespaces } from "@reco-m/member-models";

export namespace MyIntergralCountWhite {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

    export interface IState extends ViewComponent.IState, intergralModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.intergral;

        componentDidMount() {
            this.isAuth() && this.dispatch({ type: `getLoyal`, currentIntergralType: 0 });
        }

        render(): React.ReactNode {
            const { state } = this.props as any;
            if (this.isAuth()) {
                return (
                    <div className="integral-tag">
                        <span>
                            <Flex
                                onClick={() => {
                                    this.goTo(`integral`);

                                    setLocalStorage("intergralFirstLauch", "false")
                                }}
                            >
                                {state.userIntergral ? (state.userIntergral) > 99999 ? "99999+" : state.userIntergral : 0} 积分
                            </Flex>
                        </span>
                    </div>
                );
            }
            return null;
        }
    }

    export const Page = template(Component, state => state[Namespaces.intergral]);
}
