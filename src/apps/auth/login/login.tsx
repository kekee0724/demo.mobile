import React from "react";
import { router } from "dva";

import { Input, Button, Grid, Checkbox, Toast, List } from "antd-mobile";
import { LockOutline, UserOutline } from "antd-mobile-icons";

import { template, Validators } from "@reco-m/core";
import { ViewComponent, Countdown, loginType, setEventWithLabel, ToastInfo } from "@reco-m/core-ui";

import { LoginTypeEnum, Namespaces, loginModel } from "@reco-m/auth-models";

import { statisticsEvent } from "@reco-m/statistics";

export namespace Login {
    export interface IProps<S = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, loginModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloadingContent = "";
        namespace = Namespaces.login;
        pageClass = "reco-login-box";

        // headerContent = "登录";

        componentMount(): void {
            this.dispatch({ type: "input", data: { password: "", loginName: "" } });
            this.dispatch({ type: "hideLoading" });
        }

        renderSmsLoginView(): React.ReactNode {
            const { state } = this.props;

            return (
                <>
                    <div className="reco-login-title">
                        <i className="reco-login-logo mobile mobile-logo" />
                        手机号快捷登录
                    </div>
                    <div className="reco-login-desc">新用户首次使用手机号快捷登录将自动创建账号</div>
                    <div className="reco-login-item">
                        <List.Item
                            prefix={<i className="mobile mobile-phone size-24" />}
                            extra={<Countdown.Component start={this.sendVerifyCode.bind(this)} content="获取验证码" type="logincode" />}
                        >
                            <Input maxLength={11} placeholder="请输入手机号" value={state!.loginName} onChange={(e) => this.dispatch({ type: "input", data: { loginName: e } })} />
                        </List.Item>
                    </div>
                    <div className="reco-login-item">
                        <List.Item prefix={<i className="mobile mobile-code size-24" />}>
                            <Input maxLength={4} placeholder="请输入短信验证码" value={state!.password} onChange={(e) => this.dispatch({ type: "input", data: { password: e } })} />
                        </List.Item>
                    </div>
                </>
            );
        }

        sendVerifyCode(delay: Function) {
            const msg = this.loginNameValidator()!();

            if (msg) {
                ToastInfo(msg!.msg.join(), 1000);

                return;
            }

            const { state } = this.props;

            this.dispatch({
                type: "sendVerifyCode",
                data: { username: state!.loginName },
                delay,
            });
        }

        renderBasicLoginView(): React.ReactNode {
            const { state } = this.props;

            return (
                <>
                    <div className="reco-login-title">
                        <i className="reco-login-logo mobile mobile-logo" />
                        账号密码登录
                    </div>
                    <div className="reco-login-desc">新用户请选择手机号快捷登录</div>
                    <div className="reco-login-item">
                        <List.Item prefix={<UserOutline fontSize={26} />}>
                            <Input placeholder="请输入用户名、手机号或邮箱" value={state!.loginName} onChange={(e) => this.dispatch({ type: "input", data: { loginName: e } })} />
                        </List.Item>
                    </div>
                    <div className="reco-login-item">
                        <List.Item prefix={<LockOutline fontSize={26} />} extra={<router.Link to={"/login/find"}>找回密码</router.Link>}>
                            <Input type="password" placeholder="请输入密码" value={state!.password} onChange={(e) => this.dispatch({ type: "input", data: { password: e } })} />
                        </List.Item>
                    </div>
                </>
            );
        }

        renderAgreement(checked: boolean): React.ReactNode {
            return (
                <div className="reco-login-check">
                    <Checkbox
                        style={{ fontSize: "var(--default)" }}
                        icon={(checked) =>
                            checked ? (
                                <i className="mobile mobile-check_on" style={{ color: "var(--adm-color-primary)" }} />
                            ) : (
                                <i className="mobile mobile-check" style={{ color: "var(--adm-color-weak)" }} />
                            )
                        }
                        data-seed="logId"
                        checked={checked}
                        onChange={(e) => this.dispatch({ type: "input", data: { checked: e } })}
                    >
                        我已阅读并同意iPark+
                        <a
                            onClick={(e) => {
                                e.preventDefault();
                                this.goTo(`agreement`);
                            }}
                        >
                            《用户协议》
                        </a>
                    </Checkbox>
                </div>
            );
        }

