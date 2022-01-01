import React, { forwardRef } from "react";

declare type FoldProps = {
    children?: any;
};

export const CardContainer = forwardRef((props: FoldProps, _ref: any) => {
    const { children } = props;

    return <div className="card">{children}</div>;
});
