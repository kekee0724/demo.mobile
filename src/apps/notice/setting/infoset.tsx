import React from "react";

import { List, Switch, WhiteSpace, WingBlank } from "antd-mobile-v2";

import { template, getLocalStorage, setLocalStorage, getStorageObject } from "@reco-m/core";

import { ViewComponent, setEventWithLabel } from "@reco-m/core-ui";

import { Namespaces, getDeviceStatus, noticesettingModel, NotificationStateEnum } from "@reco-m/notice-models";

import { statisticsEvent } from "@reco-m/ipark-statistics";
export namespace Infoset {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

    export interface IState extends ViewComponent.IState, noticesettingModel.StateType {
        checked?: boolean;
        checked1: boolean;
        checked2: boolean;
        checked3: boolean;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = "新消息通知";
        namespace = Namespaces.noticesetting;

        subscriptionClick(item, take) {
            this.dispatch({ type: `postTake`, item, take });

            item.SceneName === "服务通知"
                ? setEventWithLabel(statisticsEvent.serviceNotifMessageReceiveSet)
                : item.SceneName === "园区推送"
                    ? setEventWithLabel(statisticsEvent.parkPushMessageReceiveSet)
                    : item.SceneName === "互动消息" && setEventWithLabel(statisticsEvent.interactiveMessageReceiveSet);
        }

        renderHeaderContentItem(item: any, index: number, take: any): React.ReactNode {
            return (
                <List.Item key={index} extra={<Switch onClick={() => this.subscriptionClick(item, take)} checked={take} />}>
                    <span className="infoset-type-name">{item.sceneName}</span>
                </List.Item>
            );
        }

        renderScenesMap(): React.ReactNode {
            let scenes = getStorageObject("allscenes")|| [];
            let takeScences = getStorageObject("allTakeScenesID") || [];

            console.log("takeScences", takeScences, scenes);


            return (
                takeScences &&
                scenes.map((item, i) => {
                    if (takeScences.indexOf(item.id) > -1) {
                        return this.renderHeaderContentItem(item, i, true);
                    } else {
                        return this.renderHeaderContentItem(item, i, false);
                    }
                })
            );
        }

        renderScenes(): React.ReactNode {

            let show = +getLocalStorage("notificationStatus") === NotificationStateEnum.close ? false : true;

            if (show) {
                return (
                    <div key={"a"}>
                        <List className="safety-link" renderHeader={"接收消息类型"}>
                            {this.renderScenesMap()!}
                        </List>
                    </div>
                );
            }

            return null;
        }

        renderBody(): React.ReactNode {

            return (
                <>
                    <List className="safety-link extra-auto">
                        <List.Item
                            extra={
                                <>
                                    <span className="size-14">请到系统设置里设置</span>
                                    <Switch
                                        // disabled={getDeviceStatus() === SystemTypeEnum.ios ? true : false}
                                        onClick={c => {
                                            this.dispatch({ type: "input", data: { checked: c } });
                                            setLocalStorage("notificationStatus", `${c ? 1 : 0}`)
                                            getDeviceStatus() !== 2 && setEventWithLabel(statisticsEvent.messageReceivingSetting);
                                        }}
                                        checked={+getLocalStorage("notificationStatus") === NotificationStateEnum.close ? false : true}
                                    />
                                </>
                            }
                        >
                            接收通知消息
                        </List.Item>
                    </List>
                    {this.renderScenes()}
                    <WingBlank>
                        <WhiteSpace />
                        <div className="infoset-tips">更改通知样式，请在设备的&quot;设置&quot;-&quot;通知中心&quot;-功能中，找到应用程序&quot;Bitech&quot;进行修改。</div>
                        <WhiteSpace />
                    </WingBlank>
                </>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.noticesetting]);
}
