import React from "react";
import ReactDOM from "react-dom";

import { PureComponent } from "@reco-m/core";

type Align = "end" | "center" | "start" | "top" | "bottom" | "left" | "right";

type Direction = "column" | "row";

type Justify = boolean | "end" | "center" | "start";

type BiRange = "container" | "body" | "center";

interface IScrollable {
    reset();

    getPos(): { left: number; top: number };

    mount(element);

    unmount(element);
}

function hasChildrenWithVerticalFill(children) {
    let result = false;

    React.Children.forEach(children, (child: any) => {
        if (result) {
            return; // early-exit
        }

        if (!child) {
            return;
        }

        if (!child.type) {
            return;
        }

        result = !!child.type.shouldFillVerticalSpace;
    });

    return result;
}

function initScrollable(defaultPos) {
    if (!defaultPos) {
        defaultPos = {};
    }

    let pos;
    let scrollable: IScrollable = {
        reset() {
            pos = { left: defaultPos.left || 0, top: defaultPos.top || 0 };
        },
        getPos() {
            return { left: pos.left, top: pos.top };
        },
        mount(element) {
            let node = ReactDOM.findDOMNode(element) as any;
            node.scrollLeft = pos.left;
            node.scrollTop = pos.top;
        },
        unmount(element) {
            let node = ReactDOM.findDOMNode(element) as any;
            pos.left = node.scrollLeft;
            pos.top = node.scrollTop;
        },
    };

    scrollable.reset();

    return scrollable;
}

export namespace Container {
    export interface IProps extends PureComponent.IProps {
        component?;
        align?: Align;
        direction?: Direction;
        fill?: boolean;
        body?: boolean;
        justify?: Justify;
        scrollable?: boolean | IScrollable;
        hidden?: boolean;
        page?: boolean;
        id?: string;
        className?: any;
        range?: BiRange;
    }

    export interface IState extends PureComponent.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static initScrollable = initScrollable;
        static defaultProps = {
            classPrefix: "container",
            component: "div",
        } as any;

        componentDidMount() {
            const { scrollable } = this.props as any;

            if (scrollable && scrollable.mount) {
                scrollable.mount(this);
            }
        }

        componentWillUnmount() {
            const { scrollable } = this.props as any;

            if (scrollable && scrollable.unmount) {
                scrollable.unmount(this);
            }
        }

        render(): React.ReactNode {
            let { className, component: Component, children, direction, fill, align, justify, scrollable, hidden, body, page, range, ...props } = this.props as any,
                classSet = this.getClassSet();

            delete (props as any).classPrefix;

            switch (range) {
                case "container":
                    fill === undefined && (fill = true);
                    direction === undefined && (direction = "column");
                    hidden === undefined && (hidden = true);
                    break;
                case "body":
                    fill === undefined && (fill = true);
                    hidden === undefined && (hidden = false);
                    scrollable === undefined && (scrollable = true);
                    break;
                case "center":
                    direction === undefined && (direction = "column");
                    fill === undefined && (fill = true);
                    hidden === undefined && (hidden = true);
                    align === undefined && (align = "center");
                    justify === undefined && (justify = "center");
                    break;
                default:
                    break;
            }

            if (!direction) {
                if (hasChildrenWithVerticalFill(children)) {
                    direction = "column";
                }
            }

            if (direction === "column" || scrollable) {
                fill = true;
            }

            if (direction === "column" && align === "top") {
                align = "start";
            }

            if (direction === "column" && align === "bottom") {
                align = "end";
            }

            if (direction === "row" && align === "left") {
                align = "start";
            }

            if (direction === "row" && align === "right") {
                align = "end";
            }

            let classes = this.classnames(classSet, className, {
                [this.prefixClass("fill")]: fill,
                [this.prefixClass("body")]: body,
                [this.prefixClass("column")]: direction === "column",
                [this.prefixClass("row")]: direction === "row",
                [this.prefixClass("align-center")]: align === "center",
                [this.prefixClass("align-start")]: align === "start",
                [this.prefixClass("align-end")]: align === "end",
                [this.prefixClass("justify-center")]: justify === "center",
                [this.prefixClass("justify-start")]: justify === "start",
                [this.prefixClass("justify-end")]: justify === "end",
                [this.prefixClass("justified")]: justify === true,
                [this.prefixClass("scrollable")]: scrollable as any,
                [this.prefixClass("page")]: page as any,
                [this.prefixClass("hidden")]: hidden,
            });

            return (
                <Component className={classes} {...props}>
                    {children}
                </Component>
            );
        }
    }
}
