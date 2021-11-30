import React from "react";

import { NavBar, Icon } from "antd-mobile-v2";

import { ViewComponent } from "@reco-m/core-ui";

import { goToBack } from "./common";

export namespace Header {
    export interface IProps extends ViewComponent.IProps {
        title?: string;
        rightTitle?: string;
        isEdit?: any;
        path?: string;
        goBack?();
        goTo?(path: any);
    }

    export interface IState extends ViewComponent.IState { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        render(): React.ReactNode {
            const { title, isEdit, goBack } = this.props;

            return (
                <NavBar
                    className="park-nav"
                    icon={<Icon type="left" />}
                    onLeftClick={() => goToBack(isEdit, goBack && goBack.bind(this))}
                >
                    {title}
                </NavBar>
            );
        }
    }
}
