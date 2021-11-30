import React, { forwardRef, useRef, useImperativeHandle } from "react";
import classNames from "classnames";
import { getExtraAttrs } from "../../utils";

export const FabBackdrop = forwardRef((props: any, ref) => {
    const { className, id, style, children } = props;
    const extraAttrs = getExtraAttrs(props);

    const elRef = useRef(null);
    useImperativeHandle(ref, () => ({
        el: elRef.current,
    }));

    const classes = classNames(className, "fab-backdrop");

    return (
        <div id={id} style={style} className={classes} ref={elRef} {...extraAttrs}>
            {children}
        </div>
    );
});

FabBackdrop.displayName = "fab-backdrop";