        renderButton(type: any): React.ReactNode {
            const { state } = this.props,
                loading = state!.loading;
            return (
                <>
                    <div className="reco-login-button">
                        <Button block color="primary" onClick={this.login.bind(this)} disabled={loading} loading={loading}>
                            {loading ? "登录中..." : "登录"}
                        </Button>
                    </div>
                    <div className="reco-login-cut">
                        <a
                            onClick={() => {
                                this.dispatch({ type: "swap" });
                                this.dispatch({ type: "input", data: { loading: false } });
                            }}
                        >
                            {type === LoginTypeEnum.pwd ? "免密登录" : "账号密码登录"}
                        </a>
                    </div>
                </>
            );
        }

        renderThirdLoginItem(loginType: any, icon: string): React.ReactNode {
            return (
                <Grid.Item>
                    <span
                        onClick={() => {
                            Toast.show({
                                icon: "loading",
                                content: "正在拉取...",
                            });
                            this.dispatch({
                                type: "thirdLogin",
                                loginType: loginType,
                                isLogin: true,
                            });
                        }}
                    >
                        <i className={`icon ${icon}`} />
                    </span>
                </Grid.Item>
            );
        }

        renderThirdLogin(): React.ReactNode {
            return (
                <div className="openId-box margin-h-sm margin-v-lg">
                    <Grid columns={0}>
                        {this.renderThirdLoginItem(loginType.qq, "icon-QQ")}
                        {this.renderThirdLoginItem(loginType.wechat, "icon-weixin")}
                        {this.renderThirdLoginItem(loginType.weibo, "icon-weibo")}
                    </Grid>
                </div>
            );
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                checked = state!.checked,
                type: LoginTypeEnum = state!.loginType;

            return (
                <>
                    <div className="reco-login">
                        {type === LoginTypeEnum.sms ? this.renderSmsLoginView() : this.renderBasicLoginView()}
                        {this.renderAgreement(checked)}
                        {this.renderButton(type)}
                    </div>
                    {client.openThirdLogin && this.renderThirdLogin()}
                </>
            );
        }

        loginNameValidator() {
            const { cellphone, required, composeControl } = Validators,
                { state } = this.props;

            if (state!.loginType === LoginTypeEnum.pwd) {
                return composeControl([required], { value: state!.loginName, name: "用户名" });
            }

            return composeControl([required, cellphone], { value: state!.loginName, name: "手机号码" });
        }

        validator() {
            const { required, maxLength, minLength, composeControl, ValidatorControl, requiredTrue } = Validators,
                { state } = this.props,
                ispwd = state!.loginType === LoginTypeEnum.pwd;

            return ValidatorControl(
                this.loginNameValidator(),
                composeControl(ispwd ? [required] : [required, maxLength(4), minLength(4)], {
                    value: state!.password,
                    name: ispwd ? "密码" : "验证码",
                }),
                composeControl([requiredTrue], { value: state!.checked, name: "请阅读并同意用户协议" })
            );
        }

        login() {
            const msg = this.validator()!();

            if (msg) {
                ToastInfo(msg!.join(), 1000);
                return;
            }
            this.dispatch({ type: "input", data: { loading: true } });
            this.dispatch({
                type: "submit",
                callback: () => {
                    ToastInfo("登录密码太过简单，请修改密码", 2000, undefined, () => {
                        this.goTo("pchangePassword/1"); // 1：是否是登录之后密码太过简单进入
                    });
                },
            });

            const { state } = this.props,
                ispwd = state!.loginType === LoginTypeEnum.pwd;
            ispwd
                ? setEventWithLabel(statisticsEvent.c_app_Myself_accountPasswordLogin) // 密码登录
                : setEventWithLabel(statisticsEvent.c_app_Myself_verificationCodeLogin); // 验证码登录
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.login]);
}
