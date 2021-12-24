import React, { forwardRef } from "react";
import classNames from "classnames";

export const ListTitle = forwardRef((props: any, _ref: any) => {
    const bodyCls = classNames("reco-title", props.className);
    return (
        <div className={bodyCls} style={props.style}>
            {props.children}
        </div>
    );
});
