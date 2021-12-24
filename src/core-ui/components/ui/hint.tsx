import React, { forwardRef } from "react";
import classNames from "classnames";

export const Hint = forwardRef((props: any, _ref: any) => {
    const bodyCls = classNames("reco-hint", props.className);
    return (
        <div className={bodyCls} style={props.style}>
            {props.children}
        </div>
    );
});
