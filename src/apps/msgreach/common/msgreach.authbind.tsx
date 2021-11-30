import React from "react";

import { Modal, Toast, WingBlank, Button, List, WhiteSpace, InputItem } from "antd-mobile-v2";

import { template, browser, setLocalStorage } from "@reco-m/core";
import { Countdown, Loading } from "@reco-m/core-ui";
import { MsgReachViewLimitEnum, Namespaces as msgreachNamespaces } from "@reco-m/msgreach-models";
import { Namespaces } from "@reco-m/ipark-auth-models";
import { AuthBindModal } from "@reco-m/ipark-white-login";
import { getQueryString, isDingding } from "@reco-m/ipark-common";
import { CertifyStatusEnum } from "@reco-m/member-models";

const ddkit = window["dd"];
export namespace MsgReachAuthBindModal {
    export interface IProps extends AuthBindModal.IProps {
        /**
         * 访问权限
         */
        viewRange: any;
        /**
         * 园区Id
         */
        parkList: any[];
    }

    export interface IState extends AuthBindModal.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends AuthBindModal.Component<P, S> {
        namespace = Namespaces.authbindmodal;

        componentDidMount() {
            if (this.props.viewRange.toString() !== MsgReachViewLimitEnum.none.toString() && !this.isAuth()) {
                if (ddkit && ddkit.env.platform !== "notInDingTalk") {
                    this.dingLogin();
                } else {
                    this.wechatLogin();
                }
            } else if (this.props.viewRange.toString() !== MsgReachViewLimitEnum.none.toString() && this.isAuth()) {
                this.checkloginAndCertify();
            } else if (this.props.viewRange.toString() === MsgReachViewLimitEnum.none.toString()) {
                this.readMsg();
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
                    this.wechatH5Login(code);
                } else {
                    this.dispatch({ type: "input", data: { wechatPullAuthing: true } });
                    // alert(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${server.wechatAppid}&redirect_uri=${location.href}&response_type=code&scope=snsapi_userinfo#wechat_redirect`)
                    location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${server.wechatAppid}&redirect_uri=${encodeURIComponent(
                        location.href
                    )}&response_type=code&scope=snsapi_userinfo#wechat_redirect`;
                }
            } else if (client.isBiParkApp) {
                this.goTo(`login`);
            }
        }
        dingLogin() {
            // 在钉钉中
            let self = this;
            ddkit.ready(function () {
                // dd.ready参数为回调函数，在环境准备就绪时触发，jsapi的调用需要保证在该回调函数触发后调用，否则无效。
                ddkit.runtime.permission.requestAuthCode({
                    corpId: server.corpId,
                    onSuccess(result) {
                        // alert(`111 = ${JSON.stringify(result)}`);
                        self.dispatch({
                            type: `dingTalkLogin`,
                            code: result.code,
                            callback: () => {
                                // 已经绑定,登录成功
                                self.props.confirmSelect(true);
                                self.checkloginAndCertify(self);
                                self.addRegisterInfo(self);
                            },
                            failback: () => {
                                self.dispatch({ type: "input", data: { dingdingShowLogin: true } });
                            },
                        });
                    },
                    onFail(err) {
                        self.dispatch({ type: "input", data: { dingdingShowLogin: true } });
                        alert(`err=${JSON.stringify(err)}`);
                    },
                } as any);
            });
            ddkit.error(function (err) {
                alert(`allerr=${JSON.stringify(err)}`);
                self.dispatch({ type: "input", data: { dingdingShowLogin: true } });
            });
        }

        componentReceiveProps(nextProps: Readonly<P>): void {
            let locationChanged = nextProps.location !== this.props.location;

            if (
                locationChanged &&
                // // 下个页面不是login、certify或certifyDetail子页面
                nextProps.location!.pathname!.indexOf("/login/") === -1 &&
                nextProps.location!.pathname!.indexOf("/certify/") === -1 &&
                nextProps.location!.pathname!.indexOf("/certifyDetail/") === -1 &&
                nextProps.location!.pathname!.indexOf("/companycertify") === -1 &&
                // 当前页不是login、certify或certifyDetail子页面
                this.props.location!.pathname!.indexOf("/login/") === -1 &&
                this.props.location!.pathname!.indexOf("/certify/") === -1 &&
                this.getPathAuth()
            ) {
                // 从index/login或者index/certify跳转且返回时才触发检测
                setTimeout(() => {
                    this.checkloginAndCertify(this);
                }, 200);
            }
        }

        /**
         * 判断当前路径是否为login、certify或certifyDetail及其子页面
         */
        getPathAuth() {
            if (
                this.props.location!.pathname!.indexOf("/login") !== -1 ||
                this.props.location!.pathname!.indexOf("/certify") !== -1 ||
                this.props.location!.pathname!.indexOf("/certifyDetail") !== -1
            ) {
                return true;
            }
            return false;
        }

