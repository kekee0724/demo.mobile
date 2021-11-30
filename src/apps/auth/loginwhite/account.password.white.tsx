import React from "react";

import { InputItem, Button, WingBlank, WhiteSpace, List, Flex, Toast } from "antd-mobile-v2";

import { template } from "@reco-m/core";
import { Countdown, setEventWithLabel } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";
import { Namespaces } from "@reco-m/auth-models";
import { AccountChangePassword } from "@reco-m/auth-account";
export namespace AccountChangePasswordWhite {

    export interface IProps extends AccountChangePassword.IProps { }

    export interface IState extends AccountChangePassword.IState { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends AccountChangePassword.Component<P, S> {
        showloading = false;
        // 个人信息中的修改密码
        headerContent = this.props.match!.params.type === "Auth" ? "修改密码" : "";
        namespace = Namespaces.pwd;
        componentDidMount() {
            this.dispatch("input", { isPwd: true })
            this.isAuth() &&
                this.dispatch({
                    type: "getAccountMobile",
                });
        }

        renderContent(): React.ReactNode {
            const { state } = this.props;

            return (
                <>
                    <WhiteSpace />
                    <InputItem
                        labelNumber={2}
                        disabled
                        value={state!.phonenumber || this.getSearchParam("phonenumber") || state!.mobile}
                        extra={<Countdown.Component start={this.sendVerifyCode.bind(this)} content="获取验证码" type="changepass" />}
                        placeholder="请输入手机号"
                    >
                    </InputItem>
                    <InputItem
                        labelNumber={2}
                        placeholder="请输入短信验证码"
                        value={state!.code}
                        maxLength={4}
                        type="number"
                        onChange={e =>
                            this.dispatch("input", {
                                code: e,
                                phonenumber: state!.phonenumber || this.getSearchParam("phonenumber") || state!.mobile
                            })
                        }
                    >
                    </InputItem>
                    <InputItem
                        type={state!.isPwd ? "password" : "text"}
                        labelNumber={2}
                        value={state!.password}
                        extra={<i className={state!.isPwd ? "icon icon-yanjing" : "icon icon-yanjing1"} onClick={() => this.dispatch("input", { isPwd: !state!.isPwd })} />}
                        placeholder="请输入新的密码"
                        onChange={e => this.dispatch("input", { password: e })}
                    >
                    </InputItem>
                </>
            );
        }

        renderBody(): React.ReactNode {
            return (
                <WingBlank>
                    {this.props.match!.params.type !== "Auth" && <div className="login-title"> 找回密码</div>}
                    <List className="login-list">{this.renderContent()}</List>
                    <WhiteSpace />
                    <div className="size-12">提示：密码长度8-32位，数字、字母(区分大小写)和符号即可</div>

                </WingBlank>
            );
        }
        submit() {
            const msg = this.validator()!();

            if (msg) {
                Toast.fail(msg.join(), 1);
                return;
            }

            this.dispatch({
                type: "submit",
                callback: () => {
                    if (this.props.match!.params.type === "Auth") {
                        Toast.success("密码已修改，请重新登录", 1, this.loginOut.bind(this));
                    } else {
                        Toast.success("密码重置成功！", 1, this.goBack.bind(this));
                    }

                    setEventWithLabel(statisticsEvent.changePassword);
                }
            });
        }
        renderFooter(): React.ReactNode {
            return (
                <Flex className="flex-collapse">
                    <Flex.Item>
                        <Button className="mt15" type="primary" onClick={() => {
                            this.submit.bind(this)()
                        }}>
                            确认提交
                    </Button>
                    </Flex.Item>
                </Flex>
            );
        }
    }

    export const Page = template(
        Component,
        state => state.pwd
    );
}
