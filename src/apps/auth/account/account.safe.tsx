import React from "react";

import { List } from "antd-mobile-v2";

import { template } from "@reco-m/core";
import { gesture, gusture, setEventWithLabel } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, SignTypeEnum, accountItems } from "@reco-m/auth-models";


import { AccountSafe as oldAccountSafe } from "@reco-m/auth-account";

export namespace AccountSafe {
    export interface IProps extends oldAccountSafe.IProps { }

    export interface IState extends oldAccountSafe.IState {
        checked?: boolean;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends oldAccountSafe.Component<P, S> {
        showloading = false;
        headerContent = "账号与安全";
        namespace = Namespaces.accountsafe;

        componentDidMount() {
            this.dispatch({ type: "user/getCurrentUser" });
            this.dispatch({ type: "getCurrentUser" });
        }

        componentMount() {
            if (+gusture.isGusture === SignTypeEnum.modify) this.dispatch({ type: "input", data: { checked: true } });
        }

        change(value: any) {
            this.dispatch({ type: "input", data: { checked: value } });
            if (!value) {
                gusture.isGusture = SignTypeEnum.noiModify;
                gesture(value);
            }
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                mobile = state!.mobile;

            return (
                <List>
                    {accountItems.map((item, i) => {
                        return (
                            <List.Item
                                key={i}
                                onClick={() => {
                                    this.goTo(item.url);

                                    i === 2 && setEventWithLabel(statisticsEvent.bindSocialAccounts);
                                }}
                                arrow="horizontal"
                                extra={(i === 0 && mobile) || (i === 1 && "修改")}
                            >
                                {item.itemName}
                            </List.Item>
                        );
                    })}
                </List>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.accountsafe]);
}
