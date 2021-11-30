import React from "react";

import { Input, List } from "antd-mobile";

import { Validators, template } from "@reco-m/core";
import { ViewComponent,ToastInfo } from "@reco-m/core-ui";

import { Namespaces, pwdModel } from "@reco-m/auth-models";

export namespace RepasswordBefore {
    export interface IProps<S = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, pwdModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        headerContent = "找回密码";
        showloading = false;
        namespace = Namespaces.pwd;

        componentDidMount() {
            this.dispatch({ type: "input", data: { phonenumber: null } });
        }

        goNextStep() {
            const { cellphone, required, composeControl } = Validators,
                { state } = this.props as any,
                msg = composeControl([required, cellphone], { value: state!.phonenumber, name: "手机号码" })!();

            if (msg) {
                ToastInfo(msg!.msg.join(), 1);
                return;
            }

            this.jump(`changePassword/unAuth?phonenumber=${state!.phonenumber}`);
        }

        renderHeaderRight(): React.ReactNode {
            return <div onClick={this.goNextStep.bind(this)}>下一步</div>;
        }

        renderBody(): React.ReactNode {
            const { state } = this.props as any;

            return (
                <>
                    <div>*填写注册时的手机号</div>
                    <List>
                        <Input
                            placeholder="请输入手机号"
                            type="number"
                            value={state!.phonenumber || ""}
                            onChange={(e) => this.dispatch({ type: "input", data: { phonenumber: e } })}
                        />
                    </List>
                </>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.pwd]);
}
