import React from "react";
import { Grid } from "antd-mobile";
import { PureComponent } from "@reco-m/core";


export namespace FooterButton {
    export interface IProps extends PureComponent.IProps {
        className?: string;
        children?: any[];
    }

    export interface IState extends PureComponent.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static defaultProps: any = {
            className: "",
        };

        render() {
            return (
                <Grid columns={this.props.children!.length} gap={8} className={`reco-footer-button ${this.props.className}`}>
                    {this.props.children}
                </Grid>
            );
        }
    }

    export const Item = (props) => <Grid.Item>{props.children}</Grid.Item>;
}
