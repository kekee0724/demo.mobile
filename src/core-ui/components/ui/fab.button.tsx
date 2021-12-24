import React, { forwardRef, useRef, useImperativeHandle } from "react";
import { getExtraAttrs } from "../../utils";
import classNames from "classnames";

export const FabButton = forwardRef((props: any, ref) => {
    const { className, id, style, children, fabClose, label, target, onClick } = props;
    const extraAttrs = getExtraAttrs(props);

    const elRef = useRef(null);

    useImperativeHandle(ref, () => ({
        el: elRef.current,
    }));

    const classes = classNames(className, {
        "fab-close": fabClose,
        "fab-label-button": label,
    });

    let labelEl;
    if (label) {
        labelEl = <span className="fab-label">{label}</span>;
    }

    return (
        <a id={id} style={style} target={target} className={classes} ref={elRef} {...extraAttrs} onClick={onClick}>
            {children}
            {labelEl}
        </a>
    );
});

FabButton.displayName = "fab-button";
