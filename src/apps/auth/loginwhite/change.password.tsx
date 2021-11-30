import React from "react";

import { Button, Flex } from "antd-mobile-v2";

import { template, setLocalStorage } from "@reco-m/core";

import { Namespaces as userNamespace } from "@reco-m/auth-models";

import { Namespaces, changePasswordModel, userModel } from "@reco-m/auth-models";
import { ChangePassword } from "@reco-m/auth-account";
export namespace ChangePasswordIpark {
    export interface IProps<S = IState> extends ChangePassword.IProps<S> {}

    export interface IState extends ChangePassword.IState, changePasswordModel.StateType {
        changepassword: ChangePassword.IState & changePasswordModel.StateType;
        user: ChangePassword.IState & userModel.StateType;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ChangePassword.Component<P, S> {
        showloading = false;
        namespace = Namespaces.changepassword;

        renderFooter(): React.ReactNode {
            return (
                <Flex className=" flex-collapse row-collapse">
                    <Flex.Item>
                        <Button
                            onClick={() => {
                                setLocalStorage("noCheckPassword", "true");
                                history.go(-2);
                            }}
                        >
                            跳过修改
                        </Button>
                    </Flex.Item>
                    <Flex.Item type="primary">
                        <Button className="am-button am-button-primary" onClick={() => this.sureChangePassword()}>
                            确认提交
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }
    }

    export const Page = template(
        Component,
        (state) => ({
            changepassword: state[Namespaces.changepassword],
            user: state[userNamespace.user],
        }),
        (state) => state.changepassword
    );
}
