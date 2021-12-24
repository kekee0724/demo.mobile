import React, { forwardRef } from "react";
import classNames from "classnames";

export const ListContainer = forwardRef((props: any, _ref: any) => {
    const bodyCls = classNames("list-definition", props.className);
    return (
        <div className={bodyCls} style={props.style}>
            {props.children}
        </div>
    );
});
