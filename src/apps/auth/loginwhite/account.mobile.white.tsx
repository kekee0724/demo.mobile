import React from "react";

import { List, WingBlank, InputItem, Button, Toast, Flex } from "antd-mobile-v2";

import { template, Validators, browser } from "@reco-m/core";
import { Countdown, jpushRemove, setEventWithLabel } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";
import { Namespaces } from "@reco-m/auth-models";
import { AccountChangeMobile } from "@reco-m/auth-account";
export namespace AccountChangeMobileWhite {
    export interface IProps extends AccountChangeMobile.IProps {}

    export interface IState extends AccountChangeMobile.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends AccountChangeMobile.Component<P, S> {
        showloading = false;
        headerContent = "换绑手机";
        namespace = Namespaces.accountMobile;

        componentDidMount() {
            this.dispatch({ type: "getAccountMobile" });
        }

        validator(codeFlag?: any) {
            const { cellphone, required, maxLength, minLength, composeControl, ValidatorControl } = Validators,
                { state } = this.props;

            return ValidatorControl(
                composeControl([required], { value: state!.password, name: "登录密码" }),
                composeControl([required, cellphone], { value: state!.contactMobile, name: "手机号码" }),
                codeFlag && composeControl([required, maxLength(4), minLength(4)], { value: state!.code, name: "验证码" })
            );
        }

        /**
         * 发送验证码
         */
        sendVerifyCode(delay: Function) {
            const { state } = this.props;
            const msg = this.validator()!();
            if (msg) {
                Toast.fail(msg.join(), 1);
                return;
            }
            this.dispatch({
                type: "sendBindCode",
                param: { mobile: state!.contactMobile, password: state!.password },
                delay,
            });
        }

        // 确认修改手机号
        sureChangeMobile() {
            const { state } = this.props,
                msg = this.validator(true)!();

            if (msg) {
                Toast.fail(msg.join(), 1);
                return;
            }

            this.dispatch({
                type: "bindMobile",
                param: { mobile: state!.contactMobile, code: state!.code },
                callback: () => {
                    Toast.success("手机换绑成功,请重新登录", 1, () => {
                        history.go(-3);
                        setTimeout(() => {
                            this.logout();
                        }, 1000);
                    });
                    setEventWithLabel(statisticsEvent.changeMobilePhone);
                },
            });
        }

        logout() {
            /**
             * 删除原生极光设置
             */
            jpushRemove();
            this.dispatch({ type: "logout" });
        }

        changePwd() {
            let { state } = this.props,
                passwordType = state!.passwordType,
                isShow = state!.isShow;

            passwordType === "password"
                ? this.dispatch({ type: "input", data: { passwordType: "text", isShow: !isShow } })
                : this.dispatch({ type: "input", data: { passwordType: "password", isShow: !isShow } });
        }

        renderContent(): React.ReactNode {
            const { state } = this.props as any;

            return (
                <List
                    className="login-list"
                    renderHeader={
                        <Flex>
                            <Flex.Item className="size-20 text-center">
                                <span className="size-14 gray-three-color">已绑定手机号：</span>
                                {state.mobile}
                            </Flex.Item>
                        </Flex>
                    }
                >
                    <InputItem
                        type={state.passwordType}
                        ref="pwd"
                        labelNumber={5}
                        extra={<i className={state.isShow ? "icon icon-yanjing" : "icon icon-yanjing1"} onClick={() => this.changePwd()} />}
                        placeholder="请输入密码"
                        onChange={(e) => this.dispatch({ type: "input", data: { password: e } })}
                    >
                        {/* 登录密码 */}
                    </InputItem>
                    <InputItem
                        type={browser.versions.android ? "digit" : "number"}
                        labelNumber={5}
                        maxLength={11}
                        value={state.contactMobile || ""}
                        onChange={(e) => this.dispatch({ type: "input", data: { contactMobile: e } })}
                        extra={<Countdown.Component start={this.sendVerifyCode.bind(this)} content="获取验证码" type="accountchangemobile" />}
                        placeholder="请输入手机号"
                    >
                        {/* 手机号 */}
                    </InputItem>
                    <InputItem
                        labelNumber={5}
                        type={browser.versions.android ? "digit" : "number"}
                        maxLength={4}
                        onChange={(e) => this.dispatch({ type: "input", data: { code: e } })}
                        placeholder="请输入短信验证码"
                    >
                        {/* 验证码 */}
                    </InputItem>
                </List>
            );
        }

        renderBody(): React.ReactNode {
            return (
                <WingBlank>{this.renderContent()}</WingBlank>
            );
        }
        renderFooter(): React.ReactNode {
            return (
                <Flex className="flex-collapse">
                    <Flex.Item>
                        <Button className="mt15" type="primary" onClick={() => this.sureChangeMobile()}>
                            确定
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }
    }

    export const Page = template(
        Component,
        (state) => state.accountMobile
    );
}
