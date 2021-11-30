import React from "react";

import { template } from "@reco-m/core";
import { ViewComponent } from "@reco-m/core-ui";
import { Namespaces, notificationModel } from "@reco-m/notice-models";


export namespace NoticeError {

    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

    export interface IState extends ViewComponent.IState, notificationModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = "消息中心";
        namespace = Namespaces.notification;
        scrollable = false;

        renderBody(): React.ReactNode {
            return (
                <div>
                    <div className="pay-content">
                        <div className="pay-icon " style={{ color: "red" }}>
                            <i className="icon icon-cuo" />
                        </div>
                        <div className="pay-state">页面读取失败!</div>
                    </div>
                </div>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.notification]);
}
