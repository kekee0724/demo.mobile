import React from "react";

import { List, Toast, InputItem, Picker, Button, WingBlank } from "antd-mobile-v2";

import { template, Validators, browser } from "@reco-m/core";
import { ViewComponent } from "@reco-m/core-ui";
import { Namespaces } from "@reco-m/auth-models";

import { tel } from "./common";

export namespace Phone {
    export interface IProps extends ViewComponent.IProps { }

    export interface IState extends ViewComponent.IState {
        viewRef?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        isRoot = true;
        showloading = false;
        namespace = Namespaces.pwd;
        componentMount() {
            this.dispatch({ type: "input", data: { areacode: "+86" } });
        }
        componentWillUnmount() {
            this.dispatch({ type: "clear" });
        }
        renderHeader(): React.ReactNode {
            return (
                <div className="header-bodernone">{super.renderHeader()}</div>
            );
        }
        goNextStep() {
            const { cellphone, required, composeControl } = Validators,
                { state } = this.props as any,
                msg = composeControl([required, cellphone], { value: state!.phonenumber, name: "手机号码" })!();

            if (msg) {
                Toast.fail(msg!.msg.join(), 1);
                return;
            }

            this.jump(`changePassword/unAuth?phonenumber=${state!.phonenumber}`);
        }
        renderBody(): React.ReactNode {
            const { state } = this.props,
                areacode = state!.areacode;
            return (
                <WingBlank>
                        <div className="login-title">输入手机号码</div>
                        <List className="login-list">
                            <InputItem
                                type={browser.versions.android ? "digit" : "number"}
                                clear
                                placeholder="手机号码"
                                labelNumber={4}
                                value={state!.phonenumber || ""}
                                onChange={e => this.dispatch({ type: "input", data: { phonenumber: e } })}
                            >
                                <Picker
                                    disabled={true}
                                    data={tel}
                                    title="选择区号"
                                    cascade={false}
                                    onChange={value => {
                                        this.dispatch({ type: "input", data: { areacode: value![0] } });
                                    }}
                                >
                                    <span className="areacode">{areacode}</span>
                                </Picker>
                            </InputItem>
                        </List>
                        <Button className="mt15" type="primary" onClick={this.goNextStep.bind(this)}>
                            下一步
                        </Button>
                    </WingBlank>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.pwd]);
}
