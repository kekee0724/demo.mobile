import React from "react";

import { List, Button, Flex, Toast } from "antd-mobile-v2";

import { template, isAnonymous, removeLocalStorage } from "@reco-m/core";

import { ViewComponent, getVersionBefore, setEventWithLabel, getHotUpdateVersionBefore, callModal, clearCache, jpushRemove } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces } from "@reco-m/auth-models";

const settingItems = [
    { icon: "yonghu", name: "个人信息", link: "info" },
    { icon: "anquan", name: "账号与安全", link: "safe" },
    { icon: "yijianfankui", name: "意见反馈", link: "create/yjfk" },
    { icon: "newmessage", name: "新消息通知", link: "infoset" },
];

const noAuthSettingItems = [
    { icon: "wuyebaoxiu", name: "清除缓存", link: "clearcache" },
    { icon: "zu", name: "关于我们", link: "about" },
];

/**
 * itemIndex枚举
 */
export enum CouponStateTextEnum {
    accountAndSecurity = 1,
    feedback = 2,
    newsNotification = 3,
}
export namespace Setting {
    export interface IProps extends ViewComponent.IProps {}

    export interface IState extends ViewComponent.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = "设置";
        namespace = Namespaces.user;

        componentDidMount() {
            isAnonymous() || this.dispatch({ type: "getCurrentUser" });
            getVersionBefore();
            getHotUpdateVersionBefore();
        }

        renderUserSetting(): React.ReactNode {
            return isAnonymous() ? null : (
                <div className="my-shadow">
                    <List>
                        {settingItems.map((item, i) => {
                            return (
                                <List.Item
                                    key={i}
                                    onClick={() => {
                                        this.goTo(item.link);

                                        i === CouponStateTextEnum.accountAndSecurity
                                            ? setEventWithLabel(statisticsEvent.accountAndSecurity)
                                            : i === CouponStateTextEnum.feedback
                                            ? setEventWithLabel(statisticsEvent.feedback)
                                            : i === CouponStateTextEnum.newsNotification && setEventWithLabel(statisticsEvent.newsNotification);
                                    }}
                                    arrow="horizontal"
                                >
                                    <i className={"icon icon-" + item.icon + " size-16 margin-right-xs"} />
                                    {item.name}
                                </List.Item>
                            );
                        })}
                    </List>
                </div>
            );
        }

        renderAbout(): React.ReactNode {
            return (
                <div className="my-shadow">
                    <List>
                        {noAuthSettingItems.map((item, i) => {
                            return (
                                <List.Item
                                    key={i}
                                    onClick={() => {
                                        if (item.link === "clearcache") {
                                            callModal("确认清除缓存吗?", () => {
                                                clearCache();
                                                Toast.success("清理成功!");
                                                setEventWithLabel(statisticsEvent.clearCache);
                                            });
                                            return;
                                        }
                                        this.goTo(item.link);

                                        item.link === "about" && setEventWithLabel(statisticsEvent.aboutUs);
                                    }}
                                    arrow="horizontal"
                                >
                                    <i className={"icon icon-" + item.icon + " size-16 margin-right-xs"} />
                                    {item.name}
                                </List.Item>
                            );
                        })}
                    </List>
                </div>
            );
        }

        renderLogout(): React.ReactNode {
            return isAnonymous() ? null : (
                <Flex className="flex-collapse">
                    <Flex.Item>
                        <Button
                            type="primary"
                            onClick={() => {
                                /**
                                 * 删除原生极光设置
                                 */
                                jpushRemove();
                                this.dispatch({ type: "logout" });
                                removeLocalStorage("unitId");
                                setEventWithLabel(statisticsEvent.logout);
                            }}
                        >
                            退出登录
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }

        renderBody(): React.ReactNode {
            return (
                <>
                    {this.renderUserSetting()}
                    {this.renderAbout()}
                </>
            );
        }
        renderFooter(): React.ReactNode {
            return this.renderLogout();
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.user]);
}
