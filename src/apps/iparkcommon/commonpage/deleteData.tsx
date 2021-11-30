import React from "react";

import { template } from "@reco-m/core";

import { ViewComponent, DeletData } from "@reco-m/core-ui";

import { NavBar, Icon } from "antd-mobile-v2";
export namespace DeleteData {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, ViewComponent.IState {
        viewRef?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        view;
        componentDidMount() {
        }
        renderHeader(): React.ReactNode {
            return client.showheader && (
                <NavBar
                    className="park-nav"
                    icon={<Icon type="left" />}
                    rightContent={this.renderHeaderRight() as any}
                    onLeftClick={() => {
                        history.go(-2);
                    }}
                >资源错误</NavBar>
            );
        }
        renderBody() {
            return <DeletData.Component></DeletData.Component>;
        }
    }

    export const Page = template(Component);
}
