import React from "react";

import { Tabs, List, Icon, Toast, InputItem, Picker, Button, WingBlank, Checkbox, Flex } from "antd-mobile-v2";

import { template, browser, Validators } from "@reco-m/core";
import { loginType, ImageAuto, setEventWithLabel, ToastInfo } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, LoginTypeEnum as LoginTypeEnumCore } from "@reco-m/auth-models";
import { iparkloginModel, LoginTypeEnum } from "@reco-m/ipark-auth-models";
import { Login } from "@reco-m/auth-login";
import { synchronousSerial } from "@reco-m/ipark-common";
import { tel } from "./common";

const AgreeItem = Checkbox.AgreeItem;

const tabs1 = [
    { title: "手机", sub: LoginTypeEnum.phone },
    { title: "账号", sub: LoginTypeEnum.account },
];

export namespace LoginWhite {
    export interface IProps extends Login.IProps {}

    export interface IState extends Login.IState, iparkloginModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends Login.Component<P, S> {
        namespace = Namespaces.login;
        showheader = false;
        showloading = false;
        phoneInputRef;
        userNameRef;
        componentMount() {
            this.dispatch({ type: "initPage" });
        }
        componentDidMount() {
            let win_h = $(window).height() as any; // 关键代码
            window.addEventListener("resize", function () {
                if (($(window)!.height() as any) < win_h) {
                    $(".ether-login").hide();
                } else {
                    $(".ether-login").show();
                }
            });
        }
        componentWillUnmount() {
            this.dispatch({ type: "input", data: { loginName: "", password: "", loginType: LoginTypeEnumCore.sms } });
        }
        renderHeader(): React.ReactNode {
            return null;
        }
        renderThirdLoginItem(loginType: any, icon: string): React.ReactNode {
            return (
                <i
                    className={`icon ${icon}`}
                    onClick={() => {
                        Toast.loading("正在拉取...", 3);
                        this.dispatch({
                            type: "thirdLogin",
                            loginType: loginType,
                            isLogin: true,
                        });
                    }}
                ></i>
            );
        }
        renderThirdLogin(): React.ReactNode {
            return (
                <div className="ether-login">
                    {this.renderThirdLoginItem(loginType.wechat, "icon-weixin")}
                    {this.renderThirdLoginItem(loginType.qq, "icon-QQ")}
                    {/* {this.renderThirdLoginItem(loginType.weibo, "icon-weibo")} */}
                    <div>第三方登录</div>
                </div>
            );
        }
        validatorsms() {
            const { ValidatorControl } = Validators;

            return ValidatorControl(this.loginNameValidator(), this.validatorxy());
        }
        validatorxy() {
            const { composeControl, requiredTrue } = Validators,
                { state } = this.props;

            return composeControl([requiredTrue], {
                value: state!.checked,
                name: "",
                errors: {
                    required: "请阅读并同意用户协议",
                },
            });
        }
        validator() {
            const { required, maxLength, minLength, composeControl, ValidatorControl } = Validators,
                { state } = this.props,
                ispwd = state!.loginType === LoginTypeEnumCore.pwd;

            return ValidatorControl(
                this.loginNameValidator(),
                composeControl(ispwd ? [required] : [required, maxLength(4), minLength(4)], {
                    value: state!.password,
                    name: ispwd ? "密码" : "验证码",
                }),
                this.validatorxy()
            );
        }
        login() {
            const msg = this.validator()!();

            if (msg) {
                ToastInfo(msg.join(), 1);
                return;
            }
            this.dispatch({ type: "input", data: { loading: true } });
            this.dispatch({
                type: "submit",
                callback: () => {
                    ToastInfo("登录密码太过简单，请修改密码", 1.5, undefined, () => {
                        this.goTo("pchangePassword/1");
                    });
                },
            });

            const { state } = this.props,
                ispwd = state!.loginType === LoginTypeEnumCore.pwd;
            ispwd
                ? setEventWithLabel(statisticsEvent.accountPasswordLogin) // 密码登录
                : setEventWithLabel(statisticsEvent.verificationCodeLogin); // 验证码登录
        }
        renderSmsButton(): React.ReactNode {
            const { state } = this.props,
                checked = state!.checked;
            return (
                <WingBlank>
                    <Button
                        className="mt15"
                        type="primary"
                        style={{ borderRadius: "42px" }}
                        onClick={() => {
                            const msg = this.validatorsms()!();

                            if (msg) {
                                ToastInfo(msg.join(), 1);
                                return;
                            }
                            this.goTo("code");
                            this.phoneInputRef.focus();
                            setEventWithLabel(statisticsEvent.verificationCodeLogin);
                        }}
                    >
                        下一步
                    </Button>
                    <AgreeItem data-seed="logId" className="login-logid" checked={checked} onChange={(e) => this.dispatch({ type: "input", data: { checked: e.target.checked } })}>
                        我已阅读并同意{" "}
                        <a
                            onClick={(e) => {
                                setEventWithLabel(statisticsEvent.userAgreementView);
                                e.preventDefault();
                                this.goTo("agreement");
                            }}
                        >
                            《用户协议》
                        </a>
                        及
                        <a
                            onClick={(e) => {
                                setEventWithLabel(statisticsEvent.userAgreementView);
                                e.preventDefault();
                                this.goTo("tactics");
                            }}
                        >
                            《隐私政策》
                        </a>
                    </AgreeItem>
                </WingBlank>
            );
        }
        renderPasswordButton(): React.ReactNode {
            const { state } = this.props,
                loading = state!.loading,
                checked = state!.checked;
            return (
                <WingBlank>
                    <Button
                        className="mt15"
                        type="primary"
                        style={{ borderRadius: "42px" }}
                        onClick={() => {
                            this.login.bind(this)();
                            setEventWithLabel(statisticsEvent.accountPasswordLogin);
                        }}
                        loading={loading}
                    >
                        {loading ? "登录中..." : "登录"}
                    </Button>
                    <Flex>
                        <Flex.Item>
                            <AgreeItem
                                data-seed="logId"
                                className="login-logid"
                                checked={checked}
                                onChange={(e) => this.dispatch({ type: "input", data: { checked: e.target.checked } })}
                            >
                                我已阅读并同意{" "}
                                <a
                                    onClick={(e) => {
                                        e.preventDefault();
                                        this.goTo("agreement");
                                    }}
                                >
                                    《用户协议》
                                </a>
                                及
                                <a
                                    onClick={(e) => {
                                        setEventWithLabel(statisticsEvent.userAgreementView);
                                        e.preventDefault();
                                        this.goTo("tactics");
                                    }}
                                >
                                    《隐私政策》
                                </a>
                            </AgreeItem>
                        </Flex.Item>
                        <div
                            className="countdown"
                            onClick={() => {
                                setEventWithLabel(statisticsEvent.forgotPassword);
                                this.goTo("find");
                            }}
                        >
                            忘记密码?{" "}
                        </div>
                    </Flex>
                </WingBlank>
            );
        }
        renderButton(loginType: any): React.ReactNode {
            return loginType === LoginTypeEnumCore.sms ? this.renderSmsButton() : this.renderPasswordButton();
        }
        renderBody(): React.ReactNode {
            const { state } = this.props,
                loginType = state!.loginType,
                areacode = state!.areacode,
                tab = state!.tab;
            return (
                <>
                    <div
                        className="login-back tag-list"
                        onClick={() => {
                            this.goBack();
                        }}
                    >
                        <Icon size="lg" type="left" />
                    </div>
                    <div className="login-logo">
                        <ImageAuto.Component cutWidth="158" cutHeight="48" width="158px" height="48px" src="assets/images/login-logo.png" />
                    </div>
                    <div className="login-tabs">
                        <Tabs
                            swipeable={false}
                            tabs={tabs1}
                            animated={false}
                            onChange={(item) => {
                                if (+item.sub === LoginTypeEnum.phone) {
                                    this.dispatch({ type: "input", data: { loginType: +item.sub - 1, loginName: null, tab: LoginTypeEnum.phone } });
                                    synchronousSerial(() => this.phoneInputRef.focus());
                                } else {
                                    this.dispatch({ type: "input", data: { loginType: +item.sub - 1, tab: LoginTypeEnum.account } });
                                    synchronousSerial(() => this.userNameRef.focus());
                                }
                            }}
                        >
                            <div>
                                {(tab === LoginTypeEnum.phone || tab === undefined) && (
                                    <List className="login-list">
                                        <InputItem
                                            ref={(e) => (this.phoneInputRef = e)}
                                            type={browser.versions.android ? "digit" : "number"}
                                            clear
                                            placeholder="手机号码"
                                            value={state!.loginName}
                                            labelNumber={4}
                                            onChange={(e) => this.dispatch({ type: "input", data: { loginName: e } })}
                                        >
                                            <Picker
                                                disabled={true}
                                                data={tel}
                                                title="选择区号"
                                                cascade={false}
                                                onChange={(value) => {
                                                    this.dispatch({ type: "input", data: { areacode: value![0] } });
                                                }}
                                            >
                                                <span className="areacode">{areacode}</span>
                                            </Picker>
                                        </InputItem>
                                    </List>
                                )}
                            </div>
                            <div>
                                {tab === LoginTypeEnum.account && (
                                    <>
                                        <List className="login-list">
                                            <InputItem
                                                ref={(e) => (this.userNameRef = e)}
                                                placeholder="用户名/手机号"
                                                labelNumber={4}
                                                value={state!.loginName}
                                                onChange={(e) => this.dispatch({ type: "input", data: { loginName: e } })}
                                            ></InputItem>
                                        </List>
                                        <List className="login-list">
                                            <InputItem
                                                type="password"
                                                placeholder="请输入密码"
                                                labelNumber={4}
                                                value={state!.password}
                                                onChange={(e) => this.dispatch({ type: "input", data: { password: e } })}
                                            ></InputItem>
                                        </List>
                                    </>
                                )}
                            </div>
                        </Tabs>
                    </div>
                    {this.renderButton(loginType)}
                </>
            );
        }
        renderFooter(): React.ReactNode {
            return client.openThirdLogin ? this.renderThirdLogin() : null;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.login]);
}
