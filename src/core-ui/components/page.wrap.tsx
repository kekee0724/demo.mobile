import React from "react";

import { browser } from "@reco-m/core";

import { app } from "../bootstrap";
import classNames from "classnames";

export const domNode = document.getElementById("root")!;

export namespace PageWrap {
    export interface IProps {
        root?: boolean;
        match: any;
        location: any;
        history: any;
        staticContext: any;
        component: any;
        onTouch?: boolean;
    }

    export interface IState {
        styles: any;
        slideClass?: string;
        touchClass?: string;
        opacity?: number;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends React.PureComponent<P, S> {
        static defaultProps: any = {
            onTouch: true,
        };

        isRoot = !1;
        startX: number;
        startY: number;
        endX: number;
        endY: number;
        startTime: number;
        endTime: number;
        distanceX: number;
        isMoved = true;
        freeze: boolean;
        Y: number;
        X: number;
        errTime;
        err;
        time;
        endTouchTime;
        moveTime;
        transitionTime;

        constructor(props: P, context: any) {
            super(props, context);

            this.state = this.getInitState(props);

            let body = document.querySelector("html");

            browser.versions.ios ? body?.classList.add("ios") : body?.classList.add("android");
        }

        protected getInitState(props: Readonly<P>): Readonly<S> {
            this.isRoot = (props.root || !/\w\//.test(this.props.match.path)) as any;

            return {
                styles: { transform: browser.versions.ios ? "translate3d(100%, 0, 0)" : "" },
                touchClass: "",
            } as any;
        }

        cancelAnimate() {
            Array.from(domNode.children).forEach((dom: any) => (dom.style = ""));
        }

        componentWillUnmount() {
            clearTimeout(this.endTouchTime);
            clearTimeout(this.errTime);
            clearTimeout(this.moveTime);
            clearTimeout(this.transitionTime);
            const prevDom = (domNode as any).lastElementChild.previousElementSibling;

            if (prevDom !== null) {
                prevDom.classList.remove("container-hide");
            }
        }

        componentDidMount(): void {
            window["iOSEnterForeground"] = () => {
                this.cancelAnimate();
            };

            if (client.canTouchBack) {
                this.setState({
                    styles: undefined,
                    slideClass: browser.versions.android
                        ? "android animate__animated animate__faster animate__zoomIn"
                        : "ios animate__animated animate__faster animate__slideInRight",
                });

                setTimeout(() => {
                    this.isMoved = false;

                    this.setState({
                        slideClass: "",
                    });

                    const prevDom = (domNode as any).lastElementChild.previousElementSibling;

                    if (prevDom !== null) {
                        prevDom.classList.add("container-hide");
                    }
                }, 500);
            } else {
                this.setState({
                    styles: undefined,
                });
            }
        }

        goBack = (e?: MouseEvent | boolean) => {
            if (!this.freeze) {
                this.isMoved = true;
                const prevDom = (domNode as any).lastElementChild.previousElementSibling;
                if (prevDom !== null) {
                    prevDom.classList.remove("container-hide");
                }
                if (e === !1) this.__goBack();
                else {
                    if (client.canTouchBack) {
                        this.setState({
                            slideClass: browser.versions.android
                                ? "android animate__animated animate__faster animate__zoomOut"
                                : "ios animate__animated animate__faster animate__slideOutRight",
                        });
                    }

                    setTimeout(this.__goBack.bind(this), 230);
                }
            }
        };

        exclude(e) {
            const target = $(e.target).closest(".adm-nav-bar.adm-list-item,.adm-nav-bar-back, .scroll, .fab, .exclude").get(0);
            if (target) {
                return true;
            }
        }

        protected __goBack() {
            (this.props.history || app["_history"]).goBack();
        }

        protected handleTouchStart = (e: React.TouchEvent) => {
            if (this.exclude(e)) {
                return;
            }
            if (!this.freeze && browser.versions.ios && client.canTouchBack) {
                this.startX = e.touches[0].pageX;
                this.startY = e.touches[0].pageY;
                this.startTime = new Date().getTime();
                if (this.startX < window.innerWidth * 0.1) {
                    this.isMoved = true;
                    const prevDom = (domNode as any).lastElementChild.previousElementSibling;
                    if (prevDom !== null) {
                        prevDom.classList.remove("container-hide");
                    }
                }
            }
        };

        protected handleTouchMove = (e: any) => {
            if (this.exclude(e)) {
                return;
            }
            clearTimeout(this.errTime);
            this.endY = e.touches[0].pageY;
            this.endX = e.touches[0].pageX;
            this.Y = this.endY - this.startY;
            this.X = this.endX - this.startX;
            if (!this.freeze && browser.versions.ios && client.canTouchBack) {
                this.distanceX = e.targetTouches[0].clientX;

                if (this.isMoved) {
                    if (this.distanceX - this.startX >= window.innerWidth) {
                        this.setState({
                            styles: { transform: `translate3d(${window.innerWidth}px, 0, 0)`, transition: "none" },
                            opacity: 1,
                        });
                    } else {
                        const x = this.distanceX - this.startX >= 0 ? this.distanceX - this.startX : 0;
                        this.setState({ styles: { transform: `translate3d(${x}px, 0, 0)`, transition: "none" }, opacity: 1 - x / window.innerWidth });
                        if (x > 20) {
                            this.setState({
                                touchClass: "reco-touch-move",
                            });
                        }
                        if (domNode.children.length >= 3) {
                            const { style: styles } = this.getPreviousElement();
                            styles && (styles.transform = `translate3d(${this.distanceX * 0.1 - 40}px, 0 , 0)`);
                            styles && (styles.transition = "none");
                        }
                    }
                }
            }

            this.err = false;

            this.errTime = setTimeout(() => {
                const { style: styles } = this.getPreviousElement();
                styles && (styles.transform = "");
                styles && (styles.transition = "");
                this.setState({ styles: { transition: "all .3s" }, touchClass: "" });
                this.err = true;
            }, 500);
        };

        protected handleTouchEnd = (e: React.TouchEvent) => {
            if (this.exclude(e)) {
                return;
            }
            this.setState({ touchClass: "" });
            this.endX = e.changedTouches[0].clientX;
            this.endTime = new Date().getTime();

            const { style: styles } = this.getPreviousElement();

            if (Math.abs(this.X) > Math.abs(this.Y) && this.X > 0 && !this.err) {
                this.err = false;
                if (!this.freeze && this.startX < window.innerWidth * 0.1 && browser.versions.ios && client.canTouchBack) {
                    if (this.endTime - this.startTime > 10 && this.endTime - this.startTime < 100 && this.endX - this.startX > window.innerWidth / 20) {
                        this.setState({ styles: { transform: `translate3d(100%, 0 , 0)` } });
                        this.clearStyle(styles);
                        setTimeout(() => this.__goBack(), 200);
                    } else {
                        if (this.endX - this.startX > window.innerWidth / 4) {
                            this.setState({ styles: { transform: `translate3d(100%, 0 , 0)`, transition: "all .3s" } });
                            this.transitionTime = setTimeout(() => {
                                this.setState({ styles: { transition: "" } });
                            }, 300);
                            this.clearStyle(styles);
                            setTimeout(() => this.__goBack(), 200);
                        } else {
                            this.clearStyle(styles);
                            this.setState({ styles: { transform: "", transition: "all .3s" } });
                            this.transitionTime = setTimeout(() => {
                                this.setState({ styles: { transition: "" } });
                            }, 300);
                        }
                    }
                } else {
                    this.clearStyle(styles);
                    this.setState({ styles: { transform: "", transition: "all .3s" } });
                    this.transitionTime = setTimeout(() => {
                        try {
                            this.setState({ styles: { transition: "" } });
                        } catch {}
                    }, 300);
                }
                this.clearStyles(styles);
                clearTimeout(this.endTouchTime);
                this.endTouchTime = setTimeout(() => {
                    const prevDom = (domNode as any).lastElementChild.previousElementSibling;
                    if (prevDom !== null) {
                        prevDom.classList.add("container-hide");
                    }
                }, 300);
            } else {
                this.clearStyles(styles);
                clearTimeout(this.endTouchTime);
                this.endTouchTime = setTimeout(() => {
                    const prevDom = (domNode as any).lastElementChild.previousElementSibling;
                    if (prevDom !== null) {
                        prevDom.classList.add("container-hide");
                    }
                }, 300);
            }
            this.moveTime = setTimeout(() => (this.isMoved = false), 500);
        };

        clearStyle(styles) {
            if (domNode.children.length >= 3) {
                this.clearStyles(styles);
            }
        }

        clearStyles(styles) {
            styles && (styles.transform = "");
            styles && (styles.transition = "");
        }

        protected getPreviousElement() {
            return (domNode as any).lastElementChild.previousElementSibling ? (domNode as any).lastElementChild.previousElementSibling : {};
        }

        handleFreeze(freeze: boolean) {
            this.freeze = freeze;
        }

        noTouch() {}

        render(): React.ReactNode {
            const { component: Component, root, onTouch, ...props } = this.props,
                wrapProps: any = root || this.isRoot ? { className: "container-page" } : { className: classNames("container-page", this.state.slideClass) };
            return (
                <div
                    className={classNames("container-pages", this.state.touchClass)}
                    onTouchStart={!(root || this.isRoot) && onTouch ? this.handleTouchStart : this.noTouch}
                    onTouchMove={!(root || this.isRoot) && onTouch ? this.handleTouchMove : this.noTouch}
                    onTouchEnd={!(root || this.isRoot) && onTouch ? this.handleTouchEnd : this.noTouch}
                    onTouchCancel={!(root || this.isRoot) && onTouch ? this.handleTouchEnd : this.noTouch}
                >
                    <div {...wrapProps} style={this.state.styles ? this.state.styles : {}}>
                        <Component {...props} wrap={this} />
                        <div className="container-page-shadow" style={{ opacity: this.state.opacity }} />
                    </div>
                </div>
            );
        }
    }
}
