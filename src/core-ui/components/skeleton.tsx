import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

import { PureComponent } from "@reco-m/core";
import { Grid } from "antd-mobile";

export enum SkeletonType {
    list = "list",
    circle = "circle",
}

export namespace Skeletons {
    export interface IProps extends PureComponent.IProps {
        type?: SkeletonType;
        count?: number;
        color?: string;
        highlightColor?: string;
        height?: number;
        width?: number;
    }

    export interface IState extends PureComponent.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static defaultProps: any = {
            type: SkeletonType.list,
            count: 1,
            color: "#efefef",
            highlightColor: "#f7f7f7",
            height: 18
        };

        renderCircleItems(count): React.ReactNode {
            let items: any = [];

            for (let i = 0; i < count; i++) {
                items.push(1);
            }

            return items.map((_, index) => {
                return <Grid.Item key={index}><Skeleton circle={true} height={50} width={50} /></Grid.Item>;
            });
        }

        render(): React.ReactNode {
            const { type, count, color, highlightColor, height, width } = this.props;
            return type === SkeletonType.list ? (
                <SkeletonTheme baseColor={color} highlightColor={highlightColor}>
                    <Skeleton count={count} height={height} width={width} />
                </SkeletonTheme>
            ) : <Grid columns={count || 1} gap={8}>
                {this.renderCircleItems(count)}
            </Grid>
        }
    }
}
