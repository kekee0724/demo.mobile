
import React from "react";

import { List } from "antd-mobile-v2";

import { template } from "@reco-m/core";
import { ViewComponent, NoData, setEventWithLabel } from "@reco-m/core-ui";
import { Namespaces, notificationModel } from "@reco-m/notice-models";

import { statisticsEvent } from "@reco-m/ipark-statistics";
export namespace Notification {


    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

    export interface IState extends ViewComponent.IState, notificationModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = "消息中心";
        namespace = Namespaces.notification;


        componentDidMount() {
            this.dispatch({ type: `initPage` });
        }
        componentReceiveProps(nextProps: Readonly<IProps>): void {
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged) {
                this.dispatch({ type: `initPage` });
            }
        }
        goNotificationList(type: any, title: any, NotificationType: any) {
            this.goTo(`list/${type}?title=${decodeURI(title)}&notificationType=${+NotificationType || ""}`);

            title === "服务通知"
                ? setEventWithLabel(statisticsEvent.serviceNotifications)
                : title === "互动消息"
                    ? setEventWithLabel(statisticsEvent.interactiveMessage)
                    : title === "园区推送" && setEventWithLabel(statisticsEvent.parkPush);
        }
        renderList() {
            const { state } = this.props as any,
                notificationScene = state!.notificationScene;

            return notificationScene && notificationScene.length > 0 ? (
                <List>
                    {notificationScene.map((item: any, i: number) => {
                        return this.renderItems(item, i);
                    })}
                </List>
            ) : (
                    <NoData.Component />
                );
        }
        renderItems(item: any, i: number): React.ReactNode {
            let Message = item.message;
            let title = item.scene.sceneName;
            return (

                <List.Item key={i} wrap onClick={() => {
                    this.goNotificationList(Message.sceneId, title, Message.notificationType)
                }} arrow="horizontal" thumb={<div className="news-box">{item.scene.sceneName && item.scene.sceneName.slice(0, 2)}</div>}>
                    <div className="size-18">{title}</div>
                    <div className="size-12">您有<span className="color-waiting ml5 mr5">{item.unRead}</span>条新消息</div>
                </List.Item>
            );
        }
        renderBody(): React.ReactNode {
            return this.renderList();
        }

    }

    export const Page = template(Component, state => state[Namespaces.notification]);
}
