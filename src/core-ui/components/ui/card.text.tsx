import React, { forwardRef } from "react";
import { Ellipsis } from "antd-mobile";
import classNames from "classnames";

import { ImageAuto } from "../images.auto";

export const CardText = forwardRef(
    (
        props: { url?; text?; rows?; children?; cutWidth?; cutHeight?; width?; height?; onClick?; style?; className?; footer?; type?; textStyle?; textClassName?; customImage? },
        _ref: any
    ) => {
        const bodyCls = classNames("card-text-container", props.type, props.className);
        return (
            <div className={bodyCls} onClick={props.onClick} style={props.style}>
                {props.customImage ? (
                    props.customImage
                ) : (
                    <ImageAuto.Component
                        width={props.width}
                        height={props.height}
                        cutWidth={props.cutWidth}
                        cutHeight={props.cutHeight}
                        src={props.url}
                        style={{ "--width": "100%" }}
                    >
                        {props.children}
                    </ImageAuto.Component>
                )}
                {props.text && <Ellipsis content={props.text} rows={props.rows || 2} className={`card-text ${props.textClassName}`} style={props.textStyle} />}
                {props.footer && <div className="card-footer">{props.footer}</div>}
            </div>
        );
    }
);
