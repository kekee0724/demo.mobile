import React, { ReactNode } from "react";
import { Grid } from "antd-mobile";
import { PureComponent } from "@reco-m/core";
import classNames from "classnames";

export namespace FooterButton {
    export interface IProps extends PureComponent.IProps {
        className?: string;
        border?: boolean;
        back?: boolean;
        children?: any[];
    }

    export interface IState extends PureComponent.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static defaultProps: any = {
            className: "",
        };

        render() {
            const bodyCls = classNames("reco-footer-button", this.props.className, this.props.border && "footer-border", this.props.back && "footer-back");
            return (
                <Grid columns={this.props.children!.length} gap={8} className={bodyCls}>
                    {this.props.children}
                </Grid>
            );
        }
    }

    export interface ItemProps {
        span?: number;
        onClick?: () => void;
        children?: ReactNode;
        align?: "center" | "top" | "bottom";
        justify?: "left" | "center" | "right";
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
            case "left":
                justifyClass = "justify-start";
                break;
            case "right":
                justifyClass = "justify-end";
        }
        return (
            <Grid.Item className={classNames((alignClass || justifyClass) && "flex", alignClass, justifyClass)} span={props.span} onClick={props.onClick}>
                {props.children}
            </Grid.Item>
        );
    };
}
