import React from "react";

import { Toast, Input, Button, List } from "antd-mobile";

import { template, Validators, PASSWORD_REGEXP, setLocalStorage } from "@reco-m/core";
import { ViewComponent, setEventWithLabel, ToastInfo, NavBar, FooterButton } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/statistics";

import { Namespaces, PasswordTypeEnum, changePasswordModel, PasswordChangeInputEnum } from "@reco-m/auth-models";

export namespace ChangePassword {
    export interface IProps<S = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, changePasswordModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.changepassword;

        componentDidMount() {
            this.dispatch({
                type: "input",
                data: { passwordType1: PasswordTypeEnum.password, passwordType2: PasswordTypeEnum.password },
            });
        }

        componentMount() {
            let phone = this.props.match!.params.phone;
            if (phone === undefined || phone === "undefined") {
                phone = "";
            }
            this.dispatch({ type: "input", data: { loginName: phone } });
        }

        // 验证
        check() {
            const { state } = this.props,
                loginName = state!.loginName,
                code = state!.code,
                password = state!.password,
                { required, composeControl, requiredTrue, ValidatorControl } = Validators;
            return ValidatorControl(
                composeControl([required], { value: loginName, name: "旧密码" }),
                composeControl([required], { value: code, name: "新密码" }),
                composeControl([required], { value: password, name: "确认密码" }),
                composeControl([requiredTrue], {
                    value: PASSWORD_REGEXP.test(code) ? true : false,
                    name: "",
                    errors: {
                        required: "密码长度8-32位,必须包含数字、字母或符号",
                    },
                }),
                composeControl([requiredTrue], {
                    value: code === password ? true : false,
                    name: "",
                    errors: {
                        required: "两次输入的密码不一致！",
                    },
                })
            );
        }

        sureChangePassword() {
            const { state } = this.props,
                loginName = state!.loginName,
                code = state!.code,
                password = state!.password;
            const msg = this.check()!();
            if (msg) {
                ToastInfo(msg.join(), 1);
                return;
            }
            this.dispatch({
                type: "resetPasswordAction",
                data: { oldPassword: loginName, newPassword: code, reNewPassword: password },
                callback: () => {
                    Toast.show({
                        icon: "success",
                        content: "密码修改成功,请重新登录!",
                        afterClose: this.dispatch({ type: "logout" }),
                    });
                    setEventWithLabel(statisticsEvent.c_app_Myself_forgotPassword);
                    this.dispatch({ type: "input", data: { resetPassword: null } });
                },
            });
        }

        changePwd(type) {
            const { state } = this.props,
                passwordType1 = state!.passwordType1,
                isShow1 = state!.isShow1,
                passwordType2 = state!.passwordType2,
                isShow2 = state!.isShow2;

            if (type === PasswordChangeInputEnum.newPassword) {
                if (passwordType1 === PasswordTypeEnum.password) {
                    this.dispatch({ type: "input", data: { passwordType1: PasswordTypeEnum.text, isShow1: !isShow1 } });
                } else {
                    this.dispatch({ type: "input", data: { passwordType1: PasswordTypeEnum.password, isShow1: !isShow1 } });
                }
            } else {
                if (passwordType2 === PasswordTypeEnum.password) {
                    this.dispatch({ type: "input", data: { passwordType2: PasswordTypeEnum.text, isShow2: !isShow2 } });
                } else {
                    this.dispatch({ type: "input", data: { passwordType2: PasswordTypeEnum.password, isShow2: !isShow2 } });
                }
            }
        }

        renderHeader(): React.ReactNode {
            let { type } = this.props.match!.params;
            let back = !(type && type === "1"); // 1：是否是登录之后密码太过简单进入

            return (
                <NavBar.Component backArrow={back} onBack={this.goBack.bind(this)} left={this.renderHeaderLeft() as any} right={this.renderHeaderRight() as any}>
                    修改密码
                </NavBar.Component>
            );
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                passwordType1 = state!.passwordType1,
                passwordType2 = state!.passwordType2,
                isShow1 = state!.isShow1,
                isShow2 = state!.isShow2;

            return (
                <>
                    <List mode="card">
                        <List.Item>
                            <Input type={PasswordTypeEnum.password} placeholder="请输入旧密码" onChange={(e) => this.dispatch({ type: "input", data: { loginName: e } })} />
                        </List.Item>
                        <List.Item
                            extra={
                                <i
                                    className={isShow1 && isShow1 ? "icon icon-yanjing1" : "icon icon-yanjing"}
                                    onClick={() => this.changePwd(PasswordChangeInputEnum.newPassword)}
                                />
                            }
                        >
                            <Input type={passwordType1} placeholder="请输入新密码" onChange={(e) => this.dispatch({ type: "input", data: { code: e } })} />
                        </List.Item>
                        <List.Item
                            extra={
                                <i className={isShow2 && isShow2 ? "icon icon-yanjing1" : "icon icon-yanjing"} onClick={() => this.changePwd(PasswordChangeInputEnum.confirm)} />
                            }
                        >
                            <Input type={passwordType2} placeholder="请输入确认密码" onChange={(e) => this.dispatch({ type: "input", data: { password: e } })} />
                        </List.Item>
                    </List>
                    <div className="reco-hint">提示：密码长度8-32位，数字、字母(区分大小写)和符号即可</div>
                </>
            );
        }

        renderFooter(): React.ReactNode {
            return (
                <FooterButton.Component>
                    <FooterButton.Item>
                        <Button
                            block
                            onClick={() => {
                                setLocalStorage("noCheckPassword", "true");
                                history.go(-2);
                            }}
                        >
                            跳过修改
                        </Button>
                    </FooterButton.Item>
                    <FooterButton.Item>
                        <Button color={"primary"} block className="am-button am-button-primary" onClick={() => this.sureChangePassword()}>
                            确认提交
                        </Button>
                    </FooterButton.Item>
                </FooterButton.Component>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.changepassword]);
}
