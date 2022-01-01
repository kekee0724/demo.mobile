import React, { ReactNode } from "react";
import { Grid } from "antd-mobile";
import { PureComponent } from "@reco-m/core";
import classNames from "classnames";

export namespace FooterButton {
    export interface IProps extends PureComponent.IProps {
        className?: string;
        border?: boolean;
        back?: boolean;
        columns?: number;
        gridProps?: any;
        gap?: number | string | [number | string, number | string];
    }

    export interface IState extends PureComponent.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static defaultProps: any = {
            className: "",
            columns: 0,
            gap: 8,
        };

        render() {
            console.log("this.props.children", this.props.children);

            const bodyCls = classNames("reco-footer-button", this.props.className, this.props.border && "footer-border", this.props.back && "footer-back");

            let children = this.props.children;
            if (this.props.children instanceof Array) {
                children = this.props.children.filter((item) => {
                    return item instanceof Object;
                });
            }

            return children instanceof Array ? (
                <Grid columns={this.props.columns || children!.length} gap={this.props.gap} className={bodyCls} {...this.props.gridProps}>
                    {children}
                </Grid>
            ) : (
                <div className={bodyCls}>{children}</div>
            );
        }
    }

    export interface ItemProps {
        span?: number;
        onClick?: () => void;
        children?: ReactNode;
        align?: "center" | "top" | "bottom";
        justify?: "start" | "center" | "end";
        gridItemProps?: any;
    }

    export const Item = (props: ItemProps) => {
        let alignClass, justifyClass;
        switch (props.align) {
            case "center":
                alignClass = "align-center";
                break;
            case "top":
                alignClass = "align-start";
                break;
            case "bottom":
                alignClass = "align-end";
        }
        switch (props.justify) {
            case "center":
                justifyClass = "justify-center";
                break;
            case "start":
                justifyClass = "justify-start";
                break;
            case "end":
                justifyClass = "justify-end";
        }
        return (
            <Grid.Item className={classNames((alignClass || justifyClass) && "flex", alignClass, justifyClass)} span={props.span} onClick={props.onClick}>
                {props.children}
            </Grid.Item>
        );
    };
}
