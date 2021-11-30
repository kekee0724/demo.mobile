import React from "react";

import { PureComponent } from "@reco-m/core";

export namespace Badge {
    export interface IProps extends PureComponent.IProps {
        component?: any;
        href?: string;
        amStyle?: string;
        rounded?: boolean;
    }

    export interface IState extends PureComponent.IState {}

    export class Component<P extends IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static defaultProps: Badge.IProps = {
            classPrefix: "badge",
            component: "span",
        };

        render(): React.ReactNode {
            let classSet = this.getClassSet(),
                { component: Component, className, href, ...props } = this.props as any;

            delete props.classPrefix;
            delete props.amStyle;
            delete props.rounded;

            Component = href ? "a" : Component;

            return (
                <Component {...props} className={this.classnames(classSet, className)}>
                    {this.props.children}
                </Component>
            );
        }
    }
}
