import React from "react";

import { Modal, Toast, WingBlank, Button, List, WhiteSpace, InputItem } from "antd-mobile-v2";

import { template, browser, Validators } from "@reco-m/core";
import { ViewComponent, Countdown, Loading } from "@reco-m/core-ui";
import { authbindmodalModel, Namespaces } from "@reco-m/ipark-auth-models";
import { getQueryString, isDingding } from "@reco-m/ipark-common";
const ddkit = window["dd"];
export namespace AuthBindModal {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        isOpen: () => boolean;
        confirmSelect: (data: any) => void;
    }

    export interface IState extends ViewComponent.IState, authbindmodalModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.authbindmodal;
        time;
        componentDidMount() {

            if (!this.isAuth()) {
                if (ddkit && ddkit.env.platform !== "notInDingTalk") {
                    this.dingLogin();
                } else {
                    this.wechatLogin();
                }
            }
        }
        wechatLogin() {
            const { state } = this.props,
                wechatAuthing = state!.wechatAuthing;
            // 微信
            if (browser.versions.weChat) {
                // let url = `${location.href.split("/index")[0]}/index/login`;
                // window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${server.wechatAppid}&redirect_uri=${encodeURIComponent(url)}&response_type=code&scope=snsapi_userinfo#wechat_redirect`;
                // https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd37c5d2ac7154e3b&redirect_uri=http://demo.bitech.cn/index.html&response_type=code&scope=snsapi_userinfo#wechat_redirect
                let code = this.getSearchParam("code") || getQueryString("code");
                if (code && !wechatAuthing) {
                    // alert(code);
                    this.dispatch({ type: "input", data: { wechatAuthing: true } });
                    this.dispatch({
                        type: "wechatH5Login",
                        code,
                        callBack: (_d) => {
                            // 已经绑定,登录成功
                            this.props.confirmSelect(true);
                        },
                    });
                } else {
                    this.dispatch({ type: "input", data: { wechatPullAuthing: true } });
                    // alert(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${server.wechatAppid}&redirect_uri=${location.href}&response_type=code&scope=snsapi_userinfo#wechat_redirect`)
                    location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${server.wechatAppid}&redirect_uri=${encodeURIComponent(
                        location.href
                    )}&response_type=code&scope=snsapi_userinfo#wechat_redirect`;
                }
            }
        }
        dingLogin() {
            // 在钉钉中
            let _this = this;
            ddkit.ready(function () {
                // dd.ready参数为回调函数，在环境准备就绪时触发，jsapi的调用需要保证在该回调函数触发后调用，否则无效。
                ddkit.runtime.permission.requestAuthCode({
                    corpId: server.corpId,
                    onSuccess(result) {
                        // alert(`result.code = ${result.code}`);
                        _this.dispatch({
                            type: `dingTalkLogin`,
                            code: result.code,
                            callback: () => {
                                // 已经绑定,登录成功
                                _this.props.confirmSelect(true);
                            },
                            failback: () => {
                                _this.dispatch({ type: "input", data: { dingdingShowLogin: true } });
                                // /Toast.fail("您尚未开通权限，请联系管理员");
                            },
                        });
                    },
                    onFail() {
                        _this.dispatch({ type: "input", data: { dingdingShowLogin: true } });
                        // alert(`err=${JSON.stringify(err)}`);
                    },
                } as any);
            });
            ddkit.error(function (err) {
                alert(JSON.stringify(err));
            });
        }

        loginNameValidator() {
            const { cellphone, required, composeControl } = Validators,
                { state } = this.props;
            return composeControl([required, cellphone], { value: state!.phonenumber, name: "手机号码" });
        }

        sendVerifyCode(delay: Function) {
            const msg = this.loginNameValidator()!();

            if (msg) {
                Toast.fail(msg.msg.join(), 1);

                return;
            }

            const { state } = this.props;

            this.dispatch({
                type: "sendVerifyCode",
                data: { username: state!.phonenumber },
                delay,
            });
        }
        // 禁用手势操作
        setStopPropagation() {
            if (this.props.isOpen()) {
                clearTimeout(this.time);
                this.time = setTimeout(() => {
                    $(".am-modal")
                        .on("touchstart", (e) => {
                            e.stopPropagation();
                        })
                        .on("touchend", (e) => {
                            e.stopPropagation();
                        })
                        .on("touchmove", (e) => {
                            e.stopPropagation();
                        });
                }, 500);
            }
        }
        renderModal(): React.ReactNode {
            const { state } = this.props,
                isLoading = state!.isLoading,
                phonenumber = state!.phonenumber,
                smsCode = state!.smsCode,
                openid = state!.openid;
            return (
                <Modal
                    title={
                        <>
                            <div className="text-center">请登录</div>
                            <WhiteSpace />
                        </>
                    }
                    popup
                    onClose={() => {}}
                    visible={this.props.isOpen()}
                    maskClosable={true}
                    animationType="slide-up"
                    className="radius-modal"
                >
                    {isLoading && <Loading.Component />}
                    <WingBlank>
                        <List className="authentication-list">
                            <InputItem
                                placeholder="请输入手机号"
                                value={phonenumber}
                                type={"number"}
                                onChange={(e) => {
                                    this.dispatch({ type: "input", data: { phonenumber: e } });
                                }}
                            >
                                手机号码
                            </InputItem>
                            <InputItem
                                type={"number"}
                                extra={<Countdown.Component start={this.sendVerifyCode.bind(this)} content="获取验证码" />}
                                value={smsCode}
                                placeholder="请输入验证码"
                                maxLength={4}
                                onChange={(smsCode) => this.dispatch({ type: "input", data: { smsCode } })}
                            >
                                验证码
                            </InputItem>
                        </List>
                        <Button
                            onClick={() => {
                                if (!smsCode) {
                                    Toast.fail("请输入验证码");
                                    return;
                                }
                                this.dispatch({
                                    type: "smsLoginAndBindThird",
                                    successcall: (e) => {
                                        Toast.success(e);
                                        // 登录成功
                                        this.props.confirmSelect(true);
                                    },
                                    openid: openid,
                                });
                            }}
                            className="radius-button"
                            type="primary"
                        >
                            立即登录
                        </Button>
                        <WhiteSpace size={"lg"} />
                    </WingBlank>
                </Modal>
            );
        }
        render(): React.ReactNode {
            const { state } = this.props,
                dingdingShowLogin = state!.dingdingShowLogin,
                wechatPullAuthing = state!.wechatPullAuthing;
            this.setStopPropagation();
            if (wechatPullAuthing) {
                return (
                    <Modal popup onClose={() => {}} visible={this.props.isOpen()} maskClosable={true} animationType="slide-up" className="radius-modal">
                        请同意微信授权登录
                        <WhiteSpace size={"lg"} />
                        <WhiteSpace size={"lg"} />
                        <WhiteSpace size={"lg"} />
                    </Modal>
                );
            }

            return !isDingding() || dingdingShowLogin ? this.renderModal() : null;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.authbindmodal]);
}
