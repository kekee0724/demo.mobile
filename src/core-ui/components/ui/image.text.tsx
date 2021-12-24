import React, { CSSProperties, forwardRef } from "react";
import classNames from "classnames";

declare type ImageTextProps = {
    className?: string;
    style?: CSSProperties | undefined;
    icon?: any;
    iconSize?: number;
    text?: any;
};

export const ImageText = forwardRef((props: ImageTextProps, _ref: any) => {
    const bodyCls = classNames("reco-image-text", props.className);
    return (
        <div className={bodyCls} style={props.style}>
            {typeof props.icon === "string" && <i className={props.icon} style={{ fontSize: props.iconSize }} />}
            {typeof props.icon !== "string" && props.icon}
            <div className="text">{props.text}</div>
        </div>
    );
});
