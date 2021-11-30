import React from "react";
import { Badge } from "antd-mobile-v2";
import { template } from "@reco-m/core";
import { ViewComponent } from "@reco-m/core-ui";
import { Namespaces, notificationCountModel } from "@reco-m/notice-models";

export namespace MyNotificationCountWhite {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

    export interface IState extends ViewComponent.IState, notificationCountModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.notificationCount;

        componentDidMount() {
            this.isAuth() && this.dispatch({ type: `initPage` });
        }

        render(): React.ReactNode {
            const { state } = this.props as any;
            return (
                +state.notificationCount ? <Badge className="newmessage mr15" dot>
                    <i onClick={() => this.goTo(`notification`)} className="icon icon-lingdang" />
                </Badge> : <Badge className="newmessage mr15">
                        <i onClick={() => this.goTo(`notification`)} className="icon icon-lingdang" />
                    </Badge>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.notificationCount]);
}
