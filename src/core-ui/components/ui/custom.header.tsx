import React, { CSSProperties, forwardRef } from "react";
import { ImageAuto } from "../images.auto";
import classNames from "classnames";

declare type CustomHeaderProps = {
    className?: string;
    style?: CSSProperties | undefined;
    children?: any;
    backImageSrc?: any;
    backCutWidth?: any;
    backCutHeight?: any;
    navBarNoBorder?: boolean;
    navBarNoBack?: boolean;
    customHeaderList?: boolean;
    backColor?: boolean;
};

export const CustomHeader = forwardRef((props: CustomHeaderProps, _ref: any) => {
    const { className, style, children, backImageSrc, backCutWidth, backCutHeight, navBarNoBorder, navBarNoBack, customHeaderList, backColor } = props;
    const bodyCls = classNames(
        "reco-custom-header",
        className,
        !navBarNoBorder && "nav-no-border",
        !navBarNoBack && "nav-no-back",
        customHeaderList && "custom-header-list",
        !backImageSrc && "header-no-back",
        backColor && "reco-custom-back"
    );
    return (
        <div className={bodyCls} style={style}>
            <div className="reco-header-content">{children}</div>
            {backImageSrc && <ImageAuto.Component width="100%" cutWidth={backCutWidth} cutHeight={backCutHeight} src={backImageSrc} />}
        </div>
    );
});
