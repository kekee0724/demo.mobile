import React from "react";
import { Input, Button, List, Toast } from "antd-mobile";

import { template, Validators } from "@reco-m/core";
import { ViewComponent, Container, Countdown, ToastInfo } from "@reco-m/core-ui";

import { Namespaces, accountBindMobileModel } from "@reco-m/auth-models";

export namespace AccountBindMobile {
    export interface IProps<S = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, accountBindMobileModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = true;
        headerContent = "绑定账号";
        namespace = Namespaces.accountBindMobile;
        type: number;

        componentDidMount() {
            // 清空用户缓存
            this.dispatch({ type: `${Namespaces.user}/cleanCurrentUser` });
            this.type = Number(this.getSearchParam("type"));
            // 检测用户三方账号是否绑定
            this.dispatch({
                type: `checkThirdAccess`,
                thirdcode: this.getSearchParam("thirdcode"),
                thirdType: this.type,
            });
        }

        loginNameValidator() {
            const { cellphone, required, composeControl } = Validators,
                { state } = this.props;

            return composeControl([required, cellphone], { value: state!.phoneNumber, name: "手机号码" });
        }

        sendVerifyCode(delay: Function) {
            const msg = this.loginNameValidator()!();

            if (msg) {
                ToastInfo(msg.msg.join());
                return;
            }
            const { state } = this.props;
            this.dispatch({
                type: "accountBMsendVerifyCode",
                data: { username: state!.phoneNumber },
                delay,
            });
        }

        validator() {
            const { required, maxLength, minLength, composeControl, ValidatorControl } = Validators,
                { state } = this.props;

            return ValidatorControl(
                this.loginNameValidator(),
                composeControl([required, maxLength(4), minLength(4)], {
                    value: state!.smsCode,
                    name: "验证码",
                })
            );
        }

        smsLoginAndBindThird() {
            const msg = this.validator()!();
            if (msg) {
                ToastInfo(msg.join());
                return;
            }
            this.dispatch({
                type: "smsLoginAndBindThird",
                success: (e) =>
                    Toast.show({
                        icon: "success",
                        content: e,
                    }),
                thirdType: this.type,
            });
        }

        renderBody(): React.ReactNode {
            return (
                <Container.Component direction="column">
                    <Container.Component scrollable>
                        <List>
                            <p className="size-18">绑定手机</p>
                            <p className="black">为了您的账户安全请及时绑定手机</p>

                            <List.Item prefix='手机号' extra={<Countdown.Component start={this.sendVerifyCode.bind(this)} content="获取验证码" type="accountbind" />}>
                                <Input
                                    type="number"
                                    maxLength={11}
                                    placeholder="请输入手机号"
                                    onChange={(e) => {
                                        this.dispatch({ type: "input", data: { phoneNumber: e } });
                                    }}
                                />
                            </List.Item>
                            <List.Item prefix='短信验证码'>
                                <Input type="number"
                                       maxLength={4} placeholder='请输入验证码' clearable onChange={(e) => {
                                    this.dispatch({ type: "input", data: { smsCode: e } });
                                }}/>
                            </List.Item>
                        </List>
                        <Button color="primary" onClick={this.smsLoginAndBindThird.bind(this)}>
                            绑定
                        </Button>
                    </Container.Component>
                </Container.Component>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.accountBindMobile]);
}
