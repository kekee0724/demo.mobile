import React, { forwardRef } from "react";
import { Ellipsis } from "antd-mobile";
import classNames from "classnames";

import { ImageAuto } from "../images.auto";
import { mergeProps } from "antd-mobile/es/utils/with-default-props";

type CardTextProps = {
    url?: string;
    text?;
    rows?;
    children?;
    cutWidth?;
    cutHeight?;
    width?;
    height?;
    onClick?;
    style?;
    className?;
    content?;
    footer?;
    type?;
    textStyle?;
    textClassName?;
    customImage?;
    ratio?: "16:9" | "4:3" | "1:1" | "2:3";
    imageAutoProps?: ImageAuto.IProps;
    direction?: "column" | "row" | "row-reverse";
};

export const CardText = forwardRef((p: CardTextProps, _ref: any) => {
    const defaultProps = {
        ratio: "16:9",
        direction: "column",
        imageAutoProps: {
            style: { "--width": "100%" },
        },
    };

    const props = mergeProps(defaultProps, p);

    const bodyCls = classNames(
        "card-text-container",
        props.type,
        props.className,
        props.direction === "row" && "card-text-row",
        props.direction === "row-reverse" && "card-text-row reverse"
    );

    return (
        <div className={bodyCls} onClick={props.onClick} style={props.style}>
            {props.customImage ? (
                props.customImage
            ) : (
                <ImageAuto.Component
                    src={props.url}
                    width={props.width}
                    height={props.height}
                    cutWidth={props.cutWidth}
                    cutHeight={props.cutHeight}
                    ratio={props.ratio}
                    className={classNames(props.direction === "row-reverse" && "margin-v margin-right", props.direction === "row" && "margin-v margin-left")}
                    {...props.imageAutoProps}
                >
                    {props.children}
                </ImageAuto.Component>
            )}
            {(props.text || props.content) && (
                <div className="card-text-content">
                    {props.text && <Ellipsis content={props.text} rows={props.rows || 2} className={`card-text ${props.textClassName}`} style={props.textStyle} />}
                    {props.content && <div className="card-content">{props.content}</div>}
                </div>
            )}
            {props.footer && <div className="card-text-footer">{props.footer}</div>}
        </div>
    );
});
