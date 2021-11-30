import React, { forwardRef, useRef, useState } from "react";
import classNames from "classnames";
import { AddOutline, CloseOutline } from "antd-mobile-icons";

import { getExtraAttrs, getSlots } from "../../utils";

export const Fab = forwardRef((props: any, _ref) => {
    const { className, id, style, morphTo, href, target, text, onClick, position = "right-bottom" } = props as any;
    const extraAttrs = getExtraAttrs(props);

    const elRef = useRef(null);

    const [show, setShow] = useState<boolean>();

    let hrefComputed = href;
    if (hrefComputed === true) hrefComputed = "#";
    if (hrefComputed === false) hrefComputed = undefined;

    const linkChildren = [] as any;
    const rootChildren = [] as any;

    const { link: linkSlots, default: defaultSlots, root: rootSlots, text: textSlots } = getSlots(props) as any;

    if (defaultSlots) {
        for (let i = 0; i < defaultSlots.length; i += 1) {
            const child = defaultSlots[i];
            let isRoot;
            const tag = child.type && (child.type.displayName || child.type.name);
            if (tag === "FabButtons" || tag === "fab-buttons") isRoot = true;
            if (isRoot) rootChildren.push(child);
            else linkChildren.push(child);
        }
    }
    let textEl;
    if (text || (textSlots && textSlots.length)) {
        textEl = (
            <div className="fab-text">
                {text}
                {textSlots}
            </div>
        );
    }
    let linkEl;
    if (linkChildren.length || (linkSlots && linkSlots.length) || textEl) {
        linkEl = (
            <a target={target} href={hrefComputed} onClick={onClick}>
                {linkChildren}
                {textEl}
                {linkSlots}
            </a>
        );
    }

    const classes = classNames(className, "fab", `fab-${position}`, {
        "fab-morph": morphTo,
        "fab-extended": typeof textEl !== "undefined",
        "fab-opened": show,
    });

    const close = () => setShow(false);

    const dom = elRef.current as any;

    $(dom).find(".fab-close").off("click", close).on("click", close);

    return (
        <div id={id} style={style} className={classes} data-morph-to={morphTo} ref={elRef} {...extraAttrs}>
            <a className="fab-toggle-button" onClick={() => setShow(!show)}>
                <i>
                    <AddOutline />
                </i>
                <i>
                    <CloseOutline />
                </i>
            </a>
            {linkEl}
            {rootChildren}
            {rootSlots}
        </div>
    );
});

Fab.displayName = "fab";
