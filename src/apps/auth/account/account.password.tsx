import React from "react";

import { Input, Button, Toast, Form } from "antd-mobile";

import { template, Validators, PASSWORD_REGEXP } from "@reco-m/core";
import { ViewComponent, Container, Countdown, setEventWithLabel, ToastInfo } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/statistics";
import { Namespaces, pwdModel, PasswordChangeTypeEnum } from "@reco-m/auth-models";

export namespace AccountChangePassword {
    export interface IProps<S = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, pwdModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = this.props.match!.params.type === PasswordChangeTypeEnum.auth ? "修改密码" : "找回密码";

        namespace = Namespaces.pwd;

        componentDidMount() {
            this.isAuth() &&
                this.dispatch({
                    type: "initPage",
                });
        }

        componentWillUnmount(): void {
            this.dispatch("input", { code: "", password: "" });
        }

        renderContent(): React.ReactNode {
            const { state } = this.props!;

            return (
                <Form layout="vertical">
                    <Form.Item label="手机号码">
                        <Input disabled value={state!.phonenumber || this.getSearchParam("phonenumber") || state!.Mobile} placeholder="未绑定手机号" />
                    </Form.Item>
                    <Form.Item label="验证码" extra={<Countdown.Component start={this.sendVerifyCode.bind(this)} content="获取验证码" type="changepass" />}>
                        <Input
                            placeholder="请输入短信验证码"
                            value={state!.code}
                            maxLength={4}
                            onChange={(e) =>
                                this.dispatch("input", {
                                    code: e,
                                    phonenumber: state!.phonenumber || this.getSearchParam("phonenumber") || state!.Mobile,
                                })
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        label="新密码"
                        extra={<i className={state!.isPwd ? "icon icon-yanjing" : "icon icon-yanjing1"} onClick={() => this.dispatch("input", { isPwd: !state!.isPwd })} />}
                    >
                        <Input
                            type={state!.isPwd ? "password" : "text"}
                            value={state!.password}
                            placeholder="请输入新的密码"
                            onChange={(e) => this.dispatch("input", { password: e })}
                        />
                    </Form.Item>
                </Form>
            );
        }

        renderBody(): React.ReactNode {
            return (
                <Container.Component direction="column">
                    <Container.Component scrollable>
                        {this.renderContent()}
                        <div className="reco-hint">提示：密码长度8-32位，数字、字母(区分大小写)和符号即可</div>
                        <div className="list-definition">
                            <Button block color="primary" onClick={this.submit.bind(this)}>
                                确认提交
                            </Button>
                        </div>
                    </Container.Component>
                </Container.Component>
            );
        }

        sendVerifyCode(delay: any) {
            const msg = this.phoneNumberValidator()!(),
                { state } = this.props;
            if (msg) {
                ToastInfo(msg.msg.join());
                return;
            }

            this.dispatch({
                type: "sendResetCode",
                data: state!.phonenumber,
                delay,
            });
        }

        phoneNumberValidator() {
            const { cellphone, required, composeControl } = Validators,
                { state } = this.props;

            return composeControl([required, cellphone], { value: state!.phonenumber, name: "手机号码" });
        }

        validator() {
            const { required, composeControl, ValidatorControl, requiredTrue } = Validators,
                { state } = this.props;
            return ValidatorControl(
                this.phoneNumberValidator(),
                composeControl([required], { value: state!.code, name: "验证码" }),
                composeControl([required], { value: state!.password, name: "密码" }),
                composeControl([requiredTrue], {
                    value: PASSWORD_REGEXP.test(state!.password) ? true : false,
                    name: "",
                    errors: {
                        required: "密码长度8-32位,必须包含数字、字母或符号",
                    },
                })
            );
        }
        loginOut() {
            this.dispatch({ type: "logout" });
        }
        submit() {
            const msg = this.validator()!();

            if (msg) {
                ToastInfo(msg.join());
                return;
            }

            this.dispatch({
                type: "submit",
                callback: () => {
                    if (this.props.match!.params.type === PasswordChangeTypeEnum.auth) {
                        Toast.show({
                            icon: "success",
                            content: "密码已修改，请重新登录",
                            afterClose: this.loginOut.bind(this),
                        });
                    } else {
                        Toast.show({
                            icon: "success",
                            content: "密码重置成功！",
                            afterClose: this.goBack.bind(this),
                        });
                    }

                    setEventWithLabel(statisticsEvent.c_app_Myself_forgotPassword);
                },
            });
        }
    }

    export const Page = template(Component, (state) => state.pwd);
}
