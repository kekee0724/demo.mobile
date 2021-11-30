import React from "react";

import { PureComponent } from "@reco-m/core";

export namespace Icon {
    export interface IProps extends PureComponent.IProps {
        component?: any;
        name: string;
        href?: string;
    }

    export interface IState extends PureComponent.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static defaultProps = {
            classPrefix: "icon",
            component: "span",
        };

        render(): React.ReactNode {
            let classSet = this.getClassSet(),
                { component: Component, className, name, ...props } = this.props as any;

            delete props.classPrefix;

            Component = props.href ? "a" : Component;

            classSet[this.prefixClass(name)] = true;

            return (
                <Component {...props} className={this.classnames(classSet, className)}>
                    {this.props.children}
                </Component>
            );
        }
    }
}
