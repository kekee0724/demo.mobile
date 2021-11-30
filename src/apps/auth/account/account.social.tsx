import React from "react";

import { List, Dialog, Toast } from "antd-mobile";

import { template } from "@reco-m/core";
import { ViewComponent, loginType, socialType, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/statistics";
import { Namespaces, accountBindMobileModel, userModel, accountSocialItems } from "@reco-m/auth-models";


export namespace AccountSocial {
    export interface IProps<S = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, accountBindMobileModel.StateType {
        accountBindMobile: ViewComponent.IState & accountBindMobileModel.StateType;
        user: ViewComponent.IState & userModel.StateType;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = "社交账号";
        namespace = Namespaces.accountBindMobile;
        modalView: any;
        thirdcode: any = "";
        type: number;
        currentIsUnbind = false;

        componentDidMount() {
            this.thirdcode = this.getSearchParam("thirdcode");
            this.type = Number(this.getSearchParam("type"));
            if (this.thirdcode) {
                this.dispatch({
                    type: "socialGetThirdAccountBindAction",
                    success: (e) => Toast.show({
                        icon: 'success',
                        content: e
                    }),
                    thirdType: this.type,
                    openId: this.thirdcode,
                });
            } else {
                this.dispatch({ type: "accountAccess" });
            }
        }
        getQueryString(search: any, name: string) {
            let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            let r = search.substr(1).match(reg);
            if (r != null) return r[2];
            return null;
        }

        componentReceiveProps(nextProps: Readonly<P>): void {
            let locationChanged = nextProps.location !== this.props.location;

            if (locationChanged) {
                setTimeout(() => {
                    this.thirdcode = this.getSearchParam("thirdcode");
                    this.type =Number(this.getSearchParam("type"));
                    if (this.thirdcode) {
                        this.dispatch({
                            type: "socialGetThirdAccountBindAction",
                            success: (e) => Toast.show({
                                icon: 'success',
                                content: e
                            }),
                            thirdType: this.type,
                            openId: this.thirdcode,
                        });
                    }
                }, 1000);
            }
        }

        isBind(code: any) {
            const { state } = this.props;
            let social = state!.social;

            for (let i = 0; i < social.length; i++) {
                if (social[i].openPlatform === code) {
                    return "已绑定";
                }
            }
            return "未绑定";
        }

        unBind(code: any) {
            const item = this.getItem(code);

            item ? this.unbindConfirm("是否解除绑定？", "", item, code) : this.bindConfirm("是否绑定社交账号？", "", code);
        }

        getItem(code: any) {
            const { state } = this.props;
            let social = state!.social;
            for (let i = 0; i < social.length; i++) {
                if (social[i].openPlatform === code) {
                    return social[i];
                }
            }
            return null;
        }

        unbindSuccess(e: any) {
            Toast.show({
                icon: 'success',
                content: e
            })
            this.currentIsUnbind = true;
        }

        unbindConfirm(title: string, content: string, item: any, code: string) {
            this.modalView = Dialog.confirm({
                title: title,
                content: content,
                onConfirm: async () => {
                    await this.dispatch({
                        type: "accountUnBindAction",
                        data: { openId: item.openId, code },
                        callsuccess: (e) => this.unbindSuccess(e),
                    });
                }
            });
        }

        bindConfirm(title: string, content: string, code: string) {
            this.modalView = Dialog.confirm({
                title: title,
                content: content,
                onConfirm: async () => {
                    if (code === socialType.WeChat) {
                        this.dispatch({
                            type: "socialThirdLogin",
                            loginType: loginType.wechat,
                            isLogin: false,
                        });

                        setEventWithLabel(statisticsEvent.c_app_Myself_qqBind);
                    } else if (code === socialType.QQ) {
                        this.dispatch({
                            type: "socialThirdLogin",
                            loginType: loginType.qq,
                            isLogin: false,
                        });

                        setEventWithLabel(statisticsEvent.c_app_Myself_weChatBind);
                    } else if (code === socialType.WeiBo) {
                        this.dispatch({
                            type: "socialThirdLogin",
                            loginType: loginType.weibo,
                            isLogin: false,
                        });

                        setEventWithLabel(statisticsEvent.c_app_Myself_weiboBind);
                    }
                }
            });
        }

        renderBody(): React.ReactNode {
            return (
                <List mode="card">
                    {accountSocialItems.map((item, i) => {
                        return (
                            <List.Item
                                key={i}
                                prefix={<i className={"mobile mobile-" + item.itemIcon} />}
                                extra={this.isBind(item.code)}
                                onClick={this.unBind.bind(this, item.code)}
                            >
                                {item.itemName}
                            </List.Item>
                        );
                    })}
                </List>
            );
        }
    }

    export const Page = template(
        Component,
        (state) => state[Namespaces.accountBindMobile]
    );
}
