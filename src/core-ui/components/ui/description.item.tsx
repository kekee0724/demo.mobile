import React, { CSSProperties, forwardRef, ReactNode } from "react";
import { Grid } from "antd-mobile";
import { mergeProps } from "antd-mobile/es/utils/with-default-props";
import classNames from "classnames";
import { Container } from "../container";

import { WidthContext } from "./description";

declare type DescriptionProps = {
    bodyCls?: string;
    style?: CSSProperties;
    label?: string | ReactNode;
    children?: ReactNode;
    labelWidth?: string;
    labelColon?: boolean;
    align?: "center" | "top" | "bottom";
    justify?: "start" | "center" | "end";
    hide?: boolean;
    span?: number;
    direction?: "column" | "row";
};

export const DescriptionItem = forwardRef((p: DescriptionProps, _ref: any) => {
    const defaultProps = {
        bodyCls: "",
        labelWidth: "80px",
        style: {},
        align: "center",
        labelColon: true,
        span: 1,
        direction: "row",
    };

    const props = mergeProps(defaultProps, p);

    const { bodyCls, style, children, label, labelWidth, align, justify, labelColon, hide, span, direction } = props;
    return (
        <WidthContext.Consumer>
            {(width) => {
                return (
                    <Grid.Item span={span} className={classNames(bodyCls, hide && "none")} style={style}>
                        <Container.Component direction={direction} align={align} justify={justify}>
                            {label && (
                                <div className="margin-right-xxs reco-describe" style={{ width: width || labelWidth }}>
                                    {label}
                                    {labelColon && ":"}
                                </div>
                            )}
                            <Container.Component fill>{children}</Container.Component>
                        </Container.Component>
                    </Grid.Item>
                );
            }}
        </WidthContext.Consumer>
    );
});
