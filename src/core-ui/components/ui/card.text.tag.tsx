import React, { forwardRef } from "react";
import classNames from "classnames";

export const CardTextTag = forwardRef((props: any, _ref) => {
    let tagTypeClass;
    switch (props.type) {
        case "signing-up":
            tagTypeClass = "signing-up";
            break;
        case "in-progress":
            tagTypeClass = "in-progress";
            break;
        case "released":
            tagTypeClass = "released";
            break;
        default:
            tagTypeClass = "released";
    }
    return <div className={classNames("card-text-tag", tagTypeClass)}>{props.children}</div>;
});
