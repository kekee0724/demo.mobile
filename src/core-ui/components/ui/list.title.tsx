import React, { forwardRef } from "react";
import classNames from "classnames";
import { Container } from "../container";

type ListTitleProps = {
    className?: string;
    style?: any;
    children?: any;
    title?: any;
    extra?: any;
};

export const ListTitle = forwardRef((props: ListTitleProps, _ref: any) => {
    const { title, extra } = props;
    const bodyCls = classNames("reco-title", props.className);
    return title || extra ? (
        <div className={bodyCls} style={props.style}>
            <Container.Component direction={"row"}>
                <Container.Component fill>{title}</Container.Component>
                {extra}
            </Container.Component>
        </div>
    ) : (
        <div className={bodyCls} style={props.style}>
            {props.children}
        </div>
    );
});