        /**
         * 添加注册信息
         * @param self
         */
        addRegisterInfo(self?) {
            self = self || this;
            self.dispatch({
                type: `${msgreachNamespaces.msgreach}/addRegisterInfo`,
                callback: () => {
                    self.checkloginAndCertify(self);
                },
            });
        }

        /**
         * 判断是否已认证
         * @param self
         */
        getCertify(self?) {
            self = self || this;
            self.dispatch({
                type: `${msgreachNamespaces.msgreach}/getCertifyMember`,
                parkList: self.props.parkList,
                callback: (member, park) => {
                    if (member && member.status && member.status === CertifyStatusEnum.allow) {
                        self.readMsg(self);
                    } else {
                        if (!member) {
                            setLocalStorage("parkId", park && (park.parkId || park.id));
                            setLocalStorage("parkName", park && park.parkName);
                        }
                        Modal.alert("认证后查看完整内容", "", [
                            {
                                text: "去认证",
                                onPress: () => {
                                    if (member && member.status === CertifyStatusEnum.noConfim) {
                                        self.goTo(`certifyDetail/${member.id}`);
                                    } else {
                                        self.goTo("certify");
                                    }
                                },
                            },
                        ]);
                    }
                },
                error: (_e) => {
                    localStorage.clear();
                    this.componentDidMount();
                },
            });
        }

        /**
         * 阅读推送
         * @param self
         */
        readMsg(self?) {
            self = self || this;
            self.dispatch({
                type: `${msgreachNamespaces.msgreach}/readMsg`,
                error: (e) => {
                    Toast.fail(e.errmsg);
                },
            });
            self.setThirdShare(self);
        }

        /**
         * 第三方分享
         * @param self
         */
        setThirdShare(self?) {
            self = self || this;
            self.dispatch({ type: `${msgreachNamespaces.msgreach}/thirdShare`, wx });
        }

        /**
         * 判断权限
         * @param self
         */
        checkloginAndCertify(self?) {
            self = self || this;
            if (self.props.viewRange.toString() === MsgReachViewLimitEnum.registerAndCertify.toString()) {
                self.getCertify(self);
            } else if (self.props.viewRange.toString() === MsgReachViewLimitEnum.register.toString()) {
                if (!this.isAuth() && client.isBiParkApp) {
                    this.message.warning("请先登录");
                    this.goTo(`login`);
                } else if (this.isAuth()) {
                    self.readMsg(self);
                }
            }
        }

        /**
         * 微信登录
         * @param code
         */
        wechatH5Login(code) {
            this.dispatch({
                type: "wechatH5Login",
                code,
                callBack: (_d) => {
                    // 已经绑定,登录成功
                    this.props.confirmSelect(true);
                    this.addRegisterInfo();
                },
            });
        }

        /**
         * 第三方登录
         */
        smsLoginAndBindThird(isRegister?) {
            const { state } = this.props,
                openid = state!.openid;
            this.dispatch({
                type: "smsLoginAndBindThird",
                successcall: (e) => {
                    Toast.success(e);
                    // 登录成功
                    this.props.confirmSelect(true);
                    if (isRegister) {
                        this.addRegisterInfo();
                    } else {
                        this.checkloginAndCertify();
                    }
                },
                openid: openid,
            });
        }

        /**
         * 判断手机号是注册还是登陆
         */
        getRegisterOrLogin(mobile) {
            this.dispatch({
                type: `${msgreachNamespaces.msgreach}/getRegisterOrLogin`,
                mobile,
                successcall: (isRegister) => {
                    this.smsLoginAndBindThird(isRegister);
                },
            });
        }

        render(): React.ReactNode {
            const { state } = this.props,
                isLoading = state!.isLoading,
                phonenumber = state!.phonenumber,
                smsCode = state!.smsCode,
                dingdingShowLogin = state!.dingdingShowLogin,
                wechatPullAuthing = state!.wechatPullAuthing;
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
            if (this.props.viewRange.toString() !== MsgReachViewLimitEnum.none.toString() && wechatPullAuthing) {
                return (
                    <Modal title={null} popup onClose={() => {}} visible={this.props.isOpen()} maskClosable={true} animationType="slide-up" className="radius-modal">
                        请同意微信授权登录
                        <WhiteSpace size={"lg"} />
                        <WhiteSpace size={"lg"} />
                        <WhiteSpace size={"lg"} />
                    </Modal>
                );
            }

            return this.props.viewRange.toString() !== MsgReachViewLimitEnum.none.toString() && (!isDingding() || dingdingShowLogin) && !this.isAuth() ? (
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
                                extra={<Countdown.Component start={this.sendVerifyCode.bind(this)} content="获取验证码" type="msgreachauth" />}
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
                                this.getRegisterOrLogin(phonenumber);
                            }}
                            className="radius-button"
                            type="primary"
                        >
                            立即登录
                        </Button>
                        <WhiteSpace size={"lg"} />
                    </WingBlank>
                </Modal>
            ) : null;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.authbindmodal]);
}
