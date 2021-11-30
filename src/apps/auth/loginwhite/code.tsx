import React from "react";

import { Toast, WingBlank } from "antd-mobile-v2";

import { template, Validators } from "@reco-m/core";
import { ViewComponent, setEventWithLabel } from "@reco-m/core-ui";
import { Namespaces } from "@reco-m/auth-models";

import { statisticsEvent } from "@reco-m/statistics";


import { iparkloginModel } from "@reco-m/ipark-auth-models";

import {synchronousSerial} from "@reco-m/ipark-common"

import { Countdownauto } from "./countdownauto";
export namespace Code {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, iparkloginModel.StateType {
        viewRef?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = true;
        namespace = Namespaces.login;
        showloadingContent = "登录中";
        inputRef;
        isLogining;
        componentWillUnmount() {
            this.dispatch({ type: "input", data: { codestr: null } });
        }
        componentDidMount() {
            this.dispatch({ type: "hideLoading" });
        }
        tranformClass(index) {

            for (let i = 0; i < 4; i++) {
                if (i + 1 === index) {
                    $(`#cursorspan${i + 1}`).addClass("cursorspan");
                } else {
                    $(`#cursorspan${i + 1}`).removeClass("cursorspan");
                }
            }
        }
        renderHeader(): React.ReactNode {
            return <div className="header-bodernone">{super.renderHeader()}</div>;
        }
        loginNameValidator() {
            const { cellphone, required, composeControl } = Validators,
                { state } = this.props;
            return composeControl([required, cellphone], { value: state!.loginName, name: "手机号码" });
        }
        validator() {
            const { required, maxLength, minLength, composeControl, ValidatorControl } = Validators,
                { state } = this.props;

            return ValidatorControl(
                this.loginNameValidator(),
                composeControl([required, maxLength(4), minLength(4)], {
                    value: state!.password,
                    name: "验证码",
                })
            );
        }

        login() {
            const msg = this.validator()!();

            if (msg) {
                Toast.fail(msg.join(), 1);
                return;
            }
            this.dispatch({ type: "input", data: { loading: true } });
            this.dispatch({
                type: "submit",
                callback: () => {
                    this.isLogining = false;
                    Toast.success("登录成功", 1);
                },
                errCallBack: () => {
                    this.isLogining = false;
                },
            });
            setEventWithLabel(statisticsEvent.c_app_Myself_verificationCodeLogin); // 验证码登录
        }

        sendVerifyCode(delay: Function) {
            const { state } = this.props;

            this.dispatch({
                type: "sendVerifyCode",
                data: { username: state!.loginName },
                delay,
            });
        }

        checkSend(codestr) {
            if (codestr && codestr.length === 4 && !this.isLogining) {
                this.isLogining = true;
                this.dispatch({ type: "input", data: { password: codestr } });
                synchronousSerial(() => {
                    this.login();
                });
            }
        }
        renderBody(): React.ReactNode {
            const { state } = this.props,
                codestr = state!.codestr;

            return (
                <WingBlank>
                    <div className="login-title">输入手机验证码</div>
                    <div className="keyboard-input">
                        <input
                            type="tel"
                            ref={(e) => (this.inputRef = e)}
                            onTouchMove={(e) => {
                                e.preventDefault();
                            }}
                            autoFocus
                            maxLength={4}
                            onChange={(event) => {

                                let value = event.target.value;

                                this.dispatch({ type: "input", data: { codestr: value } });
                                this.checkSend(value);

                                if (value.length + 1 > 4) {
                                    this.tranformClass(value.length);
                                } else {
                                    this.tranformClass(value.length + 1);
                                }
                            }}
                            onBlur={() => {
                                this.tranformClass(5);
                            }}
                            onFocus={() => {
                                if (codestr) {
                                    if (codestr.length + 1 > 4) {
                                        this.tranformClass(codestr.length);
                                    } else {
                                        this.tranformClass(codestr.length + 1);
                                    }
                                } else {
                                    this.tranformClass(1);
                                }
                            }}
                        />
                        <div className="keyboard-span">
                            <span />
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>
                    <div
                        className="input-yzm-box"
                        onClick={() => {
                            this.inputRef.focus();
                        }}
                    >
                        <span id="cursorspan1">{codestr && codestr.slice(0, 1)}</span>
                        <span id="cursorspan2">{codestr && codestr.slice(1, 2)}</span>
                        <span id="cursorspan3">{codestr && codestr.slice(2, 3)}</span>
                        <span id="cursorspan4">{codestr && codestr.slice(3, 4)}</span>
                    </div>
                    <Countdownauto.Component start={this.sendVerifyCode.bind(this)} content="获取验证码" />
                </WingBlank>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.login]);
}
