import React from "react";

import { List, Switch } from "antd-mobile";

import { template } from "@reco-m/core";
import { ViewComponent, gesture, gusture, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/statistics";
import { Namespaces, SignTypeEnum, accountSafeModel, accountItems, AccountSecurityEnum } from "@reco-m/auth-models";

export namespace AccountSafe {
    export interface IProps<S = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, accountSafeModel.StateType {
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = "账号与安全";
        namespace = Namespaces.accountsafe;

        componentDidMount() {
            this.dispatch({ type: "initPage" });
        }

        componentMount() {
            setEventWithLabel(statisticsEvent.c_app_Myself_AaccountAndSecurity);

            if (+gusture.isGusture === SignTypeEnum.modify) this.dispatch({ type: "input", data: { checked: true } });
        }

        change(value: any) {
            console.log(value)
            this.dispatch({ type: "input", data: { checked: value } });
            if (!value) {
                gusture.isGusture = SignTypeEnum.noiModify;
                gesture(value);
            }
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                checked = state!.checked,
                mobile = state!.Mobile;

            return (
                <List mode='card'>
                    {accountItems.map((item, i) => {
                        if (!client.openThirdLogin && item.itemName === "社交账号") {
                            return null
                        }
                        return (
                            <List.Item
                                key={i}
                                onClick={() => {
                                    this.goTo(item.url);

                                    i === AccountSecurityEnum.social && setEventWithLabel(statisticsEvent.c_app_Myself_Social);
                                }}
                                extra={(i === AccountSecurityEnum.changeMobile && mobile) || (i === AccountSecurityEnum.changePassword && "修改")}
                            >
                                {item.itemName}
                            </List.Item>
                        );
                    })}
                    <List.Item extra={<Switch onChange={(value) => this.change(value)} checked={checked} />}>手势密码</List.Item>
                    {checked && (
                        <List.Item onClick={() => this.goTo(`gestures`)}>
                            手势设置
                        </List.Item>
                    )}
                </List>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.accountsafe]);
}
