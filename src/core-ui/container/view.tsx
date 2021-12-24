import React from "react";

import { Toast } from "antd-mobile";

import { freeze } from "immer";
import { CoreComponent, MessageInstance } from "@reco-m/core";

import { PageWrap } from "../components/page.wrap";
import { Loading, Container, NavBar } from "../components";
import { ToastInfo } from "../utils";

export namespace ViewComponent {
    export interface IProps<S = any> extends CoreComponent.IProps<S> {
        showloadingContent?: string;
        showloading?: boolean;
        ignoreClass?: boolean;
        showheader?: boolean;
        scrollable?: boolean;
        hidden?: boolean;
        canBack?: boolean;
        bodyClass?: string;
        wrap?: PageWrap.Component;
        pagesClass?: any;
    }

    export interface IState extends CoreComponent.IState {
        showloadingContent?: string;
        showloading?: boolean;
        hidden?: boolean;
        isLoading?: boolean;
        vertical?: boolean;
    }

    export abstract class Base<P extends IProps = IProps, S extends IState = IState> extends CoreComponent.Base<P, S> {
        static defaultProps = {
            ...CoreComponent.Base.defaultProps,
            showloadingContent: "加载中...",
            showloading: true,
            ignoreClass: false,
            scrollable: true,
            showheader: true,
            canBack: false,
        } as any;

        protected showheader = true;
        protected showloadingContent = "加载中...";
        protected showloading = true;
        protected scrollable = true;
        protected canBack = false;
        protected bodyClass: string;
        protected pageClass: any;
        protected hidden = false;

        protected headerContent: any;
        protected scroll: any;

        protected createMessageTools(): MessageInstance {
            return freeze({
                info(content: React.ReactNode, duration?: number, onClose?: () => void): void {
                    Toast.show({ content, duration, afterClose: onClose });
                },
                success(content: React.ReactNode, duration?: number, onClose?: () => void): void {
                    Toast.show({ icon: "success", content, duration, afterClose: onClose });
                },
                error(content: React.ReactNode, duration?: number, onClose?: () => void): void {
                    ToastInfo(content, duration, undefined, onClose);
                },
                warning(content: React.ReactNode, duration?: number, onClose?: () => void): void {
                    Toast.show({ content, duration, afterClose: onClose });
                },
                loading(content: React.ReactNode, duration?: number, onClose?: () => void): void {
                    Toast.show({ icon: "loading", content, duration, afterClose: onClose });
                },
            });
        }

        renderHeader(headerContent?: any): React.ReactNode {
            const { canBack, wrap } = this.props,
                back = canBack || this.canBack || !wrap!.isRoot;
            return (
                <NavBar.Component
                    visible={this.showheader && this.props.showheader && client.showheader !== false}
                    left={this.renderHeaderLeft() as any}
                    right={this.renderHeaderRight() as any}
                    onBack={back ? this.goBack.bind(this) : null}
                    backArrow={back ? true : false}
                >
                    {this.renderHeaderContent(headerContent)}
                </NavBar.Component>
            );
        }

        renderHeaderLeft(): React.ReactNode {
            return null;
        }

        renderHeaderContent(headerContent?: any): React.ReactNode {
            return headerContent || this.headerContent || "";
        }

        renderHeaderRight(): React.ReactNode {
            return null;
        }

        renderBody(): React.ReactNode {
            return "未加载数据！" as any;
        }

        renderFooter(): React.ReactNode {
            return null;
        }

        closeLoading(data?: any) {
            this.showloading = false;

            this.dispatch("input", { ...data, showloading: !1 });
        }

        openLoading(data?: any) {
            this.dispatch("input", { ...data, showloading: !0 });
        }

        renderLoading(showloading = false): React.ReactNode {
            const { canBack, state, wrap } = this.props as any,
                back = canBack || this.canBack || !wrap!.isRoot;

            return showloading ||
                (this.showloading && this.props.showloading && (!state || !this.state || (state.showloading !== !1 && state.isLoading !== !1))) ||
                ((this.state as any).showloading !== !1 && (this.state as any).isLoading === !0) ? (
                <Loading.Component showback={back} content={this.showloadingContent} />
            ) : null;
        }

        refScroll(el) {
            this.scroll = el;
        }

        viewScroll() {
            //    $('input').blur();
        }
        setFormFieldValue(formRef, key, value) {
            Promise.resolve().then(() => {
                if (value !== formRef.current?.getFieldValue(key)) {
                    formRef.current?.setFieldsValue({ [key]: value });
                }
            });
        }
        render(): React.ReactNode {
            return (
                <Container.Component direction="column" fill className={this.pageClass || this.props.pagesClass}>
                    {this.renderHeader()}
                    <div
                        className={this.classnames(
                            this.scrollable && this.props.scrollable !== false ? "container-scrollable" : "",
                            this.hidden && this.props.hidden !== false ? "container-hidden" : "",
                            "container-fill body",
                            this.props.bodyClass || this.bodyClass
                        )}
                        onScroll={() => this.viewScroll()}
                        ref={(el) => this.refScroll(el)}
                    >
                        {this.renderBody()}
                    </div>
                    {this.renderFooter()}
                    {this.renderLoading()}
                </Container.Component>
            );
        }
    }
}
