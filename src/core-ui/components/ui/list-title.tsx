import React, { forwardRef } from "react";

export const ListTitle = forwardRef((props: any, _ref: any) => {
    return <div className="reco-title">{props.children}</div>;
});
