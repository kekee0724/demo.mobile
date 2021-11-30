import React, { forwardRef, useRef, useImperativeHandle } from "react";
import classNames from "classnames";
import { getExtraAttrs } from "../../utils";

export const FabButtons = forwardRef((props: any, ref) => {
    const { className, id, style, children, position } = props;
    const extraAttrs = getExtraAttrs(props);

    const elRef = useRef(null);
    useImperativeHandle(ref, () => ({
        el: elRef.current,
    }));

    const classes = classNames(className, "fab-buttons", `fab-buttons-${position}`);

    return (
        <div id={id} style={style} className={classes} ref={elRef} {...extraAttrs}>
            {children}
        </div>
    );
});

FabButtons.displayName = "fab-buttons";
