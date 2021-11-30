import React from "react";

import { List, Switch } from "antd-mobile";

import { template } from "@reco-m/core";
import { ViewComponent, gesture, modifyGesture, gusture } from "@reco-m/core-ui";

import { Namespaces, SignTypeEnum, gesturesModel } from "@reco-m/auth-models";

export namespace Gestures {
    export interface IProps<S = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, gesturesModel.StateType {
        checked?: boolean;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = "手势设置";
        namespace = Namespaces.gestures;

        componentDidMount() {
            this.dispatch({ type: "input", data: { checked: +gusture.isGusture === SignTypeEnum.modify ? true : false } });
        }

        change(value) {
            this.dispatch({ type: "input", data: { checked: value } });
            gusture.isGusture = value ? SignTypeEnum.modify : SignTypeEnum.noiModify;
            gesture(value);
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                checked = state!.checked;

            return (
                    <List mode="card">
                        <List.Item extra={<Switch onChange={(value) => this.change(value)} checked={checked} />}>显示手势轨迹</List.Item>
                        {checked && checked && (
                            <List.Item onClick={() => modifyGesture()}>
                                修改手势密码
                            </List.Item>
                        )}
                    </List>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.gestures]);
}
