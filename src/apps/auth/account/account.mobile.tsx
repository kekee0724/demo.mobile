import React from "react";

import { Input, Button, Toast, Form } from "antd-mobile";

import { EyeOutline, EyeInvisibleOutline } from "antd-mobile-icons";

import { template, Validators } from "@reco-m/core";
import { ViewComponent, Countdown, jpushRemove, ToastInfo } from "@reco-m/core-ui";

import { Namespaces, accountMobileModel, PasswordTypeEnum } from "@reco-m/auth-models";

export namespace AccountChangeMobile {
    export interface IProps<S = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, accountMobileModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
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
                ToastInfo(msg.join());
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
                ToastInfo(msg.join());
                return;
            }

            this.dispatch({
                type: "bindMobile",
                param: { mobile: state!.contactMobile, code: state!.code },
                callback: () => {
                    Toast.show({
                        icon: "success",
                        content: "手机换绑成功,请重新登录",
                        afterClose: this.logout.bind(this),
                    });
                },
            });
        }

        logout() {
            jpushRemove();
            this.dispatch({ type: "logout" });
        }

        changePwd() {
            let { state } = this.props,
                passwordType = state!.passwordType,
                isShow = state!.isShow;

            passwordType === PasswordTypeEnum.password
                ? this.dispatch({ type: "input", data: { passwordType: PasswordTypeEnum.text, isShow: !isShow } })
                : this.dispatch({ type: "input", data: { passwordType: PasswordTypeEnum.password, isShow: !isShow } });
        }

        renderContent(): React.ReactNode {
            const { state } = this.props as any;

            return (
                <Form layout="horizontal">
                    <Form.Item label="已绑定手机号">
                        <Input placeholder="未绑定手机号" value={state.mobile} disabled />
                    </Form.Item>
                    <Form.Item label="国家和地区">
                        <Input defaultValue="中国大陆 +86" placeholder="按国家名称、空格、区号" />
                    </Form.Item>
                    <Form.Item label="登录密码" extra={<span onClick={() => this.changePwd()}>{state.isShow ? <EyeInvisibleOutline /> : <EyeOutline />}</span>}>
                        <Input type={state.passwordType} placeholder="请输入密码" clearable onChange={(e) => this.dispatch({ type: "input", data: { password: e } })} />
                    </Form.Item>
                    <Form.Item label="手机号码">
                        <Input
                            maxLength={11}
                            type="tel"
                            value={state.contactMobile || ""}
                            onChange={(e) => this.dispatch({ type: "input", data: { contactMobile: e } })}
                            placeholder="请输入手机号"
                        />
                    </Form.Item>
                    <Form.Item label="验证码" extra={<Countdown.Component start={this.sendVerifyCode.bind(this)} content="获取验证码" />}>
                        <Input maxLength={4} onChange={(e) => this.dispatch({ type: "input", data: { code: e } })} placeholder="请输入短信验证码" />
                    </Form.Item>
                </Form>
            );
        }

        renderBody(): React.ReactNode {
            return (
                <>
                    {this.renderContent()}
                    <div className="reco-hint">绑定手机号是您身份的重要凭证。当账号发生异常时，将会通过该手机号第一时间通知您，请谨慎操作！</div>
                    <div className="list-definition">
                        <Button block color="primary" onClick={() => this.sureChangeMobile()}>
                            确定
                        </Button>
                    </div>
                </>
            );
        }
    }

    export const Page = template(Component, (state) => state.accountMobile);
}
